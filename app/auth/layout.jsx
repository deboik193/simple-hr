// app/auth/layout.js
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function AuthLayout({ children }) {
  const pathname = usePathname();

  const getPageTitle = () => {
    switch (pathname) {
      case '/auth/login':
        return 'Login';
      case '/auth/register':
        return 'Register';
      case '/auth/forgot-password':
        return 'Forgot Password';
      case '/auth/reset-password':
        return 'Reset Password';
      default:
        return 'LeaveTrack';
    }
  };

  const showBackButton = pathname === '/auth/forgot-password' || pathname === '/auth/reset-password';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blu-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl outline-1 outline-gray-200 rounded-2xl">
        <div className="rounded-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Logo/Brand */}
            <div className="lg:w-1/2 p-8 lg:p-12 flex items-center justify-center bg-gradient-to-br from-teal-600 to-teal-800">
              <div className="text-center text-white">
                <div className="w-48 h-48 mx-auto mb-8 flex items-center justify-center">
                  <div className="bg-white/20 rounded-2xl p-8 backdrop-blur-sm">
                    {/* add logo here */}
                  </div>
                </div>
                <h1 className="text-4xl sm:block hidden font-bold mb-4">Simple HR</h1>
                <p className="text-teal-100 sm:block hidden text-lg">
                  Streamline your management process with Simple HR
                </p>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="lg:w-1/2 p-8 lg:p-12 text-gray-900">
              <div className="max-w-md mx-auto">
                {/* Back Button */}
                {showBackButton && (
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center text-sm text-teal-600 hover:text-teal-500 mb-6 transition-colors duration-200"
                  >
                    <FiArrowLeft className="mr-2" size={16} />
                    Back to Login
                  </Link>
                )}

                {/* Page Title */}
                <div className="text-center mb-8">
                  <h1 className="sm:text-4xl text-2xl font-bold uppercase tracking-wide">
                    {getPageTitle()}
                  </h1>
                </div>

                {/* Form Content */}
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}