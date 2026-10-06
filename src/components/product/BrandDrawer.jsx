"use client";
import { useState, useCallback } from "react";
import { Award, Save } from "lucide-react";
import {
  FileUpload,
  Input,
  TagInput,
  Textarea,
} from "@/components/ui";
import { FormDrawer } from "@/components/common";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { brandService, utilityService, productService } from "@/service";
import useApiResponse from "@/hooks/useApiResponse";

const BrandDrawer = ({ isOpen, onClose, storeId, onBrandAdded }) => {
  const { t } = useTranslation();

  const [newBrandData, setNewBrandData] = useState({
    name: "",
    description: "",
    metadata: {
      icon: null,
      tags: [],
    },
  });

  const [iconUploading, setIconUploading] = useState(false);
  const { execute: executeCreate, loading: addBrandLoading } = useApiResponse();

  const resetBrandData = useCallback(() => {
    setNewBrandData({
      name: "",
      description: "",
      metadata: {
        icon: null,
        tags: [],
      },
    });
    setIconUploading(false);
  }, []);

  const handleClose = () => {
    resetBrandData();
    onClose();
  };

  const handleRemoveIcon = async () => {
    const currentIcon = newBrandData.metadata.icon;
    if (
      currentIcon &&
      typeof currentIcon === "string" &&
      (currentIcon.includes("bucket") || currentIcon.includes("r2.dev"))
    ) {
      try {
        await utilityService.deleteFile(currentIcon);
      } catch (err) {
        console.warn("Failed to delete brand icon from storage:", err);
      }
    }

    setNewBrandData((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, icon: null },
    }));
  };

  const handleIconUpload = async (files) => {
    const file = files?.[0];
    if (!file) return;

    if (newBrandData.metadata.icon && typeof newBrandData.metadata.icon === "string") {
      await handleRemoveIcon();
    }

    try {
      setIconUploading(true);
      const uploadResult = await utilityService.uploadFile(file, "brand");

      setNewBrandData((prev) => ({
        ...prev,
        metadata: { ...prev.metadata, icon: uploadResult.publicFileUrl },
      }));
    } catch (error) {
      console.error("Icon upload failed:", error);
    } finally {
      setIconUploading(false);
    }
  };

  const handleAddBrand = async () => {
    if (!newBrandData.name.trim()) return;

    try {
      const iconUrl = newBrandData.metadata.icon;

      const apiPayload = {
        name: newBrandData.name.trim(),
        description: newBrandData.description.trim(),
        metadata: {
          ...newBrandData.metadata,
          icon: iconUrl || "brand",
        },
      };

      const result = await executeCreate(brandService.createBrand(apiPayload, storeId));

      if (result?.success) {
        const body = result.data?.data || result.data;
        const brandId = body?.id || body?._id;

        if (iconUrl && brandId) {
          try {
            await productService.saveProductImage({
              entityId: brandId,
              entityType: "Brand",
              url: iconUrl,
              isPrimary: true,
              metadata: { name: newBrandData.name },
            });
          } catch (err) {
            console.warn("Brand image metadata sync failed:", err);
          }
        }

        onBrandAdded?.({
          value: brandId,
          label: newBrandData.name.trim(),
        });
        resetBrandData();
        onClose();
      }
    } catch (error) {
      console.error("Brand creation failed:", error);
    }
  };

  return (
    <FormDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title={t("products.addNewBrand")}
      icon={Award}
      width="w-full md:w-2/3 lg:w-1/2"
      onSave={handleAddBrand}
      onCancel={handleClose}
      saveLabel={addBrandLoading ? t("common.saving") : t("products.addBrand")}
      cancelLabel={t("common.cancel")}
      isSaving={addBrandLoading}
      saveIcon={Save}
      disabled={!newBrandData.name.trim() || iconUploading}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))]">
            {t("products.basicInformation")}
          </h3>

          <Input
            label={t("products.brandName")}
            placeholder={t("products.brandNamePlaceholder")}
            value={newBrandData.name}
            onChange={(value) => setNewBrandData((prev) => ({ ...prev, name: value }))}
            required
          />

          <Textarea
            label={t("common.description")}
            placeholder={t("products.enterBrandDescription")}
            value={newBrandData.description}
            onChange={(value) =>
              setNewBrandData((prev) => ({ ...prev, description: value }))
            }
            rows={3}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))]">
            {t("products.brandSettings")}
          </h3>

          <FileUpload
            label={t("products.brandIcon")}
            accept="image/*"
            multiple={false}
            value={newBrandData.metadata.icon ? [newBrandData.metadata.icon] : []}
            onChange={handleIconUpload}
            onRemove={handleRemoveIcon}
            loading={iconUploading}
            dropZoneLabel={t("products.clickToUpload")}
            sizeLimitLabel={t("products.imagesUpTo2MB")}
            maxSize={2 * 1024 * 1024}
          />

          <TagInput
            label={t("products.tags")}
            placeholder={t("products.addTagsPlaceholder")}
            countLabel={t("products.tagCount")}
            value={newBrandData.metadata.tags}
            onChange={(value) =>
              setNewBrandData((prev) => ({
                ...prev,
                metadata: { ...prev.metadata, tags: value },
              }))
            }
          />
        </div>

        <div className="rounded-lg p-4 bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))]">
          <h3 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
            {t("products.aboutBrands")}
          </h3>
          <p className="text-sm text-[rgb(var(--color-text-secondary))]">
            {t("products.aboutBrandsDescription")}
          </p>
        </div>
      </div>
    </FormDrawer>
  );
};

export default BrandDrawer;
