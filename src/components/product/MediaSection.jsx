"use client";
import { Image as ImageIcon, Trash2, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { FileUpload } from "../ui";
import Image from "next/image";
import { uploadService, productService } from "@/service";

const MediaSection = ({
  formData,
  onChange,
  errors = {},
  productId = null,
  storeId = null,
  ...props
}) => {
  const { t } = useTranslation();
  const [uploadStatus, setUploadStatus] = useState({}); // { [fileIdentifier]: 'uploading' | 'completed' | 'error' }

  // Use file name + size as a simple identifier for tracking upload status of local files
  const getFileId = (file) => (file instanceof File ? `${file.name}-${file.size}` : file);

  const getImageDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0 });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const images = formData.images || [];

  const handleUpload = useCallback(async (file) => {
    const fileId = getFileId(file);

    setUploadStatus(prev => ({ ...prev, [fileId]: 'uploading' }));

    try {
      // Get dimensions before upload
      const dimensions = await getImageDimensions(file);

      const result = await uploadService.uploadFileAndWait(file, "products");

      if (result?.url) {
        // If we have a productId, call the image save API
        if (productId) {
          try {
            await productService.saveProductImage({
              entityId: productId,
              entityType: "Product",
              url: result.url,
              isPrimary: images.length === 0,
              altText: file.name || "Product Image",
              metadata: {
                width: dimensions.width,
                height: dimensions.height
              }
            }, { store: storeId });
          } catch (apiError) {
            console.error("Error saving product image mapping:", apiError);
            // We still mark the upload as completed because the file is in storage
            // but we might want to log this or notify the user
          }
        }

        setUploadStatus(prev => ({ ...prev, [fileId]: 'completed' }));

        // Update the global state using a functional update to safely handle concurrent uploads
        onChange("images", (prevImages) => {
          const currentImages = Array.isArray(prevImages) ? prevImages : images;
          return currentImages.map(img => {
            if (img === file || getFileId(img) === fileId) {
              // Attach the uploaded URL to the file object 
              // We keep it as a File for local preview
              img.uploadedUrl = result.url;
              return img;
            }
            return img;
          });
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus(prev => ({ ...prev, [fileId]: 'error' }));
    }
  }, [onChange, images, productId, storeId]);

  // When images change, check for any NEW File objects that need uploading
  const handleImagesChange = (allImages) => {
    // Determine which ones are newly added files
    const newFiles = (allImages || []).filter(img =>
      img instanceof File && !uploadStatus[getFileId(img)]
    );

    // Update the state immediately so preview shows up
    onChange("images", allImages);

    // Start background uploads for each new file
    newFiles.forEach(file => handleUpload(file));
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange("images", newImages);
  };

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
              onChange={handleImagesChange}
              dropZoneLabel={t("products.clickToUploadImage") || "Click or drag to upload product images"}
              sizeLimitLabel={t("products.imagesUpTo5MB") || "Images up to 5MB"}
              helperText={t("products.productImageHelperText") || "High-quality images help customers identify your products"}
              maxSize={5 * 1024 * 1024} // 5MB
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {images.map((img, index) => {
              const fileId = getFileId(img);
              const status = uploadStatus[fileId];
              const isUploading = status === 'uploading';
              const isError = status === 'error';

              return (
                <div
                  key={index}
                  className={`relative aspect-square rounded-xl overflow-hidden border bg-[rgb(var(--color-bg-secondary))] group shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] ${isError ? 'border-red-500' : 'border-[rgb(var(--color-border-primary))]'}`}
                >
                  {typeof img === "string" ? (
                    <Image src={img} alt={`Product Preview ${index + 1}`} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : img instanceof File ? (
                    <Image src={URL.createObjectURL(img)} alt={`Product Preview ${index + 1}`} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : null}

                  {/* Uploading Overlay */}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center z-10">
                      <Loader2 className="w-6 h-6 text-white animate-spin mb-1" />
                      <span className="text-[10px] text-white font-medium uppercase tracking-wider">{t("common.uploading") || "Uploading..."}</span>
                    </div>
                  )}

                  {/* Error Overlay */}
                  {isError && (
                    <div className="absolute inset-0 bg-red-500/20 backdrop-blur-[1px] flex flex-col items-center justify-center z-10">
                      <AlertCircle className="w-6 h-6 text-red-600 mb-1" />
                      <span className="text-[10px] text-red-700 font-bold uppercase">{t("common.failed") || "Failed"}</span>
                    </div>
                  )}

                  {/* Index Badge */}
                  {!isUploading && (
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/50 backdrop-blur-md text-[10px] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      #{index + 1}
                    </div>
                  )}

                  {/* Overlay with Actions */}
                  {!isUploading && (
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
                  )}
                </div>
              );
            })}

            {/* Compact Upload Tile */}
            <div className="transform hover:scale-[1.02] transition-transform duration-300">
              <FileUpload
                variant="compact"
                accept="image/*"
                multiple={true}
                value={images}
                showFileList={false}
                onChange={handleImagesChange}
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
