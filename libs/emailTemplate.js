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
};