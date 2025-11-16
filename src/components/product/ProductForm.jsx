"use client"
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Package, Eye, IndianRupee, GripVertical, Info, X } from 'lucide-react';

// Import drag and drop
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, } from '@dnd-kit/sortable';
import { useSortable, } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Import sections
import BasicInfoSection from './BasicInfoSection';
import AdditionalDetailsSection from './AdditionalDetailsSection';
import PricingGSTSection from './PricingGSTSection';
import OpeningQuantitySection from './OpeningQuantitySection';

import { Card, CardHeader, CardTitle, CardDescription, CardBody, Input, Button, Textarea, Select, TagInput, FileUpload } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { categoryService } from '@/service/retailer';

// Sortable Section Component
const SortableSection = ({ id, title, subtitle, icon: Icon, children, onInfoClick }) => {
  const { themeConfig, currentVariant } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Theme-aware glass effect styles
  const getGlassStyles = () => {
    const isDark = currentVariant === 'dark';

    if (isDark) {
      return {
        card: `backdrop-blur-[1px] bg-black/20 border border-white/20 shadow-xl`,
        header: `border-b border-white/15`,
        body: ``,
        icon: `bg-[${themeConfig.primary}]/20 backdrop-blur-sm  border-[${themeConfig.primary}]/10`,
        dragHandle: `backdrop-blur-sm bg-black/10 hover:bg-black/20`,
        title: `text-white`,
        description: `text-gray-300`
      };
    } else {
      return {
        card: `backdrop-blur-[1px] bg-white/20 border border-gray-200/30`,
        header: `backdrop-blur-sm border-b border-gray-200/20`,
        body: `backdrop-blur-sm`,
        icon: `bg-[${themeConfig.primary}]/20 backdrop-blur-sm border border-gray-200/60`,
        dragHandle: `backdrop-blur-sm bg-white/10 hover:bg-white/20`,
        title: `text-gray-800`,
        description: `text-gray-600`
      };
    }
  };

  const glassStyles = getGlassStyles();

  return (
    <div ref={setNodeRef} style={style} className="break-inside-avoid">
      <Card
        // shadow="sm"
        className={`relative ${glassStyles.card}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className={`absolute top-2 right-2 p-2 cursor-grab active:cursor-grabbing text-gray-600 z-50 ${glassStyles.dragHandle} ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <CardHeader className={`${glassStyles.header} pr-20`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 backdrop-blur-sm rounded-lg ${glassStyles.icon}`}>
              <Icon className="w-5 h-5 text-[rgb(var(--color-primary))]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <CardTitle className={`text-lg ${glassStyles.title}`}>{title}</CardTitle>
                <button
                  onClick={() => onInfoClick(id)}
                  className="p-1 hover:bg-[rgb(var(--color-bg-secondary))] rounded-full transition-colors duration-200 group/info cursor-pointer"
                  title="Section Information"
                >
                  <Info className="w-4 h-4 text-[rgb(var(--color-text-tertiary))] group-hover/info:text-[rgb(var(--color-primary))]" />
                </button>
              </div>
              <CardDescription className={glassStyles.description}>{subtitle}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardBody className={glassStyles.body}>
          {children}
        </CardBody>
      </Card>
    </div>
  );
};

const ProductForm = ({
  formData = {},
  onChange = () => { },
  fieldErrors = {},
  storeId = null,
  className = '',
}) => {
  const { themeConfig, currentVariant } = useTheme();
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [currentInfoSection, setCurrentInfoSection] = useState(null);

  // Theme-aware drawer styles
  const getDrawerStyles = () => {
    const isDark = currentVariant === 'dark';

    if (isDark) {
      return {
        backdrop: 'backdrop-blur-[1px]',
        drawer: 'bg-gray-900 border-l border-gray-700',
        header: 'bg-gray-800 border-b border-gray-700',
        content: 'bg-gray-900',
        footer: 'bg-gray-800 border-t border-gray-700',
        text: {
          primary: 'text-white',
          secondary: 'text-gray-300',
          tertiary: 'text-gray-400'
        },
        button: {
          hover: 'hover:bg-gray-700',
          outline: 'border-gray-600 text-gray-300 hover:bg-gray-700'
        }
      };
    } else {
      return {
        backdrop: 'backdrop-blur-[1px]',
        drawer: 'bg-white border-l border-gray-200',
        header: 'bg-gray-50 border-b border-gray-200',
        content: 'bg-white',
        footer: 'bg-gray-50 border-t border-gray-200',
        text: {
          primary: 'text-gray-900',
          secondary: 'text-gray-600',
          tertiary: 'text-gray-500'
        },
        button: {
          hover: 'hover:bg-gray-100',
          outline: 'border-gray-300 text-gray-700 hover:bg-gray-100'
        }
      };
    }
  };

  const drawerStyles = getDrawerStyles();

  // Category drawer state
  const [showAddCategoryDrawer, setShowAddCategoryDrawer] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({
    name: '',
    description: '',
    metadata: {
      icon: null,
      tags: []
    }
  });
  const [apiCategories, setApiCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Ref to prevent duplicate API calls
  const hasFetchedCategories = useRef(false);

  const [sections, setSections] = useState([
    { id: 'basic', title: 'Basic Information', subtitle: 'Product name, brand, and basic details', icon: Package, component: BasicInfoSection },
    { id: 'pricing-gst', title: 'Pricing Information', subtitle: 'Set product prices, currency, and tax settings', icon: IndianRupee, component: PricingGSTSection },
    { id: 'opening-quantity', title: 'Opening Stock', subtitle: 'Initial inventory quantity and purchase price', icon: Package, component: OpeningQuantitySection },
    { id: 'content', title: 'Content & SEO', subtitle: 'Descriptions, features, and SEO content', icon: Eye, component: AdditionalDetailsSection },
  ]);

  // Section information data
  const sectionInfo = {
    'basic': {
      title: 'Basic Information',
      description: 'Essential product details required for listing',
      details: [
        'Product Name: The main title of your product',
        'Brand: Manufacturer or brand name',
        'Category: Product category for better organization',
        'Barcode: Optional product identification code'
      ],
      tips: 'These fields are mandatory and help customers identify your product easily.'
    },
    'pricing-gst': {
      title: 'Pricing Information',
      description: 'Product pricing and tax configuration',
      details: [
        'MRP: Maximum Retail Price as per regulations',
        'Selling Price: Actual price customers will pay',
        'Currency: Currency for pricing (default: INR)',
        'Unit of Measure: How the product is sold (PCS, KG, etc.)',
        'GST: Tax settings if applicable'
      ],
      tips: 'Ensure pricing is competitive and GST compliance is maintained.'
    },
    'content': {
      title: 'Content & SEO',
      description: 'Detailed product information and marketing content',
      details: [
        'Short Description: Brief product summary (max 200 chars)',
        'Long Description: Detailed product information (max 2000 chars)',
        'Features: Key product features and benefits',
        'Tags: Searchable keywords for better discoverability',
        'Specifications: Technical details and specifications'
      ],
      tips: 'Rich content helps customers make informed decisions and improves SEO.'
    },
    'status': {
      title: 'Status & Visibility',
      description: 'Product status and visibility settings',
      details: [
        'Product Status: Draft, Active, Inactive, etc.',
        'Visibility: Public, Private, or Hidden',
        'Featured: Highlight on homepage',
        'Best Seller: Mark as popular product',
        'New Arrival: Mark as recently added'
      ],
      tips: 'Configure these settings to control how your product appears to customers.'
    },
    'opening-quantity': {
      title: 'Opening Stock',
      description: 'Initial inventory quantity and purchase price',
      details: [
        'Opening Quantity: Initial stock quantity for this product',
        'Opening Purchase Price: Cost price per unit for opening stock',
        'Total Value: Automatically calculated (Quantity × Purchase Price)',
        'Unit of Measure: Uses the UOM from pricing section'
      ],
      tips: 'This represents your initial inventory investment and helps in cost tracking.'
    }
  };

  // Handle info button click
  const handleInfoClick = (sectionId) => {
    setCurrentInfoSection(sectionInfo[sectionId]);
    setShowInfoModal(true);
  };

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    if (!storeId || hasFetchedCategories.current) return;
    hasFetchedCategories.current = true;

    try {
      setCategoriesLoading(true);
      const response = await categoryService.getCategories({
        limit: 100,
        store: storeId,
        lightweight: true
      });
      if (response.success) {
        const categories = response.data?.data || response.data || [];
        const formattedCategories = categories.map(category => ({
          value: category.id || category._id,
          label: category.name
        }));
        setApiCategories(formattedCategories);
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      hasFetchedCategories.current = false; // Reset on error
    } finally {
      setCategoriesLoading(false);
    }
  }, [storeId]);

  // Fetch categories on component mount
  useEffect(() => {
    if (storeId) {
      fetchCategories();
    }
  }, [storeId, fetchCategories]);

  // Handle category drawer
  const handleAddCategoryClick = () => {
    setShowAddCategoryDrawer(true);
  };

  // Reset category data to initial state
  const resetCategoryData = () => {
    setNewCategoryData({
      name: '',
      description: '',
      metadata: {
        icon: null,
        tags: []
      }
    });
  };

  // Close category drawer and reset data
  const handleCloseCategoryDrawer = () => {
    setShowAddCategoryDrawer(false);
    resetCategoryData();
  };

  const handleAddCategory = async () => {
    if (newCategoryData.name.trim()) {
      try {
        // Create API payload
        const apiPayload = {
          name: newCategoryData.name.trim(),
          description: newCategoryData.description.trim(),
          metadata: null
        };

        // Call the category service
        const response = await categoryService.createCategory(apiPayload, storeId);

        if (response.success) {
          // Create dropdown option for immediate use
          const newCategory = {
            value: response.data.id || `custom-${newCategoryData.name.toLowerCase().replace(/\s+/g, '-')}`,
            label: newCategoryData.name.trim()
          };

          // Refresh categories list from API
          hasFetchedCategories.current = false; // Reset to allow refetch
          await fetchCategories();

          // Set as selected category
          onChange('category', newCategory.value);

          // Reset form and close drawer
          resetCategoryData();
          setShowAddCategoryDrawer(false);
        } else {
          console.error('Failed to create category:', response.message);
        }
      } catch (error) {
        console.error('Error creating category:', error);
      }
    }
  };

  // Close drawer on escape key and prevent body scroll
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showAddCategoryDrawer) {
        handleCloseCategoryDrawer();
      }
    };

    if (showAddCategoryDrawer) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showAddCategoryDrawer]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle form data changes
  const handleFormDataChange = (fieldName, value) => {
    if (onChange) {
      onChange(fieldName, value);
    }
  };

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sections.map(section => section.id)} strategy={verticalListSortingStrategy}>
          <div className="columns-1 lg:columns-2 gap-6 space-y-6">
            {sections.map((section) => {
              const SectionComponent = section.component;

              return (
                <SortableSection
                  key={section.id}
                  id={section.id}
                  title={section.title}
                  subtitle={section.subtitle}
                  icon={section.icon}
                  onInfoClick={handleInfoClick}
                >
                  {section.id === 'basic' ? (
                    <SectionComponent
                      formData={formData}
                      onChange={handleFormDataChange}
                      errors={fieldErrors}
                      onAddCategoryClick={handleAddCategoryClick}
                      apiCategories={apiCategories}
                      categoriesLoading={categoriesLoading}
                    />
                  ) : section.id === 'opening-quantity' ? (
                    <SectionComponent
                      formData={formData}
                      onChange={handleFormDataChange}
                      errors={fieldErrors}
                      storeId={storeId}
                    />
                  ) : (
                    <SectionComponent formData={formData} onChange={handleFormDataChange} errors={fieldErrors} />
                  )}
                </SortableSection>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* Info Modal */}
      {showInfoModal && currentInfoSection && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center p-4 z-[9999]">
          <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                  {currentInfoSection.title}
                </h3>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="p-2  cursor-pointer hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-[rgb(var(--color-text-secondary))]">
                  {currentInfoSection.description}
                </p>

                <div>
                  <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                    Fields in this section:
                  </h4>
                  <ul className="space-y-1">
                    {currentInfoSection.details.map((detail, index) => (
                      <li key={index} className="text-sm text-[rgb(var(--color-text-secondary))] flex items-start">
                        <span className="w-2 h-2 bg-[rgb(var(--color-primary))] rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg border border-[rgb(var(--color-border-primary))]">
                  <p className="text-sm text-[rgb(var(--color-text-primary))] font-medium">
                    💡 Tip: {currentInfoSection.tips}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Page Add Category Drawer */}
      {showAddCategoryDrawer && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 ${drawerStyles.backdrop} z-[9999] animate-in fade-in duration-300`}
            onClick={handleCloseCategoryDrawer}
          />

          {/* Full Page Drawer - slides from right edge of viewport */}
          <div className={`fixed top-0 right-0 h-screen w-[600px] ${drawerStyles.drawer} shadow-2xl z-[9999] transform transition-transform duration-300 ease-out`}>
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className={`flex items-center justify-between p-4 ${drawerStyles.header}`}>
                <h2 className={`text-base font-semibold ${drawerStyles.text.primary}`}>
                  Add New Category
                </h2>
                <button
                  onClick={handleCloseCategoryDrawer}
                  className={`p-2 ${drawerStyles.button.hover} rounded-lg transition-colors cursor-pointer`}
                >
                  <X className={`w-5 h-5 ${drawerStyles.text.primary}`} />
                </button>
              </div>

              {/* Content */}
              <div className={`flex-1 p-6 overflow-y-auto ${drawerStyles.content}`}>
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className={`text-lg font-medium ${drawerStyles.text.primary}`}>Basic Information</h3>

                    <Input
                      label="Category Name"
                      placeholder="Enter category name (e.g., Electronics)"
                      value={newCategoryData.name}
                      onChange={(value) => setNewCategoryData(prev => ({ ...prev, name: value }))}
                      required
                    />

                    <Textarea
                      label="Description"
                      placeholder="Enter category description (e.g., Electronic devices and accessories)"
                      value={newCategoryData.description}
                      onChange={(value) => setNewCategoryData(prev => ({ ...prev, description: value }))}
                      rows={3}
                    />
                  </div>

                  {/* Metadata */}
                  <div className="space-y-4">
                    <h3 className={`text-lg font-medium ${drawerStyles.text.primary}`}>Category Settings</h3>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <FileUpload
                          label="Category Icon"
                          accept="image/*"
                          multiple={false}
                          value={newCategoryData.metadata.icon ? [newCategoryData.metadata.icon] : []}
                          onChange={(files) => {
                            if (files && files.length > 0) {
                              setNewCategoryData(prev => ({
                                ...prev,
                                metadata: { ...prev.metadata, icon: files[0] }
                              }));
                            } else {
                              setNewCategoryData(prev => ({
                                ...prev,
                                metadata: { ...prev.metadata, icon: null }
                              }));
                            }
                          }}
                          helperText="Upload an icon image for this category. Drag and drop or click to select."
                          maxSize={2 * 1024 * 1024} // 2MB limit for icons
                        />
                      </div>
                    </div>

                    <TagInput
                      label="Tags"
                      placeholder="Add tags (e.g., tech, gadgets)"
                      value={newCategoryData.metadata.tags}
                      onChange={(value) => setNewCategoryData(prev => ({
                        ...prev,
                        metadata: { ...prev.metadata, tags: value }
                      }))}
                    />
                  </div>

                  <div className={`rounded-lg p-4 ${currentVariant === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <h3 className={`text-sm font-medium ${drawerStyles.text.primary} mb-2`}>
                      About Categories
                    </h3>
                    <p className={`text-sm ${drawerStyles.text.secondary}`}>
                      Categories help organize your products and make them easier to find.
                      This category will be available for all your future products.
                    </p>
                  </div>

                  <div className={`rounded-lg p-4 ${currentVariant === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                    <h3 className={`text-sm font-medium ${currentVariant === 'dark' ? 'text-blue-300' : 'text-blue-700'} mb-2`}>
                      💡 Tip
                    </h3>
                    <p className={`text-sm ${currentVariant === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                      Use descriptive names like "Electronics", "Clothing", or "Home & Garden"
                      to make your products easy to categorize.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className={`p-4 ${drawerStyles.footer}`}>
                <div className="flex gap-3">
                  <Button type="button" onClick={handleAddCategory} disabled={!newCategoryData.name.trim()} >
                    Add Category
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className={drawerStyles.button.outline}
                    onClick={handleCloseCategoryDrawer}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductForm;