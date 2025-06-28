// /**
//  * Email Service using Nodemailer
//  * Person Y Guide: This handles all email notifications for budget alerts
//  * Person X: This is like an automated email assistant that sends alerts
//  */

// const nodemailer = require('nodemailer');

// /**
//  * Person Y Tip: Create reusable transporter with your Gmail credentials
//  * This setup allows sending emails through Gmail SMTP
//  */
// const createEmailTransporter = () => {
//   return nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.EMAIL_USER, // Your Gmail: gbharathitrs@gmail.com
//       pass: process.env.EMAIL_PASS  // Your App Password: isvhhcmhhcnlqaaq
//     }
//   });
// };

// /**
//  * Send threshold warning email (25%, 50%, 75% usage)
//  */
// const sendThresholdAlert = async (budgetData, expenseData, thresholdPercentage) => {
//   try {
//     const transporter = createEmailTransporter();
    
//     const usagePercentage = ((budgetData.used_amount / budgetData.limit_amount) * 100).toFixed(1);
    
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: budgetData.email,
//       subject: `🚨 Budget Alert: ${budgetData.department} - ${budgetData.category} (${usagePercentage}% Used)`,
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
//             <h2>🚨 Budget Threshold Alert</h2>
//             <p>You have reached ${thresholdPercentage}% of your budget limit</p>
//           </div>
          
//           <div style="padding: 20px; background: #f8f9fa;">
//             <h3 style="color: #e74c3c;">Budget Details</h3>
//             <table style="width: 100%; border-collapse: collapse;">
//               <tr style="background: #fff;">
//                 <td style="padding: 10px; border: 1px solid #ddd;"><strong>Department:</strong></td>
//                 <td style="padding: 10px; border: 1px solid #ddd;">${budgetData.department}</td>
//               </tr>
//               <tr style="background: #f8f9fa;">
//                 <td style="padding: 10px; border: 1px solid #ddd;"><strong>Category:</strong></td>
//                 <td style="padding: 10px; border: 1px solid #ddd;">${budgetData.category}</td>
//               </tr>
//               <tr style="background: #fff;">
//                 <td style="padding: 10px; border: 1px solid #ddd;"><strong>Budget Limit:</strong></td>
//                 <td style="padding: 10px; border: 1px solid #ddd;">$${budgetData.limit_amount.toLocaleString()}</td>
//               </tr>
//               <tr style="background: #f8f9fa;">
//                 <td style="padding: 10px; border: 1px solid #ddd;"><strong>Amount Used:</strong></td>
//                 <td style="padding: 10px; border: 1px solid #ddd; color: #e74c3c;"><strong>$${budgetData.used_amount.toLocaleString()}</strong></td>
//               </tr>
//               <tr style="background: #fff;">
//                 <td style="padding: 10px; border: 1px solid #ddd;"><strong>Percentage Used:</strong></td>
//                 <td style="padding: 10px; border: 1px solid #ddd; color: #e74c3c;"><strong>${usagePercentage}%</strong></td>
//               </tr>
//               <tr style="background: #f8f9fa;">
//                 <td style="padding: 10px; border: 1px solid #ddd;"><strong>Remaining:</strong></td>
//                 <td style="padding: 10px; border: 1px solid #ddd;">$${(budgetData.limit_amount - budgetData.used_amount).toLocaleString()}</td>
//               </tr>
//             </table>
//           </div>
          
//           <div style="padding: 20px; background: #fff3cd; border-left: 5px solid #ffc107;">
//             <h4 style="color: #856404;">⚠️ Latest Expense</h4>
//             <p><strong>Amount:</strong> $${expenseData.amount.toLocaleString()}</p>
//             <p><strong>Description:</strong> ${expenseData.description}</p>
//             <p><strong>Vendor:</strong> ${expenseData.vendor_name || 'N/A'}</p>
//             <p><strong>Date:</strong> ${new Date(expenseData.date).toLocaleDateString()}</p>
//           </div>
          
//           <div style="padding: 20px; text-align: center; background: #f8f9fa;">
//             <p style="color: #6c757d;">Please review your spending and consider adjusting future expenses.</p>
//             <p style="font-size: 12px; color: #adb5bd;">This is an automated alert from Smart Budget Enforcer</p>
//           </div>
//         </div>
//       `
//     };

//     const result = await transporter.sendMail(mailOptions);
//     console.log('Threshold alert email sent:', result.messageId);
//     return { success: true, messageId: result.messageId };

//   } catch (error) {
//     console.error('Error sending threshold alert email:', error);
//     return { success: false, error: error.message };
//   }
// };

// /**
//  * Send budget exceeded email with AI recommendations
//  */
// const sendBudgetExceededAlert = async (budgetData, expenseData, recommendations) => {
//   try {
//     const transporter = createEmailTransporter();
    
//     const overageAmount = budgetData.used_amount - budgetData.limit_amount;
//     const overagePercentage = ((overageAmount / budgetData.limit_amount) * 100).toFixed(1);
    
//     // Generate recommendations HTML
//     const recommendationsHtml = recommendations.map((rec, index) => `
//       <div style="margin: 10px 0; padding: 15px; background: #f8f9fa; border-left: 4px solid #28a745; border-radius: 4px;">
//         <h5 style="color: #28a745; margin: 0 0 5px 0;">${index + 1}. ${rec.title}</h5>
//         <p style="margin: 0; color: #6c757d;">${rec.description}</p>
//         ${rec.estimated_savings > 0 ? `<p style="margin: 5px 0 0 0; color: #28a745;"><strong>Potential Savings: $${rec.estimated_savings.toLocaleString()}</strong></p>` : ''}
//       </div>
//     `).join('');
    
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: budgetData.email,
//       subject: `🚫 BUDGET EXCEEDED: ${budgetData.department} - ${budgetData.category} (+${overagePercentage}%)`,
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 20px; text-align: center;">
//             <h2>🚫 BUDGET LIMIT EXCEEDED</h2>
//             <p>Immediate action required - Budget overspent by $${overageAmount.toLocaleString()}</p>
//           </div>
          
//           <div style="padding: 20px; background: #f8d7da; border: 1px solid #f5c6cb;">
//             <h3 style="color: #721c24;">⚠️ Overage Details</h3>
//             <table style="width: 100%; border-collapse: collapse;">
//               <tr style="background: #fff;">
//                 <td style="padding: 10px; border: 1px solid #ddd;"><strong>Department:</strong></td>
//                 <td style="padding: 10px; border: 1px solid #ddd;">${budgetData.department}</td>
//               </tr>
//               <tr style="background: #f8f9fa;">
//                 <td style="padding: 10px; border: 1px solid #ddd;"><strong>Category:</strong></td>
//                 <td style="padding: 10px; border: 1px solid #ddd;">${budgetData.category}</td>
//               </tr>
//               <tr style="background: #fff;">
//                 <td style="padding: 10px; border: 1px solid #ddd;"><strong>Budget Limit:</strong></td>
//                 <td style="padding: 10px; border: 1px solid #ddd;">$${budgetData.limit_amount.toLocaleString()}</td>
//               </tr>
//               <tr style="background: #f8d7da;">
//                 <td style="padding: 10px; border: 1px solid #ddd;"><strong>Total Spent:</strong></td>
//                 <td style="padding: 10px; border: 1px solid #ddd; color: #721c24;"><strong>$${budgetData.used_amount.toLocaleString()}</strong></td>
//               </tr>
//               <tr style="background: #f8d7da;">
//                 <td style="padding: 10px; border: 1px solid #ddd;"><strong>Amount Over:</strong></td>
//                 <td style="padding: 10px; border: 1px solid #ddd; color: #721c24;"><strong>$${overageAmount.toLocaleString()} (+${overagePercentage}%)</strong></td>
//               </tr>
//             </table>
//           </div>
          
//           <div style="padding: 20px; background: #fff3cd; border-left: 5px solid #ffc107;">
//             <h4 style="color: #856404;">💳 Triggering Expense</h4>
//             <p><strong>Amount:</strong> $${expenseData.amount.toLocaleString()}</p>
//             <p><strong>Description:</strong> ${expenseData.description}</p>
//             <p><strong>Vendor:</strong> ${expenseData.vendor_name || 'N/A'}</p>
//             <p><strong>Date:</strong> ${new Date(expenseData.date).toLocaleDateString()}</p>
//           </div>
          
//           <div style="padding: 20px; background: #d1ecf1; border-left: 5px solid #17a2b8;">
//             <h4 style="color: #0c5460;">🤖 AI Recommendations</h4>
//             ${recommendationsHtml}
//           </div>
          
//           <div style="padding: 20px; text-align: center; background: #f8f9fa;">
//             <p style="color: #dc3545; font-weight: bold;">IMMEDIATE ACTION REQUIRED</p>
//             <p style="color: #6c757d;">Please review the recommendations above and take corrective action.</p>
//             <p style="font-size: 12px; color: #adb5bd;">This is an automated alert from Smart Budget Enforcer</p>
//           </div>
//         </div>
//       `
//     };

//     const result = await transporter.sendMail(mailOptions);
//     console.log('Budget exceeded alert email sent:', result.messageId);
//     return { success: true, messageId: result.messageId };

//   } catch (error) {
//     console.error('Error sending budget exceeded alert email:', error);
//     return { success: false, error: error.message };
//   }
// };

// /**
//  * Send general notification email
//  */
// const sendNotificationEmail = async (to, subject, message) => {
//   try {
//     const transporter = createEmailTransporter();
    
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: to,
//       subject: subject,
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
//             <h2>💰 Smart Budget Enforcer</h2>
//           </div>
//           <div style="padding: 20px; background: #fff;">
//             ${message}
//           </div>
//           <div style="padding: 20px; text-align: center; background: #f8f9fa;">
//             <p style="font-size: 12px; color: #adb5bd;">This is an automated notification from Smart Budget Enforcer</p>
//           </div>
//         </div>
//       `
//     };

//     const result = await transporter.sendMail(mailOptions);
//     console.log('Notification email sent:', result.messageId);
//     return { success: true, messageId: result.messageId };

//   } catch (error) {
//     console.error('Error sending notification email:', error);
//     return { success: false, error: error.message };
//   }
// };

// module.exports = {
//   sendThresholdAlert,
//   sendBudgetExceededAlert,
//   sendNotificationEmail
// };



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
  return nodemailer.createTransporter({
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

/**
 * Send email notification for individual high-priority recommendations
 */
const sendRecommendationEmail = async (user, recommendation, budget, breachSummary) => {
  try {
    const transporter = createEmailTransporter();
    
    const subject = `🧠 AI Budget Recommendation: ${recommendation.title}`;
    
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
          <h2>🧠 AI Budget Recommendation</h2>
          <p>Smart Budget Enforcer has generated a recommendation for your review</p>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">${recommendation.title}</h3>
            <p style="color: #666; line-height: 1.6;">${recommendation.description}</p>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h4 style="color: #1976d2; margin: 0 0 10px 0;">💰 Financial Impact</h4>
              <p style="margin: 0; color: #333;">
                <strong>Estimated Savings:</strong> $${recommendation.estimated_savings.toLocaleString()}<br>
                <strong>Priority Level:</strong> ${recommendation.priority === 1 ? 'Critical' : recommendation.priority === 2 ? 'High' : 'Medium'}<br>
                <strong>Recommendation Type:</strong> ${recommendation.type.replace('_', ' ').toUpperCase()}
              </p>
            </div>
            
            ${budget ? `
            <div style="background: #fff3e0; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h4 style="color: #f57c00; margin: 0 0 10px 0;">📊 Related Budget</h4>
              <p style="margin: 0; color: #333;">
                <strong>Budget:</strong> ${budget.name}<br>
                <strong>Department:</strong> ${budget.department}<br>
                <strong>Category:</strong> ${budget.category}<br>
                <strong>Current Usage:</strong> $${budget.used_amount.toLocaleString()} / $${budget.limit_amount.toLocaleString()} (${((budget.used_amount / budget.limit_amount) * 100).toFixed(1)}%)
              </p>
            </div>
            ` : ''}
            
            ${breachSummary && breachSummary.total_breaches > 0 ? `
            <div style="background: #ffebee; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h4 style="color: #d32f2f; margin: 0 0 10px 0;">🚨 Breach Context</h4>
              <p style="margin: 0; color: #333;">
                <strong>Total Breaches:</strong> ${breachSummary.total_breaches}<br>
                <strong>Departments Affected:</strong> ${breachSummary.departments_affected.join(', ')}<br>
                <strong>Total Overage:</strong> $${breachSummary.total_overage.toLocaleString()}
              </p>
            </div>
            ` : ''}
          </div>
          
          <div style="text-align: center; padding: 20px;">
            <p style="color: #666; margin-bottom: 20px;">
              Review this recommendation in your Smart Budget Enforcer dashboard and take appropriate action.
            </p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/alerts" 
               style="background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View in Dashboard
            </a>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">Smart Budget Enforcer - AI-Powered Budget Management</p>
          <p style="margin: 5px 0 0 0;">Generated at ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recommendation.type === 'approval_request' ? 'finance@company.com' : user.email,
      subject: subject,
      html: emailBody
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Recommendation email sent:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Error sending recommendation email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send summary email for multiple recommendations
 */
const sendRecommendationSummaryEmail = async (user, recommendationCount, breachSummary, budgetSummary) => {
  try {
    const transporter = createEmailTransporter();
    
    const subject = `📊 AI Budget Analysis: ${recommendationCount} New Recommendations`;
    
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
          <h2>📊 AI Budget Analysis Complete</h2>
          <p>Smart Budget Enforcer has analyzed your budget and generated ${recommendationCount} recommendations</p>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Analysis Summary</h3>
            
            ${budgetSummary ? `
            <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h4 style="color: #2e7d32; margin: 0 0 10px 0;">💰 Budget Overview</h4>
              <p style="margin: 0; color: #333;">
                <strong>Total Allocated:</strong> $${budgetSummary.total_allocated?.toLocaleString() || 0}<br>
                <strong>Overall Usage:</strong> ${budgetSummary.overall_usage_percentage?.toFixed(1) || 0}%<br>
                <strong>Budgets at Risk:</strong> ${budgetSummary.budgets_at_risk || 0}<br>
                <strong>Available for Reallocation:</strong> $${budgetSummary.available_for_reallocation?.toLocaleString() || 0}
              </p>
            </div>
            ` : ''}
            
            ${breachSummary && breachSummary.total_breaches > 0 ? `
            <div style="background: #ffebee; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h4 style="color: #d32f2f; margin: 0 0 10px 0;">🚨 Breach Analysis</h4>
              <p style="margin: 0; color: #333;">
                <strong>Total Breaches:</strong> ${breachSummary.total_breaches}<br>
                <strong>Departments Affected:</strong> ${breachSummary.departments_affected?.join(', ') || 'None'}<br>
                <strong>Total Overage:</strong> $${breachSummary.total_overage?.toLocaleString() || 0}
              </p>
            </div>
            ` : ''}
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h4 style="color: #1976d2; margin: 0 0 10px 0;">🧠 AI Recommendations</h4>
              <p style="margin: 0; color: #333;">
                <strong>Total Generated:</strong> ${recommendationCount}<br>
                <strong>Status:</strong> All recommendations are pending your review<br>
                <strong>Next Action:</strong> Review and implement suitable recommendations
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px;">
            <p style="color: #666; margin-bottom: 20px;">
              View all recommendations in your dashboard and take action to optimize your budget.
            </p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/alerts" 
               style="background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View All Recommendations
            </a>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">Smart Budget Enforcer - AI-Powered Budget Management</p>
          <p style="margin: 5px 0 0 0;">Analysis completed at ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: subject,
      html: emailBody
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Summary email sent:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Error sending recommendation summary email:', error);
    return { success: false, error: error.message };
  }
};

// ✅ COMPLETE MODULE EXPORTS - All functions properly defined
module.exports = {
  sendThresholdAlert,
  sendBudgetExceededAlert,
  sendNotificationEmail,
  sendRecommendationEmail,
  sendRecommendationSummaryEmail
};