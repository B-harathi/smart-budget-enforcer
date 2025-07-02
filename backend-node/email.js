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


