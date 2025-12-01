import { Suspense } from 'react';
import ResetPasswordContent from './ResetPasswordContent';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner">Loading reset password...</div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}