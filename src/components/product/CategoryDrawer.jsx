"use client";
import { CategoryDrawerView } from "@dragorbit/features/categories";

import { useCallback, useEffect, useState } from "react";

import { Checkbox, FileUpload } from "@/components/ui";

import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";
import { categoryService, productService, utilityService } from "@/service";

const CategoryDrawer = ({
  isOpen,
  onClose,
  storeId,
  categoryToEdit = null,
  onCategoryAdded,
  onCategoryUpdated,
}) => {
  const { t } = useTranslation();
  const isEditing = Boolean(categoryToEdit);

  const [newCategoryData, setNewCategoryData] = useState({
    name: "",
    description: "",
    hasExpiryDate: false,
    metadata: {
      icon: null,
      tags: [],
    },
  });

  const [iconUploading, setIconUploading] = useState(false);
  const { execute: executeSave, loading: saveCategoryLoading } =
    useApiResponse();

  const resetCategoryData = useCallback(() => {
    setNewCategoryData({
      name: "",
      description: "",
      hasExpiryDate: false,
      metadata: {
        icon: null,
        tags: [],
      },
    });
    setIconUploading(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (categoryToEdit) {
        const existingIcon = categoryToEdit.metadata?.icon;
        setNewCategoryData({
          name: categoryToEdit.name || "",
          description: categoryToEdit.description || "",
          hasExpiryDate: categoryToEdit.hasExpiryDate === true,
          metadata: {
            icon:
              existingIcon && existingIcon !== "category" ? existingIcon : null,
            tags: Array.isArray(categoryToEdit.metadata?.tags)
              ? [...categoryToEdit.metadata.tags]
              : [],
          },
        });
      } else {
        resetCategoryData();
      }
    }
  }, [isOpen, categoryToEdit, resetCategoryData]);

  const handleClose = () => {
    resetCategoryData();
    onClose();
  };

  const handleRemoveIcon = async () => {
    const currentIcon = newCategoryData.metadata.icon;
    if (
      currentIcon &&
      typeof currentIcon === "string" &&
      (currentIcon.includes("bucket") || currentIcon.includes("r2.dev"))
    ) {
      try {
        await utilityService.deleteFile(currentIcon);
      } catch (err) {
        console.warn("Failed to delete category icon from storage:", err);
      }
    }

    setNewCategoryData((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, icon: null },
    }));
  };

  const handleIconUpload = async (files) => {
    const file = files?.[0];
    if (!file) return;

    if (
      newCategoryData.metadata.icon &&
      typeof newCategoryData.metadata.icon === "string"
    ) {
      await handleRemoveIcon();
    }

    try {
      setIconUploading(true);
      const uploadResult = await utilityService.uploadFile(file, "category");

      setNewCategoryData((prev) => ({
        ...prev,
        metadata: { ...prev.metadata, icon: uploadResult.publicFileUrl },
      }));
    } catch (error) {
      console.error("Icon upload failed:", error);
    } finally {
      setIconUploading(false);
    }
  };

  const handleSaveCategory = async () => {
    if (!newCategoryData.name.trim()) return;

    try {
      const iconUrl = newCategoryData.metadata.icon;

      const apiPayload = {
        name: newCategoryData.name.trim(),
        description: newCategoryData.description.trim(),
        hasExpiryDate: newCategoryData.hasExpiryDate === true,
        metadata: {
          ...newCategoryData.metadata,
          icon: iconUrl || "category",
        },
      };

      if (isEditing) {
        const categoryId = categoryToEdit.id || categoryToEdit._id;
        const result = await executeSave(
          categoryService.updateCategory(categoryId, apiPayload, storeId),
          {
            message:
              t("products.categoryUpdateSuccess") ||
              "Category updated successfully",
          }
        );

        if (result?.success) {
          const body = result.data?.data || result.data;

          if (
            iconUrl &&
            categoryId &&
            iconUrl !== categoryToEdit?.metadata?.icon
          ) {
            try {
              await productService.saveProductImage({
                entityId: categoryId,
                entityType: "Category",
                url: iconUrl,
                isPrimary: true,
                metadata: { name: newCategoryData.name },
              });
            } catch (err) {
              console.warn("Category image metadata sync failed:", err);
            }
          }

          onCategoryUpdated?.({
            value: categoryId,
            label: newCategoryData.name.trim(),
            data: body,
          });
          resetCategoryData();
          onClose();
        }
      } else {
        const result = await executeSave(
          categoryService.createCategory(apiPayload, storeId),
          {
            message:
              t("products.categoryCreateSuccess") ||
              "Category created successfully",
          }
        );

        if (result?.success) {
          const body = result.data?.data || result.data;
          const categoryId = body?.id || body?._id;

          if (iconUrl && categoryId) {
            try {
              await productService.saveProductImage({
                entityId: categoryId,
                entityType: "Category",
                url: iconUrl,
                isPrimary: true,
                metadata: { name: newCategoryData.name },
              });
            } catch (err) {
              console.warn("Category image metadata sync failed:", err);
            }
          }

          onCategoryAdded?.({
            value: categoryId,
            label: newCategoryData.name.trim(),
            data: body,
          });
          resetCategoryData();
          onClose();
        }
      }
    } catch (error) {
      console.error("Category save failed:", error);
    }
  };

  return (
    <CategoryDrawerView
      model={{
        isOpen,
        handleClose,
        t,
        handleAddCategory: handleSaveCategory,
        addCategoryLoading: saveCategoryLoading,
        newCategoryData,
        iconUploading,
        setNewCategoryData,
        Checkbox,
        FileUpload,
        handleIconUpload,
        handleRemoveIcon,
        isEditing,
      }}
    />
  );
};

export default CategoryDrawer;
