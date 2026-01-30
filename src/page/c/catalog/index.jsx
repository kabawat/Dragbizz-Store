"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    setCartOpen,
    addToCart as addToCartAction,
    updateCartQuantity as updateCartQuantityAction,
    clearCart
} from "@/store/slices/publicCartSlice";
import { Search, Sparkles, X, Building2, Package } from "lucide-react";
import publicCatalogService from "@/service/public/catalog.service";
import { copyToClipboard } from "@/utils/clipboard";
import { useToast } from "@/hooks/useToast";
import ProductCard from "@/components/public/ProductCard";
import CatalogHeader from "@/components/public/CatalogHeader";
import CategoryFilter from "@/components/public/CategoryFilter";
import LoadingSkeleton from "@/components/public/LoadingSkeleton";
import EmptyState from "@/components/public/EmptyState";
import CartDrawer from "@/components/public/CartDrawer";
import { Card, CardBody, Input } from "@/components/ui";
import useDebounce from "@/hooks/useDebounce";
// Order Modal State (Removed)

export default function CatalogPage({ catalogId }) {
    const toast = useToast();
    const dispatch = useDispatch();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const [selectedCategory, setSelectedCategory] = useState("all");

    // Redux Cart State
    const cartItems = useSelector(state => state.publicCart.items);



    // Fetch initial catalog and categories
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [catalogResult, categoriesResult] = await Promise.all([
                    publicCatalogService.getCatalog(catalogId),
                    publicCatalogService.getCategories(catalogId)
                ]);

                if (catalogResult?.success) {
                    const products = Array.isArray(catalogResult.data) ? catalogResult.data : catalogResult.data?.products || [];
                    const store = catalogResult.meta?.store || catalogResult.data?.store || {};

                    let categories = [];
                    if (categoriesResult?.success) {
                        categories = categoriesResult.data;
                    } else {
                        // Fallback to deriving categories from products if API fails
                        categories = [...new Set(products.map(p =>
                            (p.category && typeof p.category === 'object') ? p.category?.name : p.category
                        ).filter(Boolean))].map(c => ({ _id: c, name: c }));
                    }

                    setData({
                        products,
                        store,
                        categories
                    });
                } else {
                    setError(catalogResult?.message || "Catalog not found");
                }
            } catch (err) {
                console.error("Initial fetch error:", err);
                setError("An unexpected error occurred while fetching the catalog");
            } finally {
                setLoading(false);
            }
        };

        if (catalogId) {
            fetchInitialData();
        }
    }, [catalogId]);

    // Fetch products whenever debouncedSearchQuery or selectedCategory changes
    useEffect(() => {
        const fetchFilteredProducts = async () => {
            if (!data?.store) return;

            try {
                setProductsLoading(true);
                const result = await publicCatalogService.getCatalog(catalogId, {
                    search: debouncedSearchQuery,
                    category: selectedCategory
                });

                if (result?.success) {
                    const products = Array.isArray(result.data) ? result.data : result.data?.products || [];
                    setData(prev => ({
                        ...prev,
                        products
                    }));
                }
            } catch (err) {
                console.error("Filter fetch error:", err);
                toast.showError("Failed to update product list");
            } finally {
                setProductsLoading(false);
            }
        };

        if (!loading) {
            fetchFilteredProducts();
        }
    }, [debouncedSearchQuery, selectedCategory, catalogId, loading]);

    // Products to display (now directly from state)
    const filteredProducts = data?.products || [];

    // WhatsApp share handler
    const shareOnWhatsApp = useCallback((product) => {
        if (!data?.store?.phone) {
            toast.showError("Store contact information is missing");
            return;
        }

        const text = `Hi, I'm interested in ordering:\n*${product.name}*\nPrice: ₹${product.sellingPrice}\nLink: ${window.location.origin}/c/${catalogId}`;

        let phone = data.store.phone.toString().replace(/\D/g, "");
        if (phone.length === 10) phone = "91" + phone;

        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
    }, [data?.store, catalogId, toast]);

    // Add to cart handler
    const addToCart = useCallback((product, quantity = 1) => {
        dispatch(addToCartAction({ product, quantity }));
        toast.showSuccess(`${product.name} added to cart`);
    }, [dispatch, toast]);

    // Update cart quantity
    const updateCartQuantity = useCallback((productId, quantity) => {
        dispatch(updateCartQuantityAction({ productId, quantity }));
    }, [dispatch]);

    // Handle Update Quantity (Called from ProductCard)
    const handleProductQuantityUpdate = useCallback((product, newQuantity) => {
        if (newQuantity <= 0) {
            updateCartQuantity(product._id, 0);
            return;
        }

        const existingItem = cartItems.find(item => item._id === product._id);
        if (!existingItem) {
            addToCart(product, newQuantity);
        } else {
            updateCartQuantity(product._id, newQuantity);
        }
    }, [cartItems, addToCart, updateCartQuantity]);

    // Share catalog link
    const handleShareCatalog = useCallback(async () => {
        try {
            await copyToClipboard(window.location.href);
            toast.showSuccess("Catalog link copied!");
        } catch (err) {
            toast.showError("Failed to copy link");
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
                <Card className="max-w-md w-full border-[rgb(var(--color-border-primary))] rounded-3xl shadow-2xl overflow-hidden">
                    <CardBody className="p-12">
                        <div className="w-24 h-24 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                            <Package className="w-12 h-12 text-red-500" />
                        </div>
                        <h2 className="text-3xl font-black text-[rgb(var(--color-text-primary))] mb-4 tracking-tight">Catalog Missing</h2>
                        <p className="text-[rgb(var(--color-text-secondary))] mb-10 leading-relaxed font-medium">
                            {error || "The catalog you are looking for does not exist or has been removed."}
                        </p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    const { store, categories } = data;

    return (
        <div className="min-h-screen bg-[rgb(var(--color-bg-secondary))] flex flex-col font-sans selection:bg-[rgb(var(--color-primary))]/30">
            {/* Header */}
            <CatalogHeader
                store={store}
                onShare={handleShareCatalog}
                onCall={handleCallStore}
            />

            {/* Hero Section */}
            <div className="relative pt-16 pb-12 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-30">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-[rgb(var(--color-primary))]/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-[rgb(var(--color-primary))]/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />
                </div>

                <div className="container mx-auto px-6 relative">
                    <div className="max-w-3xl space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[rgb(var(--color-primary))]/5 rounded-full text-[rgb(var(--color-primary))] text-xs font-black uppercase tracking-widest border border-[rgb(var(--color-primary))]/10">
                            <Sparkles className="w-3.5 h-3.5" />
                            Official Store Catalog
                        </div>
                        <h2 className="text-5xl sm:text-7xl font-black text-[rgb(var(--color-text-primary))] tracking-tighter leading-[0.9]">
                            Discover our <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary))]/50 italic">Exclusive</span> Collection
                        </h2>
                        <p className="text-lg text-[rgb(var(--color-text-secondary))] max-w-xl font-medium leading-relaxed opacity-80">
                            Explore our curated selection of premium products. Order directly via WhatsApp for a seamless shopping experience.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 pb-20 flex-1">
                <div className="flex flex-col gap-10">
                    {/* Search & Filters Bar */}
                    <div className="sticky top-0 z-40 bg-[rgb(var(--color-bg-secondary))]/90 backdrop-blur-md pt-4 pb-2 border-b border-[rgb(var(--color-border-primary))]/30 transition-all duration-300">
                        <div className="flex flex-col lg:flex-row gap-8 items-end">
                            <div className="w-full lg:max-w-sm">
                                <Input
                                    placeholder="Search catalog..."
                                    value={searchQuery}
                                    onChange={(val) => setSearchQuery(val)}
                                    leftIcon={Search}
                                />
                            </div>

                            <div className="flex-1 w-full overflow-hidden">
                                <CategoryFilter
                                    categories={categories}
                                    selectedCategory={selectedCategory}
                                    onCategoryChange={setSelectedCategory}
                                />
                            </div>
                        </div>
                    </div>


                    {/* Products Grid */}
                    {productsLoading ? (
                        <LoadingSkeleton type="catalog" count={4} />
                    ) : filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                            {filteredProducts.map((product) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    onWhatsAppShare={shareOnWhatsApp}
                                    onUpdateQuantity={handleProductQuantityUpdate}
                                    quantity={cartItems.find(item => item._id === product._id)?.quantity || 0}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 lg:py-32">
                            <EmptyState
                                title="No products found"
                                description="Your search didn't return any results. Try adjusting your keywords or clearing filters."
                                actionLabel="Reset all filters"
                                onAction={handleClearFilters}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-auto border-t border-[rgb(var(--color-border-primary))]/30 bg-[rgb(var(--color-bg-primary))] pt-20 pb-12">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-16">
                        <div className="text-center md:text-left space-y-4">
                            <div className="inline-flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-[rgb(var(--color-primary))] flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-2xl font-black text-[rgb(var(--color-text-primary))] tracking-tighter uppercase">{store?.name}</span>
                            </div>
                            <p className="text-[rgb(var(--color-text-secondary))] max-w-xs font-medium opacity-70">
                                Providing premium quality products and personalized service for our valued customers.
                            </p>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="text-center md:text-right">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[rgb(var(--color-text-tertiary))] mb-2">Developed By</p>
                                <div className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] shadow-sm">
                                    <span className="text-sm font-black text-[rgb(var(--color-text-primary))] tracking-widest uppercase">DragBizz</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-[rgb(var(--color-border-primary))]/30 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-[11px] text-[rgb(var(--color-text-tertiary))] font-bold uppercase tracking-widest">
                            &copy; {new Date().getFullYear()} {store?.name}. All Rights Reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <a href="#" className="text-[11px] font-black uppercase tracking-widest text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-primary))] transition-colors">Privacy</a>
                            <a href="#" className="text-[11px] font-black uppercase tracking-widest text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-primary))] transition-colors">Terms</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Cart Drawer */}
            <CartDrawer catalogId={catalogId} />
        </div>
    );
}

