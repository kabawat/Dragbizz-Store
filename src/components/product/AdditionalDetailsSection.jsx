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
