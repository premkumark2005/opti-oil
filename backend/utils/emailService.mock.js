/**
 * Mock Email Service for Development
 * Use this when SMTP ports are blocked on local network
 * Logs emails to console instead of sending them
 */

import { Logger } from './logger.js';

/**
 * Mock send email function
 */
export const sendEmail = async (options) => {
  const { to, subject, html } = options;
  
  Logger.info('📧 [MOCK EMAIL] Would send email:');
  console.log('\n' + '═'.repeat(60));
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log('═'.repeat(60));
  console.log('HTML Content:');
  console.log(html.substring(0, 200) + '...');
  console.log('═'.repeat(60) + '\n');
  
  return {
    success: true,
    messageId: `mock-${Date.now()}@opti-oil.local`,
    error: null
  };
};

// Mock template functions
export const sendWelcomeEmail = async (email, name) => {
  Logger.info(`📧 [MOCK] Welcome email to ${name} (${email})`);
  return { success: true, messageId: `mock-welcome-${Date.now()}`, error: null };
};

export const sendAccountApprovalEmail = async (email, name) => {
  Logger.info(`📧 [MOCK] Approval email to ${name} (${email})`);
  return { success: true, messageId: `mock-approval-${Date.now()}`, error: null };
};

export const sendAccountDeactivationEmail = async (email, name) => {
  Logger.info(`📧 [MOCK] Deactivation email to ${name} (${email})`);
  return { success: true, messageId: `mock-deactivation-${Date.now()}`, error: null };
};

export const sendOrderConfirmationEmail = async (email, name, order) => {
  Logger.info(`📧 [MOCK] Order confirmation to ${name} (${email}) - Order #${order.orderNumber}`);
  return { success: true, messageId: `mock-order-${Date.now()}`, error: null };
};

export const sendOrderApprovalEmail = async (email, name, order) => {
  Logger.info(`📧 [MOCK] Order approval to ${name} (${email}) - Order #${order.orderNumber}`);
  return { success: true, messageId: `mock-order-approval-${Date.now()}`, error: null };
};

export const sendOrderRejectionEmail = async (email, name, order, reason) => {
  Logger.info(`📧 [MOCK] Order rejection to ${name} (${email}) - Order #${order.orderNumber} - Reason: ${reason}`);
  return { success: true, messageId: `mock-order-rejection-${Date.now()}`, error: null };
};

export const sendTestEmail = async (testEmail) => {
  Logger.info(`📧 [MOCK] Test email to ${testEmail}`);
  return { success: true, messageId: `mock-test-${Date.now()}`, error: null };
};

Logger.warn('⚠️  Using MOCK email service - emails will be logged but not sent');
Logger.info('💡 To use real emails, fix SMTP connectivity or deploy to production');
