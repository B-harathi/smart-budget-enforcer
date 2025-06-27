/**
 * Email Service using Nodemailer
 * Person Y Guide: This handles all email notifications for budget alerts
 * Person X: This is like an automated email assistant that sends alerts
 */

const nodemailer = require('nodemailer');

/**
 * Person Y Tip: Create reusable transporter with your Gmail credentials
 * This setup allows sending emails through Gmail SMTP
 */
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail: gbharathitrs@gmail.com
      pass: process.env.EMAIL_PASS  // Your App Password: isvhhcmhhcnlqaaq
    }
  });
};

/**
 * Send threshold warning email (25%, 50%, 75% usage)
 */
const sendThresholdAlert = async (budgetData, expenseData, thresholdPercentage) => {
  try {
    const transporter = createEmailTransporter();
    
    const usagePercentage = ((budgetData.used_amount / budgetData.limit_amount) * 100).toFixed(1);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: budgetData.email,
      subject: `🚨 Budget Alert: ${budgetData.department} - ${budgetData.category} (${usagePercentage}% Used)`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h2>🚨 Budget Threshold Alert</h2>
            <p>You have reached ${thresholdPercentage}% of your budget limit</p>
          </div>
          
          <div style="padding: 20px; background: #f8f9fa;">
            <h3 style="color: #e74c3c;">Budget Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="background: #fff;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Department:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${budgetData.department}</td>
              </tr>
              <tr style="background: #f8f9fa;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Category:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${budgetData.category}</td>
              </tr>
              <tr style="background: #fff;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Budget Limit:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">$${budgetData.limit_amount.toLocaleString()}</td>
              </tr>
              <tr style="background: #f8f9fa;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Amount Used:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd; color: #e74c3c;"><strong>$${budgetData.used_amount.toLocaleString()}</strong></td>
              </tr>
              <tr style="background: #fff;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Percentage Used:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd; color: #e74c3c;"><strong>${usagePercentage}%</strong></td>
              </tr>
              <tr style="background: #f8f9fa;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Remaining:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">$${(budgetData.limit_amount - budgetData.used_amount).toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          <div style="padding: 20px; background: #fff3cd; border-left: 5px solid #ffc107;">
            <h4 style="color: #856404;">⚠️ Latest Expense</h4>
            <p><strong>Amount:</strong> $${expenseData.amount.toLocaleString()}</p>
            <p><strong>Description:</strong> ${expenseData.description}</p>
            <p><strong>Vendor:</strong> ${expenseData.vendor_name || 'N/A'}</p>
            <p><strong>Date:</strong> ${new Date(expenseData.date).toLocaleDateString()}</p>
          </div>
          
          <div style="padding: 20px; text-align: center; background: #f8f9fa;">
            <p style="color: #6c757d;">Please review your spending and consider adjusting future expenses.</p>
            <p style="font-size: 12px; color: #adb5bd;">This is an automated alert from Smart Budget Enforcer</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Threshold alert email sent:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending threshold alert email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send budget exceeded email with AI recommendations
 */
const sendBudgetExceededAlert = async (budgetData, expenseData, recommendations) => {
  try {
    const transporter = createEmailTransporter();
    
    const overageAmount = budgetData.used_amount - budgetData.limit_amount;
    const overagePercentage = ((overageAmount / budgetData.limit_amount) * 100).toFixed(1);
    
    // Generate recommendations HTML
    const recommendationsHtml = recommendations.map((rec, index) => `
      <div style="margin: 10px 0; padding: 15px; background: #f8f9fa; border-left: 4px solid #28a745; border-radius: 4px;">
        <h5 style="color: #28a745; margin: 0 0 5px 0;">${index + 1}. ${rec.title}</h5>
        <p style="margin: 0; color: #6c757d;">${rec.description}</p>
        ${rec.estimated_savings > 0 ? `<p style="margin: 5px 0 0 0; color: #28a745;"><strong>Potential Savings: $${rec.estimated_savings.toLocaleString()}</strong></p>` : ''}
      </div>
    `).join('');
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: budgetData.email,
      subject: `🚫 BUDGET EXCEEDED: ${budgetData.department} - ${budgetData.category} (+${overagePercentage}%)`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 20px; text-align: center;">
            <h2>🚫 BUDGET LIMIT EXCEEDED</h2>
            <p>Immediate action required - Budget overspent by $${overageAmount.toLocaleString()}</p>
          </div>
          
          <div style="padding: 20px; background: #f8d7da; border: 1px solid #f5c6cb;">
            <h3 style="color: #721c24;">⚠️ Overage Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="background: #fff;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Department:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${budgetData.department}</td>
              </tr>
              <tr style="background: #f8f9fa;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Category:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${budgetData.category}</td>
              </tr>
              <tr style="background: #fff;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Budget Limit:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">$${budgetData.limit_amount.toLocaleString()}</td>
              </tr>
              <tr style="background: #f8d7da;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Total Spent:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd; color: #721c24;"><strong>$${budgetData.used_amount.toLocaleString()}</strong></td>
              </tr>
              <tr style="background: #f8d7da;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Amount Over:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd; color: #721c24;"><strong>$${overageAmount.toLocaleString()} (+${overagePercentage}%)</strong></td>
              </tr>
            </table>
          </div>
          
          <div style="padding: 20px; background: #fff3cd; border-left: 5px solid #ffc107;">
            <h4 style="color: #856404;">💳 Triggering Expense</h4>
            <p><strong>Amount:</strong> $${expenseData.amount.toLocaleString()}</p>
            <p><strong>Description:</strong> ${expenseData.description}</p>
            <p><strong>Vendor:</strong> ${expenseData.vendor_name || 'N/A'}</p>
            <p><strong>Date:</strong> ${new Date(expenseData.date).toLocaleDateString()}</p>
          </div>
          
          <div style="padding: 20px; background: #d1ecf1; border-left: 5px solid #17a2b8;">
            <h4 style="color: #0c5460;">🤖 AI Recommendations</h4>
            ${recommendationsHtml}
          </div>
          
          <div style="padding: 20px; text-align: center; background: #f8f9fa;">
            <p style="color: #dc3545; font-weight: bold;">IMMEDIATE ACTION REQUIRED</p>
            <p style="color: #6c757d;">Please review the recommendations above and take corrective action.</p>
            <p style="font-size: 12px; color: #adb5bd;">This is an automated alert from Smart Budget Enforcer</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Budget exceeded alert email sent:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending budget exceeded alert email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send general notification email
 */
const sendNotificationEmail = async (to, subject, message) => {
  try {
    const transporter = createEmailTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h2>💰 Smart Budget Enforcer</h2>
          </div>
          <div style="padding: 20px; background: #fff;">
            ${message}
          </div>
          <div style="padding: 20px; text-align: center; background: #f8f9fa;">
            <p style="font-size: 12px; color: #adb5bd;">This is an automated notification from Smart Budget Enforcer</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Notification email sent:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending notification email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendThresholdAlert,
  sendBudgetExceededAlert,
  sendNotificationEmail
};