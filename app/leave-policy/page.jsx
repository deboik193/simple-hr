// pages/leave-policies.js
'use client'

import { deleteLeavePolicy, getLeavePolicy, leavePolicy, updateLeavePolicy } from "@/api";
import Button from "@/components/Button";
import Loader from "@/components/Loader";
import { useToast } from "@/context/toastContext";
import { useState, useEffect } from "react";
import { FiFileText, FiEdit2, FiTrash2, FiPlus, FiSearch, FiFilter } from "react-icons/fi";

const LEAVETYPE = ['annual', 'sick', 'personal', 'maternity', 'paternity', 'compassionate', 'unpaid', 'emergency'];
const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'contract'];
const APPROVAL_LEVELS = ['manager', 'hr', 'department-head'];
const ACCRUAL_TYPES = ['monthly', 'annual', 'none'];

export default function LeavePolicies() {
  const [loading, setLoading] = useState(true);
  const [leavePolicies, setLeavePolicies] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const { addToast } = useToast();

  const [policyForm, setPolicyForm] = useState({
    policyName: '',
    leaveType: 'annual',
    eligibility: {
      employmentTypes: ['full-time'],
      minServiceDays: 0
    },
    accrual: {
      type: 'monthly',
      rate: 1.25,
      maxBalance: 30
    },
    carryOver: {
      enabled: false,
      maxDays: 0,
      expiryDays: 0
    },
    approvalWorkflow: {
      requireReliefOfficer: true,
      approvalLevels: ['manager']
    },
    restrictions: {
      blackoutDates: [],
      minNoticeDays: 1,
      maxConsecutiveDays: 14,
      allowHalfDays: false
    },
    isActive: true
  });

  // Load initial data
  useEffect(() => {
    setLoading(true);

    const loadData = async () => {

      try {
        loadPolicies();
      } catch (error) {
        addToast(`Failed to load. Please try again.`, 'error')
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const loadPolicies = async () => {

    const getLeavePolicies = await getLeavePolicy();
    setLeavePolicies(getLeavePolicies.data);
  };

  const handlePolicySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (editingPolicy) {
      // Update existing policy
      const { _id, createdAt, updatedAt, __v, ...policyDataWithoutId } = policyForm;

      const res = await updateLeavePolicy(policyDataWithoutId, _id);

      if (res.error) {
        addToast(res.error, 'error')
      }

      if (res && res._id) setLeavePolicies(prev => prev.map(policy =>
        policy._id === editingPolicy._id
          ? { ...policyForm, _id: editingPolicy._id }
          : policy
      ));

      if (res.message) {
        addToast(res.message, 'success')
      }

      await loadPolicies()
      setLoading(false)

    } else {
      // Create new policy
      const res = await leavePolicy(policyForm)

      if (res.error) {
        addToast(res.error, 'error')
      }

      if (res && res._id) setLeavePolicies(prev => [...prev, res]);

      if (res.message) {
        addToast(res.message, 'success')
      }

      await loadPolicies()
      setLoading(false)
    }

    resetForm();
  };

  const handleEdit = (policy) => {
    setEditingPolicy(policy);
    setPolicyForm(policy);
    setShowCreateForm(true);
  };

  const handleDelete = async (policyId) => {
    if (confirm('Are you sure you want to delete this policy?')) {

      const res = await deleteLeavePolicy(policyId);

      if (res.error) {
        addToast(res.error, 'error')
      }

      if (res && res._id) setLeavePolicies(prev => prev.filter(policy => policy._id !== policyId));

      if (res.message) {
        addToast(res.message, 'success')
      }

      await loadPolicies()
    }
  };

  const resetForm = () => {
    setPolicyForm({
      policyName: '',
      leaveType: 'annual',
      eligibility: {
        employmentTypes: ['full-time'],
        minServiceDays: 0
      },
      accrual: {
        type: 'monthly',
        rate: 1.25,
        maxBalance: 30
      },
      carryOver: {
        enabled: false,
        maxDays: 0,
        expiryDays: 0
      },
      approvalWorkflow: {
        requireReliefOfficer: true,
        approvalLevels: ['manager']
      },
      restrictions: {
        blackoutDates: [],
        minNoticeDays: 1,
        maxConsecutiveDays: 14,
        allowHalfDays: false
      },
      isActive: true
    });
    setEditingPolicy(null);
    setShowCreateForm(false);
  };

  const getLeaveTypeDisplay = (type) => {
    const displayNames = {
      annual: 'Annual Leave',
      sick: 'Sick Leave',
      personal: 'Personal Leave',
      maternity: 'Maternity Leave',
      paternity: 'Paternity Leave',
      emergency: 'Emergency Leave',
      unpaid: 'Unpaid Leave',
      compassionate: 'Compassionate Leave'
    };
    return displayNames[type] || type;
  };

  // Filter and search policies
  const filteredPolicies = leavePolicies?.filter(policy => {

    const matchesSearch = policy.policyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || policy.leaveType === filterType;
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && policy.isActive) ||
      (filterStatus === 'inactive' && !policy.isActive);

    return matchesSearch && matchesType && matchesStatus;
  });

  // Policy form handlers
  const updatePolicyField = (field, value) => {
    setPolicyForm(prev => ({ ...prev, [field]: value }));
  };

  const updatePolicyEligibility = (field, value) => {
    setPolicyForm(prev => ({
      ...prev,
      eligibility: { ...prev.eligibility, [field]: value }
    }));
  };

  const updatePolicyAccrual = (field, value) => {
    setPolicyForm(prev => ({
      ...prev,
      accrual: { ...prev.accrual, [field]: value }
    }));
  };

  const updatePolicyCarryOver = (field, value) => {
    setPolicyForm(prev => ({
      ...prev,
      carryOver: { ...prev.carryOver, [field]: value }
    }));
  };

  const updatePolicyApproval = (field, value) => {
    setPolicyForm(prev => ({
      ...prev,
      approvalWorkflow: { ...prev.approvalWorkflow, [field]: value }
    }));
  };

  const updatePolicyRestrictions = (field, value) => {
    setPolicyForm(prev => ({
      ...prev,
      restrictions: { ...prev.restrictions, [field]: value }
    }));
  };

  const toggleEmploymentType = (type) => {
    setPolicyForm(prev => {
      const currentTypes = prev.eligibility.employmentTypes;
      const newTypes = currentTypes.includes(type)
        ? currentTypes.filter(t => t !== type)
        : [...currentTypes, type];

      return {
        ...prev,
        eligibility: { ...prev.eligibility, employmentTypes: newTypes }
      };
    });
  };

  const toggleApprovalLevel = (level) => {
    setPolicyForm(prev => {
      const currentLevels = prev.approvalWorkflow.approvalLevels;
      const newLevels = currentLevels.includes(level)
        ? currentLevels.filter(l => l !== level)
        : [...currentLevels, level];

      return {
        ...prev,
        approvalWorkflow: { ...prev.approvalWorkflow, approvalLevels: newLevels }
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="sm:flex justify-between items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Leave Policies</h1>
              <p className="text-gray-600 mt-2">
                Manage and configure leave policies for your organization
              </p>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              size="large"
              className="flex sm:w-auto w-full items-center justify-center gap-2"
            >
              Create Policy
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <Loader />
        ) : (
          <>

            {filteredPolicies?.length === 0 ? (
              <div className="text-center py-12">
                <FiFileText className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No policies found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first leave policy'
                  }
                </p>
                {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
                  <Button onClick={() => setShowCreateForm(true)}>
                    Create Policy
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Search and Filter */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search policies by name or type..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-3 w-full py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="all">All Types</option>
                        {LEAVETYPE.map(type => (
                          <option key={type} value={type}>{getLeaveTypeDisplay(type)}</option>
                        ))}
                      </select>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Policies Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {filteredPolicies?.map((policy) => (
                    <div key={policy._id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg capitalize">{policy.policyName}</h3>
                          <p className="text-sm text-gray-600">{getLeaveTypeDisplay(policy.leaveType)}</p>
                        </div>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${policy.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {policy.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Accrual:</span>
                          <span className="font-medium">{policy.accrual.type} ({policy.accrual.rate} days)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Max Balance:</span>
                          <span className="font-medium">{policy.accrual.maxBalance} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Carry Over:</span>
                          <span className="font-medium">{policy.carryOver.enabled ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Relief Officer:</span>
                          <span className="font-medium">
                            {policy.approvalWorkflow.requireReliefOfficer ? 'Required' : 'Not Required'}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                        <span className="text-xs text-gray-500">
                          Created: {new Date(policy.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(policy)}
                            className="p-2 text-gray-400 hover:text-teal-600 transition-colors cursor-pointer"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(policy._id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}


          </>
        )}

        {/* Create/Edit Policy Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingPolicy ? 'Edit Policy' : 'Create Leave Policy'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="hover:bg-green-100 cursor-pointer transition-colors"
                  >
                    <FiPlus className="w-6 h-6 transform rotate-45 text-green-600/30" />
                  </button>
                </div>

                <form onSubmit={handlePolicySubmit} className="space-y-6">
                  {/* Basic Policy Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Policy Name</label>
                      <input
                        type="text"
                        value={policyForm.policyName}
                        onChange={(e) => updatePolicyField('policyName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="e.g., Standard Annual Leave Policy"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                      <select
                        value={policyForm.leaveType}
                        onChange={(e) => updatePolicyField('leaveType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        {LEAVETYPE.map(type => (
                          <option key={type} value={type}>{getLeaveTypeDisplay(type)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Eligibility Settings */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Eligibility</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Employment Types
                        </label>
                        <div className="space-y-2">
                          {EMPLOYMENT_TYPES.map(type => (
                            <label key={type} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={policyForm.eligibility.employmentTypes.includes(type)}
                                onChange={() => toggleEmploymentType(type)}
                                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                              />
                              <span className="text-sm text-gray-700 capitalize">{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Minimum Service Days
                        </label>
                        <input
                          type="number"
                          value={policyForm.eligibility.minServiceDays}
                          onChange={(e) => updatePolicyEligibility('minServiceDays', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Accrual Settings */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Accrual Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Accrual Type</label>
                        <select
                          value={policyForm.accrual.type}
                          onChange={(e) => updatePolicyAccrual('type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          {ACCRUAL_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Accrual Rate</label>
                        <input
                          type="number"
                          step="0.25"
                          value={policyForm.accrual.rate}
                          onChange={(e) => updatePolicyAccrual('rate', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Balance</label>
                        <input
                          type="number"
                          value={policyForm.accrual.maxBalance}
                          onChange={(e) => updatePolicyAccrual('maxBalance', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Carry Over Settings */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Carry Over Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={policyForm.carryOver.enabled}
                          onChange={(e) => updatePolicyCarryOver('enabled', e.target.checked)}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <label className="text-sm font-medium text-gray-700">Enable Carry Over</label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Carry Over Days</label>
                        <input
                          type="number"
                          value={policyForm.carryOver.maxDays}
                          onChange={(e) => updatePolicyCarryOver('maxDays', parseInt(e.target.value) || 0)}
                          disabled={!policyForm.carryOver.enabled}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Days</label>
                        <input
                          type="number"
                          value={policyForm.carryOver.expiryDays}
                          onChange={(e) => updatePolicyCarryOver('expiryDays', parseInt(e.target.value) || 0)}
                          disabled={!policyForm.carryOver.enabled}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Approval Workflow */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Approval Workflow</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={policyForm.approvalWorkflow.requireReliefOfficer}
                          onChange={(e) => updatePolicyApproval('requireReliefOfficer', e.target.checked)}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <label className="text-sm font-medium text-gray-700">Require Relief Officer</label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Approval Levels</label>
                        <div className="space-y-2">
                          {APPROVAL_LEVELS.map(level => (
                            <label key={level} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={policyForm.approvalWorkflow.approvalLevels.includes(level)}
                                onChange={() => toggleApprovalLevel(level)}
                                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                              />
                              <span className="text-sm text-gray-700 capitalize">{level}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Restrictions */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Restrictions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Notice Days</label>
                        <input
                          type="number"
                          value={policyForm.restrictions.minNoticeDays}
                          onChange={(e) => updatePolicyRestrictions('minNoticeDays', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Consecutive Days</label>
                        <input
                          type="number"
                          value={policyForm.restrictions.maxConsecutiveDays}
                          onChange={(e) => updatePolicyRestrictions('maxConsecutiveDays', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={policyForm.restrictions.allowHalfDays}
                          onChange={(e) => updatePolicyRestrictions('allowHalfDays', e.target.checked)}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <label className="text-sm font-medium text-gray-700">Allow Half Days</label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-6 border-t border-gray-200">
                    <input
                      type="checkbox"
                      checked={policyForm.isActive}
                      onChange={(e) => updatePolicyField('isActive', e.target.checked)}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <label className="text-sm font-medium text-gray-700">Active Policy</label>
                  </div>

                  <div className="flex gap-3 pt-6">
                    <Button loading={loading} type="submit" size="large">
                      {editingPolicy ? 'Update Policy' : 'Create Policy'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="large"
                      onClick={resetForm}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}