// app/employees/page.js
'use client';

import EmployeeModal from '@/components/EmployeeModal';
import EmployeeDetail from '@/components/EmployeeDetail';
import { useState, useEffect } from 'react';
import {
  FiSearch,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiUser,
  FiEye,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import Button from '@/components/Button';

// Mock LEAVETYPE constant
const LEAVETYPE = ['annual', 'sick', 'personal', 'maternity', 'paternity', 'emergency', 'unpaid'];


export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    department: 'all',
    role: 'all',
    status: 'active',
    branch: 'all'
  });
  const [selectedEmployee, setSelectedEmployee] = useState();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Mock data with additional fields
  useEffect(() => {
    const mockEmployees = [
      {
        _id: '1',
        employeeId: 'EMP001',
        name: 'John Smith',
        email: 'john.smith@company.com',
        role: 'employee',
        department: 'Engineering',
        position: 'Senior Software Engineer',
        managerId: { name: 'Mike Chen', position: 'Tech Lead' },
        employmentType: 'full-time',
        joinDate: '2022-03-15',
        branch: 'New York',
        levels: 'L3',
        leaveBalance: {
          annual: 15,
          sick: 8,
          personal: 3,
          maternity: 0,
          paternity: 0,
          emergency: 2,
          unpaid: 0
        },
        isActive: true,
        personalInfo: {
          dateOfBirth: '1990-05-15',
          phoneNumber: '+1 (555) 123-4567',
          emergencyContact: {
            name: 'Jane Smith',
            relationship: 'spouse',
            phone: '+1 (555) 123-4568'
          }
        },
        preferences: {
          notifications: true,
          autoRelief: false
        }
      },
      {
        _id: '2',
        employeeId: 'EMP002',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        role: 'manager',
        department: 'Marketing',
        position: 'Marketing Manager',
        managerId: '4',
        employmentType: 'full-time',
        joinDate: '2021-06-20',
        phone: '+1 (555) 123-4568',
        branch: 'San Francisco',
        level: 'L4',
        leaveBalance: {
          annual: 15,
          sick: 8,
          personal: 3,
          maternity: 0,
          paternity: 0,
          emergency: 2,
          unpaid: 0
        },
        isActive: true,
        personalInfo: {
          dateOfBirth: '1990-05-15',
          phoneNumber: '+1 (555) 123-4567',
          emergencyContact: {
            name: 'Jane Smith',
            relationship: 'spouse',
            phone: '+1 (555) 123-4568'
          }
        },
        preferences: {
          notifications: true,
          autoRelief: true
        }
      },
      {
        _id: '3',
        employeeId: 'EMP003',
        name: 'Mike Chen',
        email: 'mike.chen@company.com',
        role: 'hr',
        department: 'Engineering',
        position: 'Tech Lead',
        managerId: '4',
        employmentType: 'full-time',
        joinDate: '2020-01-10',
        phone: '+1 (555) 123-4569',
        branch: 'New York',
        level: 'L5',
        leaveBalance: {
          annual: 15,
          sick: 8,
          personal: 3,
          maternity: 0,
          paternity: 0,
          emergency: 2,
          unpaid: 0
        },
        isActive: true,
        personalInfo: {
          dateOfBirth: '1990-05-15',
          phoneNumber: '+1 (555) 123-4567',
          emergencyContact: {
            name: 'Jane Smith',
            relationship: 'spouse',
            phone: '+1 (555) 123-4568'
          }
        },
        preferences: {
          notifications: false,
          autoRelief: true
        }
      },
      {
        _id: '4',
        employeeId: 'EMP004',
        name: 'Jessica Williams',
        email: 'jessica.williams@company.com',
        role: 'admin',
        department: 'HR',
        position: 'HR Director',
        managerId: null,
        employmentType: 'full-time',
        joinDate: '2019-08-05',
        phone: '+1 (555) 123-4570',
        branch: 'Chicago',
        level: 'L6',
        leaveBalance: {
          annual: 15,
          sick: 8,
          personal: 3,
          maternity: 0,
          paternity: 0,
          emergency: 2,
          unpaid: 0
        },
        isActive: true,
        personalInfo: {
          dateOfBirth: '1990-05-15',
          phoneNumber: '+1 (555) 123-4567',
          emergencyContact: {
            name: 'Jane Smith',
            relationship: 'spouse',
            phone: '+1 (555) 123-4568'
          }
        },
        preferences: {
          notifications: true,
          autoRelief: false
        }
      },
      {
        _id: '5',
        employeeId: 'EMP005',
        name: 'David Wilson',
        email: 'david.wilson@company.com',
        role: 'employee',
        department: 'Sales',
        position: 'Sales Executive',
        managerId: '2',
        employmentType: 'full-time',
        joinDate: '2023-01-15',
        phone: '+1 (555) 123-4571',
        branch: 'San Francisco',
        level: 'L2',
        leaveBalance: {
          annual: 15,
          sick: 8,
          personal: 3,
          maternity: 0,
          paternity: 0,
          emergency: 2,
          unpaid: 0
        },
        isActive: true,
        personalInfo: {
          dateOfBirth: '1990-05-15',
          phoneNumber: '+1 (555) 123-4567',
          emergencyContact: {
            name: 'Jane Smith',
            relationship: 'spouse',
            phone: '+1 (555) 123-4568'
          }
        },
        preferences: {
          notifications: true,
          autoRelief: true
        }
      }
    ];

    setEmployees(mockEmployees);
    setFilteredEmployees(mockEmployees);
  }, []);

  // Filter employees based on filters
  useEffect(() => {
    let filtered = employees;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower) ||
        emp.employeeId.toLowerCase().includes(searchLower)
      );
    }

    if (filters.department !== 'all') {
      filtered = filtered.filter(emp => emp.department === filters.department);
    }

    if (filters.role !== 'all') {
      filtered = filtered.filter(emp => emp.role === filters.role);
    }

    if (filters.branch !== 'all') {
      filtered = filtered.filter(emp => emp.branch === filters.branch);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(emp =>
        filters.status === 'active' ? emp.isActive : !emp.isActive
      );
    }

    setFilteredEmployees(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters, employees]);

  // In the table, update the columns to show the new fields:
  const columns = [
    'Employee',
    'Position & Department',
    'Branch & Level',
    'Role & Status',
    'Leave Balance',
    'Actions'
  ];

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      employee: { color: 'bg-green-100 text-green-800', label: 'Employee' },
      manager: { color: 'bg-green-100 text-green-800', label: 'Manager' },
      hr: { color: 'bg-purple-100 text-purple-800', label: 'HR' },
      admin: { color: 'bg-red-100 text-red-800', label: 'Admin' }
    };

    const config = roleConfig[role] || roleConfig.employee;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (isActive) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );

  const getLevelBadge = (level) => (
    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
      {level}
    </span>
  );

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowAddModal(true);
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailModal(true);
  };

  const handleDeleteEmployee = (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setEmployees(prev => prev.filter(emp => emp._id !== employeeId));
    }
  };

  const handleAddEmployee = (newEmployee) => {
    const employee = {
      ...newEmployee,
      _id: Date.now().toString(),
      employeeId: `EMP${String(employees.length + 1).padStart(3, '0')}`,
      isActive: true,
      leaveBalance: {
        annual: 0,
        sick: 0,
        personal: 0,
        maternity: 0,
        paternity: 0
      }
    };
    setEmployees(prev => [...prev, employee]);
    setShowAddModal(false);
  };

  const handleUpdateEmployee = (updatedEmployee) => {
    setEmployees(prev => prev.map(emp =>
      emp._id === updatedEmployee._id ? updatedEmployee : emp
    ));
    setSelectedEmployee(null);
    setShowAddModal(false);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600">Manage employee information and access</p>
        </div>
        <Button
          icon={FiPlus}
          size='large'
          onClick={() => {
            setSelectedEmployee(null);
            setShowAddModal(true);
          }}
        >
          Add Employee
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-gray-600 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="search"
                placeholder="Search employees by name, email, or ID..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-4 flex-wrap">
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="HR">HR</option>
              <option value="Sales">Sales</option>
              <option value="Finance">Finance</option>
            </select>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Roles</option>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="hr">HR</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={filters.branch}
              onChange={(e) => handleFilterChange('branch', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Branches</option>
              <option value="New York">New York</option>
              <option value="San Francisco">San Francisco</option>
              <option value="Chicago">Chicago</option>
              <option value="Boston">Boston</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEmployees.map((employee) => (
                <tr key={employee._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* Employee info with new fields */}
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-green-600">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                        <div className="text-xs text-gray-400">{employee.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{employee.position}</div>
                    <div className="text-sm text-gray-500">{employee.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.branch}</div>
                    <div className="text-sm text-gray-500">{employee.level}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      {getRoleBadge(employee.role)}
                      {getStatusBadge(employee.isActive)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      {LEAVETYPE.slice(0, 3).map((type) => (
                        <div key={type} className="text-center">
                          <div className="font-semibold text-green-700">{employee.leaveBalance?.[type] || 0}</div>
                          <div className="text-xs text-green-600 capitalize">{type}</div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewEmployee(employee)}
                        className="text-green-600 hover:text-green-900 p-1"
                        title="View Details"
                      >
                        <FiEye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditEmployee(employee)}
                        className="text-gray-600 hover:text-gray-900 p-1"
                        title="Edit"
                      >
                        <FiEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee._id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <FiUser className="mx-auto text-gray-400" size={48} />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No employees found</h3>
            <p className="mt-2 text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredEmployees.length > 0 && (
        <div className="flex items-center justify-between bg-white px-6 py-3 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(indexOfLastItem, filteredEmployees.length)}
            </span> of{' '}
            <span className="font-medium">{filteredEmployees.length}</span> results
          </div>
          <div className="flex gap-1">
            <Button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              icon={FiChevronLeft}
            >
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                onClick={() => paginate(page)}
                className={`px-3 py-1 rounded border ${currentPage === page
                  ? 'bg-green-600 text-white border-green-600'
                  : 'border-gray-300 hover:bg-gray-50'
                  }`}
              >
                {page}
              </Button>
            ))}

            <Button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              icon={FiChevronRight}
            >
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Employee Modal */}
      {showAddModal && (
        <EmployeeModal
          employee={selectedEmployee}
          onSave={selectedEmployee ? handleUpdateEmployee : handleAddEmployee}
          onClose={() => {
            setShowAddModal(false);
            setSelectedEmployee(null);
          }}
        />
      )}

      {/* Employee Detail Modal */}
      {showDetailModal && selectedEmployee && (
        <EmployeeDetail
          employee={selectedEmployee}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedEmployee(null);
          }}
        />
      )}
    </div>
  );
}