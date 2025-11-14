// app/leave-requests/page.js
'use client';

import { getDepartment } from '../../api';
import ActionModal from '../../components/actionModal';
import Button from '@/components/Button';
import LeaveRequestDetail from '@/components/LeaveRequestDetail';
import NewLeaveRequestModal from '../../components/NewLeaveRequestModal';
import { LEAVETYPE, STATUS } from '@/constant/constant';
import { useState, useEffect } from 'react';
import {
  FiSearch,
  FiEye,
  FiCalendar,
  FiUser,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiChevronLeft,
  FiChevronRight,
  FiDownload
} from 'react-icons/fi';

// Mock data based on your LeaveRequest schema
const MOCK_LEAVE_REQUESTS = [
  {
    _id: '1',
    employeeId: {
      _id: '1',
      name: 'John Smith',
      employeeId: 'EMP001',
      department: 'Engineering',
      position: 'Senior Software Engineer'
    },
    leaveType: 'annual',
    startDate: '2024-02-15',
    endDate: '2024-02-20',
    totalDays: 5,
    reason: 'Family vacation and personal time off',
    status: 'pending-manager',
    reliefOfficerId: {
      _id: '3',
      name: 'Mike Chen',
      employeeId: 'EMP003'
    },
    reliefStatus: 'accepted',
    reliefNotes: 'Happy to cover for John during his vacation',
    approvalHistory: [
      {
        approvedBy: {
          _id: '3',
          name: 'Mike Chen'
        },
        role: 'relief',
        action: 'accepted-relief',
        notes: 'Confirmed I can handle the workload',
        timestamp: '2024-01-10T10:30:00Z'
      }
    ],
    handoverNotes: 'All ongoing projects documented in shared drive. Key contacts listed in project files.',
    urgentContact: '+1 (555) 123-4567',
    createdAt: '2024-01-08T09:15:00Z',
    updatedAt: '2024-01-10T10:30:00Z'
  },
  {
    _id: '2',
    employeeId: {
      _id: '2',
      name: 'Sarah Johnson',
      employeeId: 'EMP002',
      department: 'Marketing',
      position: 'Marketing Manager'
    },
    leaveType: 'sick',
    startDate: '2024-01-10',
    endDate: '2024-01-12',
    totalDays: 3,
    reason: 'Medical appointment and recovery',
    status: 'approved',
    reliefOfficerId: {
      _id: '4',
      name: 'David Wilson',
      employeeId: 'EMP005'
    },
    reliefStatus: 'accepted',
    reliefNotes: 'Covering Sarah\'s campaigns',
    approvalHistory: [
      {
        approvedBy: {
          _id: '4',
          name: 'Jessica Williams'
        },
        role: 'manager',
        action: 'approved',
        notes: 'Medical leave approved',
        timestamp: '2024-01-08T14:20:00Z'
      },
      {
        approvedBy: {
          _id: '5',
          name: 'HR Department'
        },
        role: 'hr',
        action: 'approved',
        notes: 'Documentation verified',
        timestamp: '2024-01-08T16:45:00Z'
      }
    ],
    handoverNotes: 'Campaign schedules shared with David',
    urgentContact: '+1 (555) 123-4568',
    createdAt: '2024-01-07T11:00:00Z',
    updatedAt: '2024-01-08T16:45:00Z'
  },
  {
    _id: '3',
    employeeId: {
      _id: '3',
      name: 'Mike Chen',
      employeeId: 'EMP003',
      department: 'Engineering',
      position: 'Tech Lead'
    },
    leaveType: 'paternity',
    startDate: '2024-03-01',
    endDate: '2024-04-01',
    totalDays: 31,
    reason: 'Paternity leave for newborn child',
    status: 'pending-hr',
    reliefOfficerId: {
      _id: '1',
      name: 'John Smith',
      employeeId: 'EMP001'
    },
    reliefStatus: 'pending',
    reliefNotes: '',
    approvalHistory: [
      {
        approvedBy: {
          _id: '4',
          name: 'Jessica Williams'
        },
        role: 'manager',
        action: 'approved',
        notes: 'Congratulations! Team coverage arranged',
        timestamp: '2024-01-12T09:15:00Z'
      }
    ],
    handoverNotes: 'Tech lead responsibilities delegated to senior team members',
    urgentContact: '+1 (555) 123-4569',
    createdAt: '2024-01-11T08:30:00Z',
    updatedAt: '2024-01-12T09:15:00Z'
  },
  {
    _id: '4',
    employeeId: {
      _id: '5',
      name: 'Emily Davis',
      employeeId: 'EMP006',
      department: 'Sales',
      position: 'Sales Executive'
    },
    leaveType: 'emergency',
    startDate: '2024-01-09',
    endDate: '2024-01-09',
    totalDays: 1,
    reason: 'Family emergency',
    status: 'approved',
    reliefOfficerId: {
      _id: '6',
      name: 'Robert Brown',
      employeeId: 'EMP007'
    },
    reliefStatus: 'accepted',
    reliefNotes: 'Covering urgent client calls',
    approvalHistory: [
      {
        approvedBy: {
          _id: '2',
          name: 'Sarah Johnson'
        },
        role: 'manager',
        action: 'approved',
        notes: 'Emergency leave granted',
        timestamp: '2024-01-09T08:00:00Z'
      }
    ],
    handoverNotes: 'Client meeting notes shared with Robert',
    urgentContact: '+1 (555) 123-4570',
    createdAt: '2024-01-08T19:30:00Z',
    updatedAt: '2024-01-09T08:00:00Z'
  },
  {
    _id: '5',
    employeeId: {
      _id: '7',
      name: 'Lisa Wang',
      employeeId: 'EMP008',
      department: 'Engineering',
      position: 'Frontend Developer'
    },
    leaveType: 'personal',
    startDate: '2024-02-01',
    endDate: '2024-02-02',
    totalDays: 2,
    reason: 'Personal matters',
    status: 'rejected',
    reliefOfficerId: {
      _id: '8',
      name: 'Alex Turner',
      employeeId: 'EMP009'
    },
    reliefStatus: 'declined',
    reliefNotes: 'Unable to cover due to own project deadlines',
    approvalHistory: [
      {
        approvedBy: {
          _id: '3',
          name: 'Mike Chen'
        },
        role: 'manager',
        action: 'rejected',
        notes: 'No available coverage during critical project phase',
        timestamp: '2024-01-15T11:20:00Z'
      }
    ],
    handoverNotes: '',
    urgentContact: '+1 (555) 123-4571',
    createdAt: '2024-01-14T13:45:00Z',
    updatedAt: '2024-01-15T11:20:00Z'
  }
];

export default function LeaveRequests() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    leaveType: 'all',
    department: 'all'
  });
  // Add this state to the component
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [departments, setDepartments] = useState([]);

  const getDepartments = async () => {
    const fetchDept = await getDepartment();
    setDepartments(fetchDept.data);
  }

  useEffect(() => {
    getDepartments();
    // Load mock data
    setLeaveRequests(MOCK_LEAVE_REQUESTS);
    setFilteredRequests(MOCK_LEAVE_REQUESTS);
  }, []);

  // Filter leave requests
  useEffect(() => {
    let filtered = leaveRequests;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(request =>
        request.employeeId.name.toLowerCase().includes(searchLower) ||
        request.employeeId.employeeId.toLowerCase().includes(searchLower) ||
        request.reason.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(request => request.status === filters.status);
    }

    if (filters.leaveType !== 'all') {
      filtered = filtered.filter(request => request.leaveType === filters.leaveType);
    }

    if (filters.department !== 'all') {
      filtered = filtered.filter(request => request.employeeId.department === filters.department);
    }

    setFilteredRequests(filtered);
    setCurrentPage(1);
  }, [filters, leaveRequests]);

  const handleNewRequest = async (newRequest) => {
// console.log(newRequest)
    setLeaveRequests(prev => [newRequest, ...prev]);
    // Show success message (you could use a toast notification here)
    alert('Leave request submitted successfully! It is now pending relief officer acceptance.');
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'draft': { color: 'bg-gray-100 text-gray-800', label: 'Draft', icon: FiClock },
      'pending-relief': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Relief', icon: FiUser },
      'pending-manager': { color: 'bg-teal-100 text-teal-800', label: 'Pending Manager', icon: FiClock },
      'pending-hr': { color: 'bg-purple-100 text-purple-800', label: 'Pending HR', icon: FiClock },
      'approved': { color: 'bg-green-100 text-green-800', label: 'Approved', icon: FiCheckCircle },
      'rejected': { color: 'bg-red-100 text-red-800', label: 'Rejected', icon: FiXCircle },
      'cancelled': { color: 'bg-gray-100 text-gray-800', label: 'Cancelled', icon: FiXCircle },
      'revoked': { color: 'bg-gray-100 text-gray-800', label: 'Revoked', icon: FiXCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const getLeaveTypeBadge = (type) => {
    const typeConfig = {
      'annual': { color: 'bg-teal-100 text-teal-800', label: 'Annual' },
      'sick': { color: 'bg-green-100 text-green-800', label: 'Sick' },
      'personal': { color: 'bg-purple-100 text-purple-800', label: 'Personal' },
      'maternity': { color: 'bg-pink-100 text-pink-800', label: 'Maternity' },
      'paternity': { color: 'bg-teal-100 text-teal-800', label: 'Paternity' },
      'emergency': { color: 'bg-red-100 text-red-800', label: 'Emergency' },
      'unpaid': { color: 'bg-gray-100 text-gray-800', label: 'Unpaid' },
      'compassionate': { color: 'bg-blue-100 text-blue-800', label: 'Unpaid' }
    };

    const config = typeConfig[type] || typeConfig.annual;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getReliefStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      'accepted': { color: 'bg-green-100 text-green-800', label: 'Accepted' },
      'declined': { color: 'bg-red-100 text-red-800', label: 'Declined' },
      'cancelled': { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleAction = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setActionNotes('');
    setShowActionModal(true);
  };

  const submitAction = () => {
    if (!selectedRequest || !actionType) return;

    // Update the leave request status
    const updatedRequests = leaveRequests.map(request => {
      if (request._id === selectedRequest._id) {
        const updatedRequest = {
          ...request,
          status: actionType === 'approve' ? 'approved' :
            actionType === 'reject' ? 'rejected' : request.status,
          updatedAt: new Date().toISOString(),
          approvalHistory: [
            ...request.approvalHistory,
            {
              approvedBy: { _id: 'current-user', name: 'Current User' },
              role: 'manager',
              action: actionType === 'approve' ? 'approved' : 'rejected',
              notes: actionNotes,
              timestamp: new Date().toISOString()
            }
          ]
        };
        return updatedRequest;
      }
      return request;
    });

    setLeaveRequests(updatedRequests);
    setShowActionModal(false);
    setSelectedRequest(null);
    setActionType('');
    setActionNotes('');
  };

  const handleExport = () => {
    // Mock export functionality
    const csvContent = filteredRequests.map(request =>
      `${request.employeeId.name},${request.leaveType},${request.startDate},${request.endDate},${request.status}`
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leave-requests.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const canTakeAction = (request) => {
    const userRole = 'manager'; // This would come from auth context
    return (
      (userRole === 'manager' && request.status === 'pending-manager') ||
      (userRole === 'hr' && request.status === 'pending-hr') ||
      (userRole === 'admin' && ['pending-manager', 'pending-hr'].includes(request.status))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Requests</h1>
          <p className="text-gray-600">Manage and review employee leave applications</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size='large'
            onClick={handleExport}
          >
            <FiDownload size={18} />
          </Button>
          <Button onClick={() => setShowNewRequestModal(true)} size='large'>
            New Request
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="search"
                placeholder="Search by employee name, ID, or reason..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-4 flex-wrap">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Status</option>
              {STATUS.map((item) => (
                <option key={item} className='capitalize' value={item}>{item}</option>
              ))}
            </select>
            <select
              value={filters.leaveType}
              onChange={(e) => handleFilterChange('leaveType', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Types</option>
              {LEAVETYPE.map((item) => (
                <option key={item} className='capitalize' value={item}>{item}</option>
              ))}
            </select>
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Departments</option>
              {departments.map((item) => (
                <option key={item?._id} className='capitalize' value={item?.name}>{item?.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {
          [{ title: 'Total Requests', stats: filteredRequests.length }, { title: 'Pending Approval', stats: filteredRequests.filter(r => r.status?.startsWith('pending')).length }, { title: 'Approved', stats: filteredRequests.filter(r => r.status === 'approved').length }, { title: 'Rejected', stats: filteredRequests.filter(r => r.status === 'rejected').length },].map((stat) => (
            <div key={stat.title} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-2xl font-bold text-gray-900">{stat.stats}</div>
              <div className="text-sm text-gray-600">{stat.title}</div>
            </div>
          ))
        }
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Employee & Details', 'Leave Period', 'Relief Officer', 'Status', 'Actions'].map((item) => (
                  <th key={item} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentRequests.map((request) => (
                <tr key={request._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-teal-600">
                          {request.employeeId.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{request.employeeId.name}</div>
                        <div className="text-sm text-gray-500">{request.employeeId.position}</div>
                        <div className="text-xs text-gray-400">{request.employeeId.employeeId} • {request.employeeId.department}</div>
                        <div className="mt-1">
                          {getLeaveTypeBadge(request.leaveType)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(request.startDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      to {new Date(request.endDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {request.totalDays} day{request.totalDays !== 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {request.reliefOfficerId.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.reliefOfficerId.employeeId}
                    </div>
                    {getReliefStatusBadge(request.reliefStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(request.status)}
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(request)}
                        className="text-teal-600 cursor-pointer hover:text-teal-900 p-1"
                        title="View Details"
                      >
                        <FiEye size={16} />
                      </button>

                      {canTakeAction(request) && (
                        <>
                          <button
                            onClick={() => handleAction(request, 'approve')}
                            className="text-green-600 cursor-pointer hover:text-green-900 p-1"
                            title="Approve"
                          >
                            <FiCheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleAction(request, 'reject')}
                            className="text-red-600 cursor-pointer hover:text-red-900 p-1"
                            title="Reject"
                          >
                            <FiXCircle size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <FiCalendar className="mx-auto text-gray-400" size={48} />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No leave requests found</h3>
            <p className="mt-2 text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredRequests.length > 0 && (
        <div className="flex items-center justify-between bg-white px-6 py-3 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(indexOfLastItem, filteredRequests.length)}
            </span> of{' '}
            <span className="font-medium">{filteredRequests.length}</span> results
          </div>
          <div className="flex gap-1">
            <Button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FiChevronLeft size={16} />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                onClick={() => paginate(page)}
                className={`px-3 py-1 rounded border ${currentPage === page
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'border-gray-300 hover:bg-gray-50'
                  }`}
              >
                {page}
              </Button>
            ))}

            <Button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <FiChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <LeaveRequestDetail
          request={selectedRequest}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedRequest(null);
          }}
          onAction={(action) => handleAction(selectedRequest, action)}
          canTakeAction={canTakeAction(selectedRequest)}
        />
      )}

      {/* Action Modal */}
      {showActionModal && selectedRequest && (
        <ActionModal
          request={selectedRequest}
          actionType={actionType}
          notes={actionNotes}
          onNotesChange={setActionNotes}
          onSubmit={submitAction}
          onClose={() => {
            setShowActionModal(false);
            setSelectedRequest(null);
            setActionType('');
            setActionNotes('');
          }}
        />
      )}

      {/* // Add this modal to the JSX return section */}
      {showNewRequestModal && (
        <NewLeaveRequestModal
          onSave={handleNewRequest}
          onClose={() => setShowNewRequestModal(false)}
        />
      )}
    </div>
  );
}