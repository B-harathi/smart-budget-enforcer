/**
 * Smart Budget Enforcer - Node.js Express Server
 * Person Y Guide: This is the main server file that handles all API routes
 * Person X: Think of this as the central hub that receives requests and sends responses
 */

// Debug: Print current directory and .env path before loading
console.log('🔍 Current working directory:', process.cwd());
console.log('🔍 Looking for .env at:', require('path').resolve('.env'));

// Load environment variables
require('dotenv').config();

// Debug: Check if .env was loaded
console.log('🔍 .env file loaded. Environment variables:');
console.log('   MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('   PYTHON_RAG_URL:', process.env.PYTHON_RAG_URL ? 'SET' : 'NOT SET');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

// Import our custom modules
const { User, Budget, Expense, Alert, Recommendation } = require('./models');
const { hashPassword, comparePassword, generateToken, verifyToken, requireRole } = require('./auth');
const { sendThresholdAlert, sendBudgetExceededAlert, sendNotificationEmail } = require('./email');

// Person Y Tip: Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Person Y: Enable CORS for frontend communication
app.use(cors());

// Person Y: Parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Person Y Tip: Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Person Y: Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Person Y Tip: Add timestamp to prevent filename conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Person Y: 10MB file size limit
  },
  fileFilter: (req, file, cb) => {
    // Person Y: Only allow PDF, Excel, and Word documents
    const allowedTypes = ['.pdf', '.xlsx', '.xls', '.docx', '.doc'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload PDF, Excel, or Word documents only.'));
    }
  }
});

// Person Y Tip: Connect to MongoDB with fallback
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_budget_enforcer';
console.log('🔗 Connecting to MongoDB:', mongoUri);

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  console.log('💡 Make sure MongoDB is running: mongod --dbpath C:\\data\\db');
  process.exit(1);
});

// Person Y: Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Budget Enforcer API is running!',
    timestamp: new Date().toISOString()
  });
});

// ==================== AUTHENTICATION ROUTES ====================

/**
 * User Registration
 * Person X: This creates a new user account
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Person Y: Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    // Person Y: Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Person Y: Hash password and create user
    const hashedPassword = await hashPassword(password);
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: role || 'user'
    });

    await newUser.save();

    // Person Y: Generate token for immediate login
    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

/**
 * User Login
 * Person X: This logs in existing users
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Person Y: Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Person Y: Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Person Y: Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// ==================== DOCUMENT UPLOAD & RAG PROCESSING ====================

/**
 * Upload and process budget document
 * Person X: This sends documents to Python service for AI processing
 */
app.post('/api/upload/budget-document', verifyToken, upload.single('document'), async (req, res) => {
  let tempFilePath = null;
  
  try {
    // ✅ FIX: Better file validation
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // ✅ FIX: Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'text/csv',
      'text/plain'
    ];

    if (!allowedTypes.includes(req.file.mimetype)) {
      // Clean up uploaded file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Please upload PDF, Excel, Word, CSV, or text files only.'
      });
    }

    tempFilePath = req.file.path;
    console.log('📄 File uploaded:', req.file.filename, 'Size:', req.file.size, 'Type:', req.file.mimetype);

    // ✅ FIX: Enhanced FormData creation with proper error handling
    const FormData = require('form-data');
    const formData = new FormData();
    
    // ✅ FIX: Check if file exists before creating stream
    if (!fs.existsSync(tempFilePath)) {
      throw new Error('Uploaded file not found on server');
    }

    const fileStream = fs.createReadStream(tempFilePath);
    
    // ✅ FIX: Handle stream errors
    fileStream.on('error', (error) => {
      console.error('❌ File stream error:', error);
      throw new Error('Error reading uploaded file');
    });
    
    formData.append('file', fileStream, {
      filename: req.file.filename,
      contentType: req.file.mimetype
    });
    formData.append('user_id', req.user.id);

    console.log('🔄 Sending file to Python RAG service...');

    // ✅ FIX: Use environment variable with fallback and better timeout
    const pythonUrl = process.env.PYTHON_RAG_URL || 'http://localhost:8000';
    const pythonResponse = await axios.post(
      `${pythonUrl}/process-document`,
      formData,
      {
        headers: {
          ...formData.getHeaders(), // ✅ FIX: Only use FormData headers
        },
        timeout: 180000, // ✅ FIX: 3 minute timeout for AI processing
        maxContentLength: 50 * 1024 * 1024, // 50MB limit
        maxBodyLength: 50 * 1024 * 1024
      }
    );

    console.log('🐍 Python response status:', pythonResponse.status);
    console.log('🐍 Python response success:', pythonResponse.data?.success);

    // ✅ FIX: Better response validation
    if (!pythonResponse.data || typeof pythonResponse.data !== 'object') {
      throw new Error('Invalid response from AI processing service');
    }

    if (!pythonResponse.data.success) {
      const errorMsg = pythonResponse.data.error || pythonResponse.data.message || 'AI processing failed';
      throw new Error(`AI Processing Error: ${errorMsg}`);
    }

    const budgetItems = pythonResponse.data.budget_data;
    
    // ✅ FIX: Enhanced budget data validation
    if (!budgetItems || !Array.isArray(budgetItems) || budgetItems.length === 0) {
      throw new Error('No budget data extracted from document. Please ensure your document contains budget information in a recognizable format (tables, structured data, etc.).');
    }

    console.log(`💾 Processing ${budgetItems.length} budget items for storage...`);
    
    const savedBudgets = [];
    const errors = [];

    for (let i = 0; i < budgetItems.length; i++) {
      const item = budgetItems[i];
      try {
        // ✅ FIX: Enhanced validation and data cleaning
        const amount = parseFloat(item.amount) || parseFloat(item.limit_amount) || 0;
        const limitAmount = parseFloat(item.limit_amount) || parseFloat(item.amount) || 0;
        
        if (amount <= 0 || limitAmount <= 0) {
          errors.push(`Item ${i + 1}: Invalid amount (${amount}) or limit (${limitAmount})`);
          continue;
        }

        const budgetData = {
          name: (item.name || `${item.department || 'General'} ${item.category || 'Budget'}`).trim(),
          category: (item.category || 'General').trim(),
          department: (item.department || 'General').trim(),
          amount: amount,
          limit_amount: limitAmount,
          used_amount: 0, // Initial value
          warning_threshold: parseFloat(item.warning_threshold) || (limitAmount * 0.8),
          priority: item.priority || 'Medium',
          vendor: (item.vendor || '').trim(),
          email: item.email || req.user.email || 'finance@company.com',
          user_id: req.user.id,
          status: 'active',
          created_at: new Date(),
          updated_at: new Date()
        };

        // ✅ FIX: Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(budgetData.email)) {
          budgetData.email = req.user.email || 'finance@company.com';
        }

        console.log(`💾 Saving budget ${i + 1}:`, {
          name: budgetData.name,
          department: budgetData.department,
          category: budgetData.category,
          limit_amount: budgetData.limit_amount
        });
        
        const budget = new Budget(budgetData);
        const savedBudget = await budget.save();
        savedBudgets.push(savedBudget);
        
      } catch (saveError) {
        console.error(`❌ Error saving budget item ${i + 1}:`, saveError);
        errors.push(`Item ${i + 1}: ${saveError.message}`);
        continue; // Skip this item but continue with others
      }
    }

    // ✅ FIX: Always clean up uploaded file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log('🗑️ Temporary file cleaned up');
      } catch (cleanupError) {
        console.warn('⚠️ Could not delete temporary file:', cleanupError.message);
      }
    }

    // ✅ FIX: Better success/partial success handling
    if (savedBudgets.length === 0) {
      throw new Error(`Failed to save any budget items. Errors: ${errors.join('; ')}`);
    }

    const response = {
      success: true,
      message: `Document processed successfully! Extracted and saved ${savedBudgets.length} budget items.`,
      budget_count: savedBudgets.length,
      total_extracted: budgetItems.length,
      budgets: savedBudgets.map(b => ({
        id: b._id,
        name: b.name,
        department: b.department,
        category: b.category,
        limit_amount: b.limit_amount,
        warning_threshold: b.warning_threshold,
        priority: b.priority,
        email: b.email,
        status: b.status
      })),
      processing_info: {
        processing_time: pythonResponse.data.processing_time || 0,
        processing_steps: pythonResponse.data.processing_steps || []
      }
    };

    // ✅ FIX: Include warnings if some items failed
    if (errors.length > 0) {
      response.warnings = errors;
      response.message += ` Note: ${errors.length} items could not be processed.`;
    }

    console.log(`✅ Successfully processed document: ${savedBudgets.length}/${budgetItems.length} items saved`);
    res.json(response);

  } catch (error) {
    console.error('❌ Document upload error:', error);
    
    // ✅ FIX: Ensure cleanup on any error
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log('🗑️ Cleanup: Temporary file deleted after error');
      } catch (cleanupError) {
        console.warn('⚠️ Could not delete temporary file after error:', cleanupError.message);
      }
    }

    // ✅ FIX: Enhanced error handling and user-friendly messages
    let errorMessage = 'Error processing document';
    let statusCode = 500;

    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'AI processing service is unavailable. Please try again later.';
      statusCode = 503;
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Document processing timed out. Please try with a smaller file or try again later.';
      statusCode = 408;
    } else if (error.response?.status === 422) {
      errorMessage = error.response.data?.detail || 'The document format is not supported or contains no budget data.';
      statusCode = 422;
    } else if (error.response?.status === 400) {
      errorMessage = error.response.data?.detail || 'Invalid file format or content.';
      statusCode = 400;
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.message) {
      errorMessage = error.message;
    }

    const errorResponse = {
      success: false,
      message: errorMessage,
      error_type: error.code || 'PROCESSING_ERROR'
    };

    // ✅ FIX: Only include debug info in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.debug_info = {
        python_url: process.env.PYTHON_RAG_URL || 'http://localhost:8000',
        file_info: req.file ? {
          name: req.file.filename,
          size: req.file.size,
          type: req.file.mimetype,
          path: req.file.path
        } : null,
        stack: error.stack
      };
    }

    res.status(statusCode).json(errorResponse);
  }
});

// ==================== BUDGET MANAGEMENT ROUTES ====================

/**
 * Get all budgets for user
 * Person X: This fetches all budget data for the dashboard
 */
app.get('/api/budgets', verifyToken, async (req, res) => {
  try {
    const budgets = await Budget.find({ user_id: req.user.id }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      budgets
    });

  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching budgets'
    });
  }
});

/**
 * Get budget by ID
 */
app.get('/api/budgets/:id', verifyToken, async (req, res) => {
  try {
    const budget = await Budget.findOne({ 
      _id: req.params.id, 
      user_id: req.user.id 
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.json({
      success: true,
      budget
    });

  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching budget'
    });
  }
});

/**
 * Update budget
 */
app.put('/api/budgets/:id', verifyToken, async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.json({
      success: true,
      budget
    });

  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating budget'
    });
  }
});

/**
 * Delete budget
 */
app.delete('/api/budgets/:id', verifyToken, async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ 
      _id: req.params.id, 
      user_id: req.user.id 
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.json({
      success: true,
      message: 'Budget deleted successfully'
    });

  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting budget'
    });
  }
});

// ==================== EXPENSE MANAGEMENT ROUTES ====================

/**
 * Add new expense
 * Person X: This is where users add expenses and triggers AI monitoring
 */
app.post('/api/expenses', verifyToken, async (req, res) => {
  try {
    const { amount, department, category, description, vendor_name, budget_id } = req.body;

    // Person Y: Validate required fields
    if (!amount || !department || !category || !description || !budget_id) {
      return res.status(400).json({
        success: false,
        message: 'Amount, department, category, description, and budget_id are required'
      });
    }

    // Person Y: Find the budget
    const budget = await Budget.findOne({ 
      _id: budget_id, 
      user_id: req.user.id 
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Person Y: Create expense
    const expense = new Expense({
      amount: parseFloat(amount),
      department,
      category,
      description,
      vendor_name: vendor_name || '',
      budget_id,
      user_id: req.user.id
    });

    await expense.save();

    // Person Y: Update budget used_amount
    const newUsedAmount = budget.used_amount + parseFloat(amount);
    budget.used_amount = newUsedAmount;
    await budget.save();

    // Person Y: Check thresholds and send alerts
    await checkBudgetThresholds(budget, expense);

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      expense,
      budget: {
        ...budget.toObject(),
        used_amount: newUsedAmount
      }
    });

  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding expense'
    });
  }
});

/**
 * Person Y: Helper function to check budget thresholds and send alerts
 */
async function checkBudgetThresholds(budget, expense) {
  try {
    const usagePercentage = (budget.used_amount / budget.limit_amount) * 100;
    const previousUsage = ((budget.used_amount - expense.amount) / budget.limit_amount) * 100;

    console.log(`💰 Budget usage: ${usagePercentage.toFixed(1)}%`);

    // Person Y: Check threshold alerts (25%, 50%, 75%)
    const thresholds = [25, 50, 75];
    for (const threshold of thresholds) {
      if (usagePercentage >= threshold && previousUsage < threshold) {
        console.log(`🚨 Threshold ${threshold}% reached for ${budget.department} - ${budget.category}`);
        
        // Send email alert
        await sendThresholdAlert(budget, expense, threshold);
        
        // Create alert record
        await createAlert({
          type: 'threshold_warning',
          severity: threshold >= 75 ? 'high' : threshold >= 50 ? 'medium' : 'low',
          message: `Budget usage reached ${threshold}% for ${budget.department} - ${budget.category}`,
          department: budget.department,
          category: budget.category,
          budget_id: budget._id,
          expense_id: expense._id,
          user_id: budget.user_id
        });
      }
    }

    // Person Y: Check if budget exceeded (100%+)
    if (usagePercentage > 100 && previousUsage <= 100) {
      console.log(`🚫 Budget exceeded for ${budget.department} - ${budget.category}`);
      
      // Person Y: Get AI recommendations from Python service
      try {
        const recommendationsResponse = await axios.post(
          `${process.env.PYTHON_RAG_URL}/generate-recommendations`,
          {
            budget_data: budget,
            expense_data: expense,
            user_id: budget.user_id
          },
          { timeout: 120000 }
        );

        const recommendations = recommendationsResponse.data.recommendations || [];
        
        // Person Y: Save recommendations to database
        for (const rec of recommendations) {
          await createRecommendation({
            ...rec,
            budget_id: budget._id,
            user_id: budget.user_id
          });
        }

        // Send email with recommendations
        await sendBudgetExceededAlert(budget, expense, recommendations);

      } catch (error) {
        console.error('Error getting AI recommendations:', error);
        // Send basic exceeded alert without recommendations
        await sendBudgetExceededAlert(budget, expense, []);
      }

      // Create alert record
      await createAlert({
        type: 'budget_exceeded',
        severity: 'critical',
        message: `Budget exceeded by ${(budget.used_amount - budget.limit_amount).toFixed(2)} for ${budget.department} - ${budget.category}`,
        department: budget.department,
        category: budget.category,
        budget_id: budget._id,
        expense_id: expense._id,
        user_id: budget.user_id
      });

      // Update budget status
      budget.status = 'exceeded';
      await budget.save();
    }

  } catch (error) {
    console.error('Error checking budget thresholds:', error);
  }
}

/**
 * Person Y: Helper function to create alerts
 */
async function createAlert(alertData) {
  try {
    const alert = new Alert(alertData);
    await alert.save();
    return alert;
  } catch (error) {
    console.error('Error creating alert:', error);
  }
}

/**
 * Person Y: Helper function to create recommendations
 */
async function createRecommendation(recData) {
  try {
    const recommendation = new Recommendation(recData);
    await recommendation.save();
    return recommendation;
  } catch (error) {
    console.error('Error creating recommendation:', error);
  }
}

/**
 * Get all expenses for user
 */
app.get('/api/expenses', verifyToken, async (req, res) => {
  try {
    const expenses = await Expense.find({ user_id: req.user.id })
      .populate('budget_id', 'name department category')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      expenses
    });

  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expenses'
    });
  }
});

/**
 * Get expenses by budget
 */
app.get('/api/expenses/budget/:budgetId', verifyToken, async (req, res) => {
  try {
    const expenses = await Expense.find({ 
      budget_id: req.params.budgetId,
      user_id: req.user.id 
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      expenses
    });

  } catch (error) {
    console.error('Get budget expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching budget expenses'
    });
  }
});

// ==================== DASHBOARD DATA ROUTES ====================

/**
 * Get dashboard summary data
 * Person X: This provides all data needed for the dashboard charts
 */
app.get('/api/dashboard/summary', verifyToken, async (req, res) => {
  try {
    // Person Y: Get all budgets with aggregated data
    const budgets = await Budget.find({ user_id: req.user.id });
    
    // Person Y: Calculate summary statistics
    const totalBudgets = budgets.length;
    const totalAllocated = budgets.reduce((sum, b) => sum + b.limit_amount, 0);
    const totalUsed = budgets.reduce((sum, b) => sum + b.used_amount, 0);
    const totalRemaining = totalAllocated - totalUsed;
    
    // Person Y: Group by department
    const departmentSummary = budgets.reduce((acc, budget) => {
      if (!acc[budget.department]) {
        acc[budget.department] = {
          department: budget.department,
          allocated: 0,
          used: 0,
          remaining: 0,
          categories: []
        };
      }
      
      acc[budget.department].allocated += budget.limit_amount;
      acc[budget.department].used += budget.used_amount;
      acc[budget.department].remaining += (budget.limit_amount - budget.used_amount);
      acc[budget.department].categories.push({
        name: budget.category,
        allocated: budget.limit_amount,
        used: budget.used_amount,
        remaining: budget.limit_amount - budget.used_amount,
        percentage: (budget.used_amount / budget.limit_amount) * 100,
        status: budget.status,
        priority: budget.priority
      });
      
      return acc;
    }, {});

    // Person Y: Get recent alerts
    const recentAlerts = await Alert.find({ user_id: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5);

    // Person Y: Get active recommendations
    const activeRecommendations = await Recommendation.find({ 
      user_id: req.user.id,
      status: 'pending'
    }).sort({ priority: 1, createdAt: -1 });

    res.json({
      success: true,
      summary: {
        totalBudgets,
        totalAllocated,
        totalUsed,
        totalRemaining,
        usagePercentage: totalAllocated > 0 ? (totalUsed / totalAllocated) * 100 : 0
      },
      departmentSummary: Object.values(departmentSummary),
      recentAlerts,
      activeRecommendations
    });

  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
});

// ==================== ALERTS & RECOMMENDATIONS ROUTES ====================

/**
 * Get all alerts for user
 */
app.get('/api/alerts', verifyToken, async (req, res) => {
  try {
    const alerts = await Alert.find({ user_id: req.user.id })
      .populate('budget_id', 'name department category')
      .populate('expense_id', 'amount description')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      alerts
    });

  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts'
    });
  }
});

/**
 * Mark alert as read
 */
app.put('/api/alerts/:id/read', verifyToken, async (req, res) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      { read: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      alert
    });

  } catch (error) {
    console.error('Mark alert read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating alert'
    });
  }
});

/**
 * Get all recommendations for user
 */
app.get('/api/recommendations', verifyToken, async (req, res) => {
  try {
    const recommendations = await Recommendation.find({ user_id: req.user.id })
      .populate('budget_id', 'name department category')
      .sort({ priority: 1, createdAt: -1 });
    
    res.json({
      success: true,
      recommendations
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recommendations'
    });
  }
});

/**
 * Update recommendation status
 */
app.put('/api/recommendations/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['accepted', 'rejected', 'implemented'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const recommendation = await Recommendation.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      { status },
      { new: true }
    );

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    res.json({
      success: true,
      recommendation
    });

  } catch (error) {
    console.error('Update recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating recommendation'
    });
  }
});

// ==================== INTERNAL NOTIFICATION ENDPOINT ====================

/**
 * Internal endpoint for Python service to send breach notifications
 * Person Y: This is called by the Python Escalation Communicator Agent
 */
app.post('/api/internal/process-breach-notification', async (req, res) => {
  try {
    const { 
      escalation_level, 
      user_id, 
      breach_details, 
      recommendations, 
      budget_summary 
    } = req.body;

    console.info(`🚨 Processing breach notification for user ${user_id}`);

    // Person Y: Get user details for email
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Person Y: Process each breach and send appropriate emails
    let emailsSent = 0;
    const emailResults = [];

    if (breach_details && breach_details.length > 0) {
      for (const breach of breach_details) {
        try {
          // Person Y: Find the budget for email address
          const budget = await Budget.findOne({
            department: breach.department,
            category: breach.category,
            user_id: user_id
          });

          if (!budget) {
            console.warn(`⚠️ Budget not found for ${breach.department} - ${breach.category}`);
            continue;
          }

          // Person Y: Create mock expense data for email context
          const latestExpense = {
            amount: breach.financial_impact?.overage_amount || 1000,
            description: `Budget breach detected in ${breach.category}`,
            vendor_name: budget.vendor || 'Unknown',
            date: new Date()
          };

          // Person Y: Send appropriate email based on severity
          let emailResult;
          
          if (breach.severity === 'critical' || breach.financial_impact?.overage_amount > 0) {
            // Person Y: Budget exceeded - send with recommendations
            emailResult = await sendBudgetExceededAlert(budget, latestExpense, recommendations || []);
          } else {
            // Person Y: Threshold alert
            const usagePercentage = ((budget.used_amount / budget.limit_amount) * 100);
            const threshold = usagePercentage >= 75 ? 75 : usagePercentage >= 50 ? 50 : 25;
            emailResult = await sendThresholdAlert(budget, latestExpense, threshold);
          }

          if (emailResult.success) {
            emailsSent++;
            emailResults.push({
              department: breach.department,
              category: breach.category,
              email_sent: true,
              message_id: emailResult.messageId
            });
          } else {
            emailResults.push({
              department: breach.department,
              category: breach.category,
              email_sent: false,
              error: emailResult.error
            });
          }

        } catch (emailError) {
          console.error(`❌ Error sending email for ${breach.department}: ${emailError}`);
          emailResults.push({
            department: breach.department,
            category: breach.category,
            email_sent: false,
            error: emailError.message
          });
        }
      }
    }

    res.json({
      success: true,
      message: `Processed ${breach_details?.length || 0} breach notifications`,
      emails_sent: emailsSent,
      email_results: emailResults,
      escalation_level
    });

  } catch (error) {
    console.error('❌ Error processing breach notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing breach notification',
      error: error.message
    });
  }
});

// Person Y: Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Person Y: 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Person Y: Start server
app.listen(PORT, () => {
  console.log(`🚀 Smart Budget Enforcer API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL}`);
});