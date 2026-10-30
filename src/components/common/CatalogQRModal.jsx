"use client";
import { Loader2 } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui";
import { useGlobalToast } from "@/contexts/ToastContext";
import useDebounce from "@/hooks/form/useDebounce";
import { useApiResponse } from "@/hooks/useApiResponse";
import { useTranslation } from "@/hooks/ui/useTranslation";
import catalogService from "@/service/retailer/catalog.service";
import { useAppSelector } from "@/store/hooks";
import { copyToClipboard } from "@/utils/clipboard";
import {
    CATALOG_LOGO_URL,
    CatalogDetailsPanel,
    CatalogEmptyState,
    CatalogList,
    CatalogQRPreview,
    composeQrWithLogo,
    computeCatalogUrls,
    generateCatalogPDF,
    printCatalogQR,
    QR_SIZE,
    slugify,
} from "./CatalogQR";

const mergeStoresWithCatalogs = ({
    apiCatalogs = [],
    stores = [],
    store,
    selectedStore,
    propCatalogId,
    defaultTitle = "Digital Shop",
}) => {
    const list = [...apiCatalogs];
    const availableStores = [store, selectedStore, ...stores].filter(Boolean);
    if (!availableStores.length && !propCatalogId) return list;

    // Fast O(1) Sets for lookups instead of nested iterations
    const linkedStoreIds = new Set();
    const catalogIds = new Set();
    const subdomains = new Set();

    for (let i = 0; i < list.length; i++) {
        const c = list[i];
        if (c.catalogId) catalogIds.add(c.catalogId);
        if (c.subdomain) subdomains.add(c.subdomain);
        if (c.name) subdomains.add(slugify(c.name));
        if (c.defaultStore) linkedStoreIds.add(String(c.defaultStore));
        if (Array.isArray(c.stores)) {
            for (let j = 0; j < c.stores.length; j++) {
                linkedStoreIds.add(String(c.stores[j]));
            }
        }
    }

    for (let i = 0; i < availableStores.length; i++) {
        const s = availableStores[i];
        const storeId = String(s.storeId || s._id || "");
        const catId = s.catalogId;
        const name = s.storeName || s.name || "";
        const slug = slugify(name) || catId;

        const isLinked = storeId ? linkedStoreIds.has(storeId) : false;
        const isSameId = catId ? catalogIds.has(catId) : false;
        const isSameSlug = slug ? subdomains.has(slug) : false;

        if (!isLinked && !isSameId && !isSameSlug && (catId || name)) {
            if (catId) catalogIds.add(catId);
            if (slug) subdomains.add(slug);
            if (storeId) linkedStoreIds.add(storeId);

            list.push({
                id: storeId || catId,
                name: name || defaultTitle,
                catalogId: catId,
                subdomain: slug,
                status: "ACTIVE",
                stores: storeId ? [storeId] : [],
            });
        }
    }

    if (propCatalogId && !catalogIds.has(propCatalogId) && !subdomains.has(propCatalogId)) {
        list.push({
            id: propCatalogId,
            name: defaultTitle,
            catalogId: propCatalogId,
            subdomain: slugify(defaultTitle),
            status: "ACTIVE",
        });
    }

    return list;
};

const findInitialCatalog = (catalogs, { store, selectedStore, propCatalogId }) => {
    const len = catalogs.length;
    if (len === 0) return null;
    if (len === 1) return catalogs[0];

    const currentStoreId = String(store?.storeId || store?._id || selectedStore?.storeId || selectedStore?._id || "");
    const storeSlug = slugify(store?.storeName || store?.name || selectedStore?.storeName || selectedStore?.name || "");
    const targetCatId = propCatalogId || store?.catalogId || selectedStore?.catalogId;

    let linkedMatch = null;
    let slugMatch = null;
    let idMatch = null;

    // Single pass O(N) lookup with priority resolution
    for (let i = 0; i < len; i++) {
        const c = catalogs[i];

        if (!linkedMatch && currentStoreId) {
            if (String(c.defaultStore || "") === currentStoreId) {
                return c; // Exact default store match - exit immediately
            }
            if (Array.isArray(c.stores)) {
                for (let j = 0; j < c.stores.length; j++) {
                    if (String(c.stores[j]) === currentStoreId) {
                        linkedMatch = c;
                        break;
                    }
                }
            }
        }

        if (!slugMatch && storeSlug && (c.subdomain === storeSlug || slugify(c.name) === storeSlug)) {
            slugMatch = c;
        }

        if (!idMatch && targetCatId && (c.catalogId === targetCatId || c.subdomain === targetCatId || c.id === targetCatId)) {
            idMatch = c;
        }
    }

    return linkedMatch || slugMatch || idMatch || catalogs[0];
};

const CatalogQRModal = ({ isOpen, onClose, store, catalogId: propCatalogId, order }) => {
    const { t } = useTranslation();
    const { showSuccess, showError } = useGlobalToast();
    const { execute, loading: loadingCatalogs } = useApiResponse();
    const { stores, selectedStore } = useAppSelector((state) => state.profile);

    const [catalogs, setCatalogs] = useState([]);
    const [selectedCatalogId, setSelectedCatalogId] = useState(null);
    const [qrWithLogoUrl, setQrWithLogoUrl] = useState(null);
    const [copied, setCopied] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const [inStoreLocation, setInStoreLocation] = useState("");

    // Initialize in-store location from order if available
    useEffect(() => {
        if (order?.inStoreLocation) {
            setInStoreLocation(order.inStoreLocation);
        }
    }, [order]);

    // Fetch all catalogs when modal opens
    useEffect(() => {
        if (!isOpen) return;

        let active = true;

        const loadCatalogs = async () => {
            const result = await execute(
                catalogService.getCatalogs({
                    limit: 50,
                    sortBy: "createdAt",
                    sortOrder: "desc",
                }),
                { showToast: false }
            );

            if (!active) return;

            const apiCatalogs = result?.success && Array.isArray(result.data) ? result.data : [];
            const merged = mergeStoresWithCatalogs({
                apiCatalogs,
                stores: Array.isArray(stores) ? stores : [],
                store,
                selectedStore,
                propCatalogId,
                defaultTitle: t("settings.publicCatalog", "Digital Shop"),
            });

            setCatalogs(merged);

            const initial = findInitialCatalog(merged, { store, selectedStore, propCatalogId });
            if (initial) {
                setSelectedCatalogId(initial.id || initial.catalogId);
            }
        };

        loadCatalogs();

        return () => {
            active = false;
        };
    }, [isOpen, store, selectedStore, stores, propCatalogId, execute, t]);

    // O(1) Map for selected catalog lookup
    const catalogMap = useMemo(() => {
        const map = new Map();
        for (let i = 0; i < catalogs.length; i++) {
            const c = catalogs[i];
            if (c.id) map.set(c.id, c);
            if (c.catalogId) map.set(c.catalogId, c);
        }
        return map;
    }, [catalogs]);

    // Active selected catalog in O(1)
    const selectedCatalog = useMemo(() => {
        if (!catalogs.length) return null;
        return (selectedCatalogId && catalogMap.get(selectedCatalogId)) || catalogs[0] || null;
    }, [catalogs, selectedCatalogId, catalogMap]);

    // Debounce in-store location to avoid generating QR canvas on every keystroke
    const debouncedLocation = useDebounce(inStoreLocation, 250);

    // Compute URLs for instant UI display
    const { catalogUrl, displayUrl } = useMemo(() => {
        return computeCatalogUrls(selectedCatalog, store, propCatalogId, inStoreLocation);
    }, [selectedCatalog, store, propCatalogId, inStoreLocation]);

    // Compute raw QR code URL (debounced location saves canvas & network operations)
    const qrCodeUrl = useMemo(() => {
        const { catalogUrl: qrTargetUrl } = computeCatalogUrls(selectedCatalog, store, propCatalogId, debouncedLocation);
        return qrTargetUrl
            ? `https://api.qrserver.com/v1/create-qr-code/?size=${QR_SIZE}x${QR_SIZE}&ecc=H&data=${encodeURIComponent(qrTargetUrl)}`
            : "";
    }, [selectedCatalog, store, propCatalogId, debouncedLocation]);

    // Compose QR with DragBizz logo (memoized by cache in composeQrWithLogo)
    useEffect(() => {
        if (!qrCodeUrl) {
            setQrWithLogoUrl(null);
            return;
        }

        let cancelled = false;
        composeQrWithLogo(qrCodeUrl, CATALOG_LOGO_URL)
            .then((url) => {
                if (!cancelled) setQrWithLogoUrl(url);
            })
            .catch(() => {
                if (!cancelled) setQrWithLogoUrl(qrCodeUrl);
            });

        return () => {
            cancelled = true;
        };
    }, [qrCodeUrl]);

    const displayQrUrl = qrWithLogoUrl || qrCodeUrl;

    // Stable clipboard and action handlers
    const handleCopy = useCallback(async () => {
        if (!catalogUrl) return;
        const success = await copyToClipboard(catalogUrl);
        if (success) {
            setCopied(true);
            showSuccess(t("settings.linkCopied", "Link copied to clipboard"));
            setTimeout(() => setCopied(false), 2500);
        }
    }, [catalogUrl, showSuccess, t]);

    const handleCopyDirect = useCallback(async (targetCatalog) => {
        const { catalogUrl: url } = computeCatalogUrls(targetCatalog, store, propCatalogId, inStoreLocation);
        if (!url) return;
        const success = await copyToClipboard(url);
        if (success) {
            const catId = targetCatalog.id || targetCatalog.catalogId;
            setCopiedId(catId);
            showSuccess(t("settings.linkCopied", "Link copied to clipboard"));
            setTimeout(() => setCopiedId(null), 2000);
        }
    }, [store, propCatalogId, inStoreLocation, showSuccess, t]);

    const handleView = useCallback(() => {
        if (catalogUrl && typeof window !== "undefined") {
            window.open(catalogUrl, "_blank", "noopener,noreferrer");
        }
    }, [catalogUrl]);

    const handleDownloadPDF = useCallback(async () => {
        try {
            const displayName = selectedCatalog?.name || store?.name || "Exclusive Digital Shop";
            await generateCatalogPDF({ displayName, store, displayQrUrl, displayUrl });
            showSuccess("PDF generated successfully");
        } catch {
            showError("Failed to generate PDF. Please try again.");
        }
    }, [selectedCatalog, store, displayQrUrl, displayUrl, showSuccess, showError]);

    const handlePrint = useCallback(() => {
        const displayName = selectedCatalog?.name || store?.name || "Our Digital Shop";
        printCatalogQR({ displayName, displayQrUrl, displayUrl });
    }, [selectedCatalog, store, displayQrUrl, displayUrl]);

    const modalTitle = catalogs.length > 1
        ? `${t("settings.publicCatalog")} (${catalogs.length})`
        : t("settings.publicCatalog");

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTitle}
            size={catalogs.length > 1 ? "4xl" : "3xl"}
        >
            {loadingCatalogs ? (
                <div className="flex flex-col items-center justify-center p-12 space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[rgb(var(--color-primary))]" />
                    <p className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                        Loading Digital Shops…
                    </p>
                </div>
            ) : catalogs.length === 0 ? (
                <CatalogEmptyState />
            ) : catalogs.length > 1 ? (
                /* Multi Catalog View */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-2">
                    {/* Left Column: All Catalogs List */}
                    <CatalogList
                        catalogs={catalogs}
                        selectedCatalogId={selectedCatalog?.id || selectedCatalog?.catalogId}
                        onSelectCatalog={(id) => setSelectedCatalogId(id)}
                        onCopyCatalog={handleCopyDirect}
                        copiedId={copiedId}
                        title={t("sidebar.catalogs", "Digital Shops")}
                    />

                    {/* Right Column: Selected Catalog QR & Details */}
                    <div className="lg:col-span-7 flex flex-col gap-4 bg-[rgb(var(--color-bg-secondary))]/30 p-4 rounded-2xl border border-[rgb(var(--color-border-primary)/0.3)]">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            <CatalogQRPreview qrUrl={displayQrUrl} size="md" />
                            <div className="flex-1 min-w-0">
                                <CatalogDetailsPanel
                                    catalog={selectedCatalog}
                                    store={store}
                                    displayUrl={displayUrl}
                                    inStoreLocation={inStoreLocation}
                                    onInStoreLocationChange={setInStoreLocation}
                                    onCopy={handleCopy}
                                    isCopied={copied}
                                    onDownloadPDF={handleDownloadPDF}
                                    onPrint={handlePrint}
                                    onView={handleView}
                                    marketingText={t(
                                        "settings.catalogMarketingDescription",
                                        "Customers can scan to browse and order directly."
                                    )}
                                    layout="compact"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Single Catalog View */
                <div className="flex flex-col md:flex-row items-center md:items-start gap-10 py-4">
                    <CatalogQRPreview qrUrl={displayQrUrl} size="lg" />
                    <div className="flex-1 min-w-0">
                        <CatalogDetailsPanel
                            catalog={selectedCatalog}
                            store={store}
                            displayUrl={displayUrl}
                            inStoreLocation={inStoreLocation}
                            onInStoreLocationChange={setInStoreLocation}
                            onCopy={handleCopy}
                            isCopied={copied}
                            onDownloadPDF={handleDownloadPDF}
                            onPrint={handlePrint}
                            onView={handleView}
                            marketingText={t(
                                "settings.catalogMarketingDescription",
                                "Generate a QR code for your public store catalog. Customers can scan to browse and order directly."
                            )}
                            layout="full"
                        />
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default CatalogQRModal;
