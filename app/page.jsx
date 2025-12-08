// app/dashboard/page.js
'use client';

import { dashboardLeaveBalance, dashboardStats, fetchMe } from '@/api';
import Loader from '@/components/Loader';
import { jwtDecode } from 'jwt-decode';
import { useState, useEffect } from 'react';
import {
  FiCalendar,
  FiClock,
  FiTrendingUp,
  FiEye,
  FiGift,
  FiChevronRight
} from 'react-icons/fi';

export default function Dashboard() {
  const [stats, setStats] = useState({
    pendingRequests: 0,
    approvedThisMonth: 0,
    totalEmployees: 0,
    onLeaveToday: 0,
    birthdayThisWeek: 0,
    yourLeaveBalance: { balance: 0 },
    rejectedLeaveRequests: 0,
    approvedLeaveRequests: 0,
    totalLeaveRequests: 0,
    recentLeaveRequests: []
  });

  const [recentRequests, setRecentRequests] = useState([]);
  const [upcomingLeaves, setUpcomingLeaves] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState({
    currentUser: {
      employeeName: '',
      employeeId: '',
      department: '',
      leaveTypes: [],
      totalRemaining: 0
    },
    teamMembers: []
  });
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [showAllTeam, setShowAllTeam] = useState(false);
  const [users, setUsers] = useState({})
  const [loading, setLoading] = useState(true);
  const [role, setRoles] = useState('');

  const loadDashboard = async () => {
    setLoading(true);

    try {
      // Run both API calls in parallel
      const [statsRes, balanceRes] = await Promise.all([
        dashboardStats(),
        dashboardLeaveBalance()
      ]);

      // Handle stats
      if (statsRes?.data) {
        setStats({
          pendingRequests: statsRes.data.pendingLeaveRequests,
          approvedThisMonth: statsRes.data.approvedLeaveRequests,
          totalEmployees: statsRes.data.totalEmployees,
          onLeaveToday: statsRes.data.onLeaveToday.length,
          birthdayThisWeek: statsRes.data.birthdayThisWeek.length,
          yourLeaveBalance: statsRes.data.yourLeaveBalance ?? { balance: 0 },
          rejectedLeaveRequests: statsRes.data.rejectedLeaveRequests,
          totalLeaveRequests: statsRes.data.totalLeaveRequests,
          recentLeaveRequests: statsRes.data.recentLeaveRequests || []
        });
      }

      // Handle leave balances
      if (balanceRes?.data) {
        setLeaveBalances(balanceRes.data);
      }

    } catch (error) {
      console.error("Dashboard load error:", error);

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const decoded = token ? jwtDecode(token) : undefined;

    setRoles(decoded?.role);
  })

  useEffect(() => {
    // Mock data - replace with actual API calls
    loadDashboard();

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
      },
      {
        id: 3,
        employee: 'Mike Chen',
        type: 'Personal',
        startDate: '2024-01-18',
        endDate: '2024-01-19',
        status: 'pending',
        days: 2
      },
      // {
      //   id: 1,
      //   employee: 'John Smith',
      //   type: 'Annual',
      //   startDate: '2024-01-15',
      //   endDate: '2024-01-20',
      //   status: 'pending',
      //   days: 5
      // },
      // {
      //   id: 2,
      //   employee: 'Sarah Johnson',
      //   type: 'Sick',
      //   startDate: '2024-01-10',
      //   endDate: '2024-01-12',
      //   status: 'approved',
      //   days: 3
      // },
      // {
      //   id: 3,
      //   employee: 'Mike Chen',
      //   type: 'Personal',
      //   startDate: '2024-01-18',
      //   endDate: '2024-01-19',
      //   status: 'pending',
      //   days: 2
      // },
      // {
      //   id: 1,
      //   employee: 'John Smith',
      //   type: 'Annual',
      //   startDate: '2024-01-15',
      //   endDate: '2024-01-20',
      //   status: 'pending',
      //   days: 5
      // },
      // {
      //   id: 2,
      //   employee: 'Sarah Johnson',
      //   type: 'Sick',
      //   startDate: '2024-01-10',
      //   endDate: '2024-01-12',
      //   status: 'approved',
      //   days: 3
      // },
      // {
      //   id: 3,
      //   employee: 'Mike Chen',
      //   type: 'Personal',
      //   startDate: '2024-01-18',
      //   endDate: '2024-01-19',
      //   status: 'pending',
      //   days: 2
      // },
      // {
      //   id: 1,
      //   employee: 'John Smith',
      //   type: 'Annual',
      //   startDate: '2024-01-15',
      //   endDate: '2024-01-20',
      //   status: 'pending',
      //   days: 5
      // },
      // {
      //   id: 2,
      //   employee: 'Sarah Johnson',
      //   type: 'Sick',
      //   startDate: '2024-01-10',
      //   endDate: '2024-01-12',
      //   status: 'approved',
      //   days: 3
      // },
      // {
      //   id: 3,
      //   employee: 'Mike Chen',
      //   type: 'Personal',
      //   startDate: '2024-01-18',
      //   endDate: '2024-01-19',
      //   status: 'pending',
      //   days: 2
      // },
      // {
      //   id: 1,
      //   employee: 'John Smith',
      //   type: 'Annual',
      //   startDate: '2024-01-15',
      //   endDate: '2024-01-20',
      //   status: 'pending',
      //   days: 5
      // },
      // {
      //   id: 2,
      //   employee: 'Sarah Johnson',
      //   type: 'Sick',
      //   startDate: '2024-01-10',
      //   endDate: '2024-01-12',
      //   status: 'approved',
      //   days: 3
      // },
      // {
      //   id: 3,
      //   employee: 'Mike Chen',
      //   type: 'Personal',
      //   startDate: '2024-01-18',
      //   endDate: '2024-01-19',
      //   status: 'pending',
      //   days: 2
      // }
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
      },
      {
        id: 3,
        employee: 'Robert Brown',
        type: 'Annual',
        startDate: '2024-01-22',
        endDate: '2024-01-26',
        days: 4
      }
    ]);

    // Mock upcoming birthdays for this week
    const today = new Date();
    const currentWeek = getWeekDates(today);

    setUpcomingBirthdays([
      {
        id: 1,
        employeeName: 'Michael Rodriguez',
        department: 'Sales',
        birthDate: '1990-01-15', // Today or within week
        birthday: formatBirthdayForWeek('1990-01-15', currentWeek),
        age: 34,
        avatarColor: 'bg-pink-100 text-pink-600'
      },
      {
        id: 2,
        employeeName: 'Jennifer Lee',
        department: 'Design',
        birthDate: '1992-01-16', // Tomorrow
        birthday: formatBirthdayForWeek('1992-01-16', currentWeek),
        age: 32,
        avatarColor: 'bg-blue-100 text-blue-600'
      },
      {
        id: 3,
        employeeName: 'David Kim',
        department: 'Engineering',
        birthDate: '1988-01-18', // This week
        birthday: formatBirthdayForWeek('1988-01-18', currentWeek),
        age: 36,
        avatarColor: 'bg-green-100 text-green-600'
      },
      {
        id: 4,
        employeeName: 'Sophia Martinez',
        department: 'Marketing',
        birthDate: '1995-01-20', // This week
        birthday: formatBirthdayForWeek('1995-01-20', currentWeek),
        age: 29,
        avatarColor: 'bg-purple-100 text-purple-600'
      },
      {
        id: 5,
        employeeName: 'Alex Thompson',
        department: 'HR',
        birthDate: '1991-01-14', // Yesterday
        birthday: formatBirthdayForWeek('1991-01-14', currentWeek),
        age: 33,
        avatarColor: 'bg-yellow-100 text-yellow-600',
        justPassed: true
      }
    ]);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    if (!token) return;

    const fetchUser = async () => {
      const res = await fetchMe();
      setUsers(res.data)
    }

    fetchUser();
  }, []);

  // Helper function to get week dates
  function getWeekDates(date) {
    const current = new Date(date);
    const week = [];

    // Start from Monday
    current.setDate(current.getDate() - current.getDay() + 1);

    for (let i = 0; i < 7; i++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return week;
  }

  // Helper function to format birthday display
  function formatBirthdayForWeek(birthDate, week) {
    const birth = new Date(birthDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = birth.getDate() === today.getDate() &&
      birth.getMonth() === today.getMonth();
    const isTomorrow = birth.getDate() === tomorrow.getDate() &&
      birth.getMonth() === tomorrow.getMonth();

    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';

    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][birth.getDay()];
    return `${dayOfWeek}, ${birth.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
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

  const LeaveBalanceItem = ({ type, used, total, remaining }) => {
    const percentage = (used / total) * 100;
    const getColor = (percentage) => {
      if (percentage > 75) return 'bg-red-500';
      if (percentage > 50) return 'bg-yellow-500';
      return 'bg-green-500';
    };

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">{type}</span>
          <span className="text-sm font-semibold text-gray-900">{remaining} days left</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className={`h-full rounded-full ${getColor(percentage)}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 w-12 text-right">
            {used}/{total}
          </span>
        </div>
      </div>
    );
  };

  const TeamMemberCard = ({ member }) => (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${member.onLeave ? 'bg-red-100' : 'bg-teal-100'}`}>
          <span className={`text-sm font-medium ${member.onLeave ? 'text-red-600' : 'text-teal-600'}`}>
            {member.employeeName.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900">{member.employeeName}</p>
            {member.onLeave && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                On Leave
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{member.department}</p>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{member.annualLeave}</p>
          <p className="text-xs text-gray-500">Annual</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{member.sickLeave}</p>
          <p className="text-xs text-gray-500">Sick</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{member.personalLeave}</p>
          <p className="text-xs text-gray-500">Personal</p>
        </div>
      </div>
    </div>
  );

  const BirthdayCard = ({ birthday }) => {
    const isToday = birthday.birthday === 'Today';
    const isTomorrow = birthday.birthday === 'Tomorrow';
    const justPassed = birthday.justPassed;

    return (
      <div className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors ${isToday ? 'border-yellow-200 bg-yellow-50' :
        justPassed ? 'border-gray-200 opacity-75' :
          'border-gray-200'
        }`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${birthday.avatarColor}`}>
            {isToday ? (
              <FiGift size={20} />
            ) : (
              <span className="text-lg font-semibold">
                {birthday.employeeName.split(' ').map(n => n[0]).join('')}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900">{birthday.employeeName}</p>
              {isToday && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full font-medium">
                  🎉 Today!
                </span>
              )}
              {isTomorrow && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                  Tomorrow
                </span>
              )}
              {justPassed && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                  Just passed
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{birthday.department}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">
                Turning {birthday.age + 1} years
              </span>
              {!justPassed && (
                <span className="text-xs font-medium text-gray-700">
                  • {birthday.birthday}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          {isToday ? (
            <button className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-3 py-1 rounded-lg text-sm font-medium transition-colors">
              Send Wishes
            </button>
          ) : (
            <button className="text-gray-400 hover:text-gray-600">
              <FiChevronRight size={20} />
            </button>
          )}
          {justPassed && (
            <span className="text-xs text-gray-500 mt-2">
              {birthday.birthday}
            </span>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management Dashboard</h1>
          <p className="text-gray-600">Welcome back, {users.fullName}. Here's what's happening today.</p>
        </div>
      </div>

      {/* Updated Stats Grid with Birthday Count */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon={FiClock}
          color="bg-yellow-500"
        />
        <StatCard
          title="Your Annual Leave Balance"
          value={`${stats.yourLeaveBalance?.balance || 0} days`}
          icon={FiTrendingUp}
          color="bg-green-500"
          subtitle="Total days remaining"
        />
        <StatCard
          title="On Leave Today"
          value={stats.onLeaveToday}
          icon={FiCalendar}
          color="bg-purple-500"
        />
        <StatCard
          title="Birthdays This Week"
          value={stats.birthdayThisWeek}
          icon={FiGift}
          color="bg-pink-500"
          subtitle="Celebrating soon"
        />
      </div>

      {/* Main Content Grid */}
      <div className="flex flex-wrap gap-6 w-full">
        {/* Your Leave Balance Card */}
        <div className="grow basis-full md:basis-1/2 lg:basis-1/3 bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold text-teal-600">
                  {leaveBalances.currentUser.employeeName.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 capitalize">{leaveBalances.currentUser.employeeName}</p>
                <p className="text-sm text-gray-600">{leaveBalances.currentUser.department} • {leaveBalances.currentUser.employeeId}</p>
              </div>
            </div>

            <div className="space-y-4">
              {leaveBalances.currentUser.leaveTypes.filter(leave => !['emergency', 'compassionate', 'paternity', 'personal'].includes(leave.name.toLowerCase())).map((leave, index) => (
                <LeaveBalanceItem
                  key={index}
                  type={leave.name}
                  used={leave.used}
                  total={leave.total}
                  remaining={leave.remaining}
                />
              ))}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total Available</span>
                <span className="text-lg font-bold text-gray-900">{leaveBalances.currentUser.totalRemaining} days</span>
              </div>
            </div>
          </div>
        </div>

        {['admin', 'manager', 'hr', 'team-lead'].includes(role) &&
          <div className="grow bg-white rounded-lg border border-gray-200 p-6">
            {!showAllTeam && (
              <div className="space-y-4 transition-all">

                <h3 className="text-md font-medium text-gray-900">Team Leave Balances</h3>

                {/* Show only 4 members */}
                <div className="space-y-3">
                  {leaveBalances.teamMembers.slice(0, 4).map((member) => (
                    <TeamMemberCard key={member.id} member={member} />
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-200">
                  <span>
                    Showing {Math.min(4, leaveBalances.teamMembers.length)} of {leaveBalances.teamMembers.length}
                  </span>

                  {leaveBalances.teamMembers.length > 3 && (
                    <button
                      className="text-teal-600 hover:text-teal-700 cursor-pointer font-medium"
                      onClick={() => setShowAllTeam(true)}
                    >
                      View All →
                    </button>
                  )}
                </div>

              </div>
            )}
          </div>
        }

        {showAllTeam && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full sm:w-[500px] max-h-[80vh] rounded-2xl p-6 shadow-xl overflow-y-auto animate-[slideUp_0.3s_ease]">

              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">All Team Members</h2>
                <button
                  onClick={() => setShowAllTeam(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ✕
                </button>
              </div>

              {/* All team members */}
              <div className="space-y-3">
                {leaveBalances.teamMembers.map((member) => (
                  <TeamMemberCard key={member.id} member={member} />
                ))}
              </div>

            </div>
          </div>
        )}

        {/* Recent Leave Requests */}
        {['admin', 'manager', 'hr'].includes(role) &&
          <div className="grow bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Leave Requests</h2>
            </div>
            <div className="space-y-4">
              {stats.recentLeaveRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-teal-600">
                          {request?.employeeId.fullName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{request?.employeeId.fullName}</p>
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {request?.leaveType}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(request?.startDate).toLocaleDateString()} - {new Date(request?.endDate).toLocaleDateString()}
                          <span className="mx-2">•</span>
                          {request?.totalDays} days
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={request?.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        }

        {/* Upcoming Birthdays */}
        <div className="grow bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiGift className="text-pink-500" />
                Upcoming Birthdays This Week
              </h2>
              <p className="text-sm text-gray-600">Wish your colleagues a happy birthday</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All Birthdays
            </button>
          </div>
          <div className="space-y-3">
            {upcomingBirthdays.slice(0, 3).map((birthday) => (
              <BirthdayCard key={birthday.id} birthday={birthday} />
            ))}
          </div>
          {upcomingBirthdays.filter(b => b.justPassed).length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Showing {upcomingBirthdays.filter(b => !b.justPassed).length} upcoming birthdays
                {upcomingBirthdays.filter(b => b.justPassed).length > 0 &&
                  ` and ${upcomingBirthdays.filter(b => b.justPassed).length} recent birthdays`
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Leaves */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Leaves</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View Calendar
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingLeaves.map((leave) => (
            <div key={leave.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-green-600">
                    {leave.employee.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{leave.employee}</p>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {leave.type}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium text-gray-900">{leave.days} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Starts:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(leave.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ends:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(leave.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </span>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}