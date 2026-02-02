// components/NewLeaveRequestModal.js
'use client';

import { getAllUser, requestLeave } from '../api';
import { useState, useEffect } from 'react';
import {
  FiX, FiCalendar, FiPhone,
  FiClock, FiAlertCircle
} from 'react-icons/fi';
import { LEAVETYPE } from '@/constant/constant';
import CloudinaryFileUpload from './CloudinaryFileUpload';
import Button from './Button';
import { useToast } from '@/context/toastContext';

export default function NewLeaveRequestModal({ onSave, onClose }) {
  const [formData, setFormData] = useState({
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    reason: '',
    reliefOfficerId: '',
    handoverNotes: '',
    urgentContact: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalDays, setTotalDays] = useState(0);
  const [reliefOfficere, setReliefOfficer] = useState([]);
  const { addToast } = useToast();

  const reliefOfficers = async () => {
    const res = await getAllUser();
    setReliefOfficer(res.data)
  }

  useEffect(() => {
    reliefOfficers();

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);

      // Calculate total working days (excluding weekends)
      let workingDays = 0;
      const currentDate = new Date(start);

      while (currentDate <= end) {
        const dayOfWeek = currentDate.getDay();
        // Monday to Friday are 1-5
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          workingDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      setTotalDays(workingDays);
    } else {
      setTotalDays(0);
    }
  }, [formData.startDate, formData.endDate]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.leaveType) {
      newErrors.leaveType = 'Leave type is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    } else if (new Date(formData.startDate) < new Date().setHours(0, 0, 0, 0)) {
      newErrors.startDate = 'Start date cannot be in the past';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date cannot be before start date';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    } else if (formData.reason.trim().length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters';
    }

    if (!formData.reliefOfficerId) {
      newErrors.reliefOfficerId = 'Relief officer is required';
    }

    if (!formData.handoverNotes.trim()) {
      newErrors.handoverNotes = 'Handover notes are required';
    }

    if (!formData.urgentContact.trim()) {
      newErrors.urgentContact = 'Urgent contact is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {

      const res = await requestLeave({ ...formData, totalDays })

      if (res?.error) {
        addToast(res?.error, 'error')
      } else {
        addToast(res?.message, 'success')
        onSave({ ...formData, totalDays });
        onClose();
      }

    } catch (error) {
      setErrors({ submit: 'Failed to create leave request. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
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

  const isFormValid = formData.startDate && formData.endDate && formData.reason &&
    formData.reliefOfficerId && formData.handoverNotes && formData.urgentContact;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">New Leave Request</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
            disabled={isSubmitting}
          >
            <FiX size={20} className='text-teal-400'/>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Leave Type & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Leave Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leave Type *
              </label>
              <select
                value={formData.leaveType}
                onChange={(e) => handleChange('leaveType', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.leaveType ? 'border-red-300' : 'border-gray-300'
                  }`}
              >
                {LEAVETYPE.map((type) => (
                  <option key={type} value={type}>
                    {getLeaveTypeDisplay(type)}
                  </option>
                ))}
              </select>
              {errors.leaveType && (
                <p className="mt-1 text-sm text-red-600">{errors.leaveType}</p>
              )}
            </div>

            {/* Duration Display */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                <div className="flex items-center gap-2 text-gray-700">
                  <FiClock size={16} />
                  <span className="font-medium">{totalDays} day{totalDays !== 1 ? 's' : ''}</span>
                  {totalDays > 0 && (
                    <span className="text-sm text-gray-500">
                      ({formData.startDate} to {formData.endDate})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.startDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                />
              </div>
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.endDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                />
              </div>
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Relief Officer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relief Officer *
            </label>
            <select
              value={formData.reliefOfficerId}
              onChange={(e) => handleChange('reliefOfficerId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.reliefOfficerId ? 'border-red-300' : 'border-gray-300'
                }`}
            >
              <option value="">Select Relief Officer</option>
              {reliefOfficere.map((employee) => (
                <option className='capitalize' key={employee._id} value={employee._id}>
                  {employee.fullName} ({employee.employeeId}) - {employee?.department.name}
                </option>
              ))}
            </select>
            {errors.reliefOfficerId && (
              <p className="mt-1 text-sm text-red-600">{errors.reliefOfficerId}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              This person will be notified to cover your responsibilities
            </p>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Leave *
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              rows={3}
              placeholder="Please provide a detailed reason for your leave request..."
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.reason ? 'border-red-300' : 'border-gray-300'
                }`}
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Minimum 10 characters. For sick leave, additional documentation may be required.
            </p>
          </div>

          <CloudinaryFileUpload
            value={formData.additionalFile}
            onChange={(url) => handleChange('additionalFile', url)}
            folder="leave-requests"
            maxSize={5 * 1024 * 1024} // 5MB
            allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'application/pdf']}
            label="Additional Documents"
            description="Doctors report if necessary for sick leave (optional)."
          />

          {/* Handover Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Handover Notes *
            </label>
            <textarea
              value={formData.handoverNotes}
              onChange={(e) => handleChange('handoverNotes', e.target.value)}
              rows={3}
              placeholder="Describe what needs to be covered, important deadlines, key contacts, etc."
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.handoverNotes ? 'border-red-300' : 'border-gray-300'
                }`}
            />
            {errors.handoverNotes && (
              <p className="mt-1 text-sm text-red-600">{errors.handoverNotes}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              This information will be shared with your relief officer
            </p>
          </div>

          {/* Urgent Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urgent Contact Information *
            </label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={formData.urgentContact}
                onChange={(e) => handleChange('urgentContact', e.target.value)}
                placeholder="Phone number where you can be reached in case of emergency"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.urgentContact ? 'border-red-300' : 'border-gray-300'
                  }`}
              />
            </div>
            {errors.urgentContact && (
              <p className="mt-1 text-sm text-red-600">{errors.urgentContact}</p>
            )}
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="text-yellow-600 mt-0.5 flex-shrink-0" size={18} />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Important Information</p>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li>Your request will be sent to the relief officer for acceptance first</li>
                  <li>After relief acceptance, it goes to your manager for approval</li>
                  <li>HR final approval may be required for certain leave types</li>
                  <li>You will be notified at each step of the approval process</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              variant='outline'
              size='large'
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size='large'
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </>
              ) : (
                <>
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}