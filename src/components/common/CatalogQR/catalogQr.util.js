import { getCatalogUrl } from "@dragorbit/core/domain";

export const CATALOG_LOGO_URL = "/logo/logo.png";
export const QR_SIZE = 500;
export const LOGO_RATIO = 0.22;

export const slugify = (text = "") =>
    text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

export const getEffectiveSubdomain = (catalog, store) => {
    const rawSubdomain = catalog?.subdomain ? String(catalog.subdomain).trim().toLowerCase() : "";
    const catId = catalog?.catalogId ? String(catalog.catalogId).trim() : "";

    // If rawSubdomain exists and is not equal to raw catalogId and has no uppercase
    if (rawSubdomain && rawSubdomain !== catId.toLowerCase() && !/[A-Z]/.test(catalog?.subdomain || "")) {
        return rawSubdomain;
    }

    // Use name/slug of catalog or store
    const candidateName = catalog?.slug || catalog?.name || store?.slug || store?.storeName || store?.name || "";
    if (candidateName) {
        const slug = slugify(candidateName);
        if (slug) return slug;
    }

    if (rawSubdomain) return rawSubdomain;
    return catId || store?.catalogId || "";
};

export const loadImage = (url) =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });

const qrCanvasCache = new Map();

export const composeQrWithLogo = async (qrImageUrl, logoUrl) => {
    const cacheKey = `${qrImageUrl}::${logoUrl}`;
    if (qrCanvasCache.has(cacheKey)) {
        return qrCanvasCache.get(cacheKey);
    }

    const [qrImg, logoImg] = await Promise.all([
        loadImage(qrImageUrl),
        loadImage(logoUrl).catch(() => null),
    ]);

    const size = QR_SIZE;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(qrImg, 0, 0, size, size);

    if (logoImg) {
        const logoSize = Math.floor(size * LOGO_RATIO);
        const padding = Math.floor(size * 0.04);
        const center = size / 2;
        const halfLogo = logoSize / 2 + padding;
        const x = center - halfLogo;
        const y = center - halfLogo;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x, y, halfLogo * 2, halfLogo * 2);

        ctx.drawImage(logoImg, x + padding, y + padding, logoSize, logoSize);
    }

    const dataUrl = canvas.toDataURL("image/png");
    if (qrCanvasCache.size > 50) {
        qrCanvasCache.clear();
    }
    qrCanvasCache.set(cacheKey, dataUrl);
    return dataUrl;
};

export const getBase64FromUrl = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const computeCatalogUrls = (catalog, store, propCatalogId, inStoreLocation = "") => {
    const subdomain = getEffectiveSubdomain(catalog, store) || propCatalogId;

    let catalogUrl = "";
    let displayUrl = "";

    if (subdomain) {
        catalogUrl = getCatalogUrl(subdomain);
        displayUrl = catalogUrl.replace(/^https?:\/\//, "");

        if (inStoreLocation && inStoreLocation.trim().length > 0) {
            const query = `?mode=in_store&location=${encodeURIComponent(inStoreLocation.trim())}`;
            catalogUrl += query;
            displayUrl += query;
        }
    }

    return { catalogUrl, displayUrl };
};

export const generateCatalogPDF = async ({ displayName, store, displayQrUrl, displayUrl }) => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    // Header - Dark background
    doc.setFillColor(31, 41, 55);
    doc.rect(0, 0, 210, 45, "F");

    // Branded Text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("DRAGBIZZ", 105, 25, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("YOUR DIGITAL BUSINESS PARTNER", 105, 33, { align: "center" });

    // Store/Catalog Information Section
    let y = 65;
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(displayName, 105, y, { align: "center" });

    y += 12;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99);

    const address = store?.address;
    if (address) {
        const addrStr = [address.line1, address.city, address.state, address.pincode].filter(Boolean).join(", ");
        if (addrStr) {
            doc.text(addrStr, 105, y, { align: "center" });
            y += 8;
        }
    }

    const contactInfo = [
        store?.phone && `Phone: ${store.phone}`,
        store?.email && `Email: ${store.email}`,
    ].filter(Boolean).join("  |  ");

    if (contactInfo) {
        doc.text(contactInfo, 105, y, { align: "center" });
        y += 12;
    }

    // Separator Line
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(50, y, 160, y);

    // Marketing Section
    y += 15;
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("SCAN TO EXPLORE OUR COLLECTION", 105, y, { align: "center" });

    y += 8;
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Discover our latest products, check real-time stock,", 105, y, { align: "center" });
    y += 6;
    doc.text("and place orders instantly from the comfort of your phone.", 105, y, { align: "center" });

    // QR Code Section
    y += 15;
    const imgData = await getBase64FromUrl(displayQrUrl);
    doc.addImage(imgData, "PNG", 55, y, 100, 100);

    // Catalog URL with blue link color
    y += 112;
    doc.setTextColor(37, 99, 235);
    doc.setFontSize(11);
    doc.text(displayUrl, 105, y, { align: "center" });

    // Footer
    doc.setTextColor(156, 163, 175);
    doc.setFontSize(9);
    doc.text("Thank you for choosing DragBizz - Empowering Small Businesses", 105, 275, { align: "center" });
    doc.text("www.dragbizz.com", 105, 282, { align: "center" });

    const filename = `${displayName.replace(/\s+/g, "-").toLowerCase()}-qr.pdf`;
    doc.save(filename);
};

export const printCatalogQR = ({ displayName, displayQrUrl, displayUrl }) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
        <html>
            <head>
                <title>Print QR Code - ${displayName}</title>
                <style>
                    body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
                    img { width: 350px; height: 350px; border: 1px solid #eee; padding: 10px; border-radius: 10px; }
                    h1 { color: #1f2937; margin-bottom: 5px; font-size: 28px; }
                    h2 { color: #4b5563; margin-top: 5px; margin-bottom: 20px; font-size: 20px; font-weight: normal; }
                    p { color: #666; font-family: monospace; font-size: 16px; margin-top: 20px; }
                    .marketing { color: #dc2626; font-weight: bold; margin-bottom: 30px; font-size: 18px; }
                </style>
            </head>
            <body>
                <h1>${displayName}</h1>
                <div class="marketing">Scan to browse & order products online!</div>
                <img src="${displayQrUrl}" alt="QR Code" />
                <p>${displayUrl}</p>
                <script>
                    window.onload = () => {
                        window.print();
                        window.onafterprint = () => window.close();
                    };
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
};

