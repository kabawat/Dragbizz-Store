"use client";
import { BrandDrawerView } from "@dragorbit/features/brands";

import { useCallback, useEffect, useState } from "react";

import { FileUpload } from "@/components/ui";

import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";
import { brandService, productService, utilityService } from "@/service";

const BrandDrawer = ({
  isOpen,
  onClose,
  storeId,
  brandToEdit = null,
  onBrandAdded,
  onBrandUpdated,
}) => {
  const { t } = useTranslation();
  const isEditing = Boolean(brandToEdit);

  const [newBrandData, setNewBrandData] = useState({
    name: "",
    description: "",
    metadata: {
      icon: null,
      tags: [],
    },
  });

  const [iconUploading, setIconUploading] = useState(false);
  const { execute: executeSave, loading: saveBrandLoading } = useApiResponse();

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

  useEffect(() => {
    if (isOpen) {
      if (brandToEdit) {
        const existingIcon = brandToEdit.metadata?.icon;
        setNewBrandData({
          name: brandToEdit.name || "",
          description: brandToEdit.description || "",
          metadata: {
            icon:
              existingIcon && existingIcon !== "brand" ? existingIcon : null,
            tags: Array.isArray(brandToEdit.metadata?.tags)
              ? [...brandToEdit.metadata.tags]
              : [],
          },
        });
      } else {
        resetBrandData();
      }
    }
  }, [isOpen, brandToEdit, resetBrandData]);

  const handleClose = () => {
    resetBrandData();
    onClose();
  };

  const handleRemoveIcon = async () => {
    const currentIcon = newBrandData.metadata?.icon;
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

    if (
      newBrandData.metadata?.icon &&
      typeof newBrandData.metadata.icon === "string"
    ) {
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

  const handleSaveBrand = async () => {
    if (!newBrandData.name.trim()) return;

    try {
      const iconUrl = newBrandData.metadata?.icon;

      const apiPayload = {
        name: newBrandData.name.trim(),
        description: newBrandData.description?.trim() || "",
        metadata: {
          ...newBrandData.metadata,
          icon: iconUrl || "brand",
        },
      };

      if (isEditing) {
        const baseVersion = brandToEdit?.base_version ?? brandToEdit?.version;
        if (typeof baseVersion === "number") {
          apiPayload.base_version = baseVersion;
        }

        const brandId = brandToEdit.id || brandToEdit._id;
        const result = await executeSave(
          brandService.updateBrand(brandId, apiPayload, storeId),
          {
            message:
              t("products.brandUpdateSuccess") || "Brand updated successfully",
          }
        );

        if (result?.success) {
          const body = result.data?.data || result.data;

          if (iconUrl && brandId && iconUrl !== brandToEdit?.metadata?.icon) {
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

          onBrandUpdated?.({
            value: brandId,
            label: newBrandData.name.trim(),
            data: body,
          });
          resetBrandData();
          onClose();
        }
      } else {
        const result = await executeSave(
          brandService.createBrand(apiPayload, storeId),
          {
            message:
              t("products.brandCreateSuccess") || "Brand created successfully",
          }
        );

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
            data: body,
          });
          resetBrandData();
          onClose();
        }
      }
    } catch (error) {
      console.error("Brand save failed:", error);
    }
  };

  return (
    <BrandDrawerView
      model={{
        isOpen,
        handleClose,
        t,
        handleAddBrand: handleSaveBrand,
        addBrandLoading: saveBrandLoading,
        newBrandData,
        iconUploading,
        setNewBrandData,
        FileUpload,
        handleIconUpload,
        handleRemoveIcon,
        isEditing,
      }}
    />
  );
};

export default BrandDrawer;
