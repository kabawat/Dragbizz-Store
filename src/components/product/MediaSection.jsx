"use client";
import { Image as ImageIcon, Trash2 } from "lucide-react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { FileUpload } from "../ui";
import Image from "next/image";

const MediaSection = ({
  formData,
  onChange,
  errors = {},
  ...props
}) => {
  const { t } = useTranslation();

  const handleFieldChange = (field, value) => {
    onChange(field, value);
  };

  const handleRemoveImage = (index) => {
    const newImages = [...(formData.images || [])];
    newImages.splice(index, 1);
    handleFieldChange("images", newImages);
  };

  const images = formData.images || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <FileUpload
            label={t("products.images") || "Product Images"}
            accept="image/*"
            multiple={true}
            value={images}
            showFileList={false}
            onChange={(allFiles) => handleFieldChange("images", allFiles)}
            dropZoneLabel={t("products.clickToUploadImage") || "Click or drag to upload product images"}
            sizeLimitLabel={t("products.imagesUpTo5MB") || "Images up to 5MB"}
            helperText={t("products.productImageHelperText") || "High-quality images help customers identify your products"}
            maxSize={5 * 1024 * 1024} // 5MB
          />
        </div>

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))] group">
                {typeof img === "string" ? (
                  <Image src={img} alt={`Product Preview ${index + 1}`} fill className="object-cover" />
                ) : img instanceof File ? (
                  <Image src={URL.createObjectURL(img)} alt={`Product Preview ${index + 1}`} fill className="object-cover" />
                ) : null}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => handleRemoveImage(index)} className="p-2 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors cursor-pointer" title="Remove Image" type="button">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg p-4 bg-blue-500/10 border border-blue-500/20">
        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
          💡 {t("products.tip") || "Tip"}: {t("products.imageTip") || "Adding multiple images from different angles increases conversion rates."}
        </p>
      </div>
    </div>
  );
};

export default MediaSection;
