"use client"
import React, { useState, useEffect } from 'react';
import { X, Receipt, Building2, Package, IndianRupee, Calendar, Save, Plus, Minus } from 'lucide-react';
import { Button, Input, Select, Textarea, Card, AddActionButton } from '@/components/ui';
import { productService, billService } from '@/service/retailer';
import { useAppSelector } from '@/store/hooks';

const CreateBillDrawer = ({
    isOpen,
    onClose,
    purchaseOrder,
    onSuccess
}) => {
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id || '';
    const [formData, setFormData] = useState({
        supplier: '',
        purchaseOrder: '',
        billDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        notes: '',
        items: []
    });

    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [errors, setErrors] = useState({});
    // Handle escape key and body scroll lock
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Initialize form data when purchase order changes
    useEffect(() => {
        if (purchaseOrder && isOpen) {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 30);

            setFormData({
                supplier: purchaseOrder.supplier?.id || '',
                purchaseOrder: purchaseOrder.id || purchaseOrder._id || '',
                billDate: new Date().toISOString().split('T')[0],
                dueDate: dueDate.toISOString().split('T')[0],
                notes: '',
                items: purchaseOrder.items?.map(item => ({
                    product: item.product,
                    productName: '',
                    quantity: item.quantity || 1,
                    purchasePrice: 0,
                    expiryDate: ''
                })) || []
            });
        }
    }, [purchaseOrder, isOpen]);

    // Fetch products
    useEffect(() => {
        if (isOpen && storeId) {
            fetchProducts();
        }
    }, [isOpen, storeId]);

    const fetchProducts = async () => {
        try {
            setProductsLoading(true);
            const result = await productService.getProducts({
                limit: 100,
                lightweight: true,
                store: storeId
            });
            if (result.success) {
                const productsData = result.data || [];
                setProducts(productsData);

                // Update product names in form data
                setFormData(prev => ({
                    ...prev,
                    items: prev.items.map(item => ({
                        ...item,
                        productName: productsData.find(p => (p.id || p._id) === item.product)?.name || ''
                    }))
                }));
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setProductsLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };

    const handleItemChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, {
                product: '',
                productName: '',
                quantity: 1,
                purchasePrice: 0,
                expiryDate: ''
            }]
        }));
    };

    const removeItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const calculateTotal = () => {
        return formData.items.reduce((total, item) => {
            return total + (item.quantity * item.purchasePrice);
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.items.length === 0) {
            setErrors({ items: 'At least one item is required' });
            return;
        }

        try {
            setIsCreating(true);
            setErrors({});

            const billData = {
                ...formData,
                store: storeId,
                totalAmount: calculateTotal(),
                items: formData.items.map(item => ({
                    product: item.product,
                    quantity: item.quantity,
                    purchasePrice: item.purchasePrice,
                    expiryDate: item.expiryDate
                }))
            };

            const result = await billService.createBill(billData);

            if (result.success) {
                onSuccess?.(result.data);
                onClose();
            } else {
                setErrors({ submit: result.message || 'Failed to create bill' });
            }
        } catch (error) {
            setErrors({ submit: error.message || 'Failed to create bill' });
        } finally {
            setIsCreating(false);
        }
    };

    const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);

    const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    if (!isOpen || !purchaseOrder) return null;

    return (
        <>
            {/* Backdrop with glass effect */}
            <div className="fixed inset-0 backdrop-blur-[1px] z-[9998] transition-opacity duration-300"/>

            {/* Drawer */}
            <div className="fixed right-0 top-0 h-full w-full xl:w-1/2 bg-[rgb(var(--color-bg-primary))] shadow-2xl z-[9999] transform transition-transform duration-300 ease-in-out">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--color-border-primary))]">
                        <div>
                            <h2 className="text-xl font-bold text-[rgb(var(--color-text-primary))]">
                                Create Bill
                            </h2>
                            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                                From Purchase Order #{purchaseOrder.poNumber}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors">
                            <X className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Purchase Order Info and Supplier Info - Side by Side */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Purchase Order Info */}
                                <Card className="p-4 shadow-none">
                                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-3 flex items-center">
                                        <Receipt className="w-5 h-5 mr-2" />
                                        Purchase Order Details
                                    </h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-[rgb(var(--color-text-secondary))] w-40 whitespace-nowrap">PO Number:</span>
                                            <p className="font-medium text-[rgb(var(--color-text-primary))] text-right flex-1 truncate" title={String(purchaseOrder.poNumber)}>{purchaseOrder.poNumber}</p>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-[rgb(var(--color-text-secondary))] w-40 whitespace-nowrap">PO Date:</span>
                                            <p className="font-medium text-[rgb(var(--color-text-primary))] text-right flex-1 truncate" title={formatDate(purchaseOrder.poDate)}>{formatDate(purchaseOrder.poDate)}</p>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-[rgb(var(--color-text-secondary))] w-40 whitespace-nowrap">Expected Delivery:</span>
                                            <p className="font-medium text-[rgb(var(--color-text-primary))] text-right flex-1 truncate" title={formatDate(purchaseOrder.expectedDeliveryDate)}>{formatDate(purchaseOrder.expectedDeliveryDate)}</p>
                                        </div>
                                    </div>
                                </Card>

                                {/* Supplier Info */}
                                <Card className="p-4 shadow-none">
                                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-3 flex items-center">
                                        <Building2 className="w-5 h-5 mr-2" />
                                        Supplier Information
                                    </h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-[rgb(var(--color-text-secondary))] w-40 whitespace-nowrap">Name:</span>
                                            <p className="font-medium text-[rgb(var(--color-text-primary))] text-right flex-1 truncate" title={purchaseOrder.supplier?.name || ''}>{purchaseOrder.supplier?.name}</p>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-[rgb(var(--color-text-secondary))] w-40 whitespace-nowrap">Email:</span>
                                            <p className="font-medium text-[rgb(var(--color-text-primary))] text-right flex-1 truncate" title={purchaseOrder.supplier?.email || ''}>{purchaseOrder.supplier?.email}</p>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-[rgb(var(--color-text-secondary))] w-40 whitespace-nowrap">Phone:</span>
                                            <p className="font-medium text-[rgb(var(--color-text-primary))] text-right flex-1 truncate" title={purchaseOrder.supplier?.phone || ''}>{purchaseOrder.supplier?.phone}</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Bill Details */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Input label="Bill Date" size="sm" type="date" value={formData.billDate} onChange={(value) => handleInputChange('billDate', value)} leftIcon={Calendar} />
                                </div>
                                <div>
                                    <Input label="Due Date" size="sm" type="date" value={formData.dueDate} onChange={(value) => handleInputChange('dueDate', value)} leftIcon={Calendar} />
                                </div>
                            </div>

                            {/* Items */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] flex items-center">
                                    <Package className="w-5 h-5 mr-2" />
                                    Items ({formData.items.length})
                                </h3>
                                <AddActionButton 
                                    onClick={addItem}
                                    label="Add Item"
                                    Icon={Plus}
                                    size="sm"
                                    variant="success"
                                />
                            </div>

                            <div className="space-y-3">
                                {formData.items.map((item, index) => (
                                    <div key={index} className="group p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                                                Item {index + 1}
                                            </h4>
                                            {formData.items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 cursor-pointer"
                                                    title="Remove item"
                                                >
                                                    <Minus className="w-4 h-4 text-red-500 group-hover:text-red-600 transition-colors duration-200" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-4">
                                                <Select
                                                    label="Product"
                                                    size="sm"
                                                    value={item.product}
                                                    onChange={(value) => {
                                                        const selected = products.find(p => (p.id || p._id) === value);
                                                        handleItemChange(index, 'product', value);
                                                        handleItemChange(index, 'productName', selected?.name || '');
                                                    }}
                                                    options={products.map(p => ({ value: (p.id || p._id), label: p.name }))}
                                                    placeholder="Select product"
                                                    searchable
                                                    disabled={productsLoading}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <Input
                                                    label="Quantity"
                                                    size="sm"
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(value) => handleItemChange(index, 'quantity', value || "")}
                                                    min="1"
                                                    className="text-center"
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <Input
                                                    label="Purchase Price/(unit)"
                                                    size="sm"
                                                    type="number"
                                                    value={item.purchasePrice}
                                                    onChange={(value) => handleItemChange(index, 'purchasePrice', value || "")}
                                                    min="0"
                                                    step="0.01"
                                                    leftIcon={IndianRupee}
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <Input
                                                    label="Expiry Date"
                                                    size="sm"
                                                    type="date"
                                                    value={item.expiryDate}
                                                    onChange={(value) => handleItemChange(index, 'expiryDate', value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {errors.items && (
                                <p className="text-sm text-red-600 mt-2">{errors.items}</p>
                            )}

                            {/* Notes */}
                            <div>
                                <Textarea
                                    label="Notes"
                                    value={formData.notes}
                                    onChange={(value) => handleInputChange('notes', value)}
                                    placeholder="Add any additional notes..."
                                    rows={3}
                                />
                            </div>

                            {/* Total */}
                            <Card className="p-4 border-0 shadow-none">
                                <div className="flex items-center justify-end gap-3">
                                    <span className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                                        Total Amount:
                                    </span>
                                    <span className="text-xl font-bold text-[rgb(var(--color-primary))]">
                                        {formatCurrency(calculateTotal())}
                                    </span>
                                </div>
                            </Card>

                            {/* Error Message */}
                            {errors.submit && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                                    <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-start gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={onClose} >
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" disabled={isCreating} leftIcon={Save} >
                                    {isCreating ? 'Creating...' : 'Create Bill'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreateBillDrawer;
