"use client"
import { Edit2, User, Mail, Phone } from 'lucide-react';
import PersonalInfoCard from './PersonalInfoCard';

const PersonalInfoSection = ({ 
  form, 
  apiUser, 
  user, 
  onEditClick 
}) => {
  return (
    <div className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Personal Information</h3>
        <button
          onClick={onEditClick}
          className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--color-primary))] text-white rounded-lg"
        >
          <Edit2 className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      {/* Read-only view */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PersonalInfoCard
          icon={User}
          label="Full Name"
          value={form.firstName || form.lastName
            ? `${form.firstName || ''} ${form.lastName || ''}`.trim()
            : '-'}
        />

        <PersonalInfoCard
          icon={Mail}
          label="Email"
          value={apiUser?.email || user?.email || '-'}
        />

        <PersonalInfoCard
          icon={Phone}
          label="Phone"
          value={[
            apiUser?.countryCode || user?.countryCode,
            apiUser?.phone || user?.phone,
          ]
            .filter(Boolean)
            .join(' ') || '-'}
        />

        <PersonalInfoCard
          label="Date of Birth"
          value={form.dob || '-'}
        />

        <PersonalInfoCard
          label="Gender"
          value={form.gender || '-'}
        />
      </div>
    </div>
  );
};

export default PersonalInfoSection;

