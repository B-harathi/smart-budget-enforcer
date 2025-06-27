 
/**
 * MongoDB Models for Smart Budget Enforcer
 * Person Y Guide: These are Mongoose schemas that define our data structure
 * Person X: Think of these as blueprints for our database tables
 */

const mongoose = require('mongoose');

// User Schema for Authentication
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'finance_manager', 'user'],
    default: 'user'
  }
}, {
  timestamps: true // Person Y Tip: Always include timestamps for audit trails
});

// Budget Schema - Stores extracted budget data from RAG
const budgetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  limit_amount: {
    type: Number,
    required: true
  },
  used_amount: {
    type: Number,
    default: 0
  },
  warning_threshold: {
    type: Number,
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  vendor: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'exceeded'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Expense Schema - Stores individual expense entries
const expenseSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  vendor_name: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  },
  budget_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Alert Schema - Stores breach alerts and notifications
const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['threshold_warning', 'budget_exceeded', 'recommendation'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  department: String,
  category: String,
  budget_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget'
  },
  expense_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense'
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  email_sent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Recommendation Schema - Stores AI-generated recommendations
const recommendationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['budget_reallocation', 'vendor_alternative', 'spending_pause', 'approval_request'],
    required: true
  },
  priority: {
    type: Number,
    min: 1,
    max: 3,
    required: true
  },
  department: String,
  category: String,
  estimated_savings: {
    type: Number,
    default: 0
  },
  budget_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget'
  },
  alert_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alert'
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'implemented'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Person Y Tip: Add indexes for better query performance
budgetSchema.index({ user_id: 1, department: 1, category: 1 });
expenseSchema.index({ user_id: 1, budget_id: 1, date: -1 });
alertSchema.index({ user_id: 1, read: 1, createdAt: -1 });

// Export all models
module.exports = {
  User: mongoose.model('User', userSchema),
  Budget: mongoose.model('Budget', budgetSchema),
  Expense: mongoose.model('Expense', expenseSchema),
  Alert: mongoose.model('Alert', alertSchema),
  Recommendation: mongoose.model('Recommendation', recommendationSchema)
};