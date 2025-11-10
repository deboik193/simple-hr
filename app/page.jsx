// app/dashboard/page.js
'use client';

import { useState, useEffect } from 'react';
import {
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiUser,
} from 'react-icons/fi';

export default function Dashboard() {
  const [stats, setStats] = useState({
    pendingRequests: 0,
    approvedThisMonth: 0,
    totalEmployees: 0,
    onLeaveToday: 0
  });

  const [recentRequests, setRecentRequests] = useState([]);
  const [upcomingLeaves, setUpcomingLeaves] = useState([]);

  useEffect(() => {
    // Mock data - replace with actual API calls
    setStats({
      pendingRequests: 12,
      approvedThisMonth: 45,
      totalEmployees: 156,
      onLeaveToday: 8
    });

    setRecentRequests([
      {
        id: 1,
        employee: 'John Smith',
        type: 'Annual',
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        status: 'pending',
        days: 5
      },
      {
        id: 2,
        employee: 'Sarah Johnson',
        type: 'Sick',
        startDate: '2024-01-10',
        endDate: '2024-01-12',
        status: 'approved',
        days: 3
      }
    ]);

    setUpcomingLeaves([
      {
        id: 1,
        employee: 'Mike Chen',
        type: 'Annual',
        startDate: '2024-01-18',
        endDate: '2024-01-25',
        days: 7
      },
      {
        id: 2,
        employee: 'Emily Davis',
        type: 'Maternity',
        startDate: '2024-02-01',
        endDate: '2024-08-01',
        days: 180
      }
    ]);
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management Dashboard</h1>
          <p className="text-gray-600">Welcome back, Jessica. Here's what's happening today.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          New Leave Request
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon={FiClock}
          color="bg-yellow-500"
        />
        <StatCard
          title="Approved This Month"
          value={stats.approvedThisMonth}
          icon={FiCheckCircle}
          color="bg-green-500"
        />
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={FiUser}
          color="bg-blue-500"
        />
        <StatCard
          title="On Leave Today"
          value={stats.onLeaveToday}
          icon={FiCalendar}
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leave Requests */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Leave Requests</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {request.employee.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{request.employee}</p>
                      <p className="text-sm text-gray-600">{request.type} Leave • {request.days} days</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={request.status} />
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(request.startDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Leaves */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Leaves</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View Calendar
            </button>
          </div>
          <div className="space-y-4">
            {upcomingLeaves.map((leave) => (
              <div key={leave.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-600">
                        {leave.employee.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{leave.employee}</p>
                      <p className="text-sm text-gray-600">{leave.type} • {leave.days} days</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    Starts {new Date(leave.startDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}