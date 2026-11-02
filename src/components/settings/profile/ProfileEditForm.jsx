"use client";
import { ProfileEditFormView } from "@dragorbit/features/settings";

const ProfileEditForm = ({ form, onChange }) => {
  // Handle Input component onChange (receives value directly)
  const handleInputChange = (name, value) => {
    const event = {
      target: { name, value },
    };
    onChange(event);
  };

  const genderOptions = [
    { value: "", label: "Select gender" },
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  return (
    <ProfileEditFormView model={{ form, handleInputChange, genderOptions }} />
  );
};

export default ProfileEditForm;
