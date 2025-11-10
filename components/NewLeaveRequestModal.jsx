// components/NewLeaveRequestModal.js
'use client';

import { useState, useEffect } from 'react';
import {
  FiX, FiCalendar, FiUser, FiFileText, FiPhone,
  FiClock, FiAlertCircle
} from 'react-icons/fi';

// Mock employees for relief officer selection
const MOCK_EMPLOYEES = [
  { _id: '1', name: 'Mike Chen', employeeId: 'EMP003', department: 'Engineering' },
  { _id: '2', name: 'David Wilson', employeeId: 'EMP005', department: 'Marketing' },
  { _id: '3', name: 'Alex Turner', employeeId: 'EMP009', department: 'Engineering' },
  { _id: '4', name: 'Robert Brown', employeeId: 'EMP007', department: 'Sales' },
  { _id: '5', name: 'Sarah Kim', employeeId: 'EMP010', department: 'HR' }
];

const LEAVETYPE = ['annual', 'sick', 'personal', 'maternity', 'paternity', 'emergency', 'unpaid'];

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

  // Calculate total days when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const timeDiff = end.getTime() - start.getTime();
      const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
      setTotalDays(dayDiff > 0 ? dayDiff : 0);
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newRequest = {
        // _id: Date.now().toString(),
        // ...formData,
        // reliefOfficerId: MOCK_EMPLOYEES.find(emp => emp._id === formData.reliefOfficerId),
        // totalDays,
        // status: 'pending-relief',
        // reliefStatus: 'pending',
        // approvalHistory: [],
        // employeeId: {
        //   _id: 'current-user',
        //   name: 'Current User',
        //   employeeId: 'EMP001',
        //   department: 'Engineering',
        //   position: 'Software Engineer'
        // }
      };

      onSave(newRequest);
      onClose();
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
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <FiX size={20} />
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
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.leaveType ? 'border-red-300' : 'border-gray-300'
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
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.startDate ? 'border-red-300' : 'border-gray-300'
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
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.endDate ? 'border-red-300' : 'border-gray-300'
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
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.reliefOfficerId ? 'border-red-300' : 'border-gray-300'
                }`}
            >
              <option value="">Select Relief Officer</option>
              {MOCK_EMPLOYEES.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.name} ({employee.employeeId}) - {employee.department}
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
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.reason ? 'border-red-300' : 'border-gray-300'
                }`}
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Minimum 10 characters. For sick leave, additional documentation may be required.
            </p>
          </div>

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
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.handoverNotes ? 'border-red-300' : 'border-gray-300'
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
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.urgentContact ? 'border-red-300' : 'border-gray-300'
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
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <FiFileText size={16} />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}