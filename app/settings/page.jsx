'use client'

import { branch, getBranch, getManagers, updateBranch, getDepartment, department, updateDepartment, initialLeaveBalance, getInitialBalance } from "@/api";
import Button from "@/components/Button";
import { useState, useEffect } from "react";
import { FaBuilding, FaUsers } from "react-icons/fa";
import { FaShield } from "react-icons/fa6";
import { FiShield, FiUsers, FiEdit2, FiX, FiSave } from "react-icons/fi";
import { useToast } from '@/context/toastContext'
import Loader from "@/components/Loader";
import { LEAVETYPE } from '@/constant/constant';


export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('leaveBalance');
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [editingBranch, setEditingBranch] = useState(null);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [managers, setManagers] = useState([]);
  const [initialBalance, setInitialBalance] = useState([])
  const { addToast } = useToast();

  const [formData, setFormData] = useState({

    leaveBalance: LEAVETYPE.reduce((acc, type) => {
      acc[type] = initialBalance[type] || 0;
      return acc;
    }, {})
  });

  // Branch form state
  const [branchForm, setBranchForm] = useState({
    name: '',
    managerId: '',
    contactEmail: '',
    headCount: 0,
    leaveSettings: {
      maxConcurrentLeaves: '',
      requiredCoverage: 70
    },
  });

  // Department form state
  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    managerId: '',
    contactEmail: '',
    headCount: 0,
    leaveSettings: {
      maxConcurrentLeaves: '',
      requiredCoverage: 70
    },
  });

  const getManager = async () => {
    const fetchManagers = await getManagers();
    setManagers(fetchManagers)
  }

  const getBranches = async () => {
    const fetchBranch = await getBranch()
    setBranches(fetchBranch.data);
  }

  const getDepartments = async () => {
    const fetchDept = await getDepartment()
    setDepartments(fetchDept.data);
  }

  const getInitialBalances = async () => {
    const fetchInitialBalance = await getInitialBalance();
    setInitialBalance(fetchInitialBalance.data[0]);
  }

  // Load branches and departments
  useEffect(() => {
    setLoading(true);
    const loadData = async () => {

      try {
        await getManager();
        await getBranches();
        await getDepartments();
        await getInitialBalances();

      } catch (error) {
        addToast(`Failed to load. Please try again.`, 'error')
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (initialBalance && Object.keys(initialBalance).length > 0) {

      setFormData(prev => ({
        ...prev,
        leaveBalance: LEAVETYPE.reduce((acc, type) => {
          acc[type] = initialBalance[type] || 0;
          return acc;
        }, {})
      }));
    }
  }, [initialBalance])

  const handleLeaveBalanceSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await initialLeaveBalance(formData.leaveBalance, initialBalance._id)

    if (res.error) {
      addToast(res.error, 'error')
      setLoading(false)
    }

    if (res.message) {
      addToast(res.message, 'success')
      setLoading(false)
      await getInitialBalances();
    }
  }

  const handleBranchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (editingBranch) {
      // Remove _id from branchForm before sending
      const { _id, ...branchDataWithoutId } = branchForm;

      // Update existing branch
      const res = await updateBranch(branchDataWithoutId, _id)

      if (res.error) {
        addToast(res.error, 'error')
      }

      if (res && res._id) setBranches(prev =>
        prev.map(branch =>
          branch._id === editingBranch._id
            ? { ...branchForm, _id: editingBranch._id }
            : branch
        )
      );

      if (res.message) {
        addToast(res.message, 'success')
      }

      await getBranches();
      setEditingBranch(null);
      setLoading(false)
    } else {
      // Create new branch
      const res = await branch(branchForm)

      if (res.error) {
        addToast(res.error, 'error')
      }

      if (res && res._id) setBranches(prev => [...prev, res]);

      if (res.message) {
        addToast(res.message, 'success')
      }

      await getBranches();
      setLoading(false)
    }

    // Reset form
    setBranchForm({
      name: '', managerId: '', contactEmail: '', headCount: 0,
      leaveSettings: { maxConcurrentLeaves: '', requiredCoverage: 70 }
    });
  };

  const handleDepartmentSubmit = async (e) => {
    e.preventDefault();

    if (editingDepartment) {
      // Update existing department
      // Remove _id from branchForm before sending
      const { _id, ...deptDataWithoutId } = departmentForm;

      // Update existing branch
      const res = await updateDepartment(deptDataWithoutId, _id)

      if (res.error) {
        addToast(res.error, 'error')
      }

      if (res && res._id) setDepartments(prev =>
        prev.map(dept =>
          dept._id === editingDepartment._id
            ? { ...departmentForm, _id: editingDepartment._id }
            : dept
        )
      );

      if (res.message) {
        addToast(res.message, 'success')
      }

      await getDepartments();
      setEditingDepartment(null);
      setLoading(false)
    } else {

      // Create new department
      const res = await department(departmentForm)

      if (res.error) {
        addToast(res.error, 'error')
      }

      if (res && res._id) setDepartments(prev => [...prev, res]);

      if (res.message) {
        addToast(res.message, 'success')
      }

      await getDepartments();
      setLoading(false);
    }

    // Reset form
    setDepartmentForm({
      name: '', managerId: '', contactEmail: '', headCount: 0,
      leaveSettings: { maxConcurrentLeaves: '', requiredCoverage: 70 }
    });
  };

  const handleEditBranch = (branch) => {
    setEditingBranch(branch);
    setBranchForm({
      _id: branch._id,
      name: branch.name,
      managerId: branch.managerId || '',
      contactEmail: branch.contactEmail || '',
      headCount: branch.headCount,
      leaveSettings: {
        maxConcurrentLeaves: branch.leaveSettings?.maxConcurrentLeaves || '',
        requiredCoverage: branch.leaveSettings?.requiredCoverage || 70
      }
    });
  };

  const handleEditDepartment = (department) => {
    setEditingDepartment(department);
    setDepartmentForm({
      _id: department._id,
      name: department.name,
      managerId: department.managerId || '',
      contactEmail: department.contactEmail || '',
      headCount: department.headCount,
      leaveSettings: {
        maxConcurrentLeaves: department.leaveSettings?.maxConcurrentLeaves || '',
        requiredCoverage: department.leaveSettings?.requiredCoverage || 70
      }
    });
  };

  const cancelEdit = () => {
    setEditingBranch(null);
    setEditingDepartment(null);
    setBranchForm({
      name: '', managerId: '', contactEmail: '', headCount: 0,
      leaveSettings: { maxConcurrentLeaves: '', requiredCoverage: 70 }
    });
    setDepartmentForm({
      name: '', managerId: '', contactEmail: '', headCount: 0,
      leaveSettings: { maxConcurrentLeaves: '', requiredCoverage: 70 }
    });
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

  const handleLeaveBalanceChange = (leaveType, value) => {
    setFormData(prev => ({
      ...prev,
      leaveBalance: {
        ...prev.leaveBalance,
        [leaveType]: parseInt(value) || 0
      }
    }));
  };

  const updateBranchField = (field, value) => {
    setBranchForm(prev => ({ ...prev, [field]: value }));
  };

  const updateDepartmentField = (field, value) => {
    setDepartmentForm(prev => ({ ...prev, [field]: value }));
  };

  const updateBranchLeaveSetting = (field, value) => {
    setBranchForm(prev => ({
      ...prev,
      leaveSettings: { ...prev.leaveSettings, [field]: value }
    }));
  };

  const updateDepartmentLeaveSetting = (field, value) => {
    setDepartmentForm(prev => ({
      ...prev,
      leaveSettings: { ...prev.leaveSettings, [field]: value }
    }));
  };

  return (
    <main>
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {[
            { id: 'leaveBalance', name: 'Leave Balance', icon: FaShield },
            { id: 'branches', name: 'Branches', icon: FaBuilding },
            { id: 'departments', name: 'Departments', icon: FaUsers },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                cancelEdit(); // Cancel any active edits when switching tabs
              }}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${activeTab === tab.id
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Leave Balance Section */}
      {activeTab === 'leaveBalance' && (
        <form onSubmit={handleLeaveBalanceSubmit} className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiShield className="text-teal-600" />
            Leave Balance Management
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
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
          <Button
            type="submit"
            loading={loading}
            size="large"
            className="flex items-center gap-2">Update Leave Balances</Button>
        </form>
      )}

      {/* Branches Section */}
      {activeTab === 'branches' && (
        <div className="space-y-6">
          {/* Existing Branches List */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="sm:flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaBuilding className="text-teal-600" />
                Existing Branches
              </h3>
              {!loading && (
                <span className="text-sm text-gray-500">
                  {branches?.length} branch{branches?.length !== 1 ? 'es' : ''}
                </span>
              )}
            </div>

            {/* Loading State */}
            {loading ? (
              <Loader />
            ) : (
              /* Content State */
              <>
                {branches?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FaBuilding className="mx-auto w-12 h-12 mb-2 opacity-50" />
                    <p>No branches found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {branches?.map((branch) => (
                      <div key={branch._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-gray-900">{branch.name}</h4>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditBranch(branch)}
                              className="p-1 text-gray-400 hover:text-teal-600 transition-colors cursor-pointer"
                              title="Edit branch"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600">Employees: {branch.headCount}</p>
                        {branch.leaveSettings?.maxConcurrentLeaves && (
                          <p className="text-sm text-gray-600">
                            Max Leaves: {branch.leaveSettings.maxConcurrentLeaves}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          Coverage: {branch.leaveSettings?.requiredCoverage || 70}%
                        </p>

                        <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${branch.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {branch.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Create/Edit Branch Form */}
          <form onSubmit={handleBranchSubmit} className="border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaBuilding className="text-teal-600" />
                {editingBranch ? 'Edit Branch' : 'Create New Branch'}
              </h3>
              {editingBranch && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  <FiX className="w-4 h-4" />
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                <input
                  type="text"
                  value={branchForm.name}
                  onChange={(e) => updateBranchField('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={branchForm.contactEmail}
                  onChange={(e) => updateBranchField('contactEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Head Count</label>
                <input
                  type="number"
                  min="0"
                  value={branchForm.headCount}
                  onChange={(e) => updateBranchField('headCount', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
                <select
                  value={branchForm.managerId}
                  onChange={(e) => updateBranchField('managerId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select Manager</option>
                  {managers && managers?.data && managers?.data?.map((item) => (
                    <option key={item._id} value={item._id}>{item.fullName}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Branch Leave Settings */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Branch Leave Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Concurrent Leaves
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={branchForm.leaveSettings.maxConcurrentLeaves}
                    onChange={(e) => updateBranchLeaveSetting('maxConcurrentLeaves', parseInt(e.target.value) || '')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="No limit if empty"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Required Coverage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={branchForm.leaveSettings.requiredCoverage}
                    onChange={(e) => updateBranchLeaveSetting('requiredCoverage', parseInt(e.target.value) || 70)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                type="submit"
                loading={loading}
                size="large"
                className="flex items-center gap-2"
              >
                {editingBranch ? (
                  <div className="flex items-center">
                    <FiSave className="w-4 h-4 mr-2" />
                    Update Branch
                  </div>
                ) : (
                  'Create Branch'
                )}
              </Button>
              {editingBranch && (
                <Button
                  type="button"
                  variant="outline"
                  size="large"
                  onClick={cancelEdit}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Departments Section */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          {/* Existing Departments List */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="sm:flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiUsers className="text-teal-600" />
                Existing Departments
              </h3>
              {!loading && (<span className="text-sm text-gray-500">
                {departments?.length} department{departments?.length !== 1 ? 's' : ''}
              </span>)}
            </div>

            {loading ? (
              <Loader />
            ) : (
              <>
                {departments?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FaBuilding className="mx-auto w-12 h-12 mb-2 opacity-50" />
                    <p>No Department found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {departments?.map((dept) => (
                      <div key={dept._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-gray-900">{dept.name}</h4>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditDepartment(dept)}
                              className="p-1 text-gray-400 hover:text-teal-600 transition-colors cursor-pointer"
                              title="Edit department"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600">Employees: {dept.headCount}</p>
                        {dept.contactEmail && (
                          <p className="text-sm text-gray-600">Email: {dept.contactEmail}</p>
                        )}
                        {dept.leaveSettings?.maxConcurrentLeaves && (
                          <p className="text-sm text-gray-600">
                            Max Leaves: {dept.leaveSettings.maxConcurrentLeaves}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          Coverage: {dept.leaveSettings?.requiredCoverage || 70}%
                        </p>

                        <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${dept.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {dept.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Create/Edit Department Form */}
          <form onSubmit={handleDepartmentSubmit} className="border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiUsers className="text-teal-600" />
                {editingDepartment ? 'Edit Department' : 'Create New Department'}
              </h3>
              {editingDepartment && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  <FiX className="w-4 h-4" />
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                <input
                  type="text"
                  value={departmentForm.name}
                  onChange={(e) => updateDepartmentField('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={departmentForm.contactEmail}
                  onChange={(e) => updateDepartmentField('contactEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Head Count</label>
                <input
                  type="number"
                  min="0"
                  value={departmentForm.headCount}
                  onChange={(e) => updateDepartmentField('headCount', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
                <select
                  value={departmentForm.managerId}
                  onChange={(e) => updateDepartmentField('managerId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select Manager</option>
                  {managers && managers?.data && managers?.data?.map((item) => (
                    <option key={item._id} value={item._id}>{item.fullName}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Department Leave Settings */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Department Leave Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Concurrent Leaves
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={departmentForm.leaveSettings.maxConcurrentLeaves}
                    onChange={(e) => updateDepartmentLeaveSetting('maxConcurrentLeaves', parseInt(e.target.value) || '')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="No limit if empty"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Required Coverage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={departmentForm.leaveSettings.requiredCoverage}
                    onChange={(e) => updateDepartmentLeaveSetting('requiredCoverage', parseInt(e.target.value) || 70)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                type="submit"
                loading={loading}
                size="large"
                className="flex items-center gap-2"
              >
                {editingDepartment ? (
                  <div className="flex items-center">
                    <FiSave className="w-4 h-4 mr-2" />
                    Update Department
                  </div>
                ) : (
                  'Create Department'
                )}
              </Button>
              {editingDepartment && (
                <Button
                  type="button"
                  variant="outline"
                  size="large"
                  onClick={cancelEdit}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>
      )}
    </main>
  )
}