"use client"
import { Save, Store, Loader2 } from 'lucide-react';
import { FormDrawer } from '@/components/common';
import StoreEditForm from './StoreEditForm';

const StoreEditDrawer = ({
  isOpen,
  isSaving,
  isLoadingStore,
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
      title="Edit Store"
      icon={Store}
      description="Update store information"
      width="w-full md:w-2/3 lg:w-1/2"
      onSave={onSave}
      onCancel={onCancel}
      saveLabel={isSaving ? 'Saving...' : 'Save Changes'}
      cancelLabel="Cancel"
      isSaving={isSaving}
      isLoading={isLoadingStore}
      saveIcon={Save}
      saveVariant="primary"
    >
      {isLoadingStore ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[rgb(var(--color-primary))]" />
            <span className="text-sm text-[rgb(var(--color-text-secondary))]">
              Loading store details...
            </span>
          </div>
        </div>
      ) : (
        <StoreEditForm form={form} onChange={onChange} errors={errors} />
      )}
    </FormDrawer>
  );
};

export default StoreEditDrawer;
