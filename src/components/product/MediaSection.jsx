import { Image as ImageIcon, Loader2, Trash2 } from "lucide-react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { FileUpload } from "../ui";
import Image from "next/image";
import { utilityService } from "@/service";
import { productService } from "@/service/retailer";
import { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { useApiResponse } from "@/hooks/useApiResponse";

const MediaSection = ({
  formData,
  onChange,
  errors = {},
  productId = null,
  ...props
}) => {
  const { t } = useTranslation();
  const images = formData.images || [];
  const [uploading, setUploading] = useState(false);
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;
  const { execute } = useApiResponse();

  // Sync metadata with Retailer DB
  const syncWithRetailer = async (url, file) => {
    if (!productId || !storeId) return;

    return await execute(
      productService.saveProductImage({
        entityId: productId,
        entityType: "Product",
        url: url,
        metadata: {
          name: file.name,
          size: file.size,
          type: file.type,
        },
        store: storeId,
        isPrimary: images.length === 0,
      }),
      { showToast: false }
    );
  };

  const handleImagesChange = async (allFiles) => {
    onChange("images", allFiles); // Immediate local preview

    const filesToUpload = allFiles.filter(
      (item) => item instanceof File && !item.uploadedUrl
    );

    if (filesToUpload.length === 0) return;

    setUploading(true);
    const updatedImages = [...allFiles];

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      try {
        const { publicFileUrl } = await utilityService.uploadFile(file, "products");

        file.uploadedUrl = publicFileUrl;

        const fileIndexInAll = updatedImages.indexOf(file);
        if (fileIndexInAll !== -1) {
          updatedImages[fileIndexInAll] = publicFileUrl;
          onChange("images", [...updatedImages]);
        }

        if (productId) {
          await syncWithRetailer(publicFileUrl, file);
        }
      } catch (error) {
        console.error("Upload failed:", file.name, error);
      }
    }

    setUploading(false);
  };

  const handleRemoveImage = async (index) => {
    const imageToDelete = images[index];

    const newImages = [...images];
    newImages.splice(index, 1);
    onChange("images", newImages); // Update UI

    // Delete from Storage & DB
    const imageUrl = typeof imageToDelete === "string" ? imageToDelete : imageToDelete?.url;
    if (imageUrl && (imageUrl.includes("bucket") || imageUrl.includes("r2.dev") || imageUrl.includes("local"))) {
      try {
        await utilityService.deleteFile(imageUrl);
      } catch (err) {
        console.warn("Failed to delete product image from storage:", err);
      }
    }

    if (imageToDelete?.id) {
      await execute(
        productService.deleteProductImage(imageToDelete.id, storeId),
        { message: t("products.imageDeleted") || "Image removed" }
      );
    }
  };

  const getImageUrl = (img) => {
    if (!img) return null;
    if (typeof img === "string" && img.trim()) return img;
    if (img instanceof File) return URL.createObjectURL(img);
    if (img && typeof img === "object" && img.url && img.url.trim()) return img.url;
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Title & Count */}
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
          {uploading && (
            <div className="flex items-center space-x-1.5 px-2 py-0.5 border border-blue-500/20 bg-blue-500/5 rounded-full">
              <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Uploading...</span>
            </div>
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
              const src = getImageUrl(img);
              if (!src) return null;

              return (
                <div
                  key={index}
                  style={{ position: "relative" }} // Inline style to ensure it's not overridden
                  className="relative aspect-square rounded-xl overflow-hidden border bg-[rgb(var(--color-bg-secondary))] group shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] border-[rgb(var(--color-border-primary))]"
                >
                  <Image
                    src={src}
                    alt={`Product Preview ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    unoptimized={img instanceof File || src.startsWith("blob:")}
                  />

                  {/* Index Badge */}
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/50 backdrop-blur-md text-[10px] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    #{index + 1}
                  </div>

                  {/* Actions Overlay */}
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
