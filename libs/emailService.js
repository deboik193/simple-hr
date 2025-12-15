// lib/services/email-service.js
import axios from 'axios';
import { emailTemplates } from '@/libs/emailTemplate';

class EmailService {
  constructor() {
    this.apiKey = process.env.ELASTIC_EMAIL_API_KEY;
    this.fromEmail = process.env.ELASTIC_EMAIL_FROM;
    this.fromName = process.env.ELASTIC_EMAIL_FROM_NAME;
    this.baseUrl = 'https://api.elasticemail.com/v4';

    this.validateConfig();
  }

  validateConfig() {
    const required = [this.apiKey, this.fromEmail, this.fromName];
    if (required.some(field => !field)) {
      throw new Error('Missing required email configuration');
    }
  }

  /**
   * Send email using React components
   */
  async sendEmail(to, subject, templateName, data) {
    try {

      const template = emailTemplates[templateName];
      if (!template) {
        throw new Error(`Template ${templateName} not found`);
      }

      const html = template(data);

      const payload = {
        Recipients: { To: Array.isArray(to) ? to : [to] },
        Content: {
          From: `${this.fromName} <${this.fromEmail}>`,
          Subject: subject,
          Body: [
            {
              ContentType: 'HTML',
              Charset: 'utf-8',
              Content: html,
            },
          ],
        },
      };

      const response = await axios.post(
        `${this.baseUrl}/emails/transactional`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-ElasticEmail-ApiKey': this.apiKey,
          },
        }
      );

      console.log(`Email sent to ${to}`);
      return response.data;
    } catch (error) {
      console.error('Email sending error:',
        error.response?.data || error.message
      );
      throw new Error('Failed to send email');
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

    return this.sendEmail(
      user.email,
      'Reset Your Simple HR Password',
      'passwordReset',
      {
        name: user.fullName,
        resetUrl: resetUrl,
        expiryTime: '1 hour'
      }
    );
  }

  async sendWelcomeEmail(user) {
    return this.sendEmail(
      user.email,
      'Welcome to Simple HR',
      'welcome',
      {
        name: user.fullName,
        loginUrl: `${process.env.NEXTAUTH_URL}/auth/login`,
        username: user.email,
        password: user.employeeId
      }
    );
  }

  async notifyReliefOfficer(user, reliefOfficer) {
    return this.sendEmail(
      reliefOfficer.email,
      'Pending Relief Officer',
      'reliefOfficer',
      {
        name: reliefOfficer.fullName,
        loginUrl: `${process.env.NEXTAUTH_URL}/auth/login`,
        employeeName: user.fullName,
      }
    );
  }

  async notifyDeclinedLeaveRequest(leaveRequest, declineReason, manager, whois) {
    const { employeeId, reliefOfficerId, startDate, endDate } = leaveRequest;

    return this.sendEmail(
      [employeeId.email, manager.managerId.email],
      'Leave Request Declined by Relief Officer',
      'leaveDeclinedEmployee',
      {
        who: 'Relief' || whois,
        managerName: manager?.managerId.fullName,
        employeeName: employeeId.fullName,
        reliefOfficerName: reliefOfficerId.fullName,
        declineReason: declineReason?.notes,
        startDate: startDate.toDateString(),
        endDate: endDate.toDateString(),
      }
    )
  }

  async notifyManagerApproval(leaveRequest, manager) {
    const { employeeId } = leaveRequest;

    return this.sendEmail(
      manager.email,
      'Leave Request Notification',
      'manager',
      {
        name: manager.fullName,
        employeeName: employeeId.fullName,
        loginUrl: `${process.env.NEXTAUTH_URL}/auth/login`,
      }
    )
  }

  async notifyHRApproval(leaveRequest, hr) {
    const { employeeId } = leaveRequest;

    return this.sendEmail(
      hr.email,
      'Leave Request Notification',
      'hr',
      {
        name: hr.fullName,
        employeeName: employeeId.fullName,
        loginUrl: `${process.env.NEXTAUTH_URL}/auth/login`,
      }
    )
  }

  async notifyDeclinedLeaveRequestEmployeeOnly(leaveRequest, declineReason, role) {
    const { employeeId, startDate, endDate } = leaveRequest;
    return this.sendEmail(
      employeeId.email,
      'Leave Request Declined by ' + (role || 'Manager'),
      'leaveDeclinedEmployeeOnly',
      {
        employeeName: employeeId.fullName,
        declineReason: declineReason?.notes,
        startDate: startDate.toDateString(),
        endDate: endDate.toDateString(),
        role: role || 'manager',
      }
    )
  }

  async notifyFinalApproval(leaveRequest) {
    const { employeeId, reliefOfficerId, startDate, endDate } = leaveRequest;
    return this.sendEmail(
      [employeeId.email, reliefOfficerId.email],
      'Leave Request Approved',
      'leaveApprovedAll',
      {
        employeeName: employeeId.fullName,
        reliefOfficerName: reliefOfficerId.fullName,
        startDate: startDate.toDateString(),
        endDate: endDate.toDateString(),
      }
    )
  }

  async birthdayNotification(hr, birthdays) {
    return this.sendEmail(
      hr.email,
      'Weekly Birthday Reminder',
      'getBirthdayTemplate',
      {
        hrName: hr.fullName,
        birthdays: birthdays.map(b => ({
          employeeName: b.fullName,
          department: b.department?.name || 'Unknown',
          birthdayDate: new Date(b.nextBirthday).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          daysUntil: b.daysUntilBirthday
        })),
        count: birthdays.length
      }
    );
  }

  // ... other email methods
}

export const emailService = new EmailService();