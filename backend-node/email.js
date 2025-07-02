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
//   // ✅ FIXED: Add debug logging to check environment variables
//   console.log('🔍 Email configuration debug:');
//   console.log('   EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
//   console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
  
//   if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
//     console.warn('⚠️ Email credentials not found. Email notifications will be logged instead of sent.');
//     return null;
//   }
  
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
//     console.log('📧 Attempting to send threshold alert email...');
//     console.log('📧 Budget data:', {
//       department: budgetData.department,
//       category: budgetData.category,
//       email: budgetData.email,
//       limit_amount: budgetData.limit_amount,
//       used_amount: budgetData.used_amount
//     });
    
//     const transporter = createEmailTransporter();
    
//     // If no email credentials, just log the alert
//     if (!transporter) {
//       const usagePercentage = ((budgetData.used_amount / budgetData.limit_amount) * 100).toFixed(1);
//       console.log('📧 EMAIL ALERT (NOT SENT - No credentials):', {
//         to: budgetData.email,
//         subject: `🚨 Budget Alert: ${budgetData.department} - ${budgetData.category} (${usagePercentage}% Used)`,
//         threshold: thresholdPercentage,
//         budget: budgetData.name,
//         department: budgetData.department,
//         category: budgetData.category,
//         limit: budgetData.limit_amount,
//         used: budgetData.used_amount,
//         remaining: budgetData.limit_amount - budgetData.used_amount
//       });
//       return { success: true, messageId: 'logged_only', note: 'Email credentials not configured' };
//     }
    
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

//     console.log('📧 Mail options prepared, attempting to send...');
//     const result = await transporter.sendMail(mailOptions);
//     console.log('✅ Threshold alert email sent successfully:', result.messageId);
//     return { success: true, messageId: result.messageId };

//   } catch (error) {
//     console.error('❌ Error sending threshold alert email:', error);
//     console.error('❌ Error details:', {
//       message: error.message,
//       code: error.code,
//       command: error.command
//     });
//     return { success: false, error: error.message };
//   }
// };

// /**
//  * Send budget exceeded email with AI recommendations
//  */
// const sendBudgetExceededAlert = async (budgetData, expenseData, recommendations) => {
//   try {
//     const transporter = createEmailTransporter();
    
//     // If no email credentials, just log the alert
//     if (!transporter) {
//       const overageAmount = budgetData.used_amount - budgetData.limit_amount;
//       const overagePercentage = ((overageAmount / budgetData.limit_amount) * 100).toFixed(1);
//       console.log('📧 BUDGET EXCEEDED ALERT (NOT SENT - No credentials):', {
//         to: budgetData.email,
//         subject: `🚫 BUDGET EXCEEDED: ${budgetData.department} - ${budgetData.category} (+${overagePercentage}%)`,
//         budget: budgetData.name,
//         department: budgetData.department,
//         category: budgetData.category,
//         limit: budgetData.limit_amount,
//         used: budgetData.used_amount,
//         overage: overageAmount,
//         overagePercentage: overagePercentage,
//         recommendations: recommendations.length
//       });
//       return { success: true, messageId: 'logged_only', note: 'Email credentials not configured' };
//     }
    
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
    
//     // If no email credentials, just log the notification
//     if (!transporter) {
//       console.log('📧 NOTIFICATION EMAIL (NOT SENT - No credentials):', {
//         to: to,
//         subject: subject,
//         message: message
//       });
//       return { success: true, messageId: 'logged_only', note: 'Email credentials not configured' };
//     }
    
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: to,
//       subject: subject,
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
//             <h2>Smart Budget Enforcer</h2>
//           </div>
//           <div style="padding: 20px; background: #f8f9fa;">
//             ${message}
//           </div>
//           <div style="padding: 20px; text-align: center; background: #f8f9fa;">
//             <p style="font-size: 12px; color: #adb5bd;">This is an automated notification from Smart Budget Enforcer</p>
//           </div>
//         </div>
//       `
//     };

//     const result = await transporter.sendMail(mailOptions);
//     console.log('✅ Notification email sent successfully:', result.messageId);
//     return { success: true, messageId: result.messageId };

//   } catch (error) {
//     console.error('❌ Error sending notification email:', error);
//     return { success: false, error: error.message };
//   }
// };

// /**
//  * Send email notification for individual high-priority recommendations
//  */
// const sendRecommendationEmail = async (user, recommendation, budget, breachSummary) => {
//   try {
//     const transporter = createEmailTransporter();
    
//     const subject = `🧠 AI Budget Recommendation: ${recommendation.title}`;
    
//     // If no email credentials, just log the recommendation
//     if (!transporter) {
//       console.log('📧 RECOMMENDATION EMAIL (NOT SENT - No credentials):', {
//         to: recommendation.type === 'approval_request' ? 'gbharathitrs@gmail.com' : user.email,
//         subject: subject,
//         recommendation: recommendation.title,
//         type: recommendation.type,
//         priority: recommendation.priority,
//         estimated_savings: recommendation.estimated_savings
//       });
//       return { success: true, messageId: 'logged_only', note: 'Email credentials not configured' };
//     }
    
//     const emailBody = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
//           <h2>🧠 AI Budget Recommendation</h2>
//           <p>Smart Budget Enforcer has generated a recommendation for your review</p>
//         </div>
        
//         <div style="padding: 20px; background: #f9f9f9;">
//           <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
//             <h3 style="color: #333; margin-top: 0;">${recommendation.title}</h3>
//             <p style="color: #666; line-height: 1.6;">${recommendation.description}</p>
            
//             <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
//               <h4 style="color: #1976d2; margin: 0 0 10px 0;">💰 Financial Impact</h4>
//               <p style="margin: 0; color: #333;">
//                 <strong>Estimated Savings:</strong> $${recommendation.estimated_savings.toLocaleString()}<br>
//                 <strong>Priority Level:</strong> ${recommendation.priority === 1 ? 'Critical' : recommendation.priority === 2 ? 'High' : 'Medium'}<br>
//                 <strong>Recommendation Type:</strong> ${recommendation.type.replace('_', ' ').toUpperCase()}
//               </p>
//             </div>
            
//             ${budget ? `
//             <div style="background: #fff3e0; padding: 15px; border-radius: 5px; margin: 15px 0;">
//               <h4 style="color: #f57c00; margin: 0 0 10px 0;">📊 Related Budget</h4>
//               <p style="margin: 0; color: #333;">
//                 <strong>Budget:</strong> ${budget.name}<br>
//                 <strong>Department:</strong> ${budget.department}<br>
//                 <strong>Category:</strong> ${budget.category}<br>
//                 <strong>Current Usage:</strong> $${budget.used_amount.toLocaleString()} / $${budget.limit_amount.toLocaleString()} (${((budget.used_amount / budget.limit_amount) * 100).toFixed(1)}%)
//               </p>
//             </div>
//             ` : ''}
            
//             ${breachSummary && breachSummary.total_breaches > 0 ? `
//             <div style="background: #ffebee; padding: 15px; border-radius: 5px; margin: 15px 0;">
//               <h4 style="color: #d32f2f; margin: 0 0 10px 0;">🚨 Breach Context</h4>
//               <p style="margin: 0; color: #333;">
//                 <strong>Total Breaches:</strong> ${breachSummary.total_breaches}<br>
//                 <strong>Departments Affected:</strong> ${breachSummary.departments_affected.join(', ')}<br>
//                 <strong>Total Overage:</strong> $${breachSummary.total_overage.toLocaleString()}
//               </p>
//             </div>
//             ` : ''}
//           </div>
          
//           <div style="text-align: center; padding: 20px;">
//             <p style="color: #666; margin-bottom: 20px;">
//               Review this recommendation in your Smart Budget Enforcer dashboard and take appropriate action.
//             </p>
//             <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/alerts" 
//                style="background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
//               View in Dashboard
//             </a>
//           </div>
//         </div>
        
//         <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
//           <p style="margin: 0;">Smart Budget Enforcer - AI-Powered Budget Management</p>
//           <p style="margin: 5px 0 0 0;">Generated at ${new Date().toLocaleString()}</p>
//         </div>
//       </div>
//     `;

//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: recommendation.type === 'approval_request' ? 'gbharathitrs@gmail.com' : user.email,
//       subject: subject,
//       html: emailBody
//     };

//     const result = await transporter.sendMail(mailOptions);
//     console.log('✅ Recommendation email sent:', result.messageId);
//     return { success: true, messageId: result.messageId };

//   } catch (error) {
//     console.error('❌ Error sending recommendation email:', error);
//     return { success: false, error: error.message };
//   }
// };

// /**
//  * Send summary email for multiple recommendations
//  */
// const sendRecommendationSummaryEmail = async (user, recommendationCount, breachSummary, budgetSummary) => {
//   try {
//     const transporter = createEmailTransporter();
    
//     const subject = `📊 AI Budget Analysis: ${recommendationCount} New Recommendations`;
    
//     // If no email credentials, just log the summary
//     if (!transporter) {
//       console.log('📧 RECOMMENDATION SUMMARY EMAIL (NOT SENT - No credentials):', {
//         to: user.email,
//         subject: subject,
//         recommendationCount: recommendationCount,
//         breachSummary: breachSummary,
//         budgetSummary: budgetSummary
//       });
//       return { success: true, messageId: 'logged_only', note: 'Email credentials not configured' };
//     }
    
//     const emailBody = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
//           <h2>📊 AI Budget Analysis Complete</h2>
//           <p>Smart Budget Enforcer has analyzed your budget and generated ${recommendationCount} recommendations</p>
//         </div>
        
//         <div style="padding: 20px; background: #f9f9f9;">
//           <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
//             <h3 style="color: #333; margin-top: 0;">Analysis Summary</h3>
            
//             ${budgetSummary ? `
//             <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0;">
//               <h4 style="color: #2e7d32; margin: 0 0 10px 0;">💰 Budget Overview</h4>
//               <p style="margin: 0; color: #333;">
//                 <strong>Total Allocated:</strong> $${budgetSummary.total_allocated?.toLocaleString() || 0}<br>
//                 <strong>Overall Usage:</strong> ${budgetSummary.overall_usage_percentage?.toFixed(1) || 0}%<br>
//                 <strong>Budgets at Risk:</strong> ${budgetSummary.budgets_at_risk || 0}<br>
//                 <strong>Available for Reallocation:</strong> $${budgetSummary.available_for_reallocation?.toLocaleString() || 0}
//               </p>
//             </div>
//             ` : ''}
            
//             ${breachSummary && breachSummary.total_breaches > 0 ? `
//             <div style="background: #ffebee; padding: 15px; border-radius: 5px; margin: 15px 0;">
//               <h4 style="color: #d32f2f; margin: 0 0 10px 0;">🚨 Breach Analysis</h4>
//               <p style="margin: 0; color: #333;">
//                 <strong>Total Breaches:</strong> ${breachSummary.total_breaches}<br>
//                 <strong>Departments Affected:</strong> ${breachSummary.departments_affected?.join(', ') || 'None'}<br>
//                 <strong>Total Overage:</strong> $${breachSummary.total_overage?.toLocaleString() || 0}
//               </p>
//             </div>
//             ` : ''}
            
//             <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
//               <h4 style="color: #1976d2; margin: 0 0 10px 0;">🧠 AI Recommendations</h4>
//               <p style="margin: 0; color: #333;">
//                 <strong>Total Generated:</strong> ${recommendationCount}<br>
//                 <strong>Status:</strong> All recommendations are pending your review<br>
//                 <strong>Next Action:</strong> Review and implement suitable recommendations
//               </p>
//             </div>
//           </div>
          
//           <div style="text-align: center; padding: 20px;">
//             <p style="color: #666; margin-bottom: 20px;">
//               View all recommendations in your dashboard and take action to optimize your budget.
//             </p>
//             <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/alerts" 
//                style="background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
//               View All Recommendations
//             </a>
//           </div>
//         </div>
        
//         <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
//           <p style="margin: 0;">Smart Budget Enforcer - AI-Powered Budget Management</p>
//           <p style="margin: 5px 0 0 0;">Analysis completed at ${new Date().toLocaleString()}</p>
//         </div>
//       </div>
//     `;

//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: user.email,
//       subject: subject,
//       html: emailBody
//     };

//     const result = await transporter.sendMail(mailOptions);
//     console.log('✅ Summary email sent:', result.messageId);
//     return { success: true, messageId: result.messageId };

//   } catch (error) {
//     console.error('❌ Error sending recommendation summary email:', error);
//     return { success: false, error: error.message };
//   }
// };

// // ✅ COMPLETE MODULE EXPORTS - All functions properly defined
// module.exports = {
//   sendThresholdAlert,
//   sendBudgetExceededAlert,
//   sendNotificationEmail,
//   sendRecommendationEmail,
//   sendRecommendationSummaryEmail
// };


/**
 * Enhanced Email Service with Detailed Cost Reduction Recommendations
 * Person Y Guide: This handles all email notifications including detailed cost reduction strategies
 * Person X: This is like an automated financial advisor that sends detailed action plans
 */



/**
 * FIXED Email Service using Nodemailer
 * CORRECTED: Fixed nodemailer function name and helper function references
 */

const nodemailer = require('nodemailer');
const axios = require('axios');

/**
 * FIXED: Create reusable transporter with Gmail credentials
 */
const createEmailTransporter = () => {
  console.log('🔍 Email configuration debug:');
  console.log('   EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
  console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ Email credentials not found. Email notifications will be logged instead of sent.');
    return null;
  }
  
  // FIXED: Use createTransport (not createTransporter)
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

/**
 * Get AI recommendations for breach context
 */
async function getAIRecommendationsForBreach(budgetData, expenseData, breachContext) {
  try {
    console.log('🧠 Fetching AI recommendations for breach email...');
    
    const pythonUrl = process.env.PYTHON_RAG_URL || 'http://localhost:8001';
    const aiRequestPayload = {
      budget_data: {
        id: budgetData._id,
        name: budgetData.name,
        department: budgetData.department,
        category: budgetData.category,
        limit_amount: budgetData.limit_amount,
        used_amount: budgetData.used_amount,
        usage_percentage: (budgetData.used_amount / budgetData.limit_amount) * 100,
        priority: budgetData.priority,
        vendor: budgetData.vendor,
        email: budgetData.email
      },
      expense_data: {
        id: expenseData._id || 'breach_expense',
        amount: expenseData.amount,
        department: expenseData.department || budgetData.department,
        category: expenseData.category || budgetData.category,
        description: expenseData.description,
        vendor_name: expenseData.vendor_name || '',
        date: expenseData.date || new Date().toISOString()
      },
      breach_context: {
        type: breachContext.type || 'budget_exceeded',
        severity: breachContext.severity || 'critical',
        usage_percentage: breachContext.usage_percentage || (budgetData.used_amount / budgetData.limit_amount) * 100,
        overage_amount: Math.max(0, budgetData.used_amount - budgetData.limit_amount),
        triggered_by_expense: expenseData.amount
      },
      user_id: budgetData.user_id
    };

    const response = await axios.post(
      `${pythonUrl}/generate-recommendations`,
      aiRequestPayload,
      {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SmartBudgetEnforcer-EmailService/2.0'
        }
      }
    );

    if (response.status === 200 && response.data.success) {
      return response.data.recommendations || [];
    } else {
      console.warn('⚠️ AI service returned unsuccessful response');
      return [];
    }

  } catch (error) {
    console.error('❌ Error fetching AI recommendations for email:', error.message);
    return [];
  }
}

/**
 * Generate HTML for recommendations in email
 */
function generateRecommendationsHTML(recommendations) {
  if (!recommendations || recommendations.length === 0) {
    return `
      <div style="padding: 20px; background: #f0f8ff; border-left: 5px solid #007acc; margin: 15px 0;">
        <h4 style="color: #007acc; margin: 0 0 10px 0;">🤖 AI Recommendations</h4>
        <p style="margin: 0; color: #333;">AI recommendations are being generated. Please check your dashboard for updates.</p>
      </div>
    `;
  }

  const recommendationsHtml = recommendations.map((rec, index) => {
    const priorityColor = rec.priority === 1 ? '#dc3545' : rec.priority === 2 ? '#fd7e14' : '#28a745';
    const priorityText = rec.priority === 1 ? 'Critical' : rec.priority === 2 ? 'High' : 'Medium';
    
    return `
      <div style="margin: 15px 0; padding: 20px; background: #f8f9fa; border-left: 4px solid ${priorityColor}; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
          <h5 style="color: ${priorityColor}; margin: 0; font-size: 16px; font-weight: bold;">
            ${index + 1}. ${rec.title}
          </h5>
          <span style="background: ${priorityColor}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">
            ${priorityText} Priority
          </span>
        </div>
        
        <p style="margin: 10px 0; color: #555; line-height: 1.6;">
          ${rec.description}
        </p>
        
        <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 10px;">
          ${rec.estimated_savings > 0 ? `
            <p style="margin: 0 0 8px 0; color: #28a745; font-weight: bold;">
              💰 Estimated Savings: $${rec.estimated_savings.toLocaleString()}
            </p>
          ` : ''}
          
          ${rec.implementation_timeline ? `
            <p style="margin: 0 0 8px 0; color: #6c757d;">
              ⏱️ Implementation Timeline: ${rec.implementation_timeline}
            </p>
          ` : ''}
          
          ${rec.implementation_steps && rec.implementation_steps.length > 0 ? `
            <p style="margin: 8px 0 4px 0; color: #495057; font-weight: bold;">📋 Implementation Steps:</p>
            <ul style="margin: 0; padding-left: 20px; color: #6c757d;">
              ${rec.implementation_steps.map(step => `<li style="margin: 2px 0;">${step}</li>`).join('')}
            </ul>
          ` : ''}
          
          ${rec.success_metrics && rec.success_metrics.length > 0 ? `
            <p style="margin: 8px 0 4px 0; color: #495057; font-weight: bold;">📊 Success Metrics:</p>
            <ul style="margin: 0; padding-left: 20px; color: #6c757d;">
              ${rec.success_metrics.map(metric => `<li style="margin: 2px 0;">${metric}</li>`).join('')}
            </ul>
          ` : ''}
          
          ${rec.risk_factors && rec.risk_factors.length > 0 ? `
            <p style="margin: 8px 0 4px 0; color: #495057; font-weight: bold;">⚠️ Risk Factors:</p>
            <ul style="margin: 0; padding-left: 20px; color: #856404;">
              ${rec.risk_factors.map(risk => `<li style="margin: 2px 0;">${risk}</li>`).join('')}
            </ul>
          ` : ''}
          
          ${rec.responsible_party ? `
            <p style="margin: 8px 0 0 0; color: #495057;">
              👤 <strong>Responsible:</strong> ${rec.responsible_party}
            </p>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div style="padding: 20px; background: #e3f2fd; border-left: 5px solid #1976d2; margin: 15px 0;">
      <h4 style="color: #1976d2; margin: 0 0 15px 0;">🤖 AI-Generated Recommendations</h4>
      <p style="margin: 0 0 15px 0; color: #333; font-style: italic;">
        Our AI system has analyzed your spending patterns and generated the following recommendations:
      </p>
      ${recommendationsHtml}
      <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #1976d2;">
        <p style="margin: 0; color: #555; font-size: 12px;">
          💡 These recommendations are generated using AI analysis of your spending patterns and industry best practices.
        </p>
      </div>
    </div>
  `;
}

/**
 * FIXED: Send threshold warning email with AI recommendations
 */
const sendThresholdAlert = async (budgetData, expenseData, thresholdPercentage) => {
  try {
    console.log('📧 Attempting to send enhanced threshold alert email...');
    
    const transporter = createEmailTransporter();
    
    if (!transporter) {
      const usagePercentage = ((budgetData.used_amount / budgetData.limit_amount) * 100).toFixed(1);
      console.log('📧 EMAIL ALERT (NOT SENT - No credentials):', {
        to: budgetData.email,
        subject: `🚨 Budget Alert: ${budgetData.department} - ${budgetData.category} (${usagePercentage}% Used)`,
        threshold: thresholdPercentage
      });
      return { success: true, messageId: 'logged_only', note: 'Email credentials not configured' };
    }

    // Get AI recommendations for threshold breach
    const aiRecommendations = await getAIRecommendationsForBreach(
      budgetData, 
      expenseData, 
      {
        type: 'threshold_warning',
        severity: thresholdPercentage >= 90 ? 'critical' : thresholdPercentage >= 75 ? 'high' : 'medium',
        usage_percentage: (budgetData.used_amount / budgetData.limit_amount) * 100
      }
    );

    const usagePercentage = ((budgetData.used_amount / budgetData.limit_amount) * 100).toFixed(1);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: budgetData.email,
      subject: `🚨 Budget Alert with AI Recommendations: ${budgetData.department} - ${budgetData.category} (${usagePercentage}% Used)`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h2>🚨 Budget Threshold Alert with AI Insights</h2>
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
          
          ${generateRecommendationsHTML(aiRecommendations)}
          
          <div style="padding: 20px; text-align: center; background: #f8f9fa;">
            <p style="color: #6c757d;">Please review the AI recommendations above and consider implementing them to optimize your budget.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/alerts" 
               style="background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">
              View Full Dashboard
            </a>
            <p style="font-size: 12px; color: #adb5bd;">This is an automated alert from Smart Budget Enforcer with AI recommendations</p>
          </div>
        </div>
      `
    };

    console.log('📧 Mail options prepared, attempting to send...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Enhanced threshold alert email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId, recommendations_included: aiRecommendations.length };

  } catch (error) {
    console.error('❌ Error sending enhanced threshold alert email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * FIXED: Send budget exceeded email with comprehensive AI recommendations
 */
const sendBudgetExceededAlert = async (budgetData, expenseData, recommendations = []) => {
  try {
    console.log('📧 Attempting to send enhanced budget exceeded alert...');
    
    const transporter = createEmailTransporter();
    
    if (!transporter) {
      const overageAmount = budgetData.used_amount - budgetData.limit_amount;
      console.log('📧 BUDGET EXCEEDED ALERT (NOT SENT - No credentials)');
      return { success: true, messageId: 'logged_only', note: 'Email credentials not configured' };
    }

    // If no recommendations provided, get AI recommendations
    let aiRecommendations = recommendations;
    if (!aiRecommendations || aiRecommendations.length === 0) {
      aiRecommendations = await getAIRecommendationsForBreach(
        budgetData, 
        expenseData, 
        {
          type: 'budget_exceeded',
          severity: 'critical',
          usage_percentage: (budgetData.used_amount / budgetData.limit_amount) * 100,
          overage_amount: budgetData.used_amount - budgetData.limit_amount
        }
      );
    }

    const overageAmount = budgetData.used_amount - budgetData.limit_amount;
    const overagePercentage = ((overageAmount / budgetData.limit_amount) * 100).toFixed(1);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: budgetData.email,
      subject: `🚫 BUDGET EXCEEDED with AI Action Plan: ${budgetData.department} - ${budgetData.category} (+${overagePercentage}%)`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 20px; text-align: center;">
            <h2>🚫 BUDGET LIMIT EXCEEDED</h2>
            <p>Critical situation requires immediate action - AI recommendations included</p>
          </div>
          
          <div style="padding: 20px; background: #f8d7da; border: 1px solid #f5c6cb;">
            <h3 style="color: #721c24;">⚠️ Critical Overage Details</h3>
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
          
          ${generateRecommendationsHTML(aiRecommendations)}
          
          <div style="padding: 20px; text-align: center; background: #f8f9fa;">
            <div style="background: #dc3545; color: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <h3 style="margin: 0; font-size: 18px;">🚨 IMMEDIATE ACTION REQUIRED</h3>
              <p style="margin: 5px 0 0 0;">Please implement the AI recommendations above to address this budget breach</p>
            </div>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/alerts" 
               style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; font-weight: bold;">
              View Dashboard & Take Action
            </a>
            <p style="color: #6c757d; margin-top: 15px;">AI-powered recommendations are generated based on your spending patterns and industry best practices.</p>
            <p style="font-size: 12px; color: #adb5bd;">This is an automated critical alert from Smart Budget Enforcer with AI recommendations</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Enhanced budget exceeded alert email sent:', result.messageId);
    return { success: true, messageId: result.messageId, recommendations_included: aiRecommendations.length };

  } catch (error) {
    console.error('❌ Error sending enhanced budget exceeded alert email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Enhanced notification email with AI context
 */
const sendNotificationEmail = async (to, subject, message, aiContext = null) => {
  try {
    const transporter = createEmailTransporter();
    
    if (!transporter) {
      console.log('📧 NOTIFICATION EMAIL (NOT SENT - No credentials)');
      return { success: true, messageId: 'logged_only', note: 'Email credentials not configured' };
    }

    const enhancedMessage = aiContext ? `
      <div style="background: #e3f2fd; padding: 15px; border-left: 4px solid #1976d2; margin: 15px 0;">
        <h4 style="color: #1976d2; margin: 0 0 10px 0;">🤖 AI Context</h4>
        <p style="margin: 0; color: #333;">${aiContext}</p>
      </div>
      ${message}
    ` : message;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h2>Smart Budget Enforcer</h2>
            <p>AI-Powered Budget Management</p>
          </div>
          <div style="padding: 20px; background: #f8f9fa;">
            ${enhancedMessage}
          </div>
          <div style="padding: 20px; text-align: center; background: #f8f9fa;">
            <p style="font-size: 12px; color: #adb5bd;">This is an automated notification from Smart Budget Enforcer with AI enhancements</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Enhanced notification email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Error sending enhanced notification email:', error);
    return { success: false, error: error.message };
  }
};

// Keep existing functions for backward compatibility
const sendRecommendationEmail = async (user, recommendation, budget, breachSummary) => {
  const aiContext = `AI has generated a ${recommendation.priority === 1 ? 'critical' : 'high'} priority recommendation based on spending pattern analysis.`;
  
  return await sendNotificationEmail(
    user.email,
    `🧠 AI Budget Recommendation: ${recommendation.title}`,
    `
      <div style="background: white; padding: 20px; border-radius: 8px;">
        <h3>${recommendation.title}</h3>
        <p>${recommendation.description}</p>
        <p><strong>Estimated Savings:</strong> $${recommendation.estimated_savings.toLocaleString()}</p>
        <p><strong>Priority:</strong> ${recommendation.priority === 1 ? 'Critical' : 'High'}</p>
      </div>
    `,
    aiContext
  );
};

const sendRecommendationSummaryEmail = async (user, recommendationCount, breachSummary, budgetSummary) => {
  const aiContext = `AI analysis complete: ${recommendationCount} recommendations generated based on comprehensive budget and spending pattern analysis.`;
  
  return await sendNotificationEmail(
    user.email,
    `📊 AI Budget Analysis: ${recommendationCount} New Recommendations`,
    `
      <div style="background: white; padding: 20px; border-radius: 8px;">
        <h3>AI Budget Analysis Complete</h3>
        <p>Smart Budget Enforcer has analyzed your budget and generated ${recommendationCount} actionable recommendations.</p>
        <p><strong>Total Recommendations:</strong> ${recommendationCount}</p>
        <p><strong>Breaches Detected:</strong> ${breachSummary?.total_breaches || 0}</p>
      </div>
    `,
    aiContext
  );
};

module.exports = {
  sendThresholdAlert,
  sendBudgetExceededAlert,
  sendNotificationEmail,
  sendRecommendationEmail,
  sendRecommendationSummaryEmail,
  // Export new functions for advanced usage
  getAIRecommendationsForBreach,
  generateRecommendationsHTML
};