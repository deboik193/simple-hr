'use client';

import { fetchMe } from '@/api';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  FiFileText,
  FiSettings,
  FiBell,
  FiMenu,
  FiX,
  FiSearch,
  FiCalendar,
  FiBarChart2,
  FiUsers,
  FiLogOut
} from 'react-icons/fi';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('');
  const [role, setRoles] = useState('');
  const [users, setUsers] = useState({})
  const pathname = usePathname();
  const route = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    if (!token) return;

    const fetchUser = async () => {
      const res = await fetchMe();
      setUsers(res.data)
    }

    fetchUser();
  }, [])

  // Load active navigation from localStorage on component mount
  useEffect(() => {
    const savedNav = location.pathname;
    if (savedNav) {
      setActiveNav(savedNav);
    }
  }, []);

  // Save active navigation to localStorage whenever it changes
  useEffect(() => {

    const token = localStorage.getItem('authToken');
    const decoded = token ? jwtDecode(token) : undefined;

    setRoles(decoded?.role);

    localStorage.setItem('activeNav', activeNav);
  }, [activeNav]);

  const navItems = [
    { name: 'Dashboard', icon: FiBarChart2, link: '/', role: true },
    { name: 'Employees', icon: FiUsers, link: '/employees', role: ['admin', 'hr'].includes(role) },
    { name: 'Leave Requests', icon: FiCalendar, link: '/leave-request', role: true },
    // { name: 'Run Payroll', icon: FiDollarSign, link: '/time-off', role: true },
    // { name: 'Pay Contractors', icon: FiFileText, link: '/time-off', role: true },
    // { name: 'Time Tracking', icon: FiFileText, link: '/time-off', role: true },
    // { name: 'Time Off', icon: FiClock, link: '/time-off', role: true },
    // { name: 'Benefits', icon: FiFileText, link: '/time-off', role: true },
    // { name: 'Reports', icon: FiFileText, link: '/reports', role: true },
  ];

  const bottomNavItems = [
    { name: 'Leave Policies', icon: FiFileText, link: '/leave-policy' },
    { name: 'Settings', icon: FiSettings, link: '/settings' },
  ];

  const handleNavClick = (navName, path) => {
    setActiveNav(path);

    setSidebarOpen(false);
    // You can add navigation logic here if using client-side routing
  };

  const logOutUser = () => {
    localStorage.removeItem('authToken')
    route.replace('/auth/login')
  }

  if (pathname.includes('/auth')) {
    return (
      <main className="transition-all duration-300">
        {children}
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top Header */}
      <header className="bg-white fixed top-0 left-0 right-0 h-16 lg:h-20 z-50 flex items-center justify-between px-4 lg:px-8 border-b border-gray-200">
        {/* Left Section - Logo & Hamburger */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-green-100 transition-colors"
          >
            {sidebarOpen ? <FiX size={24} className='text-green-600/30' /> : <FiMenu className='text-green-600/30' size={24} />}
          </button>
          <h1 className="text-2xl font-bold text-green-600">Simple HR</h1>
        </div>

        {/* Search Bar - Hidden on mobile, visible on desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="search"
              placeholder="Search employees, requests..."
              className="w-full pl-10 pr-4 py-2 outline text-gray-600 outline-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section - Notifications & User */}
        <div className="flex items-center gap-4">

          <div className="relative border-r-2 pr-4">
            <FiBell size={24} className="text-gray-500 hover:text-gray-700 cursor-pointer" />
            <span className="absolute -top-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </div>

          <div className="hidden sm:flex flex-col">
            <div className="font-medium text-gray-700 text-sm lg:text-base capitalize">{users?.fullName}</div>
            <div className="text-xs text-gray-400 capitalize">{users?.role}</div>
          </div>

          {/* User Avatar for mobile */}
          <div className="sm:hidden w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-green-600">JJ</span>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-16 lg:top-20 left-0 h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] 
        w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        flex flex-col justify-between overflow-y-auto
      `}>
        <div className="p-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.link;
              return (
                <Link
                  key={item.name}
                  onClick={() => handleNavClick(item.name, item.link)}
                  href={item.link}
                  className={`w-full cursor-pointer ${item.role ? 'flex' : 'hidden'} items-center gap-3 p-3 rounded-md text-left transition-colors ${isActive
                    ? 'bg-green-50 text-green-600 font-semibold border-r-2 border-green-600'
                    : 'text-gray-700 hover:bg-green-50'
                    }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <nav className="space-y-1">
            {['admin', 'hr'].includes(role) && bottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.link;
              return (
                <Link
                  key={item.name}
                  onClick={() => handleNavClick(item.name, item.link)}
                  href={item.link}
                  className={`w-full cursor-pointer flex items-center gap-3 p-3 rounded-md text-left transition-colors ${isActive
                    ? 'bg-green-50 text-green-600 font-semibold border-r-2 border-green-600'
                    : 'text-gray-700 hover:bg-green-50'
                    }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <button onClick={logOutUser} className='text-red-700 hover:bg-red-50 w-full cursor-pointer flex items-center gap-3 p-3 rounded-md text-left transition-colors'>
              <FiLogOut size={18} />
              Logout
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`
        lg:ml-64 mt-16 lg:mt-20 min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-5rem)]
        transition-all duration-300
      `}>
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}