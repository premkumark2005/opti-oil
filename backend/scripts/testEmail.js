import dotenv from 'dotenv';
import { sendEmail } from '../utils/emailService.js';
import { Logger } from '../utils/logger.js';

dotenv.config();

async function testEmail() {
  console.log('🔍 Testing email configuration...\n');
  
  // Check if credentials are set
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ Email credentials not found in .env file');
    process.exit(1);
  }

  console.log(`📧 Email User: ${process.env.EMAIL_USER}`);
  console.log(`📝 From Name: ${process.env.EMAIL_FROM_NAME || 'Opti-Oil'}\n`);

  // Send test email
  console.log('📤 Sending test email...\n');
  
  const result = await sendEmail({
    to: process.env.EMAIL_USER, // Send to yourself
    subject: 'Opti-Oil Email Test',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">✅ Email Configuration Test</h2>
        <p>Congratulations! Your Opti-Oil email system is working correctly.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>Configuration Details:</strong><br>
          Email: ${process.env.EMAIL_USER}<br>
          From Name: ${process.env.EMAIL_FROM_NAME || 'Opti-Oil'}<br>
          Environment: ${process.env.NODE_ENV}
        </div>
        <p>You can now send automated emails for:</p>
        <ul>
          <li>✅ Wholesaler registration approval</li>
          <li>✅ Order confirmations</li>
          <li>✅ Order status updates</li>
          <li>✅ Account notifications</li>
        </ul>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          This is an automated test email from Opti-Oil Inventory System
        </p>
      </div>
    `
  });

  if (result.success) {
    console.log('✅ Test email sent successfully!');
    console.log(`📬 Message ID: ${result.messageId}`);
    console.log(`\n📥 Check your inbox: ${process.env.EMAIL_USER}`);
  } else {
    console.error('❌ Failed to send test email');
    console.error(`Error: ${result.error}`);
  }

  process.exit(result.success ? 0 : 1);
}

testEmail();
