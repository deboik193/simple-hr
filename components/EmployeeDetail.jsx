// components/EmployeeDetail.js
'use client';

import { FiMail, FiPhone, FiBriefcase, FiCalendar, FiUser, FiAward, FiMapPin, FiHeart, FiShield, FiX } from 'react-icons/fi';

// Mock LEAVETYPE constant
const LEAVETYPE = ['annual', 'sick', 'personal', 'maternity', 'paternity', 'emergency', 'unpaid'];

export default function EmployeeDetail({ employee, onClose }) {
  if (!employee) return null;

  const getRoleDisplay = (role) => {
    const roles = {
      employee: 'Employee',
      manager: 'Manager',
      hr: 'HR Staff',
      admin: 'Administrator'
    };
    return roles[role] || role;
  };

  const getEmploymentTypeDisplay = (type) => {
    const types = {
      'full-time': 'Full Time',
      'part-time': 'Part Time',
      contract: 'Contract'
    };
    return types[type] || type;
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-medium text-teal-600">
                {employee.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{employee.name}</h2>
              <p className="text-gray-600">{employee.position} • {employee.department}</p>
              <p className="text-sm text-gray-500">{employee.employeeId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-green-100 rounded-lg transition-colors"
          >
            <FiX size={20} className='text-green-600/30' />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info Card */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiUser className="text-teal-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <FiUser className="text-gray-400" size={18} />
                    <div>
                      <p className="text-sm text-gray-600">Employee ID</p>
                      <p className="font-medium text-gray-900">{employee.employeeId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiAward className="text-gray-400" size={18} />
                    <div>
                      <p className="text-sm text-gray-600">Role</p>
                      <p className="font-medium text-gray-900">{getRoleDisplay(employee.role)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiMail className="text-gray-400" size={18} />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{employee.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiBriefcase className="text-gray-400" size={18} />
                    <div>
                      <p className="text-sm text-gray-600">Employment Type</p>
                      <p className="font-medium text-gray-900">{getEmploymentTypeDisplay(employee.employmentType)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiCalendar className="text-gray-400" size={18} />
                    <div>
                      <p className="text-sm text-gray-600">Join Date</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(employee.joinDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiMapPin className="text-gray-400" size={18} />
                    <div>
                      <p className="text-sm text-gray-600">Branch</p>
                      <p className="font-medium text-gray-900">{employee.branch || 'Not assigned'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiAward className="text-gray-400" size={18} />
                    <div>
                      <p className="text-sm text-gray-600">Level</p>
                      <p className="font-medium text-gray-900">{employee.levels || 'Not assigned'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information Card */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiHeart className="text-teal-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(employee.personalInfo?.dateOfBirth)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="font-medium text-gray-900">
                      {employee.personalInfo?.phoneNumber || 'Not provided'}
                    </p>
                  </div>
                  {employee.personalInfo?.emergencyContact?.name && (
                    <>
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-gray-700 mb-2">Emergency Contact</p>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Name</p>
                              <p className="font-medium text-gray-900">
                                {employee.personalInfo.emergencyContact.name}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Relationship</p>
                              <p className="font-medium text-gray-900 capitalize">
                                {employee.personalInfo.emergencyContact.relationship}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Phone</p>
                              <p className="font-medium text-gray-900">
                                {employee.personalInfo.emergencyContact.phone}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Leave Balance Card */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiShield className="text-teal-600" />
                  Leave Balance
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {LEAVETYPE.map((type) => (
                    <div key={type} className="text-center p-4 bg-white rounded-lg border border-gray-200">
                      <div className="text-2xl font-bold text-teal-600">
                        {employee.leaveBalance?.[type] || 0}
                      </div>
                      <div className="text-sm font-medium text-gray-700 mt-1">
                        {getLeaveTypeDisplay(type)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar - Status & Preferences */}
            <div className="space-y-6">
              {/* Account Status */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${employee.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                  }`}>
                  {employee.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Email Notifications</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${employee.preferences?.notifications
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}>
                      {employee.preferences?.notifications ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Auto Relief</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${employee.preferences?.autoRelief
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}>
                      {employee.preferences?.autoRelief ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Manager Information */}
              {employee.managerId && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports To</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-teal-600">
                        {employee.managerId.name?.split(' ').map(n => n[0]).join('') || 'M'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{employee.managerId.name || 'Manager'}</p>
                      <p className="text-sm text-gray-600">{employee.managerId.position || 'Manager'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}