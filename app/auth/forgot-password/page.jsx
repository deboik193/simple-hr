// app/auth/forgot-password/page.js
'use client';

import { forgotPassword } from '@/api';
import Button from '@/components/Button';
import { useToast } from '@/context/toastContext';
import { useState } from 'react';
import { FiMail } from 'react-icons/fi';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('E-mail is required');
      return;
    }

    if (!/.+@.+\..+/.test(email)) {
      setError('E-mail must be valid');
      return;
    }

    setIsLoading(true);

    try {
      const res = await forgotPassword({ email });

      if (res.error) {
        addToast(res.error, 'error');
      } else {
        addToast('Password reset email sent successfully!', 'success');
        setIsSubmitted(true);
      }

    } catch (error) {
      addToast('Failed to send reset email. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiMail className="text-green-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email</h2>
        <p className="text-gray-600 mb-6">
          We've sent a password reset link to <strong>{email}</strong>
        </p>
        <p className="text-sm text-gray-500 mb-8">
          If you don't see the email, check your spam folder or try again.
        </p>
        <div className="space-y-4">
          <Button
            onClick={() => setIsSubmitted(false)}
            size='large'
            className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 w-full"
          >
            Resend Email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              className={`w-full h-12 px-14 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              placeholder="Enter your email"
            />
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        <Button
          type="submit"
          size='large'
          disabled={isLoading}
          className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 w-full"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
              Sending...
            </div>
          ) : (
            'SEND RESET LINK'
          )}
        </Button>
      </form>
    </div>
  );
}