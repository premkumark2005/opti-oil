import nodemailer from 'nodemailer';
import { Logger } from './logger.js';

/**
 * Email Service Utility
 * Handles all email operations using Nodemailer and Gmail SMTP
 */

// Create reusable transporter
let transporter = null;

/**
 * Initialize email transporter with Gmail SMTP
 */
const createTransporter = () => {
  if (transporter) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000,
    socketTimeout: 15000
  });

  // Verify transporter configuration
  transporter.verify((error, success) => {
    if (error) {
      Logger.error('Email transporter verification failed:', error);
    } else {
      Logger.info('✅ Email service is ready to send messages');
    }
  });

  return transporter;
};

/**
 * Send email function
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @param {string} options.from - Sender email (optional, uses default)
 * @returns {Promise<Object>} - Email send result with success flag
 */
export const sendEmail = async (options) => {
  try {
    // Validate required fields
    if (!options.to || !options.subject) {
      Logger.warn('Email sending failed: Missing required fields (to, subject)');
      return {
        success: false,
        error: 'Missing required fields: to and subject are required',
        messageId: null
      };
    }

    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      Logger.warn('Email service not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env file');
      return {
        success: false,
        error: 'Email service not configured',
        messageId: null
      };
    }

    const emailTransporter = createTransporter();

    const mailOptions = {
      from: options.from || `"${process.env.EMAIL_FROM_NAME || 'Opti-Oil'}" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text || '',
      html: options.html || options.text || ''
    };

    const info = await emailTransporter.sendMail(mailOptions);
    
    Logger.info(`✉️ Email sent successfully to ${options.to}: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully',
      error: null
    };
  } catch (error) {
    // Log error but don't crash the server
    Logger.error(`❌ Failed to send email to ${options.to}:`, error.message);
    return {
      success: false,
      error: error.message || 'Failed to send email',
      messageId: null
    };
  }
};

/**
 * Send welcome email to new wholesaler
 * @param {string} email - Wholesaler email
 * @param {string} name - Wholesaler name
 * @returns {Promise<Object>} - Result object with success flag
 */
export const sendWelcomeEmail = async (email, name) => {
  const subject = 'Welcome to Opti-Oil - Registration Successful';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Welcome to Opti-Oil! 🎉</h2>
      <p>Dear ${name},</p>
      <p>Thank you for registering with Opti-Oil. Your account has been created successfully.</p>
      <p><strong>Account Status:</strong> Pending Admin Approval</p>
      <p>Your account is currently under review by our admin team. You will receive another email once your account has been approved, after which you can log in and start placing orders.</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>What's Next?</strong></p>
        <ul style="margin: 10px 0;">
          <li>Wait for admin approval (usually within 24-48 hours)</li>
          <li>You'll receive a confirmation email once approved</li>
          <li>Then you can log in and browse our products</li>
        </ul>
      </div>
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
      <p>Best regards,<br><strong>Opti-Oil Team</strong></p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #999;">This is an automated message, please do not reply to this email.</p>
    </div>
  `;
  
  const result = await sendEmail({ to: email, subject, html });
  if (!result.success) {
    Logger.warn(`Failed to send welcome email to ${email}: ${result.error}`);
  }
  return result;
};

/**
 * Send account approval email
 * @param {string} email - Wholesaler email
 * @param {string} name - Wholesaler name
 * @returns {Promise<Object>} - Result object with success flag
 */
export const sendAccountApprovalEmail = async (email, name) => {
  const subject = 'Account Approved - Opti-Oil';
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Account Approved</h1>
      </div>
      
      <!-- Body -->
      <div style="background-color: #f8f9fa; padding: 40px 30px; border-radius: 0 0 10px 10px;">
        <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Dear <strong>${name}</strong>,
        </p>
        
        <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
          We are pleased to inform you that your wholesaler account with <strong>Opti-Oil</strong> has been approved.
        </p>
        
        <!-- Approval Status Box -->
        <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 30px 0; border-radius: 5px;">
          <p style="color: #155724; font-size: 18px; font-weight: 600; margin: 0;">
            ✓ Your account is now active
          </p>
        </div>
        
        <!-- Login Instructions -->
        <div style="background-color: #ffffff; padding: 25px; margin: 25px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #333333; font-size: 18px; margin-top: 0; margin-bottom: 15px;">Login Instructions:</h3>
          <ol style="color: #555555; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>Visit our platform: <strong>${process.env.FRONTEND_URL || 'http://localhost:3000'}</strong></li>
            <li>Click on <strong>"Login"</strong> button</li>
            <li>Enter your registered email: <strong>${email}</strong></li>
            <li>Enter your password</li>
            <li>Start browsing products and placing orders</li>
          </ol>
        </div>
        
        <!-- What You Can Do -->
        <h3 style="color: #333333; font-size: 18px; margin-top: 30px; margin-bottom: 15px;">What You Can Do Now:</h3>
        <ul style="color: #555555; font-size: 15px; line-height: 1.8; margin: 0 0 25px 0; padding-left: 20px;">
          <li>Browse our complete product catalog</li>
          <li>Place bulk orders for your business</li>
          <li>Track order status in real-time</li>
          <li>View order history and invoices</li>
          <li>Update your business profile</li>
        </ul>
        
        <!-- Support Section -->
        <div style="background-color: #e7f3ff; padding: 20px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #0066cc;">
          <p style="color: #004085; font-size: 14px; margin: 0; line-height: 1.6;">
            <strong>Need Help?</strong><br>
            If you have any questions or need assistance getting started, please don't hesitate to contact our support team.
          </p>
        </div>
        
        <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-top: 30px;">
          We look forward to a successful business relationship with you.
        </p>
        
        <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 0;">
          Best regards,<br>
          <strong style="color: #667eea;">Opti-Oil Team</strong>
        </p>
      </div>
      
      <!-- Footer -->
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
        <p style="color: #999999; font-size: 12px; margin: 5px 0;">
          This is an automated message. Please do not reply to this email.
        </p>
        <p style="color: #999999; font-size: 12px; margin: 5px 0;">
          © ${new Date().getFullYear()} Opti-Oil. All rights reserved.
        </p>
      </div>
    </div>
  `;
  
  const result = await sendEmail({ to: email, subject, html });
  if (!result.success) {
    Logger.warn(`Failed to send approval email to ${email}: ${result.error}`);
  }
  return result;
};

/**
 * Send account deactivation email
 * @param {string} email - Wholesaler email
 * @param {string} name - Wholesaler name
 * @returns {Promise<Object>} - Result object with success flag
 */
export const sendAccountDeactivationEmail = async (email, name) => {
  const subject = 'Opti-Oil Account Status Update';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e74c3c;">Account Status Update</h2>
      <p>Dear ${name},</p>
      <p>We regret to inform you that your Opti-Oil account has been deactivated by our admin team.</p>
      <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
        <p style="margin: 5px 0; color: #721c24;"><strong>Account Status:</strong> Inactive</p>
      </div>
      <p>You will not be able to log in or place new orders until your account is reactivated.</p>
      <p>If you believe this is a mistake or would like to discuss reactivation, please contact our support team.</p>
      <p>Best regards,<br><strong>Opti-Oil Team</strong></p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #999;">This is an automated message, please do not reply to this email.</p>
    </div>
  `;
  
  const result = await sendEmail({ to: email, subject, html });
  if (!result.success) {
    Logger.warn(`Failed to send deactivation email to ${email}: ${result.error}`);
  }
  return result;
};

/**
 * Send order confirmation email
 * @param {string} email - Customer email
 * @param {string} name - Customer name
 * @param {Object} order - Order details
 * @returns {Promise<Object>} - Result object with success flag
 */
export const sendOrderConfirmationEmail = async (email, name, order) => {
  const subject = `Order Confirmation - ${order.orderNumber}`;
  const itemsList = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product?.name || 'Product'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.unitPrice?.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.quantity * item.unitPrice)?.toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Order Received! 📦</h2>
      <p>Dear ${name},</p>
      <p>Thank you for your order. We have received your order and it is currently pending admin approval.</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #f39c12;">Pending Approval</span></p>
      </div>
      <h3 style="color: #2c3e50;">Order Details:</h3>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Product</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #dee2e6;">Quantity</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Unit Price</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 15px 10px; text-align: right; font-weight: bold;">Total Amount:</td>
            <td style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 18px; color: #27ae60;">$${order.totalAmount?.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      <p>You will receive another email once your order has been approved by our admin team.</p>
      <p>Best regards,<br><strong>Opti-Oil Team</strong></p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #999;">This is an automated message, please do not reply to this email.</p>
    </div>
  `;
  
  const result = await sendEmail({ to: email, subject, html });
  if (!result.success) {
    Logger.warn(`Failed to send order confirmation to ${email}: ${result.error}`);
  }
  return result;
};

/**
 * Send order approval email
 * @param {string} email - Customer email
 * @param {string} name - Customer name
 * @param {Object} order - Order details
 * @returns {Promise<Object>} - Result object with success flag
 */
export const sendOrderApprovalEmail = async (email, name, order) => {
  const subject = `Order Approved - ${order.orderNumber}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #27ae60;">Order Approved! ✅</h2>
      <p>Dear ${name},</p>
      <p>Great news! Your order has been approved and is now being processed.</p>
      <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
        <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #28a745;">Approved</span></p>
        <p style="margin: 5px 0;"><strong>Total Amount:</strong> $${order.totalAmount?.toFixed(2)}</p>
      </div>
      <p>Your order will be processed and shipped soon. You will receive updates as your order progresses.</p>
      <p>Best regards,<br><strong>Opti-Oil Team</strong></p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #999;">This is an automated message, please do not reply to this email.</p>
    </div>
  `;
  
  const result = await sendEmail({ to: email, subject, html });
  if (!result.success) {
    Logger.warn(`Failed to send order approval email to ${email}: ${result.error}`);
  }
  return result;
};

/**
 * Send order rejection email
 * @param {string} email - Customer email
 * @param {string} name - Customer name
 * @param {Object} order - Order details
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} - Result object with success flag
 */
export const sendOrderRejectionEmail = async (email, name, order, reason) => {
  const subject = `Order Update - ${order.orderNumber}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e74c3c;">Order Status Update</h2>
      <p>Dear ${name},</p>
      <p>We regret to inform you that your order could not be approved at this time.</p>
      <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
        <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #dc3545;">Rejected</span></p>
        <p style="margin: 5px 0;"><strong>Reason:</strong> ${reason || 'Not specified'}</p>
      </div>
      <p>If you have any questions or would like to place a new order, please contact our support team.</p>
      <p>Best regards,<br><strong>Opti-Oil Team</strong></p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #999;">This is an automated message, please do not reply to this email.</p>
    </div>
  `;
  
  const result = await sendEmail({ to: email, subject, html });
  if (!result.success) {
    Logger.warn(`Failed to send order rejection email to ${email}: ${result.error}`);
  }
  return result;
};

/**
 * Test email configuration
 * @param {string} testEmail - Email address to send test email
 * @returns {Promise<Object>} - Result object with success flag
 */
export const sendTestEmail = async (testEmail) => {
  const subject = 'Opti-Oil Email Service Test';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Email Service Test</h2>
      <p>This is a test email from Opti-Oil email service.</p>
      <p>If you received this email, your email configuration is working correctly! ✅</p>
      <p>Best regards,<br><strong>Opti-Oil Team</strong></p>
    </div>
  `;
  
  return sendEmail({ to: testEmail, subject, html });
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendAccountApprovalEmail,
  sendAccountDeactivationEmail,
  sendOrderConfirmationEmail,
  sendOrderApprovalEmail,
  sendOrderRejectionEmail,
  sendTestEmail
};
