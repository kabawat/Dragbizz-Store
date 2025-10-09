"use client"
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getInvoiceById, updateDraftInvoice } from '@/store/slices/invoicesSlice';
import { productService, customerService } from '@/service';
import { Button, Card, Input, Select, Badge } from '@/components/ui';
import { Plus, Minus, ShoppingCart, User, Calculator, Save, ArrowLeft } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { AnimatedBackground } from '@/components/ui';
import Link from 'next/link';

const EditInvoicePage = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentInvoice, isLoading: invoiceLoading } = useAppSelector((state) => state.invoices);
  const { selectedStore } = useAppSelector((state) => state.profile);

  // Local state for products and customers
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(false);

  const [formData, setFormData] = useState({
    customer: '',
    items: [],
    totalDiscount: 0
  });

  const [selectedProduct, setSelectedProduct] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);

  // Fetch products from API
  const fetchProducts = async () => {
    console.log('Edit Invoice - Fetching products for store:', selectedStore?.storeId);
    if (!selectedStore?.storeId) return;
    try {
      setProductsLoading(true);
      const result = await productService.getProducts({
        limit: 100,
        lightweight: true,
        store: selectedStore.storeId
      });
      console.log('Edit Invoice - Fetched products:', result);
      if (result.success) {
        const productsData = result.data?.data || result.data || [];
        console.log('Edit Invoice - Products data:', productsData);
        setProducts(productsData);
      } else {
        console.error('Edit Invoice - Failed to fetch products:', result.message);
      }
    } catch (error) {
      console.error('Edit Invoice - Error fetching products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  // Fetch customers from API
  const fetchCustomers = async () => {
    console.log('Edit Invoice - Fetching customers for store:', selectedStore?.storeId);
    try {
      setCustomersLoading(true);
      const params = {
        limit: 100
      };
      if (selectedStore?.storeId) {
        params.store = selectedStore.storeId;
      }
      
      const result = await customerService.getCustomers(params);
      console.log('Edit Invoice - Fetched customers:', result);
      if (result.success) {
        const customersData = result.data?.data || result.data || [];
        console.log('Edit Invoice - Customers data:', customersData);
        setCustomers(customersData);
      } else {
        console.error('Edit Invoice - Failed to fetch customers:', result.message);
      }
    } catch (error) {
      console.error('Edit Invoice - Error fetching customers:', error);
    } finally {
      setCustomersLoading(false);
    }
  };

  useEffect(() => {
    if (params.id && selectedStore?.storeId) {
      dispatch(getInvoiceById({ 
        invoiceId: params.id, 
        storeId: selectedStore.storeId 
      }));
      fetchProducts();
      fetchCustomers();
    }
  }, [dispatch, params.id, selectedStore?.storeId]);


  useEffect(() => {
    if (currentInvoice) {
      setFormData({
        customer: currentInvoice.customer?._id || currentInvoice.customer || '',
        items: currentInvoice.items || [],
        totalDiscount: currentInvoice.totalDiscount || 0
      });
    }
  }, [currentInvoice]);

  const handleAddItem = () => {
    if (!selectedProduct || itemQuantity <= 0) return;

    const product = products.find(p => p._id === selectedProduct);
    if (!product) return;

    // Check if item already exists
    const existingItemIndex = formData.items.findIndex(item => item.product === selectedProduct);
    const productPrice = product?.price || product?.sellingPrice || 0;
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...formData.items];
      updatedItems[existingItemIndex].quantity += itemQuantity;
      updatedItems[existingItemIndex].price = productPrice;
      updatedItems[existingItemIndex].total = productPrice * updatedItems[existingItemIndex].quantity;
      setFormData({ ...formData, items: updatedItems });
    } else {
      // Add new item
      const newItem = {
        product: selectedProduct,
        productName: product.name,
        quantity: itemQuantity,
        price: productPrice,
        total: productPrice * itemQuantity
      };
      setFormData({
        ...formData,
        items: [...formData.items, newItem]
      });
    }

    // Reset form
    setSelectedProduct('');
    setItemQuantity(1);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const handleUpdateQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(index);
      return;
    }

    const updatedItems = [...formData.items];
    updatedItems[index].quantity = newQuantity;
    // Recalculate total when quantity changes
    const product = products.find(p => p._id === updatedItems[index].product);
    const productPrice = product?.price || product?.sellingPrice || 0;
    updatedItems[index].total = productPrice * newQuantity;
    setFormData({ ...formData, items: updatedItems });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (item.total || 0);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return Math.max(0, subtotal - (formData.totalDiscount || 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      alert('Please add at least one item to the invoice');
      return;
    }

    if (currentInvoice?.status !== 'DRAFT') {
      alert('Only draft invoices can be edited');
      return;
    }

    try {
      const result = await dispatch(updateDraftInvoice({
        invoiceId: params.id,
        updateData: formData
      }));
      if (result.type === 'invoices/updateDraft/fulfilled') {
        router.push('/dashboard/invoices');
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
    }
  };

  if (invoiceLoading) {
    return (
      <div className="flex w-full h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
        <AnimatedBackground variant="default" />
        <Sidebar />
        <div className="min-h-screen w-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
              Loading Invoice...
            </h2>
            <p className="text-[rgb(var(--color-text-secondary))]">
              Please wait while we fetch invoice details
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentInvoice) {
    return (
      <div className="flex w-full h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
        <AnimatedBackground variant="default" />
        <Sidebar />
        <div className="min-h-screen w-full flex flex-col">
          {/* Header */}
          <Header
            title="Invoice Not Found"
            description="The requested invoice could not be found"
          />
          
          {/* Main Content */}
          <div className="flex-1 p-6">
            <Card className="p-6 text-center">
              <p className="text-red-600">Invoice not found</p>
              <Link href="/dashboard/invoices">
                <Button className="mt-4">Back to Invoices</Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (currentInvoice.status !== 'DRAFT') {
    return (
      <div className="flex w-full h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
        <AnimatedBackground variant="default" />
        <Sidebar />
        <div className="min-h-screen w-full flex flex-col">
          {/* Header */}
          <Header
            title="Cannot Edit Invoice"
            description="Only draft invoices can be edited"
          />
          
          {/* Main Content */}
          <div className="flex-1 p-6">
            <Card className="p-6 text-center">
              <p className="text-red-600">Only draft invoices can be edited</p>
              <Link href={`/dashboard/invoices/view/${params.id}`}>
                <Button className="mt-4">View Invoice</Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen relative w-full overflow-hidden">
      <AnimatedBackground variant="default" />
      <Sidebar />

      <div className="min-h-screen w-full flex flex-col">
        <Header
          title="Edit Invoice"
          description={`Edit draft invoice: ${currentInvoice.invoiceNumber}`}
        />

        <div className="flex-1 p-6">
          <div className="max-w-8xl mx-auto w-full">
            {/* Back Button */}
            <div className="flex justify-between items-center">
            <Link href="/dashboard/invoices">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Invoices
              </Button>
            </Link>
            <Badge className="bg-yellow-100 text-yellow-800">DRAFT</Badge>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Selection */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Customer Information
                  </h3>
                  <Select
                    placeholder="Select Customer (Optional)"
                    value={formData.customer}
                    onChange={(value) => setFormData({ ...formData, customer: value })}
                    disabled={customersLoading}
                  >
                    <option value="">{customersLoading ? 'Loading customers...' : 'Walk-in Customer'}</option>
                    {customers && customers.length > 0 ? customers.filter(customer => customer._id).map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name || 'Unknown'} - {customer.phone || 'No phone'}
                      </option>
                    )) : null}
                  </Select>
                </Card>

                {/* Add Items */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Edit Items
                  </h3>
                  
                  <div className="flex space-x-2 mb-4">
                    <Select
                      placeholder="Select Product"
                      value={selectedProduct}
                      onChange={setSelectedProduct}
                      className="flex-1"
                    >
                      <option value="">Choose a product...</option>
                      {products.filter(product => product._id).map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name} - ₹{product.price || product.sellingPrice || 0}
                        </option>
                      ))}
                    </Select>
                    
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                      min="1"
                      className="w-20"
                    />
                    
                    <Button type="button" onClick={handleAddItem}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Items List */}
                  {formData.items.length > 0 && (
                    <div className="space-y-2">
                      {formData.items.map((item, index) => {
                        const product = products.find(p => p._id === item.product);
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium">{product?.name}</h4>
                              <p className="text-sm text-gray-600">
                                ₹{product?.price || product?.sellingPrice || 0} × {item.quantity} = ₹{((product?.price || product?.sellingPrice || 0) * item.quantity)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateQuantity(index, item.quantity - 1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateQuantity(index, item.quantity + 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveItem(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </div>

              {/* Summary */}
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Calculator className="w-5 h-5 mr-2" />
                    Invoice Summary
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{calculateSubtotal().toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <Input
                        type="number"
                        value={formData.totalDiscount}
                        onChange={(e) => setFormData({ ...formData, totalDiscount: parseFloat(e.target.value) || 0 })}
                        min="0"
                        className="w-24 text-right"
                      />
                    </div>
                    
                    <div className="border-t pt-3">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span>₹{calculateTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={invoiceLoading || formData.items.length === 0}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {invoiceLoading ? 'Updating...' : 'Update Invoice'}
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => router.push('/dashboard/invoices')}
                    >
                      Cancel
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditInvoicePage;
