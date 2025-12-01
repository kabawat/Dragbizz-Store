"use client"
import { User, Camera } from 'lucide-react';

const ProfilePictureSection = ({ firstName, lastName, email, phone, countryCode }) => {
  return (
    <div className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[rgb(var(--color-primary))] via-[rgb(var(--color-primary))]/80 to-[rgb(var(--color-secondary))] flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-[rgb(var(--color-primary))] rounded-full flex items-center justify-center border-2 border-[rgb(var(--color-bg-primary))] hover:bg-[rgb(var(--color-primary))]/90 transition-colors">
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
          <button className="mt-2 text-sm text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary))]/80 transition-colors">
            Change profile picture
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureSection;

