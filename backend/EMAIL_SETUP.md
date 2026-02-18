# Email Service Setup Guide

## Gmail SMTP Configuration

### Prerequisites
- A Gmail account
- Gmail App Password (required for security)

### Step 1: Enable 2-Step Verification
1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security**
3. Enable **2-Step Verification** if not already enabled

### Step 2: Generate App Password
1. Go to your Google Account Security page
2. Under "Signing in to Google", select **App passwords**
   - Or visit directly: https://myaccount.google.com/apppasswords
3. Click on **Select app** and choose "Mail" or "Other (Custom name)"
4. Click on **Select device** and choose "Other (Custom name)" and enter "Opti-Oil Backend"
5. Click **Generate**
6. Copy the 16-character app password (without spaces)

### Step 3: Configure Environment Variables
Add the following to your `.env` file:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx  # 16-character app password
EMAIL_FROM_NAME=Opti-Oil
```

**Important:** 
- Use the App Password, NOT your regular Gmail password
- Never commit the `.env` file to version control
- Keep your App Password secure

### Step 4: Test Email Configuration
Use the test endpoint to verify your configuration:

```bash
# Send a test email
POST http://localhost:5000/api/test/email
Content-Type: application/json

{
  "email": "recipient@example.com"
}
```

## Available Email Functions

The email service provides the following functions:

1. **sendWelcomeEmail** - Sent when a wholesaler registers
2. **sendAccountApprovalEmail** - Sent when admin approves an account
3. **sendAccountDeactivationEmail** - Sent when admin deactivates an account
4. **sendOrderConfirmationEmail** - Sent when a wholesaler places an order
5. **sendOrderApprovalEmail** - Sent when admin approves an order
6. **sendOrderRejectionEmail** - Sent when admin rejects an order
7. **sendTestEmail** - For testing email configuration

## Usage Example

```javascript
import { sendWelcomeEmail } from '../utils/emailService.js';

// Send welcome email
await sendWelcomeEmail(user.email, user.name);
```

## Troubleshooting

### Common Issues

1. **"Invalid login" error**
   - Make sure you're using an App Password, not your Gmail password
   - Verify 2-Step Verification is enabled

2. **"Connection timeout" error**
   - Check your internet connection
   - Verify firewall settings allow outbound SMTP connections
   - Try using port 465 with secure: true

3. **Emails not being received**
   - Check spam/junk folder
   - Verify the recipient email address is correct
   - Check Gmail's "Sent" folder to confirm delivery

4. **Rate limiting**
   - Gmail has sending limits (500 emails/day for free accounts)
   - Consider upgrading to Google Workspace for higher limits

### Alternative SMTP Configuration

If you want to use a different SMTP provider (SendGrid, Mailgun, etc.), update the transporter configuration in `emailService.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.yourprovider.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

## Security Best Practices

1. ✅ Use App Passwords instead of account passwords
2. ✅ Store credentials in environment variables
3. ✅ Never commit `.env` files to Git
4. ✅ Rotate App Passwords periodically
5. ✅ Use different App Passwords for different applications
6. ✅ Revoke unused App Passwords

## Production Recommendations

For production environments, consider:
- **Google Workspace** for higher sending limits
- **SendGrid** for transactional emails
- **Amazon SES** for cost-effective bulk emails
- **Mailgun** for advanced email features
- Implement email queuing (Bull, Bee-Queue) for better performance
- Add retry logic for failed emails
- Monitor email delivery rates

## Support

If you encounter issues with email configuration:
1. Check the backend logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with the `/api/test/email` endpoint
4. Consult the official Nodemailer documentation: https://nodemailer.com/
