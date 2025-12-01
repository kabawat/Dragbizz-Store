"use client"
import { Plus, Save } from 'lucide-react';
import { FormDrawer } from '@/components/common';
import StoreEditForm from './StoreEditForm';

const StoreAddDrawer = ({
  isOpen,
  isCreating,
  form,
  errors,
  onChange,
  onSave,
  onCancel,
}) => {
  return (
    <FormDrawer
      isOpen={isOpen}
      onClose={onCancel}
      title="Add New Store"
      icon={Plus}
      description="Create a new store for your agency"
      width="w-full md:w-2/3 lg:w-1/2"
      onSave={onSave}
      onCancel={onCancel}
      saveLabel={isCreating ? 'Creating...' : 'Create Store'}
      cancelLabel="Cancel"
      isSaving={isCreating}
      saveIcon={Save}
      saveVariant="primary"
    >
      <StoreEditForm form={form} onChange={onChange} errors={errors} />
    </FormDrawer>
  );
};

export default StoreAddDrawer;
