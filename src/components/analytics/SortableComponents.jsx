"use client"
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui';

// Map Tailwind gradient classes to CSS variable gradients
const getGradientStyle = (iconColor) => {
  const gradientMap = {
    'from-green-100 to-green-200': 'var(--gradient-green)',
    'from-blue-100 to-blue-200': 'var(--gradient-blue)',
    'from-purple-100 to-purple-200': 'var(--gradient-purple)',
    'from-orange-100 to-orange-200': 'var(--gradient-orange)',
    'from-red-100 to-red-200': 'var(--gradient-red)',
    'from-yellow-100 to-yellow-200': 'var(--gradient-yellow)',
    'from-teal-100 to-teal-200': 'var(--gradient-teal)',
    'from-gray-100 to-gray-200': 'var(--gradient-gray)',
    'from-indigo-100 to-indigo-200': 'var(--gradient-indigo)',
  };
  
  return gradientMap[iconColor] || 'var(--gradient-gray)';
};

export const SortableMetricCard = ({ id, title, value, change, icon: Icon, iconColor, textColor }) => {
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
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <div className="w-6 h-6 bg-[rgb(var(--color-bg-primary))] rounded border-[var(--color-border-primary-light)] flex items-center justify-center shadow-sm">
          <GripVertical className="w-3 h-3 text-[rgb(var(--color-text-secondary))]" />
        </div>
      </div>
      <Card 
        className={`backdrop-blur-md border-[var(--color-border-primary-light)] transition-all duration-300 relative`}
        style={{ background: getGradientStyle(iconColor) }}
      >
        <div className="flex items-center justify-between p-6">
          <div>
            <p className="text-[rgb(var(--color-text-secondary))] text-sm font-medium">{title}</p>
            <p className="text-[rgb(var(--color-text-primary))] text-2xl font-bold">{value}</p>
            <p className="text-[rgb(var(--color-text-secondary))] text-xs flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              {change}
            </p>
          </div>
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ background: getGradientStyle(iconColor) }}
          >
            <Icon className="w-6 h-6 text-[rgb(var(--color-text-primary))]" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export const SortableCard = ({ id, children }) => {
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
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <div className="w-6 h-6 bg-[rgb(var(--color-bg-primary))] rounded border-[var(--color-border-primary-light)] flex items-center justify-center shadow-sm">
          <GripVertical className="w-3 h-3 text-[rgb(var(--color-text-secondary))]" />
        </div>
      </div>
      {children}
    </div>
  );
};

export const SortableSection = ({ id, children }) => {
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
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <div className="w-6 h-6 bg-[rgb(var(--color-bg-primary))] rounded border-[var(--color-border-primary-light)] flex items-center justify-center shadow-sm">
          <GripVertical className="w-3 h-3 text-[rgb(var(--color-text-secondary))]" />
        </div>
      </div>
      {children}
    </div>
  );
};

