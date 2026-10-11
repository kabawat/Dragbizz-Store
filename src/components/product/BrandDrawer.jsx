"use client";
import { BrandDrawerView } from "@dragorbit/features/brands";

import { useState, useCallback } from "react";

import { FileUpload } from "@/components/ui";

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

		if (
			newBrandData.metadata.icon &&
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

			const result = await executeCreate(
				brandService.createBrand(apiPayload, storeId),
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
				});
				resetBrandData();
				onClose();
			}
		} catch (error) {
			console.error("Brand creation failed:", error);
		}
	};

	return (
		<BrandDrawerView
			model={{
				isOpen,
				handleClose,
				t,
				handleAddBrand,
				addBrandLoading,
				newBrandData,
				iconUploading,
				setNewBrandData,
				FileUpload,
				handleIconUpload,
				handleRemoveIcon,
			}}
		/>
	);
};

export default BrandDrawer;
