"use client";
import { CategoryDrawerView } from "@dragorbit/features/categories";

import { useState, useCallback } from "react";

import { Checkbox, FileUpload } from "@/components/ui";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { categoryService, utilityService, productService } from "@/service";
import useApiResponse from "@/hooks/useApiResponse";

const CategoryDrawer = ({ isOpen, onClose, storeId, onCategoryAdded }) => {
	const { t } = useTranslation();

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
	const { execute: executeCreate, loading: addCategoryLoading } =
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

	const handleAddCategory = async () => {
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

			const result = await executeCreate(
				categoryService.createCategory(apiPayload, storeId),
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
				});
				resetCategoryData();
				onClose();
			}
		} catch (error) {
			console.error("Category creation failed:", error);
		}
	};

	return (
		<CategoryDrawerView
			model={{
				isOpen,
				handleClose,
				t,
				handleAddCategory,
				addCategoryLoading,
				newCategoryData,
				iconUploading,
				setNewCategoryData,
				Checkbox,
				FileUpload,
				handleIconUpload,
				handleRemoveIcon,
			}}
		/>
	);
};

export default CategoryDrawer;
