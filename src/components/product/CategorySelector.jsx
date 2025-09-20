"use client"
import React, { useState, useEffect } from 'react';
import { Select, MultiSelect } from '../ui';
import { Package, Tag } from 'lucide-react';

const CategorySelector = ({
  formData,
  onChange,
  errors = {},
  ...props
}) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  // Mock category data - In a real app, this would come from an API
  const mockCategories = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing & Fashion' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports & Outdoors' },
    { value: 'books', label: 'Books & Media' },
    { value: 'beauty', label: 'Beauty & Personal Care' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'toys', label: 'Toys & Games' },
    { value: 'food', label: 'Food & Beverages' },
    { value: 'health', label: 'Health & Wellness' }
  ];

  const mockSubcategories = {
    electronics: [
      { value: 'mobile-phones', label: 'Mobile Phones' },
      { value: 'laptops', label: 'Laptops' },
      { value: 'tablets', label: 'Tablets' },
      { value: 'headphones', label: 'Headphones' },
      { value: 'cameras', label: 'Cameras' },
      { value: 'gaming', label: 'Gaming' },
      { value: 'accessories', label: 'Accessories' }
    ],
    clothing: [
      { value: 'mens-clothing', label: "Men's Clothing" },
      { value: 'womens-clothing', label: "Women's Clothing" },
      { value: 'kids-clothing', label: "Kids' Clothing" },
      { value: 'shoes', label: 'Shoes' },
      { value: 'accessories', label: 'Accessories' },
      { value: 'jewelry', label: 'Jewelry' }
    ],
    home: [
      { value: 'furniture', label: 'Furniture' },
      { value: 'decor', label: 'Home Decor' },
      { value: 'kitchen', label: 'Kitchen & Dining' },
      { value: 'bedding', label: 'Bedding & Bath' },
      { value: 'garden', label: 'Garden & Outdoor' },
      { value: 'tools', label: 'Tools & Hardware' }
    ],
    sports: [
      { value: 'fitness', label: 'Fitness Equipment' },
      { value: 'outdoor', label: 'Outdoor Gear' },
      { value: 'team-sports', label: 'Team Sports' },
      { value: 'water-sports', label: 'Water Sports' },
      { value: 'winter-sports', label: 'Winter Sports' },
      { value: 'cycling', label: 'Cycling' }
    ],
    books: [
      { value: 'fiction', label: 'Fiction' },
      { value: 'non-fiction', label: 'Non-Fiction' },
      { value: 'textbooks', label: 'Textbooks' },
      { value: 'childrens-books', label: "Children's Books" },
      { value: 'magazines', label: 'Magazines' },
      { value: 'ebooks', label: 'E-Books' }
    ],
    beauty: [
      { value: 'skincare', label: 'Skincare' },
      { value: 'makeup', label: 'Makeup' },
      { value: 'haircare', label: 'Hair Care' },
      { value: 'fragrance', label: 'Fragrance' },
      { value: 'bath-body', label: 'Bath & Body' },
      { value: 'tools', label: 'Beauty Tools' }
    ],
    automotive: [
      { value: 'car-parts', label: 'Car Parts' },
      { value: 'tools', label: 'Tools & Equipment' },
      { value: 'accessories', label: 'Accessories' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'exterior', label: 'Exterior' },
      { value: 'interior', label: 'Interior' }
    ],
    toys: [
      { value: 'action-figures', label: 'Action Figures' },
      { value: 'dolls', label: 'Dolls' },
      { value: 'building-sets', label: 'Building Sets' },
      { value: 'educational', label: 'Educational Toys' },
      { value: 'outdoor-toys', label: 'Outdoor Toys' },
      { value: 'board-games', label: 'Board Games' }
    ],
    food: [
      { value: 'snacks', label: 'Snacks' },
      { value: 'beverages', label: 'Beverages' },
      { value: 'frozen', label: 'Frozen Foods' },
      { value: 'canned', label: 'Canned Goods' },
      { value: 'fresh', label: 'Fresh Produce' },
      { value: 'organic', label: 'Organic Foods' }
    ],
    health: [
      { value: 'supplements', label: 'Supplements' },
      { value: 'medical-devices', label: 'Medical Devices' },
      { value: 'first-aid', label: 'First Aid' },
      { value: 'monitoring', label: 'Health Monitoring' },
      { value: 'therapeutic', label: 'Therapeutic' },
      { value: 'wellness', label: 'Wellness Products' }
    ]
  };

  // Load categories on mount
  useEffect(() => {
    setCategories(mockCategories);
  }, []);

  // Update subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      const categorySubcategories = mockSubcategories[formData.category] || [];
      setSubcategories(categorySubcategories);
      
      // Clear subcategories if they don't belong to the new category
      if (formData.subcategories) {
        const validSubcategories = formData.subcategories.filter(sub => 
          categorySubcategories.some(cat => cat.value === sub)
        );
        if (validSubcategories.length !== formData.subcategories.length) {
          onChange({
            ...formData,
            subcategories: validSubcategories
          });
        }
      }
    } else {
      setSubcategories([]);
    }
  }, [formData.category]);

  const handleFieldChange = (field, value) => {
    onChange({
      ...formData,
      [field]: value
    });
  };

  return (
    <div {...props}>
      {/* Category Selection */}
      <div className="mb-6">
        <Select
          label="Category"
          options={categories}
          value={formData.category || ''}
          onChange={(value) => handleFieldChange('category', value)}
          error={errors.category}
          errorMessage={errors.category}
          required
          leftIcon={Package}
          searchable
          placeholder="Select a category"
          helperText="Choose the main category for your product"
        />
      </div>

      {/* Subcategories Selection */}
      {subcategories.length > 0 && (
        <div className="mb-6">
          <MultiSelect
            label="Subcategories"
            options={subcategories}
            value={formData.subcategories || []}
            onChange={(value) => handleFieldChange('subcategories', value)}
            error={errors.subcategories}
            errorMessage={errors.subcategories}
            leftIcon={Tag}
            placeholder="Select subcategories"
            maxSelections={5}
            helperText="Select relevant subcategories (optional)"
          />
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
