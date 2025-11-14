// app/auth/login/page.js
'use client';

import { useState } from 'react';
import { FiEye, FiEyeOff, FiMail, FiLock } from 'react-icons/fi';
import Link from 'next/link';
import Button from '../../../components/Button';
import { loginUser } from '../../../api';
import { useToast } from '../../../context/toastContext';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const emailRules = [
    (v) => !!v || 'E-mail is required',
    (v) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
  ];

  const passwordRules = [
    (v) => !!v || 'Password is required',
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate email
    for (const rule of emailRules) {
      const error = rule(formData.email);
      if (error && error !== true) {
        newErrors.email = error;
        break;
      }
    }

    // Validate password
    for (const rule of passwordRules) {
      const error = rule(formData.password);
      if (error && error !== true) {
        newErrors.password = error;
        break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await loginUser(formData);
      console.log(res);

      if (res?.error) {
        addToast(res?.error, 'error')
      }

      if (res?.data.token) {

        localStorage.setItem('authToken', res?.data.token);

        // Redirect to dashboard
        window.location.href = '/';
      }
    } catch (error) {
      return error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            E-mail
          </label>
          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full h-12 px-12 bg-gray-50  rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${errors.email
                ? 'border-red-300 bg-red-50 '
                : 'border-gray-200 hover:border-gray-300 '
                } text-gray-900 placeholder-gray-500 `}
              placeholder="Enter your e-mail"
            />
          </div>
          {errors.email && (
            <p className="mt-2 text-sm text-red-600 ">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={`w-full h-12 px-12 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${errors.password
                ? 'border-red-300 bg-red-50 '
                : 'border-gray-200  hover:border-gray-300 '
                } text-gray-900 placeholder-gray-500`}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-2 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size='large'
          disabled={isLoading}
          className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 w-full"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
              Signing In...
            </div>
          ) : (
            'LOGIN'
          )}
        </Button>
      </form>

      {/* Forgot Password Link */}
      <div className="flex justify-end">
        <Link
          href="/auth/forgot-password"
          className="text-sm font-medium text-teal-600 hover:text-teal-500 transition-colors"
        >
          Forgot Password?
        </Link>
      </div>
    </div>
  );
}