"use client"
import React from 'react';
import { Input, Textarea, TagInput, Button } from '../ui';
import { Plus } from 'lucide-react';

const AdditionalDetailsSection = ({
  formData,
  onChange,
  errors = {},
  ...props
}) => {
  const handleFieldChange = (field, value) => {
    console.log('AdditionalDetails - Field:', field, 'Value:', value);
    console.log('Calling onChange with:', field, value);
    onChange(field, value);
  };

  const handleSpecificationChange = (index, field, value) => {
    const newSpecs = [...(formData.content?.specifications || [])];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    
    // Update the entire content object
    const updatedContent = {
      ...formData.content,
      specifications: newSpecs
    };
    
    handleFieldChange('content', updatedContent);
  };

  const addSpecification = () => {
    const newSpecs = [...(formData.content?.specifications || []), { name: '', value: '', unit: '' }];
    
    const updatedContent = {
      ...formData.content,
      specifications: newSpecs
    };
    
    handleFieldChange('content', updatedContent);
  };

  const removeSpecification = (index) => {
    const newSpecs = (formData.content?.specifications || []).filter((_, i) => i !== index);
    
    const updatedContent = {
      ...formData.content,
      specifications: newSpecs
    };
    
    handleFieldChange('content', updatedContent);
  };

  return (
    <>
      {/* Short Description */}
      <div className="mb-6">
        <Textarea
          label="Short Description"
          placeholder="Brief description of your product..."
          value={formData.content?.shortDescription || ''}
          onChange={(value) => handleFieldChange('content.shortDescription', value)}
          error={errors.shortDescription}
          errorMessage={errors.shortDescription}
          rows={3}
          showCharCount
          maxLength={200}
          helperText="Short description for product listings (max 200 characters)"
        />
      </div>

      {/* Long Description */}
      <div className="mb-6">
        <Textarea
          label="Long Description"
          placeholder="Detailed description of your product..."
          value={formData.content?.longDescription || ''}
          onChange={(value) => handleFieldChange('content.longDescription', value)}
          error={errors.longDescription}
          errorMessage={errors.longDescription}
          rows={5}
          showCharCount
          maxLength={2000}
          helperText="Detailed description for product page (max 2000 characters)"
        />
      </div>

      {/* Product Features */}
      <div className="mb-6">
        <TagInput
          label="Product Features"
          placeholder="Add key features..."
          value={formData.content?.features || []}
          onChange={(value) => handleFieldChange('content.features', value)}
          error={errors.features}
          errorMessage={errors.features}
          maxTags={10}
          maxTagLength={50}
          helperText="Add key features that make your product special"
        />
      </div>

      {/* Product Tags */}
      <div className="mb-6">
        <TagInput
          label="Product Tags"
          placeholder="Add tags..."
          value={formData.content?.tags || []}
          onChange={(value) => handleFieldChange('content.tags', value)}
          error={errors.tags}
          errorMessage={errors.tags}
          maxTags={15}
          maxTagLength={30}
          helperText="Add relevant tags to help customers find your product"
        />
      </div>

      {/* Product Specifications */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">Product Specifications</h4>
        <div className="space-y-3">
          {(formData.content?.specifications || []).map((spec, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg border border-[rgb(var(--color-border-primary))]">
              <Input
                placeholder="Specification name"
                value={spec.name || ''}
                onChange={(value) => handleSpecificationChange(index, 'name', value)}
              />
              <Input
                placeholder="Value"
                value={spec.value || ''}
                onChange={(value) => handleSpecificationChange(index, 'value', value)}
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Unit"
                  value={spec.unit || ''}
                  onChange={(value) => handleSpecificationChange(index, 'unit', value)}
                />
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeSpecification(index)}
                >
                  ×
                </Button>
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={addSpecification}
            leftIcon={Plus}
          >
            Add Specification
          </Button>
        </div>
      </div>

    </>
  );
};

export default AdditionalDetailsSection;
