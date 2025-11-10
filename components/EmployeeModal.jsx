// components/EmployeeModal.js
'use client';

import { useState, useEffect } from 'react';
import { FiX, FiUser, FiMail, FiPhone, FiBriefcase, FiCalendar, FiAward, FiMapPin, FiHeart, FiShield } from 'react-icons/fi';
import Button from './Button';
const LEAVETYPE = ['annual', 'sick', 'personal', 'maternity', 'paternity', 'compasonate', 'unpaid', 'emergency'];

export default function EmployeeModal({ employee, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee',
    department: 'Engineering',
    position: '',
    employmentType: 'full-time',
    joinDate: new Date().toISOString().split('T')[0],
    phone: '',
    branch: 'New York',
    level: 'L1',
    personalInfo: {
      dateOfBirth: '',
      phoneNumber: '',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      }
    },
    leaveBalance: LEAVETYPE.reduce((acc, type) => {
      acc[type] = 0;
      return acc;
    }, {}),
    preferences: {
      notifications: true,
      autoRelief: false
    }
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        position: employee.position,
        employmentType: employee.employmentType,
        joinDate: employee.joinDate.split('T')[0],
        phone: employee.phone || '',
        branch: employee.branch || 'New York',
        level: employee.level || 'L1',
        personalInfo: {
          dateOfBirth: employee.personalInfo?.dateOfBirth?.split('T')[0] || '',
          phoneNumber: employee.personalInfo?.phoneNumber || '',
          emergencyContact: {
            name: employee.personalInfo?.emergencyContact?.name || '',
            relationship: employee.personalInfo?.emergencyContact?.relationship || '',
            phone: employee.personalInfo?.emergencyContact?.phone || ''
          }
        },
        leaveBalance: employee.leaveBalance,
        preferences: employee.preferences
      });
    }
  }, [employee]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.personalInfo.dateOfBirth) {
      newErrors['personalInfo.dateOfBirth'] = 'Date of birth is required';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(employee ? { ...employee, ...formData } : formData);
    }
  };

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

    // Clear error when user starts typing
    const errorField = field.split('.')[0];
    if (errors[errorField]) {
      setErrors(prev => ({ ...prev, [errorField]: '' }));
    }
  };

  const handleLeaveBalanceChange = (leaveType, value) => {
    setFormData(prev => ({
      ...prev,
      leaveBalance: {
        ...prev.leaveBalance,
        [leaveType]: parseInt(value) || 0
      }
    }));
  };

  const getLeaveTypeDisplay = (type) => {
    const displayNames = {
      annual: 'Annual Leave',
      sick: 'Sick Leave',
      personal: 'Personal Leave',
      maternity: 'Maternity Leave',
      paternity: 'Paternity Leave',
      emergency: 'Emergency Leave',
      unpaid: 'Unpaid Leave'
    };
    return displayNames[type] || type;
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {employee ? 'Edit Employee' : 'Add New Employee'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-green-100 rounded-lg transition-colors"
          >
            <FiX size={20} className='text-green-600/30' />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information Section */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiUser className="text-teal-600" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="Enter full name"
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
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
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="Enter email address"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="hr">HR</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="HR">HR</option>
                  <option value="Sales">Sales</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position *
                </label>
                <div className="relative">
                  <FiBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => handleChange('position', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.position ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="Enter job position"
                  />
                </div>
                {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position}</p>}
              </div>

              {/* Employment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Type
                </label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => handleChange('employmentType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>

              {/* Branch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <select
                    value={formData.branch}
                    onChange={(e) => handleChange('branch', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="New York">New York</option>
                    <option value="San Francisco">San Francisco</option>
                    <option value="Chicago">Chicago</option>
                    <option value="Boston">Boston</option>
                    <option value="Austin">Austin</option>
                  </select>
                </div>
              </div>

              {/* Levels */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level
                </label>
                <div className="relative">
                  <FiAward className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <select
                    value={formData.level}
                    onChange={(e) => handleChange('level', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="L1">L1 - Junior</option>
                    <option value="L2">L2 - Intermediate</option>
                    <option value="L3">L3 - Senior</option>
                    <option value="L4">L4 - Lead</option>
                    <option value="L5">L5 - Principal</option>
                    <option value="L6">L6 - Director</option>
                  </select>
                </div>
              </div>

              {/* Join Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Join Date
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="date"
                    value={formData.joinDate}
                    onChange={(e) => handleChange('joinDate', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiHeart className="text-teal-600" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="date"
                    value={formData.personalInfo.dateOfBirth}
                    onChange={(e) => handleChange('personalInfo.dateOfBirth', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors['personalInfo.dateOfBirth'] ? 'border-red-300' : 'border-gray-300'
                      }`}
                  />
                </div>
                {errors['personalInfo.dateOfBirth'] && <p className="mt-1 text-sm text-red-600">{errors['personalInfo.dateOfBirth']}</p>}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="tel"
                    value={formData.personalInfo.phoneNumber}
                    onChange={(e) => handleChange('personalInfo.phoneNumber', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Emergency Contact Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.emergencyContact.name}
                  onChange={(e) => handleChange('personalInfo.emergencyContact.name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Contact name"
                />
              </div>

              {/* Emergency Contact Relationship */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship
                </label>
                <select
                  value={formData.personalInfo.emergencyContact.relationship}
                  onChange={(e) => handleChange('personalInfo.emergencyContact.relationship', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact Phone
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="tel"
                    value={formData.personalInfo.emergencyContact.phone}
                    onChange={(e) => handleChange('personalInfo.emergencyContact.phone', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Emergency contact phone"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Leave Balance Section */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiShield className="text-teal-600" />
              Leave Balance
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {LEAVETYPE.map((type) => (
                <div key={type} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {getLeaveTypeDisplay(type)}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.leaveBalance[type]}
                    onChange={(e) => handleLeaveBalanceChange(type, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                  <p className="text-sm text-gray-500">Receive email notifications for leave requests</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.preferences.notifications}
                    onChange={(e) => handleChange('preferences.notifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Auto Relief Assignment</label>
                  <p className="text-sm text-gray-500">Automatically assign relief officers for leave</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.preferences.autoRelief}
                    onChange={(e) => handleChange('preferences.autoRelief', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className='space-x-3'>
            <Button
              variant='outline'
              size='large'
              type="button"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size='large'
            >
              {employee ? 'Update Employee' : 'Add Employee'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}