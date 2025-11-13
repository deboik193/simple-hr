// components/LeaveRequestDetail.js
'use client';

import { FiX, FiCalendar, FiUser, FiClock, FiCheckCircle, FiXCircle, FiFileText, FiPhone } from 'react-icons/fi';

export default function LeaveRequestDetail({ request, onClose, onAction, canTakeAction }) {
  const getStatusDisplay = (status) => {
    const statusMap = {
      'draft': 'Draft',
      'pending-relief': 'Pending Relief Officer',
      'pending-manager': 'Pending Manager Approval',
      'pending-hr': 'Pending HR Approval',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'cancelled': 'Cancelled',
      'revoked': 'Revoked'
    };
    return statusMap[status] || status;
  };

  const getActionDisplay = (action) => {
    const actionMap = {
      'submitted': 'Submitted',
      'accepted-relief': 'Relief Accepted',
      'declined-relief': 'Relief Declined',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'recalled': 'Recalled'
    };
    return actionMap[action] || action;
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      'relief': 'Relief Officer',
      'manager': 'Manager',
      'hr': 'HR Staff',
      'admin': 'Administrator'
    };
    return roleMap[role] || role;
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Leave Request Details</h2>
            <p className="text-gray-600">Request ID: {request?._id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Employee Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiUser className="text-teal-600" />
                Employee Information
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">{request.employeeId.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Employee ID</p>
                  <p className="font-medium text-gray-900">{request.employeeId.employeeId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-medium text-gray-900">{request.employeeId.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Position</p>
                  <p className="font-medium text-gray-900">{request.employeeId.position}</p>
                </div>
              </div>
            </div>

            {/* Leave Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiCalendar className="text-teal-600" />
                Leave Details
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Leave Type</p>
                  <p className="font-medium text-gray-900 capitalize">{request.leaveType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium text-gray-900">
                    {request.totalDays} day{request.totalDays !== 1 ? 's' : ''}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(request.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">End Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(request.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Status</p>
                  <p className="font-medium text-gray-900">{getStatusDisplay(request.status)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reason & Handover */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reason */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiFileText className="text-teal-600" />
                Reason for Leave
              </h3>
              <p className="text-gray-700">{request.reason}</p>
            </div>

            {/* Handover Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiFileText className="text-teal-600" />
                Handover Notes
              </h3>
              <p className="text-gray-700">
                {request.handoverNotes || 'No handover notes provided'}
              </p>
              {request.urgentContact && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <FiPhone size={14} />
                    Urgent Contact
                  </p>
                  <p className="font-medium text-gray-900">{request.urgentContact}</p>
                </div>
              )}
            </div>
          </div>

          {/* Relief Officer */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiUser className="text-teal-600" />
              Relief Officer
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Assigned Officer</p>
                <p className="font-medium text-gray-900">{request.reliefOfficerId.name}</p>
                <p className="text-sm text-gray-500">{request.reliefOfficerId.employeeId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Relief Status</p>
                <p className="font-medium text-gray-900 capitalize">{request.reliefStatus}</p>
                {request.reliefNotes && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Relief Notes</p>
                    <p className="text-sm text-gray-700">{request.reliefNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Approval History */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiClock className="text-teal-600" />
              Approval History
            </h3>
            <div className="space-y-3">
              {request.approvalHistory.map((history, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-teal-600">
                      {history.approvedBy.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{history.approvedBy.name}</p>
                      <span className="text-xs text-gray-500 capitalize">{getRoleDisplay(history.role)}</span>
                    </div>
                    <p className="text-sm text-gray-700 capitalize">{getActionDisplay(history.action)}</p>
                    {history.notes && (
                      <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(history.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {request.approvalHistory.length === 0 && (
                <p className="text-gray-500 text-center py-4">No approval history yet</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {canTakeAction && (
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={() => onAction('reject')}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <FiXCircle size={16} />
                Reject
              </button>
              <button
                onClick={() => onAction('approve')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <FiCheckCircle size={16} />
                Approve
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
