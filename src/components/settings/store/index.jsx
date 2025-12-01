"use client"
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppSelector } from '@/store/hooks';
import storeService from '@/service/retailer/store.service';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui';
import StoreHeader from './StoreHeader';
import StoreList from './StoreList';
import StoreAddDrawer from './StoreAddDrawer';
import StoreEditDrawer from './StoreEditDrawer';
import StoreDeleteModal from './StoreDeleteModal';

const StoreSettings = () => {
  const { stores: reduxStores, selectedStore, agency } = useAppSelector((state) => state.profile);
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toasts, showError, showSuccess, removeToast } = useToast();
  
  // Add drawer state
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: {
      street: '',
      line1: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    },
    category: '',
    gst: '',
    pan: ''
  });
  const [addErrors, setAddErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  
  // Edit drawer state
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [editingStoreId, setEditingStoreId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: {
      street: '',
      line1: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    },
    category: '',
    gst: '',
    pan: ''
  });
  const [editErrors, setEditErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingStore, setIsLoadingStore] = useState(false);

  // Delete state
  const [deletingStoreId, setDeletingStoreId] = useState(null);
  const [storeToDelete, setStoreToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Refs to prevent duplicate API calls
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);

  // Fetch stores from API
  const fetchStores = useCallback(async () => {
    // Prevent duplicate calls
    if (hasFetchedRef.current || isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    
    try {
      setIsLoading(true);
      const result = await storeService.getStores();

      if (result?.success) {
        const storesData = result.data?.data || result.data || [];
        setStores(storesData);
        hasFetchedRef.current = true;
      } else {
        if (reduxStores && reduxStores.length > 0) {
          setStores(reduxStores);
          hasFetchedRef.current = true;
        } else {
          showError(result?.message || 'Failed to fetch stores');
          setStores([]);
        }
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'An unexpected error occurred';
      
      if (reduxStores && reduxStores.length > 0) {
        setStores(reduxStores);
        hasFetchedRef.current = true;
      } else {
        showError(errorMessage);
        setStores([]);
      }
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [reduxStores, showError]);

  // Fetch stores on component mount (only once)
  useEffect(() => {
    fetchStores();
  }, []); 

  // Handle add store - open drawer
  const handleAddStore = () => {
    if (!agency || !agency.agencyId) {
      showError('Agency not found. Please create an agency first.');
      return;
    }
    
    // Reset form
    setAddFormData({
      name: '',
      phone: '',
      email: '',
      address: {
        street: '',
        line1: '',
        city: '',
        state: '',
        pincode: '',
        landmark: ''
      },
      category: '',
      gst: '',
      pan: ''
    });
    setAddErrors({});
    setIsAddDrawerOpen(true);
  };

  // Handle form field changes for add
  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error for this field
    if (addErrors[name]) {
      setAddErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Handle nested address fields
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setAddFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
          // Also update line1 if it's street
          ...(field === 'street' && { line1: value })
        }
      }));
    } else {
      setAddFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Validate add form
  const validateAddForm = () => {
    const newErrors = {};

    if (!addFormData.name?.trim()) {
      newErrors.name = 'Store name is required';
    }

    if (!addFormData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
      const cleanPhone = addFormData.phone.replace(/\D/g, '');
      if (!phoneRegex.test(addFormData.phone) || cleanPhone.length < 10) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    if (!addFormData.address?.city?.trim()) {
      newErrors['address.city'] = 'City is required';
    }

    if (addFormData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addFormData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (addFormData.gst && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(addFormData.gst)) {
      newErrors.gst = 'Please enter a valid GST number';
    }

    if (addFormData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(addFormData.pan)) {
      newErrors.pan = 'Please enter a valid PAN number';
    }

    setAddErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save new store
  const handleSaveNewStore = async () => {
    if (!validateAddForm()) {
      return;
    }

    if (!agency || !agency.agencyId) {
      showError('Agency not found. Please create an agency first.');
      return;
    }

    try {
      setIsCreating(true);
      setAddErrors({});
      
      // Prepare payload according to API structure
      const payload = {
        name: addFormData.name.trim(),
        phone: addFormData.phone.trim(),
        email: addFormData.email?.trim() || '',
        address: {
          street: addFormData.address.street || addFormData.address.line1 || '',
          city: addFormData.address.city,
          state: addFormData.address.state || '',
          pincode: addFormData.address.pincode || '',
          landmark: addFormData.address.landmark || ''
        },
        category: addFormData.category || '',
        gst: addFormData.gst?.trim() || '',
        pan: addFormData.pan?.trim() || '',
        agency: agency.agencyId
      };
      
      const result = await storeService.createStore(payload);
      
      if (result?.success) {
        showSuccess(result.message || 'Store created successfully!');
        
        // Refresh stores list
        hasFetchedRef.current = false;
        await fetchStores();
        
        // Close drawer
        setIsAddDrawerOpen(false);
        setAddFormData({
          name: '',
          phone: '',
          email: '',
          address: {
            street: '',
            line1: '',
            city: '',
            state: '',
            pincode: '',
            landmark: ''
          },
          category: '',
          gst: '',
          pan: ''
        });
      } else {
        // Handle field errors from API
        if (result?.error?.data?.fields) {
          setAddErrors(result.error.data.fields);
        } else {
          showError(result?.message || 'Failed to create store. Please try again.');
        }
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'An unexpected error occurred. Please try again.';
      showError(errorMessage);
      
      // Handle field errors from API
      if (error?.response?.data?.fields) {
        setAddErrors(error.response.data.fields);
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Handle cancel add
  const handleCancelAdd = () => {
    setIsAddDrawerOpen(false);
    setAddFormData({
      name: '',
      phone: '',
      email: '',
      address: {
        street: '',
        line1: '',
        city: '',
        state: '',
        pincode: '',
        landmark: ''
      },
      category: '',
      gst: '',
      pan: ''
    });
    setAddErrors({});
  };

  // Handle edit store - fetch store data and open drawer
  const handleEditStore = async (storeId) => {
    try {
      setIsLoadingStore(true);
      setEditingStoreId(storeId);
      setEditErrors({});
      
      // Fetch store details
      const result = await storeService.getStore(storeId);
      
      if (result?.success) {
        const storeData = result.data?.data || result.data || {};
        const address = storeData.address || {};
        
        // Format form data
        setEditFormData({
          name: storeData.name || '',
          phone: storeData.phone || '',
          email: storeData.email || '',
          address: {
            street: address.line1 || '',
            line1: address.line1 || '',
            city: address.city || '',
            state: address.state || '',
            pincode: address.pincode || '',
            landmark: address.landmark || ''
          },
          category: storeData.category || '',
          gst: storeData.gst || '',
          pan: storeData.pan || ''
        });
        
        setIsEditDrawerOpen(true);
      } else {
        showError(result?.message || 'Failed to fetch store details');
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'An unexpected error occurred';
      showError(errorMessage);
    } finally {
      setIsLoadingStore(false);
    }
  };

  // Handle form field changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error for this field
    if (editErrors[name]) {
      setEditErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Handle nested address fields
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setEditFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
          // Also update line1 if it's street
          ...(field === 'street' && { line1: value })
        }
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!editFormData.name?.trim()) {
      newErrors.name = 'Store name is required';
    }

    if (!editFormData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
      const cleanPhone = editFormData.phone.replace(/\D/g, '');
      if (!phoneRegex.test(editFormData.phone) || cleanPhone.length < 10) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    if (!editFormData.address?.city?.trim()) {
      newErrors['address.city'] = 'City is required';
    }

    if (editFormData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (editFormData.gst && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(editFormData.gst)) {
      newErrors.gst = 'Please enter a valid GST number';
    }

    if (editFormData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(editFormData.pan)) {
      newErrors.pan = 'Please enter a valid PAN number';
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save store
  const handleSaveStore = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      setEditErrors({});
      
      // Prepare payload according to API structure
      const payload = {
        name: editFormData.name.trim(),
        phone: editFormData.phone.trim(),
        email: editFormData.email?.trim() || '',
        address: {
          line1: editFormData.address.street || editFormData.address.line1 || '',
          line2: '',
          city: editFormData.address.city,
          state: editFormData.address.state || '',
          country: 'India',
          pincode: editFormData.address.pincode || '',
          landmark: editFormData.address.landmark || ''
        },
        category: editFormData.category || '',
        gst: editFormData.gst?.trim() || '',
        pan: editFormData.pan?.trim() || ''
      };
      
      const result = await storeService.updateStore(editingStoreId, payload);
      
      if (result?.success) {
        showSuccess(result.message || 'Store updated successfully!');
        
        // Refresh stores list
        hasFetchedRef.current = false;
        await fetchStores();
        
        // Close drawer
        setIsEditDrawerOpen(false);
        setEditingStoreId(null);
        setEditFormData({
          name: '',
          phone: '',
          email: '',
          address: {
            street: '',
            line1: '',
            city: '',
            state: '',
            pincode: '',
            landmark: ''
          },
          category: '',
          gst: '',
          pan: ''
        });
      } else {
        // Handle field errors from API
        if (result?.error?.data?.fields) {
          setEditErrors(result.error.data.fields);
        } else {
          showError(result?.message || 'Failed to update store. Please try again.');
        }
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'An unexpected error occurred. Please try again.';
      showError(errorMessage);
      
      // Handle field errors from API
      if (error?.response?.data?.fields) {
        setEditErrors(error.response.data.fields);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditDrawerOpen(false);
    setEditingStoreId(null);
    setEditFormData({
      name: '',
      phone: '',
      email: '',
      address: {
        street: '',
        line1: '',
        city: '',
        state: '',
        pincode: '',
        landmark: ''
      },
      category: '',
      gst: '',
      pan: ''
    });
    setEditErrors({});
  };

  // Handle delete store - open confirmation modal
  const handleDeleteStore = (storeId) => {
    if (!storeId) return;

    // Frontend guard: don't allow deleting the only store
    if (stores.filter(s => s.status !== 'DELETED').length <= 1) {
      showError('You must have at least one active store. The last store cannot be deleted.');
      return;
    }

    const store = stores.find(s => (s._id || s.id) === storeId);
    setStoreToDelete(store || null);
    // Don't set deletingStoreId here - only set it when user confirms deletion
    setIsDeleteModalOpen(true);
  };

  // Handle confirm delete - actual deletion process starts here
  const handleConfirmDelete = async () => {
    if (!storeToDelete) return;
    
    const storeIdToDelete = storeToDelete._id || storeToDelete.id;
    if (!storeIdToDelete) return;

    try {
      // Set deletingStoreId to show loading state in modal
      setDeletingStoreId(storeIdToDelete);
      
      const result = await storeService.deleteStore(storeIdToDelete);

      if (result?.success) {
        showSuccess(result.message || 'Store deleted successfully!');

        // Refresh stores list
        hasFetchedRef.current = false;
        await fetchStores();
      } else {
        const message = result?.message || result?.error?.message || 'Failed to delete store.';
        showError(message);
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'An unexpected error occurred.';
      showError(errorMessage);
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingStoreId(null);
      setStoreToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeletingStoreId(null);
    setStoreToDelete(null);
  };

  return (
    <div className="space-y-6">
      <StoreHeader
        storesCount={stores.length}
        isLoading={isLoading}
        onAddStore={handleAddStore}
      />

      <StoreList
        stores={stores}
        isLoading={isLoading}
        selectedStore={selectedStore}
        deletingStoreId={deletingStoreId}
        onAddStore={handleAddStore}
        onEditStore={handleEditStore}
        onDeleteStore={handleDeleteStore}
      />

      <StoreAddDrawer
        isOpen={isAddDrawerOpen}
        isCreating={isCreating}
        form={addFormData}
        errors={addErrors}
        onChange={handleAddFormChange}
        onSave={handleSaveNewStore}
        onCancel={handleCancelAdd}
      />

      <StoreEditDrawer
        isOpen={isEditDrawerOpen}
        isSaving={isSaving}
        isLoadingStore={isLoadingStore}
        form={editFormData}
        errors={editErrors}
        onChange={handleFormChange}
        onSave={handleSaveStore}
        onCancel={handleCancelEdit}
      />

      <StoreDeleteModal
        isOpen={isDeleteModalOpen}
        storeToDelete={storeToDelete}
        deletingStoreId={deletingStoreId}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default StoreSettings;
