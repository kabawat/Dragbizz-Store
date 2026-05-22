import { Camera, User, Loader2 } from "lucide-react";
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
      if (profileImage && (profileImage.includes("bucket") || profileImage.includes("r2.dev") || profileImage.includes("local"))) {
        try {
          await utilityService.deleteFile(profileImage);
        } catch (err) {
          console.warn("Failed to delete old profile image:", err);
        }
      }

      // Step 1: Upload to Storage
      const { publicFileUrl } = await utilityService.uploadFile(file, "profile");

      // Step 2: Update Auth Profile
      await execute(
        authService.updateProfile({ profile: publicFileUrl }),
        { message: "Profile picture updated successfully!" }
      );

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
    <div className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[rgb(var(--color-primary))] via-[rgb(var(--color-primary))]/80 to-[rgb(var(--color-secondary))] flex items-center justify-center overflow-hidden border-2 border-[rgb(var(--color-border-primary))]/30 shadow-md">
            {profileImage && !uploading ? (
              <img
                src={profileImage}
                alt={`${firstName} ${lastName}`}
                className="w-full h-full object-cover animate-in fade-in duration-500"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
            )}

            {uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
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
            disabled={uploading}
            className={`absolute bottom-0 right-0 w-8 h-8 bg-[rgb(var(--color-primary))] rounded-full flex items-center justify-center border-2 border-[rgb(var(--color-bg-primary))] transition-all shadow-lg ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 hover:shadow-xl active:scale-95'}`}
          >
            <Camera className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
            {firstName} {lastName}
          </h3>
          <div className="space-y-0.5 mt-0.5">
            {email && (
              <p className="text-sm text-[rgb(var(--color-text-secondary))] font-medium">
                {email}
              </p>
            )}
            {(phone || countryCode) && (
              <p className="text-xs text-[rgb(var(--color-text-secondary))] opacity-80">
                {[countryCode, phone].filter(Boolean).join(" ")}
              </p>
            )}
          </div>
          <button
            onClick={handleCameraClick}
            disabled={uploading}
            className={`mt-3 text-sm font-semibold transition-colors ${uploading ? "text-[rgb(var(--color-text-secondary))] cursor-not-allowed" : "text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary))]/80"}`}
          >
            {uploading ? "Uploading..." : "Change profile picture"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureSection;
