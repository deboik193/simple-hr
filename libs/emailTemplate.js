// lib/email-templates.js
export const emailTemplates = {
  passwordReset: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; }
        .button { 
          display: inline-block; 
          background: #0f766e;
          color: white; 
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0; 
        }
        a.button { 
          color: white; 
        }
        .footer { 
          margin-top: 30px; 
          padding-top: 20px; 
          border-top: 1px solid #eee; 
          color: #666; 
          font-size: 14px; 
        }
        .url { 
          word-break: break-all; 
          color: #0070f3; 
          font-size: 14px; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        
        <p>Hello <strong>${data.name}</strong>,</p>
        
        <p>We received a request to reset your password for your Simple HR account. 
           Click the button below to create a new password:</p>
        
        <div style="text-align: center;">
          <a href="${data.resetUrl}" class="button">Reset Password</a>
        </div>
        
        <p>If you didn't request this reset, please ignore this email. 
           Your password will remain unchanged.</p>
        
        <p>This reset link will expire in <strong>${data.expiryTime}</strong>.</p>
        
        <div class="footer">
          <p>If you're having trouble with the button above, copy and paste this URL into your browser:</p>
          <p class="url">${data.resetUrl}</p>
        </div>
      </div>
    </body>
    </html>
  `,

  welcome: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; }
        .button { 
          display: inline-block; 
          background: #0f766e;
          color: white; 
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0; 
        }
        .capitalize { 
          text-transform: capitalize; 
        }
        a.button { 
          color: white; 
        }
        .footer { 
          margin-top: 30px; 
          padding-top: 20px; 
          border-top: 1px solid #eee; 
          color: #666; 
          font-size: 14px; 
        }
        .url { 
          word-break: break-all; 
          color: #0070f3; 
          font-size: 14px; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Simple HR</h1>
        </div>
        
        <p>Hello <strong class="capitalize">${data.name}</strong>,</p>
        
        <p>Thank you for joining our platform. We're excited to have you on board!</p>
        
        <div style="text-align: center;">
          <a href="${data.loginUrl}" class="button">Login To Simple HR</a>
        </div>
        
        <p>This account was created by RallyTrade Admin.</p>
        
        <p>Your Username is <strong>${data.username}</strong></p>
        <p>Your Password is <strong>${data.password}</strong></p>
        
        <div class="footer">
          <p>If you're having trouble with the button above, copy and paste this URL into your browser:</p>
          <p class="url">${data.loginUrl}</p>
        </div>
      </div>
    </body>
    </html>
  `,

  reliefOfficer: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; }
        .button { 
          display: inline-block; 
          background: #0f766e;
          color: white; 
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0; 
        }
        a.button { color: white; }
        .footer { 
          margin-top: 30px; 
          padding-top: 20px; 
          border-top: 1px solid #eee; 
          color: #666; 
          font-size: 14px; 
        }
        .url { 
          word-break: break-all; 
          color: #0070f3; 
          font-size: 14px; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Relief Officer Notification</h1>
        </div>
        
        <p>Hello <strong>${data.name}</strong>,</p>
        
        <p>
          You have been appointed as the <strong>Relief Officer</strong> for 
          <strong>${data.employeeName}</strong>. There is a pending leave request that requires 
          your action. Please log in to Simple HR to review and approve or decline the request.
        </p>

        <div style="text-align: center;">
          <a href="${data.loginUrl}" class="button">Login to Simple HR</a>
        </div>

        <div class="footer">
          <p>If the button above does not work, copy and paste this URL into your browser:</p>
          <p class="url">${data.loginUrl}</p>
        </div>
      </div>
    </body>
    </html>
`,

  leaveDeclinedEmployee: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; }
        .highlight { color: #b91c1c; font-weight: bold; }
        .footer { 
          margin-top: 30px; 
          padding-top: 20px; 
          border-top: 1px solid #eee; 
          color: #666; 
          font-size: 14px; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Leave Request Declined</h1>
        </div>

        <p>Hello,</p>

        <p>
          This is to notify you that the leave request submitted by 
          <strong>${data.employeeName}</strong> for the period of 
          <strong>${data.startDate}</strong> to 
          <strong>${data.endDate}</strong> has been 
          <span class="highlight">declined</span> by the assigned ${data.who} Officer 
          <strong>${data.reliefOfficerName}</strong>.
        </p>

        <p><strong>Reason for Decline:</strong></p>
        <p>${data.declineReason}</p>

        <p>
          If further action is required, the manager 
          <strong>${data.managerName}</strong> may follow up or provide additional guidance.
        </p>

        <div class="footer">
          <p>This is an automated message from Simple HR.</p>
        </div>
      </div>
    </body>
    </html>
`,

  leaveDeclinedEmployeeOnly: (data) => `
    <!DOCTYPE html>
    <html>        
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; }
        .highlight { color: #b91c1c; font-weight: bold; }
        .footer { 
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Leave Request Declined</h1>
        </div>
        <p>Hello, ${data.employeeName}</p>

        <p>
          This is to notify you that your leave request for the period of 
          <strong>${data.startDate}</strong> to 
          <strong>${data.endDate}</strong> has been 
          <span class="highlight">declined</span> by your ${data.role}.
        </p>
        <p><strong>Reason for Decline:</strong></p>
        <p>${data.declineReason}</p>  
        <div class="footer">
          <p>This is an automated message from Simple HR.</p>
        </div>
      </div>
    </body>   
    </html>
`,

  manager: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; }
        .highlight { color: #b91c1c; font-weight: bold; }
          .button {
          display: inline-block;
          background: #0f766e;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        a.button { color: white; }
        .footer { 
          margin-top: 30px; 
          padding-top: 20px; 
          border-top: 1px solid #eee; 
          color: #666; 
          font-size: 14px; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Leave Approval Notification</h1>
        </div>

        <p>Hello <strong>${data.name}</strong>,</p>
        
        <p>
          There is a pending leave request that requires 
          your action for <strong>${data.employeeName}</strong>. Please log in to Simple HR to review and approve or decline the request.
        </p>

        <div style="text-align: center;">
          <a href="${data.loginUrl}" class="button">Login to Simple HR</a>
        </div>

        <div class="footer">
          <p>If the button above does not work, copy and paste this URL into your browser:</p>
          <p class="url">${data.loginUrl}</p>
        </div>
      </div>
    </body>
    </html>
`,

  hr: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; }
        .highlight { color: #b91c1c; font-weight: bold; }
          .button {
          display: inline-block;
          background: #0f766e;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        a.button { color: white; }
        .footer { 
          margin-top: 30px; 
          padding-top: 20px; 
          border-top: 1px solid #eee; 
          color: #666; 
          font-size: 14px; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>HR Leave Approval Notification</h1>
        </div>

        <p>Hello <strong>${data.name}</strong>,</p>
        
        <p>
          There is a pending leave request that requires 
          your action for <strong>${data.employeeName}</strong>. Please log in to Simple HR to review and approve or decline the request.
        </p>

        <div style="text-align: center;">
          <a href="${data.loginUrl}" class="button">Login to Simple HR</a>
        </div>

        <div class="footer">
          <p>If the button above does not work, copy and paste this URL into your browser:</p>
          <p class="url">${data.loginUrl}</p>
        </div>
      </div>
    </body>
    </html>
`,

  leaveApprovedAll: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; }
        .footer { 
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Leave Request Approved</h1>
        </div>

        <p>Hello ${data.employeeName} and ${data.reliefOfficerName},</p>

        <p>
          This is to inform you that the leave request for 
          <strong>${data.employeeName}</strong>, covering the period from
          <strong>${data.startDate}</strong> to 
          <strong>${data.endDate}</strong>, has been 
          <span style="color: #16a34a; font-weight: bold;">approved</span>.
        </p>

        <p>
          ${data.reliefOfficerName}, please take note that you will be the assigned 
          relief officer during this period.
        </p>

        <div class="footer">
          <p>This is an automated message from Simple HR.</p>
        </div>
      </div>
    </body>
    </html>
`,

  getBirthdayTemplate: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; }
        .footer { 
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎂 Birthday Reminder</h1>
        </div>

        <p>Hello HR,</p>

        <p>
          This is a reminder that 
          <strong>${data.employeeName}</strong> from the 
          <strong>${data.department}</strong> department has a birthday coming up!
        </p>

        <p>
          <strong>Birthday:</strong> ${data.birthdayDate}
        </p>

        <p>
          Please consider sending birthday wishes to help make their day special.
        </p>

        <div class="footer">
          <p>This is an automated message from Simple HR.</p>
        </div>
      </div>
    </body>
    </html>
  `,

};