"use client";
import { Camera, User, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { uploadService, authService } from "@/service";
import useErrorHandling from "@/hooks/error/useErrorHandling";
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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { showSuccess, showError } = useErrorHandling();
  const dispatch = useAppDispatch();

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showError("Please upload a valid image file (JPEG, PNG, or WebP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError("Image size should be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);

      // 1. Upload file and wait for result (async queue pattern)
      const uploadResult = await uploadService.uploadFileAndWait(file, "profiles");

      if (uploadResult && uploadResult.url) {
        // 2. Update user profile with the new image URL
        const updateResult = await authService.updateProfile({
          profile: uploadResult.url,
        });

        if (updateResult.success) {
          showSuccess("Profile picture updated successfully");
          // 3. Refresh profile in Redux
          dispatch(getAuthProfile());
        } else {
          showError(updateResult.message || "Failed to update profile picture");
        }
      }
    } catch (error) {
      
      showError(error.message || "An unexpected error occurred during upload");
    } finally {
      setIsUploading(false);
      // Reset input value to allow selecting same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[rgb(var(--color-primary))] via-[rgb(var(--color-primary))]/80 to-[rgb(var(--color-secondary))] flex items-center justify-center overflow-hidden border-2 border-[rgb(var(--color-border-primary))]/30">
            {profileImage ? (
              <img
                src={profileImage}
                alt={`${firstName} ${lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-white" />
            )}

            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <button
            onClick={handleCameraClick}
            disabled={isUploading}
            className="absolute bottom-0 right-0 w-8 h-8 bg-[rgb(var(--color-primary))] rounded-full flex items-center justify-center border-2 border-[rgb(var(--color-bg-primary))] hover:bg-[rgb(var(--color-primary))]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <Camera className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
            {firstName} {lastName}
          </h3>
          {email && (
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              {email}
            </p>
          )}
          {(phone || countryCode) && (
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              {[countryCode, phone].filter(Boolean).join(" ")}
            </p>
          )}
          <button
            onClick={handleCameraClick}
            disabled={isUploading}
            className="mt-2 text-sm text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary))]/80 transition-colors disabled:opacity-50"
          >
            {isUploading ? "Uploading..." : "Change profile picture"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureSection;
