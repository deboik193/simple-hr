// components/ActionModal.js
'use client';

import { FiX, FiCheckCircle, FiXCircle } from 'react-icons/fi';

export default function ActionModal({ request, actionType, notes, onNotesChange, onSubmit, onClose }) {
  const getActionTitle = () => {
    return actionType === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request';
  };

  const getActionDescription = () => {
    return actionType === 'approve'
      ? 'You are about to approve this leave request. Please add any notes if needed.'
      : 'You are about to reject this leave request. Please provide a reason for rejection.';
  };

  const getActionButtonText = () => {
    return actionType === 'approve' ? 'Approve Request' : 'Reject Request';
  };

  const getActionButtonColor = () => {
    return actionType === 'approve'
      ? 'bg-green-600 hover:bg-green-700'
      : 'bg-red-600 hover:bg-red-700';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            {actionType === 'approve' ? (
              <FiCheckCircle className="text-green-600" size={24} />
            ) : (
              <FiXCircle className="text-red-600" size={24} />
            )}
            <h2 className="text-xl font-semibold text-gray-900">{getActionTitle()}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-600">{getActionDescription()}</p>

          {/* Request Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium text-gray-900">{request.employeeId.name}</p>
            <p className="text-sm text-gray-600">
              {request.leaveType} Leave • {request.totalDays} days
            </p>
            <p className="text-sm text-gray-600">
              {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
            </p>
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {actionType === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason *'}
            </label>
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={actionType === 'approve'
                ? 'Add any additional notes or instructions...'
                : 'Please provide a reason for rejecting this leave request...'
              }
            />
            {actionType === 'reject' && !notes && (
              <p className="mt-1 text-sm text-red-600">Rejection reason is required</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={actionType === 'reject' && !notes}
            className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${getActionButtonColor()}`}
          >
            {actionType === 'approve' ? <FiCheckCircle size={16} /> : <FiXCircle size={16} />}
            {getActionButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
}