"use client"
import React, { useState } from 'react';
import { Save, Edit2, User, Mail, Phone, UserCircle, Camera } from 'lucide-react';

const ProfileSettings = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || 'John',
    lastName: user?.lastName || 'Doe',
    email: user?.email || user?.identifier || 'john.doe@example.com',
    phone: user?.phone || '+1 234 567 8900'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically make an API call to save the profile
  };

  const handleCancel = () => {
    setIsEditing(!isEditing);
    // Reset form to original values
    setForm({
      firstName: user?.firstName || 'John',
      lastName: user?.lastName || 'Doe',
      email: user?.email || user?.identifier || 'john.doe@example.com',
      phone: user?.phone || '+1 234 567 8900'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">Profile Settings</h2>
        <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
          Manage your personal information and profile details
        </p>
      </div>

      {/* Profile Picture Section */}
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
              {form.firstName} {form.lastName}
            </h3>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">{form.email}</p>
            <button className="mt-2 text-sm text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary))]/80 transition-colors">
              Change profile picture
            </button>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Personal Information</h3>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--color-primary))] text-white rounded-lg hover:bg-[rgb(var(--color-primary))]/90 transition-colors cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-primary))] rounded-lg hover:bg-[rgb(var(--color-bg-secondary))] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--color-primary))] text-white rounded-lg hover:bg-[rgb(var(--color-primary))]/90 transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[rgb(var(--color-text-primary))]">
              <User className="w-4 h-4" />
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Enter your first name"
              className="w-full px-4 py-2.5 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg text-[rgb(var(--color-text-primary))] placeholder:text-[rgb(var(--color-text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[rgb(var(--color-text-primary))]">
              <User className="w-4 h-4" />
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Enter your last name"
              className="w-full px-4 py-2.5 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg text-[rgb(var(--color-text-primary))] placeholder:text-[rgb(var(--color-text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            />
          </div>

          {/* Email */}
          <div className="space-y-2 md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[rgb(var(--color-text-primary))]">
              <Mail className="w-4 h-4" />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Enter your email address"
              className="w-full px-4 py-2.5 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg text-[rgb(var(--color-text-primary))] placeholder:text-[rgb(var(--color-text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            />
            {isEditing && (
              <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">
                A verification email will be sent to your new address
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-2 md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[rgb(var(--color-text-primary))]">
              <Phone className="w-4 h-4" />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Enter your phone number"
              className="w-full px-4 py-2.5 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg text-[rgb(var(--color-text-primary))] placeholder:text-[rgb(var(--color-text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            />
          </div>
        </div>

        {/* Account Actions */}
        {!isEditing && (
          <div className="mt-6 pt-6 border-t border-[rgb(var(--color-border-primary))]">
            <h4 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-3">Account Actions</h4>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 text-sm text-[rgb(var(--color-primary))] border border-[rgb(var(--color-primary))]/30 rounded-lg hover:bg-[rgb(var(--color-primary))]/10 transition-colors">
                Change Password
              </button>
              <button className="px-4 py-2 text-sm text-[rgb(var(--color-text-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg hover:bg-[rgb(var(--color-bg-secondary))] transition-colors">
                Download Account Data
              </button>
              <button className="px-4 py-2 text-sm text-red-600 border border-red-600/30 rounded-lg hover:bg-red-600/10 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;

