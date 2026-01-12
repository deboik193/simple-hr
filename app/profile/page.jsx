// app/profile/edit/page.js
'use client';

import { useState, useEffect } from 'react';
import {
  FiUser, FiMail, FiPhone, FiBriefcase, FiCalendar,
  FiMapPin, FiAward, FiArrowLeft, FiSave, FiX,
  FiHeart, FiShield,
  FiFeather,
  FiZapOff,
  FiBold,
  FiDroplet
} from 'react-icons/fi';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/Button';
import { updateProfile } from '@/api';
import { useToast } from '@/context/toastContext';

export default function ProfileEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const data = searchParams.get('data');
  const { addToast } = useToast();
  const searchParamsObj = data ? JSON.parse(data) : {};

  const [formData, setFormData] = useState({
    dateOfBirth: "1985-01-01",
    phoneNumber: '',
    emergencyContact: {
      phone: '',
      name: '',
      relationship: '',
    },
    teamLeadId: ''
  });

  useEffect(() => {
    setFormData({
      name: searchParamsObj.fullName || '',
      email: searchParamsObj.email || '',
      phoneNumber: searchParamsObj.personalInfo?.phoneNumber || '',
      dateOfBirth: searchParamsObj.personalInfo?.dateOfBirth || '',
      branch: searchParamsObj.branch?.name || '',
      levels: searchParamsObj.levels || '',
      role: searchParamsObj.role || '',
      position: searchParamsObj.position || '',
      joinDate: searchParamsObj.joinDate ? new Date(searchParamsObj.joinDate).toLocaleDateString() : '',
      employeeId: searchParamsObj.employeeId || '',
      employementType: searchParamsObj.employmentType || '',
      department: searchParamsObj.department?.name || '',
      branch: searchParamsObj.branch?.name || '',
      emergencyContact: {
        name: searchParamsObj.personalInfo?.emergencyContact.name || '',
        relationship: searchParamsObj.personalInfo?.emergencyContact.relationship || '',
        phone: searchParamsObj.personalInfo?.emergencyContact.phone || ''
      },
      relationship: searchParamsObj.personalInfo?.emergencyContact.relationship || '',
      phone: searchParamsObj.personalInfo?.emergencyContact.phone || '',
      teamLeadId: searchParamsObj.teamLeadId?.fullName || '',
    });
    setLoading(false);
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child, grandchild] = field.split('.');
        if (grandchild) {
          return {
            ...prev,
            [parent]: {
              ...prev[parent],
              [child]: {
                ...prev[parent][child],
                [grandchild]: value
              }
            }
          };
        }
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {

      const payload = {
        personalInfo: {
          phoneNumber: formData.phoneNumber,
          dateOfBirth: formData.dateOfBirth,
          emergencyContact: {
            name: formData.emergencyContact.name,
            relationship: formData.emergencyContact.relationship,
            phone: formData.emergencyContact.phone
          }
        },
      };

      const response = await updateProfile(payload);

      if (response.error) {
        addToast(res.error, 'error');
      } else {
        addToast('Profile updated successfully!', 'success');
        // Redirect back to profile page
        router.push('/profile');
      }

    } catch (error) {
      addToast('Error updating profile:', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
                <p className="text-gray-600">Update your personal information</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <FiUser className="text-teal-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    disabled
                    type="text"
                    value={formData.name}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Editable)
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange('phoneNumber', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 hover:border-gray-400"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth (Editable)
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="date"
                    value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Administrative Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <FiBriefcase className="text-green-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-900">Administrative Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Join Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Join Date
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <div
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 hover:border-gray-400"
                  >
                    {formData.joinDate}
                  </div>
                </div>
              </div>

              {/* Employee ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Lead
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <div
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 hover:border-gray-400"
                  >
                    {formData.teamLeadId || 'N/A'}
                  </div>
                </div>
              </div>

              {/* role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <div className="relative">
                  <FiFeather className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <div
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 hover:border-gray-400"
                  >
                    {formData.role}
                  </div>
                </div>
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <div className="relative">
                  <FiZapOff className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <div
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 hover:border-gray-400"
                  >
                    {formData.position}
                  </div>
                </div>
              </div>

              {/* Branch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <div
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 hover:border-gray-400"
                  >
                    {formData.branch}
                  </div>
                </div>
              </div>

              {/* Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level
                </label>
                <div className="relative">
                  <FiAward className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <div
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 hover:border-gray-400"
                  >
                    {formData.levels}
                  </div>
                </div>
              </div>

              {/* employement type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employement Type
                </label>
                <div className="relative">
                  <FiBold className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <div
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 hover:border-gray-400"
                  >
                    {formData.employementType}
                  </div>
                </div>
              </div>

              {/* department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <div className="relative">
                  <FiDroplet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <div
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 hover:border-gray-400"
                  >
                    {formData.department}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <FiHeart className="text-red-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-900">Emergency Contact (Editable)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Emergency Contact Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Name (Editable)
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact.name}
                  onChange={(e) => handleChange('emergencyContact.name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 hover:border-gray-400"
                  placeholder="Enter emergency contact name"
                />
              </div>

              {/* Relationship */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship (Editable)
                </label>
                <select
                  value={formData.emergencyContact.relationship}
                  onChange={(e) => handleChange('emergencyContact.relationship', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 hover:border-gray-400"
                >
                  <option value="">Select Relationship</option>
                  <option value="spouse">Spouse</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="friend">Friend</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Emergency Contact Phone */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone (Editable)
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="tel"
                    value={formData.emergencyContact.phone}
                    onChange={(e) => handleChange('emergencyContact.phone', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    placeholder="Enter emergency contact phone"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              size='large'
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={saving}
              size='large'
              className="flex items-center gap-2"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}