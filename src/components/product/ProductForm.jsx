"use client"
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ProgressBar } from '../ui';
import { SectionCard } from '../layout';
import BasicInfoSection from './BasicInfoSection';
import PricingSection from './PricingSection';
import GSTSection from './GSTSection';
import AdditionalDetailsSection from './AdditionalDetailsSection';
import StatusSection from './StatusSection';
import { Package, DollarSign, Receipt, Settings, Eye, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Section Component
const SortableSection = ({ id, children, title, subtitle, icon: Icon }) => {
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

  return (
    <div ref={setNodeRef} style={style} className="relative group break-inside-avoid mb-6">
      <SectionCard
        title={title}
        subtitle={subtitle}
        icon={Icon}
        className="relative"
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-4 right-4 cursor-grab active:cursor-grabbing p-2 rounded-lg hover:bg-[rgb(var(--color-bg-secondary))] transition-colors duration-200 opacity-0 group-hover:opacity-100 z-10"
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
        </div>
        {children}
      </SectionCard>
    </div>
  );
};

const ProductForm = ({
  initialData = {},
  onSubmit,
  onSaveDraft,
  onCancel,
  onChange,
  loading = false,
  className = '',
  ...props
}) => {
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    brand: '',
    category: '',
    subcategories: [],
    description: '',
    images: [],
    barcode: '',
    tags: [],
    
    // Pricing
    basePrice: '',
    mrp: '',
    sellingPrice: '',
    discount: '',
    currency: 'INR',
    uom: 'piece',
    
    // GST
    gstApplicable: false,
    gstRate: '',
    gstType: '',
    hsnCode: '',
    sacCode: '',
    cgstRate: '',
    sgstRate: '',
    igstRate: '',
    utgstRate: '',
    cessRate: '',
    
    // Additional Details
    seoTitle: '',
    seoDescription: '',
    weight: '',
    weightUnit: 'g',
    dimensions: {
      length: '',
      width: '',
      height: ''
    },
    warranty: '',
    warrantyUnit: 'months',
    manufacturer: '',
    countryOfOrigin: '',
    
    // Status
    status: 'DRAFT',
    visibility: 'PUBLIC',
    featured: false,
    bestSeller: false,
    newArrival: false,
    
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const lastFormDataRef = useRef({});

  // Section configuration with drag-and-drop support
  const [sections, setSections] = useState([
    { id: 'basic', title: 'Basic Information', subtitle: 'Product name, description, and basic details', icon: Package, component: BasicInfoSection },
    { id: 'pricing', title: 'Pricing Information', subtitle: 'Set product prices and currency', icon: DollarSign, component: PricingSection },
    { id: 'gst', title: 'GST Information', subtitle: 'Tax settings and compliance', icon: Receipt, component: GSTSection },
    { id: 'additional', title: 'Additional Details', subtitle: 'SEO, dimensions, warranty, and more', icon: Eye, component: AdditionalDetailsSection },
    { id: 'status', title: 'Status & Visibility', subtitle: 'Product status and visibility settings', icon: Settings, component: StatusSection },
  ]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Calculate step completion - memoized to prevent infinite re-renders
  const stepCompletion = useMemo(() => {
    const steps = [
      {
        id: 'basic',
        title: 'Basic Info',
        description: 'Product details',
        fields: ['name', 'brand', 'category', 'description'],
        requiredFields: ['name']
      },
      {
        id: 'pricing',
        title: 'Pricing',
        description: 'Price & currency',
        fields: ['basePrice', 'mrp', 'sellingPrice', 'currency', 'uom'],
        requiredFields: ['basePrice', 'mrp', 'sellingPrice']
      },
      {
        id: 'gst',
        title: 'GST',
        description: 'Tax information',
        fields: ['gstApplicable', 'gstRate', 'gstType', 'hsnCode'],
        requiredFields: formData.gstApplicable ? ['gstRate', 'gstType'] : []
      },
      {
        id: 'additional',
        title: 'Additional',
        description: 'Extra details',
        fields: ['weight', 'dimensions', 'warranty', 'manufacturer'],
        requiredFields: []
      },
      {
        id: 'status',
        title: 'Status',
        description: 'Product status',
        fields: ['status', 'visibility', 'featured', 'bestSeller', 'newArrival'],
        requiredFields: ['status', 'visibility']
      }
    ];

    return steps.map(step => {
      const completedFields = step.requiredFields.filter(field => {
        const value = formData[field];
        return value !== '' && value !== null && value !== undefined;
      });
      
      const isCompleted = step.requiredFields.length === 0 || 
        completedFields.length === step.requiredFields.length;
      
      return {
        ...step,
        completed: isCompleted,
        progress: step.requiredFields.length > 0 ? 
          Math.round((completedFields.length / step.requiredFields.length) * 100) : 100
      };
    });
  }, [formData]);

  const completedSteps = stepCompletion.filter(step => step.completed).length;
  const totalSteps = stepCompletion.length;
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

  // Handle drag and drop
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

  // Handle form data changes
  const handleFormDataChange = (newData) => {
    setFormData(newData);
    setIsDirty(true);
    
    // Clear errors for changed fields
    const changedFields = Object.keys(newData);
    const newErrors = { ...errors };
    changedFields.forEach(field => {
      if (newErrors[field]) {
        delete newErrors[field];
      }
    });
    setErrors(newErrors);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.name?.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) {
      newErrors.basePrice = 'Base price must be greater than 0';
    }

    if (!formData.mrp || parseFloat(formData.mrp) <= 0) {
      newErrors.mrp = 'MRP must be greater than 0';
    }

    if (!formData.sellingPrice || parseFloat(formData.sellingPrice) <= 0) {
      newErrors.sellingPrice = 'Selling price must be greater than 0';
    }

    if (!formData.initialStock || parseFloat(formData.initialStock) < 0) {
      newErrors.initialStock = 'Initial stock quantity is required';
    }

    // Business logic validation
    if (formData.sellingPrice && formData.mrp && parseFloat(formData.sellingPrice) > parseFloat(formData.mrp)) {
      newErrors.sellingPrice = 'Selling price cannot be higher than MRP';
    }

    if (formData.minStock && formData.maxStock && parseFloat(formData.minStock) > parseFloat(formData.maxStock)) {
      newErrors.minStock = 'Minimum stock cannot be higher than maximum stock';
    }

    if (formData.reorderPoint && formData.minStock && parseFloat(formData.reorderPoint) > parseFloat(formData.minStock)) {
      newErrors.reorderPoint = 'Reorder point should be lower than minimum stock level';
    }

    // GST validation
    if (formData.gstApplicable) {
      if (!formData.gstRate) {
        newErrors.gstRate = 'GST rate is required when GST is applicable';
      }
      if (!formData.gstType) {
        newErrors.gstType = 'GST type is required when GST is applicable';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (isDraft = false) => {
    if (!isDraft && !validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      status: isDraft ? 'DRAFT' : formData.status
    };

    if (isDraft) {
      onSaveDraft?.(submitData);
    } else {
      onSubmit?.(submitData);
    }
  };

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!isDirty) return;

    const autoSaveTimer = setTimeout(() => {
      if (onSaveDraft) {
        onSaveDraft(formData);
        setIsDirty(false);
      }
    }, 30000);

    return () => clearTimeout(autoSaveTimer);
  }, [formData, isDirty, onSaveDraft]);

  // Pass step completion data to parent - only when form data actually changes
  useEffect(() => {
    if (onChange && JSON.stringify(formData) !== JSON.stringify(lastFormDataRef.current)) {
      lastFormDataRef.current = formData;
      onChange({
        ...formData,
        stepCompletion,
        completionPercentage,
        completedSteps,
        totalSteps
      });
    }
  }, [formData, stepCompletion, completionPercentage, completedSteps, totalSteps, onChange]);

  return (
    <div className={`space-y-6 ${className}`} {...props}>
      {/* Form Sections - Drag and Drop Layout */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sections.map(section => section.id)} strategy={verticalListSortingStrategy}>
          <div className="columns-1 lg:columns-2 gap-6 space-y-6">
            {sections.map((section, index) => {
              const SectionComponent = section.component;
              return (
                <SortableSection
                  key={section.id}
                  id={section.id}
                  title={section.title}
                  subtitle={section.subtitle}
                  icon={section.icon}
                >
                  <SectionComponent
                    formData={formData}
                    onChange={handleFormDataChange}
                    errors={errors}
                  />
                </SortableSection>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default ProductForm;
