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
    <div className="space-y-4">
      {/* Header with Title and Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ImageIcon className="w-5 h-5 text-[rgb(var(--color-primary))]" />
          <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
            {t("products.images") || "Product Images"}
          </h3>
          {images.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] rounded-full">
              {images.length}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {images.length === 0 ? (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <FileUpload
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
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {images.map((img, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-xl overflow-hidden border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))] group shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]"
              >
                {typeof img === "string" ? (
                  <Image src={img} alt={`Product Preview ${index + 1}`} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : img instanceof File ? (
                  <Image src={URL.createObjectURL(img)} alt={`Product Preview ${index + 1}`} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : null}

                {/* Index Badge */}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/50 backdrop-blur-md text-[10px] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  #{index + 1}
                </div>

                {/* Overlay with Actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="p-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-white transition-all transform hover:scale-110 shadow-lg cursor-pointer"
                    title="Remove Image"
                    type="button"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Compact Upload Tile */}
            <div className="transform hover:scale-[1.02] transition-transform duration-300">
              <FileUpload
                variant="compact"
                accept="image/*"
                multiple={true}
                value={images}
                showFileList={false}
                onChange={(allFiles) => handleFieldChange("images", allFiles)}
                maxSize={5 * 1024 * 1024}
                className="h-full"
              />
            </div>
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
