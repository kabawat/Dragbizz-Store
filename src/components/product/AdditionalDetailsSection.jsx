"use client"
import React from 'react';
import { Input, Textarea, TagInput, Button } from '../ui';
import { Search, Plus } from 'lucide-react';

const AdditionalDetailsSection = ({
  formData,
  onChange,
  errors = {},
  ...props
}) => {
  const handleFieldChange = (field, value) => {
    onChange({
      ...formData,
      [field]: value
    });
  };

  return (
    <>
      {/* SEO Meta Title */}
      <div className="mb-6">
        <Input
          label="Meta Title"
          placeholder="Enter meta title"
          value={formData.metaTitle || ''}
          onChange={(value) => handleFieldChange('metaTitle', value)}
          error={errors.metaTitle}
          errorMessage={errors.metaTitle}
          leftIcon={Search}
          maxLength={60}
          helperText="Title for search engines (max 60 characters)"
        />
      </div>

      {/* SEO Meta Description */}
      <div className="mb-6">
        <Textarea
          label="Meta Description"
          placeholder="Enter meta description"
          value={formData.metaDescription || ''}
          onChange={(value) => handleFieldChange('metaDescription', value)}
          error={errors.metaDescription}
          errorMessage={errors.metaDescription}
          rows={3}
          maxLength={160}
          showCharCount
          helperText="Description for search engines (max 160 characters)"
        />
      </div>

      {/* Meta Keywords */}
      <div className="mb-6">
        <TagInput
          label="Meta Keywords"
          placeholder="Add keywords..."
          value={formData.metaKeywords || []}
          onChange={(value) => handleFieldChange('metaKeywords', value)}
          error={errors.metaKeywords}
          errorMessage={errors.metaKeywords}
          maxTags={10}
          maxTagLength={20}
          helperText="Keywords for SEO optimization"
        />
      </div>

      {/* Social Media Content */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">Social Media Content</h4>
        
        <div className="space-y-4">
          <Input
            label="Open Graph Title"
            placeholder="Enter OG title"
            value={formData.ogTitle || ''}
            onChange={(value) => handleFieldChange('ogTitle', value)}
            error={errors.ogTitle}
            errorMessage={errors.ogTitle}
            maxLength={60}
            helperText="Title for Facebook/LinkedIn sharing"
          />
          
          <Textarea
            label="Open Graph Description"
            placeholder="Enter OG description"
            value={formData.ogDescription || ''}
            onChange={(value) => handleFieldChange('ogDescription', value)}
            error={errors.ogDescription}
            errorMessage={errors.ogDescription}
            rows={2}
            maxLength={200}
            showCharCount
            helperText="Description for Facebook/LinkedIn sharing"
          />
          
          <Input
            label="Twitter Title"
            placeholder="Enter Twitter title"
            value={formData.twitterTitle || ''}
            onChange={(value) => handleFieldChange('twitterTitle', value)}
            error={errors.twitterTitle}
            errorMessage={errors.twitterTitle}
            maxLength={60}
            helperText="Title for Twitter sharing"
          />
          
          <Textarea
            label="Twitter Description"
            placeholder="Enter Twitter description"
            value={formData.twitterDescription || ''}
            onChange={(value) => handleFieldChange('twitterDescription', value)}
            error={errors.twitterDescription}
            errorMessage={errors.twitterDescription}
            rows={2}
            maxLength={200}
            showCharCount
            helperText="Description for Twitter sharing"
          />
        </div>
      </div>


      {/* Product Specifications */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">Product Specifications</h4>
        <div className="space-y-3">
          {(formData.specifications || []).map((spec, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg border border-[rgb(var(--color-border-primary))]">
              <Input
                placeholder="Specification name"
                value={spec.name || ''}
                onChange={(value) => {
                  const newSpecs = [...(formData.specifications || [])];
                  newSpecs[index] = { ...spec, name: value };
                  handleFieldChange('specifications', newSpecs);
                }}
              />
              <Input
                placeholder="Value"
                value={spec.value || ''}
                onChange={(value) => {
                  const newSpecs = [...(formData.specifications || [])];
                  newSpecs[index] = { ...spec, value: value };
                  handleFieldChange('specifications', newSpecs);
                }}
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Unit"
                  value={spec.unit || ''}
                  onChange={(value) => {
                    const newSpecs = [...(formData.specifications || [])];
                    newSpecs[index] = { ...spec, unit: value };
                    handleFieldChange('specifications', newSpecs);
                  }}
                />
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    const newSpecs = (formData.specifications || []).filter((_, i) => i !== index);
                    handleFieldChange('specifications', newSpecs);
                  }}
                >
                  ×
                </Button>
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => {
              const newSpecs = [...(formData.specifications || []), { name: '', value: '', unit: '' }];
              handleFieldChange('specifications', newSpecs);
            }}
            leftIcon={Plus}
          >
            Add Specification
          </Button>
        </div>
      </div>

      {/* Product Tags */}
      <div className="mb-6">
        <TagInput
          label="Product Tags"
          placeholder="Add tags..."
          value={formData.tags || []}
          onChange={(value) => handleFieldChange('tags', value)}
          error={errors.tags}
          errorMessage={errors.tags}
          maxTags={15}
          maxTagLength={25}
          helperText="Add relevant tags to improve product discoverability"
        />
      </div>

    </>
  );
};

export default AdditionalDetailsSection;
