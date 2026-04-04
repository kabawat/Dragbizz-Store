"use client";
import React, { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import {
  Button,
  Checkbox,
  FileUpload,
  Input,
  TagInput,
  Textarea,
} from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useTheme } from "@/contexts/ThemeContext";
import { categoryService } from "@/service/retailer";
import useApiResponse from "@/hooks/useApiResponse";

const CategoryDrawer = ({ isOpen, onClose, storeId, onCategoryAdded }) => {
  const { t } = useTranslation();
  const { currentVariant } = useTheme();

  const [newCategoryData, setNewCategoryData] = useState({
    name: "",
    description: "",
    hasExpiryDate: false,
    metadata: {
      icon: null,
      tags: [],
    },
  });

  const { execute: executeCreate, loading: addCategoryLoading } = useApiResponse();

  // Reset logic
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
  }, []);

  const handleAddCategory = async () => {
    if (!newCategoryData.name.trim()) return;

    const apiPayload = {
      name: newCategoryData.name.trim(),
      description: newCategoryData.description.trim(),
      hasExpiryDate: newCategoryData.hasExpiryDate === true,
      metadata: null,
    };

    const result = await executeCreate(
      categoryService.createCategory(apiPayload, storeId)
    );

    if (result) {
      const body = result.data?.data || result.data;
      const newCategory = {
        value: body?.id || body?._id,
        label: newCategoryData.name.trim(),
      };

      onCategoryAdded(newCategory);
      resetCategoryData();
      onClose();
    }
  };

  // Close drawer on escape key and prevent body scroll
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
        resetCategoryData();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, resetCategoryData]);

  // Theme-aware drawer styles
  const isDark = currentVariant === "dark";
  const drawerStyles = {
    backdrop: "backdrop-blur-[1px]",
    drawer: isDark ? "bg-gray-900 border-l border-gray-700" : "bg-white border-l border-gray-200",
    header: isDark ? "bg-gray-800 border-b border-gray-700" : "bg-gray-50 border-b border-gray-200",
    content: isDark ? "bg-gray-900" : "bg-white",
    footer: isDark ? "bg-gray-800 border-t border-gray-700" : "bg-gray-50 border-t border-gray-200",
    text: {
      primary: isDark ? "text-white" : "text-gray-900",
      secondary: isDark ? "text-gray-300" : "text-gray-600",
    },
    button: {
      hover: isDark ? "hover:bg-gray-700" : "hover:bg-gray-100",
      outline: isDark ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-100",
    },
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => {
          onClose();
          resetCategoryData();
        }}
        className={`fixed inset-0 ${drawerStyles.backdrop} z-[9999] animate-in fade-in duration-300`}
      />

      {/* Full Page Drawer */}
      <div
        className={`fixed top-0 right-0 h-screen w-full md:w-[600px] ${drawerStyles.drawer} shadow-2xl z-[9999] transform transition-transform duration-300 ease-out`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center justify-between p-4 ${drawerStyles.header}`}>
            <h2 className={`text-base font-semibold ${drawerStyles.text.primary}`}>
              {t("products.addNewCategory")}
            </h2>
            <button
              onClick={() => {
                onClose();
                resetCategoryData();
              }}
              className={`p-2 ${drawerStyles.button.hover} rounded-lg transition-colors cursor-pointer`}
            >
              <X className={`w-5 h-5 ${drawerStyles.text.primary}`} />
            </button>
          </div>

          {/* Content */}
          <div className={`flex-1 p-6 overflow-y-auto ${drawerStyles.content}`}>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className={`text-lg font-medium ${drawerStyles.text.primary}`}>
                  {t("products.basicInformation")}
                </h3>

                <Input
                  label={t("products.categoryName")}
                  placeholder={t("products.categoryNamePlaceholder")}
                  value={newCategoryData.name}
                  onChange={(value) => setNewCategoryData((prev) => ({ ...prev, name: value }))}
                  required
                />

                <Textarea
                  label={t("common.description")}
                  placeholder={t("products.enterCategoryDescription")}
                  value={newCategoryData.description}
                  onChange={(value) => setNewCategoryData((prev) => ({ ...prev, description: value }))}
                  rows={3}
                />

                <Checkbox
                  label={t("products.categoryRequiresExpiryDate")}
                  checked={newCategoryData.hasExpiryDate === true}
                  onChange={(checked) => setNewCategoryData((prev) => ({ ...prev, hasExpiryDate: checked }))}
                />
              </div>

              {/* Metadata */}
              <div className="space-y-4">
                <h3 className={`text-lg font-medium ${drawerStyles.text.primary}`}>
                  {t("products.categorySettings")}
                </h3>

                <FileUpload
                  label={t("products.categoryIcon")}
                  accept="image/*"
                  multiple={false}
                  value={newCategoryData.metadata.icon ? [newCategoryData.metadata.icon] : []}
                  onChange={(files) => {
                    setNewCategoryData((prev) => ({
                      ...prev,
                      metadata: { ...prev.metadata, icon: files?.[0] || null },
                    }));
                  }}
                  dropZoneLabel={t("products.clickToUpload")}
                  sizeLimitLabel={t("products.imagesUpTo2MB")}
                  helperText={t("products.categoryIconHelperText")}
                  maxSize={2 * 1024 * 1024}
                />

                <TagInput
                  label={t("products.tags")}
                  placeholder={t("products.addTagsPlaceholder")}
                  countLabel={t("products.tagCount")}
                  value={newCategoryData.metadata.tags}
                  onChange={(value) => setNewCategoryData((prev) => ({ ...prev, metadata: { ...prev.metadata, tags: value } }))}
                />
              </div>

              <div className={`rounded-lg p-4 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                <h3 className={`text-sm font-medium ${drawerStyles.text.primary} mb-2`}>
                  {t("products.aboutCategories")}
                </h3>
                <p className={`text-sm ${drawerStyles.text.secondary}`}>
                  {t("products.aboutCategoriesDescription")}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`p-4 ${drawerStyles.footer}`}>
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={handleAddCategory}
                disabled={!newCategoryData.name.trim() || addCategoryLoading}
                loading={addCategoryLoading}
              >
                {addCategoryLoading ? t("common.saving") : t("products.addCategory")}
              </Button>
              <Button
                type="button"
                variant="outline"
                className={drawerStyles.button.outline}
                onClick={() => {
                  onClose();
                  resetCategoryData();
                }}
              >
                {t("common.cancel")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryDrawer;
