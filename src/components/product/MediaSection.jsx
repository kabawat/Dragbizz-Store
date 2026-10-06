import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { FileUpload } from "../ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useApiResponse } from "@/hooks/useApiResponse";
import { utilityService } from "@/service";
import { productService } from "@/service/retailer";
import { useAppSelector } from "@/store/hooks";

const MAX_IMAGES = 10;

function getImageUrl(img) {
  if (!img) return null;
  if (typeof img === "string" && img.trim()) return img;
  if (img instanceof File) return URL.createObjectURL(img);
  if (img && typeof img === "object" && img.url?.trim()) return img.url;
  return null;
}

function getImageKey(img, index) {
  if (typeof img === "string" && img.trim()) return `url:${img}`;
  if (img instanceof File) {
    return `file:${img.name}:${img.size}:${img.lastModified}`;
  }
  if (img?.id) return `id:${img.id}`;
  if (img?.url) return `url:${img.url}`;
  return `idx:${index}`;
}

function SortableImageCard({ id, img, index, onRemove, primaryLabel, readOnly = false }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: readOnly,
  });
  const src = getImageUrl(img);
  if (!src) return null;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: "relative",
    zIndex: isDragging ? 20 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative aspect-square rounded-xl overflow-hidden border bg-[rgb(var(--color-bg-secondary))] group shadow-sm border-[rgb(var(--color-border-primary))] ${
        isDragging ? "opacity-90 shadow-lg ring-2 ring-[rgb(var(--color-primary))]" : "hover:shadow-md"
      }`}
    >
      <Image
        src={src}
        alt={`Product Preview ${index + 1}`}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        className="object-cover pointer-events-none"
        unoptimized={img instanceof File || src.startsWith("blob:")}
      />

      <div className="absolute top-2 left-2 flex items-center gap-1">
        <span className="px-1.5 py-0.5 rounded-md bg-black/55 backdrop-blur-md text-[0.625rem] text-white font-medium">
          #{index + 1}
        </span>
        {index === 0 && (
          <span className="px-1.5 py-0.5 rounded-md bg-[rgb(var(--color-primary))] text-[0.625rem] text-white font-medium">
            {primaryLabel}
          </span>
        )}
      </div>

      {!readOnly && (
        <button
          type="button"
          className="absolute top-2 right-2 p-1.5 rounded-md bg-black/55 text-white cursor-grab active:cursor-grabbing touch-none opacity-80 group-hover:opacity-100"
          title="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>
      )}

      {!readOnly && (
        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
          <button
            onClick={() => onRemove(index)}
            className="p-2 bg-red-500 hover:bg-red-600 rounded-xl text-white transition-all shadow-lg cursor-pointer"
            title="Remove Image"
            type="button"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

const MediaSection = ({
  formData,
  onChange,
  errors = {},
  productId = null,
  entityId = null,
  entityType = "Product",
  readOnly = false,
  ...props
}) => {
  const { t } = useTranslation();
  const images = formData.images || [];
  const [uploading, setUploading] = useState(false);
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;
  const { execute } = useApiResponse();
  const resolvedEntityId = entityId || productId;

  const imageIds = useMemo(
    () => images.map((img, index) => getImageKey(img, index)),
    [images],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const syncWithRetailer = async (url, file, { isPrimary = false } = {}) => {
    if (!resolvedEntityId || !storeId) return;

    return await execute(
      productService.saveProductImage({
        entityId: resolvedEntityId,
        entityType,
        url,
        metadata: {
          name: file.name,
          size: file.size,
          type: file.type,
        },
        store: storeId,
        isPrimary,
      }),
      { showToast: false },
    );
  };

  const handleImagesChange = async (allFiles) => {
    onChange("images", allFiles);

    const filesToUpload = allFiles.filter(
      (item) => item instanceof File && !item.uploadedUrl,
    );

    if (filesToUpload.length === 0) return;

    setUploading(true);
    const updatedImages = [...allFiles];
    const hadNoImages = !images.some((img) => {
      if (typeof img === "string") return Boolean(img.trim());
      if (img instanceof File) return false;
      return Boolean(img?.url);
    });

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

        if (resolvedEntityId) {
          await syncWithRetailer(publicFileUrl, file, {
            isPrimary: hadNoImages && i === 0,
          });
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
    onChange("images", newImages);

    const imageUrl = typeof imageToDelete === "string" ? imageToDelete : imageToDelete?.url;
    if (
      imageUrl &&
      (imageUrl.includes("bucket") || imageUrl.includes("r2.dev") || imageUrl.includes("local"))
    ) {
      try {
        await utilityService.deleteFile(imageUrl);
      } catch (err) {
        console.warn("Failed to delete product image from storage:", err);
      }
    }

    if (imageToDelete?.id) {
      await execute(productService.deleteProductImage(imageToDelete.id, storeId), {
        message: t("products.imageDeleted") || "Image removed",
      });
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = imageIds.indexOf(active.id);
    const newIndex = imageIds.indexOf(over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    onChange("images", arrayMove(images, oldIndex, newIndex));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {images.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] rounded-full">
              {images.length}
            </span>
          )}
          {uploading && (
            <div className="flex items-center space-x-1.5 px-2 py-0.5 border border-blue-500/20 bg-blue-500/5 rounded-full">
              <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
              <span className="text-[0.625rem] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Uploading...
              </span>
            </div>
          )}
        </div>
        {!readOnly && images.length > 1 && (
          <p className="text-xs text-[rgb(var(--color-text-secondary))]">
            {t("products.dragToReorderImages") || "Drag images to reorder"}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {images.length === 0 ? (
          readOnly ? (
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              {t("products.noImages") || "No images"}
            </p>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <FileUpload
                accept="image/*"
                multiple
                maxFiles={MAX_IMAGES}
                value={images}
                showFileList={false}
                onChange={handleImagesChange}
                dropZoneLabel={t("products.clickToUploadImage")}
                sizeLimitLabel={t("products.imagesUpTo5MB")}
                maxSize={5 * 1024 * 1024}
                loading={uploading}
              />
            </div>
          )
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={readOnly ? undefined : handleDragEnd}
          >
            <SortableContext items={imageIds} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {images.map((img, index) => (
                  <SortableImageCard
                    key={imageIds[index]}
                    id={imageIds[index]}
                    img={img}
                    index={index}
                    onRemove={handleRemoveImage}
                    primaryLabel={t("products.primaryImage") || "Primary"}
                    readOnly={readOnly}
                  />
                ))}

                {!readOnly && images.length < MAX_IMAGES && (
                  <div className="transform hover:scale-[1.02] transition-transform duration-300">
                    <FileUpload
                      variant="compact"
                      accept="image/*"
                      multiple
                      maxFiles={MAX_IMAGES}
                      value={images}
                      showFileList={false}
                      onChange={handleImagesChange}
                      maxSize={5 * 1024 * 1024}
                      className="h-full"
                      loading={uploading}
                    />
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default MediaSection;
