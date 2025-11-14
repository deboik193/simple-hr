import Layout from '../components/Layout';
import { ToastProvider } from "../context/toastContext";

import "./globals.css";

export const metadata = {
  title: 'LeaveTrack - HR Leave Management',
  description: 'Modern HR Leave Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Layout>
          <ToastProvider>
            {children}
          </ToastProvider>
        </Layout>
      </body>
    </html>
  );
}
