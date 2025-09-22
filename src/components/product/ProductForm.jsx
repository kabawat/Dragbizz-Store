"use client"
import React, { useState } from 'react';
import { Package, Eye, DollarSign, Receipt, Settings, GripVertical } from 'lucide-react';

// Import drag and drop
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

// Import sections
import BasicInfoSection from './BasicInfoSection';
import AdditionalDetailsSection from './AdditionalDetailsSection';
import PricingSection from './PricingSection';
import GSTSection from './GSTSection';
import StatusSection from './StatusSection';

// Import UI components
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '@/components/ui';

// Import theme context
import { useTheme } from '@/contexts/ThemeContext';

// Sortable Section Component
const SortableSection = ({ id, title, subtitle, icon: Icon, children }) => {
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
        card: `backdrop-blur-md bg-black/20 border border-white/20 shadow-xl`,
        header: `border-b border-white/15`,
        body: ``,
        icon: `bg-[${themeConfig.primary}]/20 backdrop-blur-sm  border-[${themeConfig.primary}]/10`,
        dragHandle: `backdrop-blur-sm bg-black/10 hover:bg-black/20`,
        title: `text-white`,
        description: `text-gray-300`
      };
    } else {
      return {
        card: `backdrop-blur-md bg-white/20 border border-gray-200/30`,
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
        
        <CardHeader className={`${glassStyles.header} pr-16`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 backdrop-blur-sm rounded-lg ${glassStyles.icon}`}>
              <Icon className="w-5 h-5 text-[rgb(var(--color-primary))]" />
            </div>
            <div>
              <CardTitle className={`text-lg ${glassStyles.title}`}>{title}</CardTitle>
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
  onChange = () => {},
  fieldErrors = {},
  className = '',
  ...props
}) => {
  const [errors, setErrors] = useState({});
  const [sections, setSections] = useState([
    { id: 'basic', title: 'Basic Information', subtitle: 'Product name, brand, and basic details', icon: Package, component: BasicInfoSection },
    { id: 'content', title: 'Content & SEO', subtitle: 'Descriptions, features, and SEO content', icon: Eye, component: AdditionalDetailsSection },
    { id: 'gst', title: 'GST Information', subtitle: 'Tax settings and compliance', icon: Receipt, component: GSTSection },
    { id: 'pricing', title: 'Pricing Information', subtitle: 'Set product prices and currency', icon: DollarSign, component: PricingSection },
    { id: 'status', title: 'Status & Visibility', subtitle: 'Product status and visibility settings', icon: Settings, component: StatusSection },
  ]);

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
                >
                  <SectionComponent formData={formData} onChange={handleFormDataChange} errors={fieldErrors} />
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