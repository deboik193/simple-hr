// app/auth/reset-password/page.js
'use client';

import { useState, useEffect } from 'react';
import { FiLock, FiEye, FiEyeOff, FiCheck, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { useToast } from '@/context/toastContext';
import { resetPassword } from '@/api';

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  });
  const { addToast } = useToast();

  // Check if token is valid on component mount
  useEffect(() => {
    if (!token) {
      // Redirect to forgot password if no token
      router.push('/auth/forgot-password');
    }
  }, [token, router]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Check password strength in real-time
    if (field === 'password') {
      checkPasswordStrength(value);
    }

    // Clear confirm password error when passwords match
    if (field === 'password' && formData.confirmPassword) {
      if (value === formData.confirmPassword && errors.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const checkPasswordStrength = (password) => {
    const feedback = [];
    let score = 0;

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One uppercase letter');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One lowercase letter');
    }

    // Number check
    if (/[0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One number');
    }

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One special character');
    }

    setPasswordStrength({ score, feedback });
  };

  const getPasswordStrengthColor = (score) => {
    if (score === 0) return 'bg-gray-200';
    if (score <= 2) return 'bg-red-500';
    if (score <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (score) => {
    if (score === 0) return 'Very Weak';
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Good';
    return 'Strong';
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (passwordStrength.score < 3) {
      newErrors.password = 'Please choose a stronger password';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    // Mock password reset API call
    try {
      const res = await resetPassword({
        token,
        newPassword: formData.password
      });

      if (res.error) {
        addToast(res.error, 'error');
      } else {
        addToast('Password has been reset successfully!', 'success');
        setIsSuccess(true);
      }

    } catch (error) {
      addToast('Failed to reset password. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheck className="text-green-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Password Reset Successfully!</h2>
        <p className="text-sm text-gray-500 mb-8">
          You will be redirected to the login page shortly...
        </p>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Not redirecting?{' '}
            <Link href="/auth/login" className="text-teal-600 hover:text-teal-500 font-medium">
              Click here
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Reset Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={`w-full pl-12 pr-12 py-4 bg-gray-50 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
          {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Password strength:</span>
                <span className={`text-sm font-medium ${passwordStrength.score <= 2 ? 'text-red-600' :
                  passwordStrength.score <= 3 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                  {getPasswordStrengthText(passwordStrength.score)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`}
                  style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className={`w-full pl-12 pr-12 py-4 bg-gray-50 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              placeholder="Confirm new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>}

          {/* Password Match Indicator */}
          {formData.password && formData.confirmPassword && (
            <div className="mt-2">
              {formData.password === formData.confirmPassword ? (
                <p className="text-sm text-green-600 flex items-center">
                  <FiCheck className="mr-1" size={16} />
                  Passwords match
                </p>
              ) : (
                <p className="text-sm text-red-600">Passwords do not match</p>
              )}
            </div>
          )}
        </div>

        {/* Password Requirements */}
        {/* <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm font-medium text-blue-800 mb-3">Password Requirements:</p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li className={`flex items-center ${formData.password.length >= 8 ? 'text-green-600' : ''}`}>
              <FiCheck className={`mr-2 ${formData.password.length >= 8 ? 'text-green-600' : 'text-blue-400'}`} size={12} />
              At least 8 characters long
            </li>
            <li className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}`}>
              <FiCheck className={`mr-2 ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-blue-400'}`} size={12} />
              One uppercase letter (A-Z)
            </li>
            <li className={`flex items-center ${/[a-z]/.test(formData.password) ? 'text-green-600' : ''}`}>
              <FiCheck className={`mr-2 ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-blue-400'}`} size={12} />
              One lowercase letter (a-z)
            </li>
            <li className={`flex items-center ${/[0-9]/.test(formData.password) ? 'text-green-600' : ''}`}>
              <FiCheck className={`mr-2 ${/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-blue-400'}`} size={12} />
              One number (0-9)
            </li>
            <li className={`flex items-center ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-green-600' : ''}`}>
              <FiCheck className={`mr-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-green-600' : 'text-blue-400'}`} size={12} />
              One special character (!@#$% etc.)
            </li>
          </ul>
        </div> */}

        {/* Security Tips */}
        {/* <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Security Tips:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Don't use common words or personal information</li>
            <li>• Avoid sequences like "12345" or "abcde"</li>
            <li>• Don't reuse passwords from other accounts</li>
            <li>• Consider using a password manager</li>
          </ul>
        </div> */}

        {/* Submit Error */}
        {/* {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600 text-center">{errors.submit}</p>
            <p className="text-sm text-red-500 text-center mt-2">
              <Link href="/auth/forgot-password" className="underline">
                Request a new reset link
              </Link>
            </p>
          </div>
        )} */}

        {/* Token Expiry Warning */}
        {/* {!token && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-700 text-center">
              Invalid or expired reset link. Please request a new password reset.
            </p>
          </div>
        )} */}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading || !token}
          size='large'
          className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 w-full"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
              Resetting Password...
            </div>
          ) : (
            'RESET PASSWORD'
          )}
        </Button>
      </form>
    </div>
  );
}