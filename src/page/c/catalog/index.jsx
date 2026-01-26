"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Search } from "lucide-react";
import publicCatalogService from "@/service/public/catalog.service";
import { copyToClipboard } from "@/utils/clipboard";
import { useToast } from "@/hooks/useToast";
import ProductCard from "@/components/public/ProductCard";
import CatalogHeader from "@/components/public/CatalogHeader";
import CategoryFilter from "@/components/public/CategoryFilter";
import LoadingSkeleton from "@/components/public/LoadingSkeleton";
import EmptyState from "@/components/public/EmptyState";
import CreateOrderModal from "@/components/public/CreateOrderModal";
import { Card, CardBody } from "@/components/ui";
import { Package } from "lucide-react";


export default function CatalogPage({ catalogId }) {
    const toast = useToast();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    // Order Modal State
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

    // Fetch catalog data
    useEffect(() => {
        const fetchCatalog = async () => {
            try {
                setLoading(true);
                const result = await publicCatalogService.getCatalog(catalogId);
                if (result?.success) {
                    setData(result.data);
                } else {
                    setError(result?.message || "Catalog not found");
                }
            } catch (err) {
                setError("An unexpected error occurred while fetching the catalog");
            } finally {
                setLoading(false);
            }
        };

        if (catalogId) {
            fetchCatalog();
        }
    }, [catalogId]);

    // Filter products based on search and category
    const filteredProducts = useMemo(() => {
        if (!data?.products) return [];

        return data.products.filter(product => {
            const productName = product.name || "";
            const productBrand = product.brand || "";
            const matchesSearch = productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                productBrand.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory = selectedCategory === "all" ||
                product.category === selectedCategory ||
                (product.category && typeof product.category === 'object' && product.category._id === selectedCategory) ||
                (product.category && typeof product.category === 'object' && product.category.name === selectedCategory);

            return matchesSearch && matchesCategory;
        });
    }, [data?.products, searchQuery, selectedCategory]);

    // WhatsApp share handler
    const shareOnWhatsApp = useCallback((product) => {
        if (!data?.store) return;

        const text = `Hi, I'm interested in ordering:\n*${product.name}*\nPrice: ₹${product.sellingPrice}\nLink: ${window.location.origin}/c/${catalogId}`;

        let phone = data.store.phone.replace(/\D/g, "");
        if (phone.length === 10) phone = "91" + phone;

        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
    }, [data?.store, catalogId]);

    // Buy now handler
    const handleBuyNow = useCallback((product) => {
        setSelectedProduct(product);
        setIsOrderModalOpen(true);
    }, []);

    // Share catalog link
    const handleShareCatalog = useCallback(async () => {
        try {
            await copyToClipboard(window.location.href);
            toast?.success?.("Catalog link copied!");
        } catch (err) {
            toast?.error?.("Failed to copy link");
        }
    }, [toast]);

    // Call store
    const handleCallStore = useCallback(() => {
        if (data?.store?.phone) {
            window.open(`tel:${data.store.phone}`);
        }
    }, [data?.store?.phone]);

    // Clear filters
    const handleClearFilters = useCallback(() => {
        setSearchQuery("");
        setSelectedCategory("all");
    }, []);

    // Loading state
    if (loading) {
        return <LoadingSkeleton type="catalog" count={8} />;
    }

    // Error state
    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg-secondary))] p-6 text-center">
                <Card className="max-w-md w-full border-[rgb(var(--color-border-primary))]">
                    <CardBody className="p-10">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-3">Catalog Not Found</h2>
                        <p className="text-[rgb(var(--color-text-secondary))] mb-8 leading-relaxed">
                            {error || "The catalog you are looking for does not exist or has been removed."}
                        </p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    const { store, categories } = data;

    return (
        <div className="min-h-screen bg-[rgb(var(--color-bg-secondary))] flex flex-col">
            {/* Header */}
            <CatalogHeader
                store={store}
                onShare={handleShareCatalog}
                onCall={handleCallStore}
            />

            {/* Main Container */}
            <div className="container mx-auto px-4 py-8 flex-1">
                <div className="flex flex-col gap-8">
                    {/* Welcome Area */}
                    <div className="space-y-2">
                        <h2 className="text-3xl font-extrabold text-[rgb(var(--color-text-primary))] tracking-tight">
                            Welcome to our Shop
                        </h2>
                        <p className="text-[rgb(var(--color-text-secondary))] max-w-2xl font-medium">
                            Browse our latest collection and order directly via WhatsApp for a personalized shopping experience.
                        </p>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
                        <div className="relative w-full lg:max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <input
                                type="text"
                                placeholder="Product name, brand..."
                                className="w-full pl-11 pr-4 py-3 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-xl outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]/20 transition-all font-medium text-sm shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                aria-label="Search products"
                            />
                        </div>

                        <CategoryFilter
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onCategoryChange={setSelectedCategory}
                        />
                    </div>

                    {/* Products Grid */}
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.map((product) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    onWhatsAppShare={shareOnWhatsApp}
                                    onBuyNow={handleBuyNow}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title="No products found"
                            description="Try searching for something else or clearing your filters."
                            actionLabel="Clear all filters"
                            onAction={handleClearFilters}
                        />
                    )}
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-auto border-t border-[rgb(var(--color-border-primary))]/50 bg-[rgb(var(--color-bg-primary))] py-10">
                <div className="container mx-auto px-4 text-center space-y-4">
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[rgb(var(--color-text-tertiary))]">
                            Powered by DragBizz Store
                        </span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-[rgb(var(--color-text-primary))]">{store.name}</p>
                        <p className="text-[10px] text-[rgb(var(--color-text-tertiary))] font-medium uppercase tracking-wider">
                            &copy; {new Date().getFullYear()} All Rights Reserved.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Order Modal */}
            {selectedProduct && (
                <CreateOrderModal
                    isOpen={isOrderModalOpen}
                    onClose={() => setIsOrderModalOpen(false)}
                    product={selectedProduct}
                    storeId={store?._id || store?.id}
                />
            )}
        </div>
    );
}
