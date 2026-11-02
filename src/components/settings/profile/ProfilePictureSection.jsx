"use client";
import { ProfilePictureSectionView } from "@dragorbit/features/settings";

import { useRef, useState } from "react";
import { utilityService } from "@/service";
import authService from "@/service/auth/auth.service";
import { useApiResponse } from "@/hooks/useApiResponse";
import { useAppDispatch } from "@/store/hooks";
import { getAuthProfile } from "@/store/slices/profileSlice";

const ProfilePictureSection = ({
  firstName,
  lastName,
  email,
  phone,
  countryCode,
  profileImage,
}) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const { execute } = useApiResponse();
  const dispatch = useAppDispatch();

  const handleCameraClick = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      // Step 0: Delete old image if exists
      if (
        profileImage &&
        (profileImage.includes("bucket") ||
          profileImage.includes("r2.dev") ||
          profileImage.includes("local"))
      ) {
        try {
          await utilityService.deleteFile(profileImage);
        } catch (err) {
          console.warn("Failed to delete old profile image:", err);
        }
      }

      // Step 1: Upload to Storage
      const { publicFileUrl } = await utilityService.uploadFile(
        file,
        "profile",
      );

      // Step 2: Update Auth Profile
      await execute(authService.updateProfile({ profile: publicFileUrl }), {
        message: "Profile picture updated successfully!",
      });

      // Step 3: Refresh global profile to update UI
      dispatch(getAuthProfile());
    } catch (error) {
      console.error("Profile upload failed:", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <ProfilePictureSectionView
      model={{
        profileImage,
        uploading,
        firstName,
        lastName,
        fileInputRef,
        handleFileChange,
        handleCameraClick,
        email,
        phone,
        countryCode,
      }}
    />
  );
};

export default ProfilePictureSection;
