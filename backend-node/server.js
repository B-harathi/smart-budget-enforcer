// // /**
// //  * Smart Budget Enforcer - Node.js Express Server
// //  * Person Y Guide: This is the main server file that handles all API routes
// //  * Person X: Think of this as the central hub that receives requests and sends responses
// //  */

// // // Load environment variables
// // require('dotenv').config();

// // const express = require('express');
// // const mongoose = require('mongoose');
// // const cors = require('cors');
// // const multer = require('multer');
// // const path = require('path');
// // const fs = require('fs');
// // const axios = require('axios');
// // const FormData = require('form-data');

// // // Import our custom modules
// // const { User, Budget, Expense, Alert, Recommendation } = require('./models');
// // const { hashPassword, comparePassword, generateToken, verifyToken, requireRole } = require('./auth');

// // // ✅ FIXED: Import all email functions including the new ones
// // const { 
// //   sendThresholdAlert, 
// //   sendBudgetExceededAlert, 
// //   sendNotificationEmail,
// //   sendRecommendationEmail,           // ✅ ADDED
// //   sendRecommendationSummaryEmail     // ✅ ADDED
// // } = require('./email');

// // // Person Y Tip: Initialize Express app
// // const app = express();
// // const PORT = process.env.PORT || 5000;

// // // Person Y: Enable CORS for frontend communication
// // app.use(cors());

// // // Person Y: Parse JSON requests
// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));

// // // Person Y Tip: Create uploads directory if it doesn't exist
// // const uploadsDir = path.join(__dirname, '../uploads');
// // if (!fs.existsSync(uploadsDir)) {
// //   fs.mkdirSync(uploadsDir, { recursive: true });
// // }

// // // Person Y: Configure multer for file uploads
// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     cb(null, uploadsDir);
// //   },
// //   filename: (req, file, cb) => {
// //     // Person Y Tip: Add timestamp to prevent filename conflicts
// //     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
// //     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
// //   }
// // });

// // const upload = multer({
// //   storage: storage,
// //   limits: {
// //     fileSize: 10 * 1024 * 1024 // Person Y: 10MB file size limit
// //   },
// //   fileFilter: (req, file, cb) => {
// //     // Person Y: Only allow PDF, Excel, and Word documents
// //     const allowedTypes = ['.pdf', '.xlsx', '.xls', '.docx', '.doc'];
// //     const fileExt = path.extname(file.originalname).toLowerCase();
// //     if (allowedTypes.includes(fileExt)) {
// //       cb(null, true);
// //     } else {
// //       cb(new Error('Invalid file type. Please upload PDF, Excel, or Word documents only.'));
// //     }
// //   }
// // });

// // // Person Y Tip: Connect to MongoDB with fallback
// // const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_budget_enforcer';
// // console.log('🔗 Connecting to MongoDB:', mongoUri);

// // mongoose.connect(mongoUri, {
// //   useNewUrlParser: true,
// //   useUnifiedTopology: true,
// // })
// //   .then(() => {
// //     console.log('✅ Connected to MongoDB successfully');
// //   })
// //   .catch((error) => {
// //     console.error('❌ MongoDB connection error:', error);
// //     console.log('💡 Make sure MongoDB is running: mongod --dbpath C:\\data\\db');
// //     process.exit(1);
// //   });

// // // Person Y: Health check endpoint
// // app.get('/api/health', (req, res) => {
// //   res.json({
// //     success: true,
// //     message: 'Smart Budget Enforcer API is running!',
// //     timestamp: new Date().toISOString()
// //   });
// // });

// // // ==================== AUTHENTICATION ROUTES ====================

// // /**
// //  * User Registration
// //  * Person X: This creates a new user account
// //  */
// // app.post('/api/auth/register', async (req, res) => {
// //   try {
// //     const { email, password, name, role } = req.body;

// //     // Person Y: Validate required fields
// //     if (!email || !password || !name) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Email, password, and name are required'
// //       });
// //     }

// //     // Person Y: Check if user already exists
// //     const existingUser = await User.findOne({ email: email.toLowerCase() });
// //     if (existingUser) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'User with this email already exists'
// //       });
// //     }

// //     // Person Y: Hash password and create user
// //     const hashedPassword = await hashPassword(password);
// //     const newUser = new User({
// //       email: email.toLowerCase(),
// //       password: hashedPassword,
// //       name,
// //       role: role || 'user'
// //     });

// //     await newUser.save();

// //     // Person Y: Generate token for immediate login
// //     const token = generateToken(newUser._id);

// //     res.status(201).json({
// //       success: true,
// //       message: 'User registered successfully',
// //       token,
// //       user: {
// //         id: newUser._id,
// //         email: newUser.email,
// //         name: newUser.name,
// //         role: newUser.role
// //       }
// //     });

// //   } catch (error) {
// //     console.error('Registration error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Server error during registration'
// //     });
// //   }
// // });

// // /**
// //  * User Login
// //  * Person X: This logs in existing users
// //  */
// // app.post('/api/auth/login', async (req, res) => {
// //   try {
// //     const { email, password } = req.body;

// //     if (!email || !password) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Email and password are required'
// //       });
// //     }

// //     // Person Y: Find user and include password for comparison
// //     const user = await User.findOne({ email: email.toLowerCase() });
// //     if (!user) {
// //       return res.status(401).json({
// //         success: false,
// //         message: 'Invalid email or password'
// //       });
// //     }

// //     // Person Y: Compare password
// //     const isPasswordValid = await comparePassword(password, user.password);
// //     if (!isPasswordValid) {
// //       return res.status(401).json({
// //         success: false,
// //         message: 'Invalid email or password'
// //       });
// //     }

// //     // Person Y: Generate token
// //     const token = generateToken(user._id);

// //     res.json({
// //       success: true,
// //       message: 'Login successful',
// //       token,
// //       user: {
// //         id: user._id,
// //         email: user.email,
// //         name: user.name,
// //         role: user.role
// //       }
// //     });

// //   } catch (error) {
// //     console.error('Login error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Server error during login'
// //     });
// //   }
// // });

// // // ==================== DOCUMENT UPLOAD & RAG PROCESSING ====================

// // /**
// //  * Upload and process budget document
// //  * Person X: This sends documents to Python service for AI processing
// //  */
// // app.post('/api/upload/budget-document', verifyToken, upload.single('document'), async (req, res) => {
// //   let tempFilePath = null;

// //   try {
// //     // ✅ FIX: Better file validation
// //     if (!req.file) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'No file uploaded'
// //       });
// //     }

// //     // ✅ FIX: Validate file type
// //     const allowedTypes = [
// //       'application/pdf',
// //       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
// //       'application/vnd.ms-excel', // .xls
// //       'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
// //       'application/msword', // .doc
// //       'text/csv',
// //       'text/plain'
// //     ];

// //     if (!allowedTypes.includes(req.file.mimetype)) {
// //       // Clean up uploaded file
// //       if (fs.existsSync(req.file.path)) {
// //         fs.unlinkSync(req.file.path);
// //       }
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Invalid file type. Please upload PDF, Excel, Word, CSV, or text files only.'
// //       });
// //     }

// //     tempFilePath = req.file.path;
// //     console.log('📄 File uploaded:', req.file.filename, 'Size:', req.file.size, 'Type:', req.file.mimetype);

// //     // ✅ FIX: Enhanced FormData creation with proper error handling
// //     const FormData = require('form-data');
// //     const formData = new FormData();

// //     // ✅ FIX: Check if file exists before creating stream
// //     if (!fs.existsSync(tempFilePath)) {
// //       throw new Error('Uploaded file not found on server');
// //     }

// //     const fileStream = fs.createReadStream(tempFilePath);

// //     // ✅ FIX: Handle stream errors
// //     fileStream.on('error', (error) => {
// //       console.error('❌ File stream error:', error);
// //       throw new Error('Error reading uploaded file');
// //     });

// //     formData.append('file', fileStream, {
// //       filename: req.file.filename,
// //       contentType: req.file.mimetype
// //     });
// //     formData.append('user_id', req.user.id);

// //     console.log('🔄 Sending file to Python RAG service...');

// //     // ✅ FIX: Use environment variable with fallback and better timeout
// //     const pythonUrl = process.env.PYTHON_RAG_URL || 'http://localhost:8001';
// //     const pythonResponse = await axios.post(
// //       `${pythonUrl}/process-document`,
// //       formData,
// //       {
// //         headers: {
// //           ...formData.getHeaders(), // ✅ FIX: Only use FormData headers
// //         },
// //         timeout: 180000, // ✅ FIX: 3 minute timeout for AI processing
// //         maxContentLength: 50 * 1024 * 1024, // 50MB limit
// //         maxBodyLength: 50 * 1024 * 1024
// //       }
// //     );

// //     console.log('🐍 Python response status:', pythonResponse.status);
// //     console.log('🐍 Python response success:', pythonResponse.data?.success);

// //     // ✅ FIX: Better response validation
// //     if (!pythonResponse.data || typeof pythonResponse.data !== 'object') {
// //       throw new Error('Invalid response from AI processing service');
// //     }

// //     if (!pythonResponse.data.success) {
// //       const errorMsg = pythonResponse.data.error || pythonResponse.data.message || 'AI processing failed';
// //       throw new Error(`AI Processing Error: ${errorMsg}`);
// //     }

// //     const budgetItems = pythonResponse.data.budget_data;

// //     // ✅ FIX: Enhanced budget data validation
// //     if (!budgetItems || !Array.isArray(budgetItems) || budgetItems.length === 0) {
// //       throw new Error('No budget data extracted from document. Please ensure your document contains budget information in a recognizable format (tables, structured data, etc.).');
// //     }

// //     console.log(`💾 Processing ${budgetItems.length} budget items for storage...`);

// //     const savedBudgets = [];
// //     const errors = [];

// //     for (let i = 0; i < budgetItems.length; i++) {
// //       const item = budgetItems[i];
// //       try {
// //         // ✅ FIX: Enhanced validation and data cleaning
// //         const amount = parseFloat(item.amount) || parseFloat(item.limit_amount) || 0;
// //         const limitAmount = parseFloat(item.limit_amount) || parseFloat(item.amount) || 0;

// //         if (amount <= 0 || limitAmount <= 0) {
// //           errors.push(`Item ${i + 1}: Invalid amount (${amount}) or limit (${limitAmount})`);
// //           continue;
// //         }

// //         const budgetData = {
// //           name: (item.name || `${item.department || 'General'} ${item.category || 'Budget'}`).trim(),
// //           category: (item.category || 'General').trim(),
// //           department: (item.department || 'General').trim(),
// //           amount: amount,
// //           limit_amount: limitAmount,
// //           used_amount: 0, // Initial value
// //           warning_threshold: parseFloat(item.warning_threshold) || (limitAmount * 0.8),
// //           priority: item.priority || 'Medium',
// //           vendor: (item.vendor || '').trim(),
// //           email: item.email || req.user.email || 'gbharathitrs@gmail.com',
// //           user_id: req.user.id,
// //           status: 'active',
// //           created_at: new Date(),
// //           updated_at: new Date()
// //         };

// //         // ✅ FIX: Validate email format
// //         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// //         if (!emailRegex.test(budgetData.email)) {
// //           budgetData.email = req.user.email || 'gbharathitrs@gmail.com';
// //         }

// //         console.log(`💾 Saving budget ${i + 1}:`, {
// //           name: budgetData.name,
// //           department: budgetData.department,
// //           category: budgetData.category,
// //           limit_amount: budgetData.limit_amount
// //         });

// //         const budget = new Budget(budgetData);
// //         const savedBudget = await budget.save();
// //         savedBudgets.push(savedBudget);

// //       } catch (saveError) {
// //         console.error(`❌ Error saving budget item ${i + 1}:`, saveError);
// //         errors.push(`Item ${i + 1}: ${saveError.message}`);
// //         continue; // Skip this item but continue with others
// //       }
// //     }

// //     // ✅ FIX: Always clean up uploaded file
// //     if (tempFilePath && fs.existsSync(tempFilePath)) {
// //       try {
// //         fs.unlinkSync(tempFilePath);
// //         console.log('🗑️ Temporary file cleaned up');
// //       } catch (cleanupError) {
// //         console.warn('⚠️ Could not delete temporary file:', cleanupError.message);
// //       }
// //     }

// //     // ✅ FIX: Better success/partial success handling
// //     if (savedBudgets.length === 0) {
// //       throw new Error(`Failed to save any budget items. Errors: ${errors.join('; ')}`);
// //     }

// //     const response = {
// //       success: true,
// //       message: `Document processed successfully! Extracted and saved ${savedBudgets.length} budget items.`,
// //       budget_count: savedBudgets.length,
// //       total_extracted: budgetItems.length,
// //       budgets: savedBudgets.map(b => ({
// //         id: b._id,
// //         name: b.name,
// //         department: b.department,
// //         category: b.category,
// //         limit_amount: b.limit_amount,
// //         warning_threshold: b.warning_threshold,
// //         priority: b.priority,
// //         email: b.email,
// //         status: b.status
// //       })),
// //       processing_info: {
// //         processing_time: pythonResponse.data.processing_time || 0,
// //         processing_steps: pythonResponse.data.processing_steps || []
// //       }
// //     };

// //     // ✅ FIX: Include warnings if some items failed
// //     if (errors.length > 0) {
// //       response.warnings = errors;
// //       response.message += ` Note: ${errors.length} items could not be processed.`;
// //     }

// //     console.log(`✅ Successfully processed document: ${savedBudgets.length}/${budgetItems.length} items saved`);
// //     res.json(response);

// //   } catch (error) {
// //     console.error('❌ Document upload error:', error);

// //     // ✅ FIX: Ensure cleanup on any error
// //     if (tempFilePath && fs.existsSync(tempFilePath)) {
// //       try {
// //         fs.unlinkSync(tempFilePath);
// //         console.log('🗑️ Cleanup: Temporary file deleted after error');
// //       } catch (cleanupError) {
// //         console.warn('⚠️ Could not delete temporary file after error:', cleanupError.message);
// //       }
// //     }

// //     // ✅ FIX: Enhanced error handling and user-friendly messages
// //     let errorMessage = 'Error processing document';
// //     let statusCode = 500;

// //     if (error.code === 'ECONNREFUSED') {
// //       errorMessage = 'AI processing service is unavailable. Please try again later.';
// //       statusCode = 503;
// //     } else if (error.code === 'ETIMEDOUT') {
// //       errorMessage = 'Document processing timed out. Please try with a smaller file or try again later.';
// //       statusCode = 408;
// //     } else if (error.response?.status === 422) {
// //       errorMessage = error.response.data?.detail || 'The document format is not supported or contains no budget data.';
// //       statusCode = 422;
// //     } else if (error.response?.status === 400) {
// //       errorMessage = error.response.data?.detail || 'Invalid file format or content.';
// //       statusCode = 400;
// //     } else if (error.response?.data?.detail) {
// //       errorMessage = error.response.data.detail;
// //     } else if (error.message) {
// //       errorMessage = error.message;
// //     }

// //     const errorResponse = {
// //       success: false,
// //       message: errorMessage,
// //       error_type: error.code || 'PROCESSING_ERROR'
// //     };

// //     // ✅ FIX: Only include debug info in development
// //     if (process.env.NODE_ENV === 'development') {
// //       errorResponse.debug_info = {
// //         python_url: process.env.PYTHON_RAG_URL || 'http://localhost:8000',
// //         file_info: req.file ? {
// //           name: req.file.filename,
// //           size: req.file.size,
// //           type: req.file.mimetype,
// //           path: req.file.path
// //         } : null,
// //         stack: error.stack
// //       };
// //     }

// //     res.status(statusCode).json(errorResponse);
// //   }
// // });

// // // ==================== BUDGET MANAGEMENT ROUTES ====================

// // /**
// //  * Get all budgets for user
// //  * Person X: This fetches all budget data for the dashboard
// //  */
// // app.get('/api/budgets', verifyToken, async (req, res) => {
// //   try {
// //     const budgets = await Budget.find({ user_id: req.user.id }).sort({ createdAt: -1 });

// //     res.json({
// //       success: true,
// //       budgets
// //     });

// //   } catch (error) {
// //     console.error('Get budgets error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Error fetching budgets'
// //     });
// //   }
// // });

// // /**
// //  * Get budget by ID
// //  */
// // app.get('/api/budgets/:id', verifyToken, async (req, res) => {
// //   try {
// //     const budget = await Budget.findOne({
// //       _id: req.params.id,
// //       user_id: req.user.id
// //     });

// //     if (!budget) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'Budget not found'
// //       });
// //     }

// //     res.json({
// //       success: true,
// //       budget
// //     });

// //   } catch (error) {
// //     console.error('Get budget error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Error fetching budget'
// //     });
// //   }
// // });

// // /**
// //  * Update budget
// //  */
// // app.put('/api/budgets/:id', verifyToken, async (req, res) => {
// //   try {
// //     const budget = await Budget.findOneAndUpdate(
// //       { _id: req.params.id, user_id: req.user.id },
// //       req.body,
// //       { new: true, runValidators: true }
// //     );

// //     if (!budget) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'Budget not found'
// //       });
// //     }

// //     res.json({
// //       success: true,
// //       budget
// //     });

// //   } catch (error) {
// //     console.error('Update budget error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Error updating budget'
// //     });
// //   }
// // });

// // /**
// //  * Delete budget
// //  */
// // app.delete('/api/budgets/:id', verifyToken, async (req, res) => {
// //   try {
// //     const budget = await Budget.findOneAndDelete({
// //       _id: req.params.id,
// //       user_id: req.user.id
// //     });

// //     if (!budget) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'Budget not found'
// //       });
// //     }

// //     res.json({
// //       success: true,
// //       message: 'Budget deleted successfully'
// //     });

// //   } catch (error) {
// //     console.error('Delete budget error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Error deleting budget'
// //     });
// //   }
// // });

// // // ==================== EXPENSE MANAGEMENT ROUTES ====================

// // /**
// //  * Add new expense
// //  * Person X: This is where users add expenses and triggers AI monitoring
// //  */
// // app.post('/api/expenses', verifyToken, async (req, res) => {
// //   try {
// //     const { amount, department, category, description, vendor_name, budget_id } = req.body;

// //     // Person Y: Validate required fields
// //     if (!amount || !department || !category || !description || !budget_id) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Amount, department, category, description, and budget_id are required'
// //       });
// //     }

// //     // Person Y: Find the budget
// //     const budget = await Budget.findOne({
// //       _id: budget_id,
// //       user_id: req.user.id
// //     });

// //     if (!budget) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'Budget not found'
// //       });
// //     }

// //     // Person Y: Create expense
// //     const expense = new Expense({
// //       amount: parseFloat(amount),
// //       department,
// //       category,
// //       description,
// //       vendor_name: vendor_name || '',
// //       budget_id,
// //       user_id: req.user.id
// //     });

// //     await expense.save();

// //     // Person Y: Update budget used_amount
// //     const newUsedAmount = budget.used_amount + parseFloat(amount);
// //     budget.used_amount = newUsedAmount;
// //     await budget.save();

// //     // Person Y: Check thresholds and send alerts
// //     await checkBudgetThresholds(budget, expense);

// //     res.status(201).json({
// //       success: true,
// //       message: 'Expense added successfully',
// //       expense,
// //       budget: {
// //         ...budget.toObject(),
// //         used_amount: newUsedAmount
// //       }
// //     });

// //   } catch (error) {
// //     console.error('Add expense error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Error adding expense'
// //     });
// //   }
// // });

// // /**
// //  * ✅ ENHANCED: Helper function to check budget thresholds and trigger AI recommendations
// //  */
// // async function checkBudgetThresholds(budget, expense) {
// //   try {
// //     const usagePercentage = (budget.used_amount / budget.limit_amount) * 100;
// //     const previousUsage = ((budget.used_amount - expense.amount) / budget.limit_amount) * 100;

// //     console.log(`💰 Budget usage: ${usagePercentage.toFixed(1)}% for ${budget.department} - ${budget.category}`);

// //     // ✅ ENHANCED: Check threshold alerts (25%, 50%, 75%, 90%)
// //     const thresholds = [25, 50, 75, 90];
// //     for (const threshold of thresholds) {
// //       if (usagePercentage >= threshold && previousUsage < threshold) {
// //         console.log(`🚨 Threshold ${threshold}% reached for ${budget.department} - ${budget.category}`);

// //         // Send email alert
// //         await sendThresholdAlert(budget, expense, threshold);

// //         // Create alert record
// //         await createAlert({
// //           type: 'threshold_warning',
// //           severity: threshold >= 90 ? 'critical' : threshold >= 75 ? 'high' : threshold >= 50 ? 'medium' : 'low',
// //           message: `Budget usage reached ${threshold}% for ${budget.department} - ${budget.category}`,
// //           department: budget.department,
// //           category: budget.category,
// //           budget_id: budget._id,
// //           expense_id: expense._id,
// //           user_id: budget.user_id,
// //           email_sent: true
// //         });

// //         // ✅ NEW: Trigger AI recommendations for high thresholds (75%+)
// //         if (threshold >= 75) {
// //           console.log(`🧠 Triggering AI analysis for ${threshold}% threshold breach`);
// //           await triggerAIRecommendations(budget, expense, 'threshold_warning', threshold);
// //         }
// //       }
// //     }

// //     // ✅ ENHANCED: Check if budget exceeded (100%+)
// //     if (usagePercentage > 100 && previousUsage <= 100) {
// //       console.log(`🚫 Budget exceeded for ${budget.department} - ${budget.category}`);

// //       // ✅ ENHANCED: Always trigger AI recommendations for budget exceeding
// //       const aiResult = await triggerAIRecommendations(budget, expense, 'budget_exceeded', usagePercentage);

// //       // Send email with AI recommendations
// //       const recommendations = aiResult.success ? aiResult.recommendations : [];
// //       await sendBudgetExceededAlert(budget, expense, recommendations);

// //       // Create alert record
// //       const alertData = {
// //         type: 'budget_exceeded',
// //         severity: 'critical',
// //         message: `Budget exceeded by $${(budget.used_amount - budget.limit_amount).toFixed(2)} for ${budget.department} - ${budget.category}`,
// //         department: budget.department,
// //         category: budget.category,
// //         budget_id: budget._id,
// //         expense_id: expense._id,
// //         user_id: budget.user_id,
// //         email_sent: true,
// //         metadata: {
// //           overage_amount: budget.used_amount - budget.limit_amount,
// //           usage_percentage: usagePercentage,
// //           ai_recommendations_generated: aiResult.success,
// //           recommendations_count: recommendations.length
// //         }
// //       };

// //       await createAlert(alertData);

// //       // Update budget status
// //       budget.status = 'exceeded';
// //       await budget.save();
// //     }

// //   } catch (error) {
// //     console.error('Error checking budget thresholds:', error);
// //   }
// // }

// // /**
// //  * ✅ NEW: Trigger AI recommendations from Python service
// //  */
// // async function triggerAIRecommendations(budget, expense, breachType, usagePercentage) {
// //   try {
// //     console.log(`🧠 Requesting AI recommendations for ${budget.department} - ${budget.category}`);

// //     // Prepare comprehensive data for AI analysis
// //     const aiRequestPayload = {
// //       budget_data: {
// //         id: budget._id,
// //         name: budget.name,
// //         department: budget.department,
// //         category: budget.category,
// //         limit_amount: budget.limit_amount,
// //         used_amount: budget.used_amount,
// //         remaining_amount: budget.limit_amount - budget.used_amount,
// //         usage_percentage: usagePercentage,
// //         warning_threshold: budget.warning_threshold,
// //         priority: budget.priority,
// //         vendor: budget.vendor,
// //         email: budget.email,
// //         status: budget.status
// //       },
// //       expense_data: {
// //         id: expense._id,
// //         amount: expense.amount,
// //         department: expense.department,
// //         category: expense.category,
// //         description: expense.description,
// //         vendor_name: expense.vendor_name,
// //         date: expense.createdAt
// //       },
// //       breach_context: {
// //         type: breachType,
// //         severity: usagePercentage > 100 ? 'critical' : usagePercentage > 90 ? 'high' : usagePercentage > 75 ? 'medium' : 'low',
// //         usage_percentage: usagePercentage,
// //         overage_amount: Math.max(0, budget.used_amount - budget.limit_amount),
// //         triggered_by_expense: expense.amount
// //       },
// //       user_id: budget.user_id
// //     };

// //     console.log(`📡 Sending AI request to Python service: ${process.env.PYTHON_RAG_URL}/generate-recommendations`);

// //     // ✅ ENHANCED: Call Python service with retry logic and timeout
// //     const pythonUrl = process.env.PYTHON_RAG_URL || 'http://localhost:8000';
// //     let response;

// //     const maxRetries = 3;
// //     for (let attempt = 1; attempt <= maxRetries; attempt++) {
// //       try {
// //         response = await axios.post(
// //           `${pythonUrl}/generate-recommendations`,
// //           aiRequestPayload,
// //           {
// //             timeout: 120000, // 2 minutes timeout
// //             headers: {
// //               'Content-Type': 'application/json',
// //               'User-Agent': 'SmartBudgetEnforcer-NodeJS/1.0'
// //             }
// //           }
// //         );
// //         break; // Success, exit retry loop
// //       } catch (retryError) {
// //         console.warn(`⚠️ AI service attempt ${attempt}/${maxRetries} failed:`, retryError.message);
// //         if (attempt === maxRetries) {
// //           throw retryError; // Re-throw on final attempt
// //         }
// //         // Wait before retry
// //         await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
// //       }
// //     }

// //     console.log(`✅ AI service response status: ${response.status}`);

// //     if (response.status === 200 && response.data.success) {
// //       const recommendations = response.data.recommendations || [];
// //       console.log(`🧠 AI generated ${recommendations.length} recommendations`);

// //       // ✅ ENHANCED: Store recommendations directly in database
// //       const storedRecommendations = [];
// //       for (const rec of recommendations) {
// //         try {
// //           const storedRec = await createRecommendation({
// //             title: rec.title,
// //             description: rec.description,
// //             type: rec.type,
// //             priority: rec.priority || 2,
// //             department: budget.department,
// //             category: budget.category,
// //             estimated_savings: parseFloat(rec.estimated_savings) || 0,
// //             budget_id: budget._id,
// //             user_id: budget.user_id,
// //             ai_metadata: {
// //               generated_by: 'expense_threshold_trigger',
// //               breach_type: breachType,
// //               usage_percentage: usagePercentage,
// //               triggering_expense: expense._id,
// //               generated_at: new Date().toISOString()
// //             }
// //           });
// //           storedRecommendations.push(storedRec);
// //         } catch (storeError) {
// //           console.error(`❌ Error storing recommendation: ${storeError.message}`);
// //         }
// //       }

// //       // ✅ ENHANCED: Send email for high-priority recommendations
// //       for (const rec of storedRecommendations) {
// //         if (rec.priority === 1 || rec.estimated_savings >= 5000) {
// //           try {
// //             await sendRecommendationEmail(
// //               await User.findById(budget.user_id),
// //               rec,
// //               budget,
// //               {
// //                 total_breaches: 1,
// //                 departments_affected: [budget.department],
// //                 total_overage: Math.max(0, budget.used_amount - budget.limit_amount)
// //               }
// //             );
// //             console.log(`📧 Email sent for high-priority recommendation: ${rec.title}`);
// //           } catch (emailError) {
// //             console.warn(`⚠️ Email failed for recommendation ${rec.title}:`, emailError.message);
// //           }
// //         }
// //       }

// //       return {
// //         success: true,
// //         recommendations: storedRecommendations,
// //         recommendations_count: storedRecommendations.length,
// //         ai_response: response.data
// //       };

// //     } else {
// //       console.error(`❌ AI service returned error:`, response.data);
// //       return {
// //         success: false,
// //         error: response.data?.error || 'AI service returned invalid response',
// //         recommendations: []
// //       };
// //     }

// //   } catch (error) {
// //     console.error('❌ Error getting AI recommendations:', error);

// //     // ✅ ENHANCED: Fallback recommendations when AI fails
// //     const fallbackRecommendations = await generateFallbackRecommendations(budget, expense, breachType);

// //     return {
// //       success: false,
// //       error: error.message,
// //       fallback_used: true,
// //       recommendations: fallbackRecommendations,
// //       recommendations_count: fallbackRecommendations.length
// //     };
// //   }
// // }

// // /**
// //  * ✅ NEW: Generate fallback recommendations when AI service is unavailable
// //  */
// // async function generateFallbackRecommendations(budget, expense, breachType) {
// //   try {
// //     console.log(`🔄 Generating fallback recommendations for ${budget.department} - ${budget.category}`);

// //     const fallbackRecommendations = [];
// //     const overage = Math.max(0, budget.used_amount - budget.limit_amount);

// //     // Fallback recommendation 1: Spending pause
// //     const pauseRec = await createRecommendation({
// //       title: `Immediate Spending Review - ${budget.department}`,
// //       description: `Implement immediate review process for all ${budget.category} expenses in ${budget.department}. ` +
// //         `Require manager approval for expenses over $500 until budget is back within limits. ` +
// //         `Current overage: ${overage.toFixed(2)}.`,
// //       type: 'spending_pause',
// //       priority: breachType === 'budget_exceeded' ? 1 : 2,
// //       department: budget.department,
// //       category: budget.category,
// //       estimated_savings: overage * 0.5,
// //       budget_id: budget._id,
// //       user_id: budget.user_id
// //     });
// //     fallbackRecommendations.push(pauseRec);

// //     // Fallback recommendation 2: Vendor review
// //     const vendorRec = await createRecommendation({
// //       title: `Vendor Cost Analysis - ${budget.category}`,
// //       description: `Conduct immediate review of current ${budget.category} vendors and contracts. ` +
// //         `Research 3-5 alternative suppliers and negotiate better rates. Target 15-20% cost reduction ` +
// //         `through competitive bidding and contract renegotiation.`,
// //       type: 'vendor_alternative',
// //       priority: 2,
// //       department: budget.department,
// //       category: budget.category,
// //       estimated_savings: budget.used_amount * 0.15,
// //       budget_id: budget._id,
// //       user_id: budget.user_id
// //     });
// //     fallbackRecommendations.push(vendorRec);

// //     // Fallback recommendation 3: Budget reallocation (if overage exists)
// //     if (overage > 0) {
// //       const reallocRec = await createRecommendation({
// //         title: `Emergency Budget Reallocation Request`,
// //         description: `Submit request to reallocate funds from underutilized budgets to cover ` +
// //           `${budget.department} - ${budget.category} overage of ${overage.toFixed(2)}. ` +
// //           `Review other department budgets for available funds that can be transferred.`,
// //         type: 'budget_reallocation',
// //         priority: 1,
// //         department: budget.department,
// //         category: budget.category,
// //         estimated_savings: overage,
// //         budget_id: budget._id,
// //         user_id: budget.user_id
// //       });
// //       fallbackRecommendations.push(reallocRec);
// //     }

// //     console.log(`✅ Generated ${fallbackRecommendations.length} fallback recommendations`);
// //     return fallbackRecommendations;

// //   } catch (error) {
// //     console.error('❌ Error generating fallback recommendations:', error);
// //     return [];
// //   }
// // }

// // /**
// //  * ✅ ENHANCED: Get comprehensive budget analysis for AI
// //  */
// // async function getAllBudgetsForAI(userId) {
// //   try {
// //     const allBudgets = await Budget.find({ user_id: userId });

// //     return allBudgets.map(budget => ({
// //       id: budget._id,
// //       name: budget.name,
// //       department: budget.department,
// //       category: budget.category,
// //       limit_amount: budget.limit_amount,
// //       used_amount: budget.used_amount,
// //       remaining_amount: budget.limit_amount - budget.used_amount,
// //       usage_percentage: (budget.used_amount / budget.limit_amount) * 100,
// //       status: budget.status,
// //       priority: budget.priority
// //     }));

// //   } catch (error) {
// //     console.error('Error getting budgets for AI analysis:', error);
// //     return [];
// //   }
// // }

// // /**
// //  * ✅ ENHANCED: Helper function to create alerts with metadata
// //  */
// // async function createAlert(alertData) {
// //   try {
// //     const alert = new Alert({
// //       ...alertData,
// //       created_at: new Date(),
// //       read: false
// //     });
// //     await alert.save();
// //     return alert;
// //   } catch (error) {
// //     console.error('Error creating alert:', error);
// //     throw error;
// //   }
// // }

// // /**
// //  * ✅ ENHANCED: Helper function to create recommendations with validation
// //  */
// // async function createRecommendation(recData) {
// //   try {
// //     // Validate required fields
// //     const requiredFields = ['title', 'description', 'type', 'user_id'];
// //     for (const field of requiredFields) {
// //       if (!recData[field]) {
// //         throw new Error(`Missing required field: ${field}`);
// //       }
// //     }

// //     // Validate recommendation type
// //     const validTypes = ['budget_reallocation', 'vendor_alternative', 'spending_pause', 'approval_request'];
// //     if (!validTypes.includes(recData.type)) {
// //       throw new Error(`Invalid recommendation type: ${recData.type}`);
// //     }

// //     const recommendation = new Recommendation({
// //       title: recData.title,
// //       description: recData.description,
// //       type: recData.type,
// //       priority: recData.priority || 2,
// //       department: recData.department || '',
// //       category: recData.category || '',
// //       estimated_savings: parseFloat(recData.estimated_savings) || 0,
// //       budget_id: recData.budget_id || null,
// //       alert_id: recData.alert_id || null,
// //       user_id: recData.user_id,
// //       status: recData.status || 'pending',
// //       ai_metadata: recData.ai_metadata || {}
// //     });

// //     await recommendation.save();
// //     return recommendation;
// //   } catch (error) {
// //     console.error('Error creating recommendation:', error);
// //     throw error;
// //   }
// // }

// // /**
// //  * Get all expenses for user
// //  */
// // app.get('/api/expenses', verifyToken, async (req, res) => {
// //   try {
// //     const expenses = await Expense.find({ user_id: req.user.id })
// //       .populate('budget_id', 'name department category')
// //       .sort({ createdAt: -1 });

// //     res.json({
// //       success: true,
// //       expenses
// //     });

// //   } catch (error) {
// //     console.error('Get expenses error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Error fetching expenses'
// //     });
// //   }
// // });

// // /**
// //  * Get expenses by budget
// //  */
// // app.get('/api/expenses/budget/:budgetId', verifyToken, async (req, res) => {
// //   try {
// //     const expenses = await Expense.find({
// //       budget_id: req.params.budgetId,
// //       user_id: req.user.id
// //     }).sort({ createdAt: -1 });

// //     res.json({
// //       success: true,
// //       expenses
// //     });

// //   } catch (error) {
// //     console.error('Get budget expenses error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Error fetching budget expenses'
// //     });
// //   }
// // });

// // // ==================== DASHBOARD DATA ROUTES ====================

// // /**
// //  * Get dashboard summary data
// //  * Person X: This provides all data needed for the dashboard charts
// //  */
// // app.get('/api/dashboard/summary', verifyToken, async (req, res) => {
// //   try {
// //     // Person Y: Get all budgets with aggregated data
// //     const budgets = await Budget.find({ user_id: req.user.id });

// //     // Person Y: Calculate summary statistics
// //     const totalBudgets = budgets.length;
// //     const totalAllocated = budgets.reduce((sum, b) => sum + b.limit_amount, 0);
// //     const totalUsed = budgets.reduce((sum, b) => sum + b.used_amount, 0);
// //     const totalRemaining = totalAllocated - totalUsed;

// //     // Person Y: Group by department
// //     const departmentSummary = budgets.reduce((acc, budget) => {
// //       if (!acc[budget.department]) {
// //         acc[budget.department] = {
// //           department: budget.department,
// //           allocated: 0,
// //           used: 0,
// //           remaining: 0,
// //           categories: []
// //         };
// //       }

// //       acc[budget.department].allocated += budget.limit_amount;
// //       acc[budget.department].used += budget.used_amount;
// //       acc[budget.department].remaining += (budget.limit_amount - budget.used_amount);
// //       acc[budget.department].categories.push({
// //         name: budget.category,
// //         allocated: budget.limit_amount,
// //         used: budget.used_amount,
// //         remaining: budget.limit_amount - budget.used_amount,
// //         percentage: (budget.used_amount / budget.limit_amount) * 100,
// //         status: budget.status,
// //         priority: budget.priority
// //       });

// //       return acc;
// //     }, {});

// //     // Person Y: Get recent alerts
// //     const recentAlerts = await Alert.find({ user_id: req.user.id })
// //       .sort({ createdAt: -1 })
// //       .limit(5);

// //     // Person Y: Get active recommendations
// //     const activeRecommendations = await Recommendation.find({
// //       user_id: req.user.id,
// //       status: 'pending'
// //     }).sort({ priority: 1, createdAt: -1 });

// //     res.json({
// //       success: true,
// //       summary: {
// //         totalBudgets,
// //         totalAllocated,
// //         totalUsed,
// //         totalRemaining,
// //         usagePercentage: totalAllocated > 0 ? (totalUsed / totalAllocated) * 100 : 0
// //       },
// //       departmentSummary: Object.values(departmentSummary),
// //       recentAlerts,
// //       activeRecommendations
// //     });

// //   } catch (error) {
// //     console.error('Dashboard summary error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Error fetching dashboard data'
// //     });
// //   }
// // });

// // // ==================== ALERTS & RECOMMENDATIONS ROUTES ====================

// // /**
// //  * Get all alerts for user
// //  */
// // app.get('/api/alerts', verifyToken, async (req, res) => {
// //   try {
// //     const alerts = await Alert.find({ user_id: req.user.id })
// //       .populate('budget_id', 'name department category')
// //       .populate('expense_id', 'amount description')
// //       .sort({ createdAt: -1 });

// //     res.json({
// //       success: true,
// //       alerts
// //     });

// //   } catch (error) {
// //     console.error('Get alerts error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Error fetching alerts'
// //     });
// //   }
// // });

// // /**
// //  * Mark alert as read
// //  */
// // app.put('/api/alerts/:id/read', verifyToken, async (req, res) => {
// //   try {
// //     const alert = await Alert.findOneAndUpdate(
// //       { _id: req.params.id, user_id: req.user.id },
// //       { read: true },
// //       { new: true }
// //     );

// //     if (!alert) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'Alert not found'
// //       });
// //     }

// //     res.json({
// //       success: true,
// //       alert
// //     });

// //   } catch (error) {
// //     console.error('Mark alert read error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Error updating alert'
// //     });
// //   }
// // });

// // /**
// //  * Get all recommendations for user
// //  */
// // app.get('/api/recommendations', verifyToken, async (req, res) => {
// //   try {
// //     const recommendations = await Recommendation.find({ user_id: req.user.id })
// //       .populate('budget_id', 'name department category')
// //       .sort({ priority: 1, createdAt: -1 });

// //     res.json({
// //       success: true,
// //       recommendations
// //     });

// //   } catch (error) {
// //     console.error('Get recommendations error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Error fetching recommendations'
// //     });
// //   }
// // });

// // /**
// //  * Update recommendation status
// //  */
// // app.put('/api/recommendations/:id/status', verifyToken, async (req, res) => {
// //   try {
// //     const { status } = req.body;

// //     if (!['accepted', 'rejected', 'implemented'].includes(status)) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Invalid status'
// //       });
// //     }

// //     const recommendation = await Recommendation.findOneAndUpdate(
// //       { _id: req.params.id, user_id: req.user.id },
// //       { status },
// //       { new: true }
// //     );

// //     if (!recommendation) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'Recommendation not found'
// //       });
// //     }

// //     res.json({
// //       success: true,
// //       recommendation
// //     });

// //   } catch (error) {
// //     console.error('Update recommendation error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Error updating recommendation'
// //     });
// //   }
// // });

// // // ==================== AI RECOMMENDATIONS PROCESSING ENDPOINT ====================

// // /**
// //  * ✅ MISSING ENDPOINT: Internal endpoint for Python service to send AI recommendations
// //  * This is called by the Python Escalation Communicator Agent
// //  */
// // app.post('/api/internal/process-recommendations', async (req, res) => {
// //   try {
// //     const { 
// //       user_id, 
// //       recommendations, 
// //       breach_detected, 
// //       breach_summary, 
// //       budget_summary,
// //       timestamp 
// //     } = req.body;

// //     console.log(`🧠 Processing ${recommendations?.length || 0} AI recommendations for user ${user_id}`);

// //     // Validate request
// //     if (!user_id || !recommendations || !Array.isArray(recommendations)) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'user_id and recommendations array are required'
// //       });
// //     }

// //     // Get user details
// //     const user = await User.findById(user_id);
// //     if (!user) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'User not found'
// //       });
// //     }

// //     let recommendationsStored = 0;
// //     let emailsSent = 0;
// //     const processingResults = [];
// //     const errors = [];

// //     // Process each recommendation
// //     for (let i = 0; i < recommendations.length; i++) {
// //       const recData = recommendations[i];
      
// //       try {
// //         // Validate recommendation data
// //         if (!recData.title || !recData.description || !recData.type) {
// //           errors.push(`Recommendation ${i + 1}: Missing required fields`);
// //           continue;
// //         }

// //         // Find related budget if department/category provided
// //         let relatedBudget = null;
// //         if (recData.department && recData.category) {
// //           relatedBudget = await Budget.findOne({
// //             user_id: user_id,
// //             department: recData.department,
// //             category: recData.category
// //           });
// //         }

// //         // Create recommendation with enhanced data
// //         const recommendationDoc = new Recommendation({
// //           title: recData.title,
// //           description: recData.description,
// //           type: recData.type,
// //           priority: recData.priority || 2,
// //           department: recData.department || '',
// //           category: recData.category || '',
// //           estimated_savings: parseFloat(recData.estimated_savings) || 0,
// //           budget_id: relatedBudget ? relatedBudget._id : null,
// //           user_id: user_id,
// //           status: 'pending',
// //           ai_metadata: {
// //             generated_at: recData.created_at || new Date().toISOString(),
// //             breach_triggered: breach_detected || false,
// //             breach_severity: breach_summary?.severity_breakdown || {},
// //             budget_context: {
// //               total_allocated: budget_summary?.total_allocated || 0,
// //               overall_usage: budget_summary?.overall_usage_percentage || 0,
// //               budgets_at_risk: budget_summary?.budgets_at_risk || 0
// //             }
// //           }
// //         });

// //         const savedRecommendation = await recommendationDoc.save();
// //         recommendationsStored++;

// //         processingResults.push({
// //           recommendation_id: savedRecommendation._id,
// //           title: recData.title,
// //           priority: recData.priority,
// //           estimated_savings: recData.estimated_savings,
// //           related_budget: relatedBudget ? relatedBudget.name : null,
// //           status: 'stored'
// //         });

// //         console.log(`💾 Stored recommendation ${i + 1}: ${recData.title} (Priority: ${recData.priority})`);

// //         // Send email notifications for high-priority recommendations
// //         if (recData.priority === 1 || recData.estimated_savings >= 5000) {
// //           try {
// //             const emailResult = await sendRecommendationEmail(
// //               user, 
// //               savedRecommendation, 
// //               relatedBudget,
// //               breach_summary
// //             );
            
// //             if (emailResult.success) {
// //               emailsSent++;
// //               processingResults[processingResults.length - 1].email_sent = true;
// //               console.log(`📧 Email sent for high-priority recommendation: ${recData.title}`);
// //             } else {
// //               console.warn(`⚠️ Email failed for recommendation: ${recData.title} - ${emailResult.error}`);
// //               processingResults[processingResults.length - 1].email_error = emailResult.error;
// //             }
// //           } catch (emailError) {
// //             console.error(`❌ Email error for recommendation ${recData.title}:`, emailError);
// //             errors.push(`Email failed for recommendation: ${recData.title}`);
// //           }
// //         }

// //         // Create related alert for critical recommendations
// //         if (recData.priority === 1 && breach_detected) {
// //           try {
// //             await createAlert({
// //               type: 'ai_recommendation',
// //               severity: 'high',
// //               message: `AI generated critical recommendation: ${recData.title}`,
// //               department: recData.department || '',
// //               category: recData.category || '',
// //               budget_id: relatedBudget ? relatedBudget._id : null,
// //               user_id: user_id,
// //               metadata: {
// //                 recommendation_id: savedRecommendation._id,
// //                 estimated_savings: recData.estimated_savings,
// //                 ai_generated: true
// //               }
// //             });
// //             console.log(`🚨 Created alert for critical recommendation: ${recData.title}`);
// //           } catch (alertError) {
// //             console.warn(`⚠️ Could not create alert for recommendation: ${alertError.message}`);
// //           }
// //         }

// //       } catch (recError) {
// //         console.error(`❌ Error processing recommendation ${i + 1}:`, recError);
// //         errors.push(`Recommendation ${i + 1}: ${recError.message}`);
// //         continue;
// //       }
// //     }

// //     // Send summary email for multiple recommendations
// //     if (recommendationsStored > 1) {
// //       try {
// //         const summaryEmailResult = await sendRecommendationSummaryEmail(
// //           user,
// //           recommendationsStored,
// //           breach_summary,
// //           budget_summary
// //         );
        
// //         if (summaryEmailResult.success) {
// //           console.log(`📧 Summary email sent for ${recommendationsStored} recommendations`);
// //         }
// //       } catch (summaryError) {
// //         console.warn(`⚠️ Summary email failed:`, summaryError);
// //       }
// //     }

// //     // Response with detailed results
// //     const response = {
// //       success: true,
// //       message: `Processed ${recommendations.length} recommendations successfully`,
// //       recommendations_stored: recommendationsStored,
// //       emails_sent: emailsSent,
// //       processing_results: processingResults,
// //       breach_context: {
// //         breach_detected: breach_detected,
// //         total_breaches: breach_summary?.total_breaches || 0,
// //         departments_affected: breach_summary?.departments_affected || [],
// //         total_overage: breach_summary?.total_overage || 0
// //       },
// //       budget_context: budget_summary || {},
// //       timestamp: new Date().toISOString()
// //     };

// //     // Include warnings if some failed
// //     if (errors.length > 0) {
// //       response.warnings = errors;
// //       response.message += ` (${errors.length} errors occurred)`;
// //     }

// //     console.log(`✅ Successfully processed recommendations: ${recommendationsStored}/${recommendations.length} stored, ${emailsSent} emails sent`);
// //     res.json(response);

// //   } catch (error) {
// //     console.error('❌ Error processing AI recommendations:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Error processing AI recommendations',
// //       error: error.message,
// //       timestamp: new Date().toISOString()
// //     });
// //   }
// // });

// // // ==================== INTERNAL NOTIFICATION ENDPOINT ====================

// // /**
// //  * Internal endpoint for Python service to send breach notifications
// //  * Person Y: This is called by the Python Escalation Communicator Agent
// //  */
// // app.post('/api/internal/process-breach-notification', async (req, res) => {
// //   try {
// //     const {
// //       escalation_level,
// //       user_id,
// //       breach_details,
// //       recommendations,
// //       budget_summary
// //     } = req.body;

// //     console.info(`🚨 Processing breach notification for user ${user_id}`);

// //     // Person Y: Get user details for email
// //     const user = await User.findById(user_id);
// //     if (!user) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'User not found'
// //       });
// //     }

// //     // Person Y: Process each breach and send appropriate emails
// //     let emailsSent = 0;
// //     const emailResults = [];

// //     if (breach_details && breach_details.length > 0) {
// //       for (const breach of breach_details) {
// //         try {
// //           // Person Y: Find the budget for email address
// //           const budget = await Budget.findOne({
// //             department: breach.department,
// //             category: breach.category,
// //             user_id: user_id
// //           });

// //           if (!budget) {
// //             console.warn(`⚠️ Budget not found for ${breach.department} - ${breach.category}`);
// //             continue;
// //           }

// //           // Person Y: Create mock expense data for email context
// //           const latestExpense = {
// //             amount: breach.financial_impact?.overage_amount || 1000,
// //             description: `Budget breach detected in ${breach.category}`,
// //             vendor_name: budget.vendor || 'Unknown',
// //             date: new Date()
// //           };

// //           // Person Y: Send appropriate email based on severity
// //           let emailResult;

// //           if (breach.severity === 'critical' || breach.financial_impact?.overage_amount > 0) {
// //             // Person Y: Budget exceeded - send with recommendations
// //             emailResult = await sendBudgetExceededAlert(budget, latestExpense, recommendations || []);
// //           } else {
// //             // Person Y: Threshold alert
// //             const usagePercentage = ((budget.used_amount / budget.limit_amount) * 100);
// //             const threshold = usagePercentage >= 75 ? 75 : usagePercentage >= 50 ? 50 : 25;
// //             emailResult = await sendThresholdAlert(budget, latestExpense, threshold);
// //           }

// //           if (emailResult.success) {
// //             emailsSent++;
// //             emailResults.push({
// //               department: breach.department,
// //               category: breach.category,
// //               email_sent: true,
// //               message_id: emailResult.messageId
// //             });
// //           } else {
// //             emailResults.push({
// //               department: breach.department,
// //               category: breach.category,
// //               email_sent: false,
// //               error: emailResult.error
// //             });
// //           }

// //         } catch (emailError) {
// //           console.error(`❌ Error sending email for ${breach.department}: ${emailError}`);
// //           emailResults.push({
// //             department: breach.department,
// //             category: breach.category,
// //             email_sent: false,
// //             error: emailError.message
// //           });
// //         }
// //       }
// //     }

// //     res.json({
// //       success: true,
// //       message: `Processed ${breach_details?.length || 0} breach notifications`,
// //       emails_sent: emailsSent,
// //       email_results: emailResults,
// //       escalation_level
// //     });

// //   } catch (error) {
// //     console.error('❌ Error processing breach notification:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Error processing breach notification',
// //       error: error.message
// //     });
// //   }
// // });

// // // Person Y: Error handling middleware
// // app.use((error, req, res, next) => {
// //   console.error('Unhandled error:', error);
// //   res.status(500).json({
// //     success: false,
// //     message: 'Internal server error'
// //   });
// // });

// // // Person Y: 404 handler
// // app.use('*', (req, res) => {
// //   res.status(404).json({
// //     success: false,
// //     message: 'Route not found'
// //   });
// // });

// // // Person Y: Start server
// // app.listen(PORT, () => {
// //   console.log(`🚀 Smart Budget Enforcer API running on port ${PORT}`);
// //   console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
// //   console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL}`);
// // });



// /**
//  * Enhanced Smart Budget Enforcer - Node.js Express Server
//  * With advanced AI integration, pattern analysis, and intelligent monitoring
//  */

// // Load environment variables
// require('dotenv').config();

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const axios = require('axios');
// const FormData = require('form-data');

// // Import custom modules
// const { User, Budget, Expense, Alert, Recommendation } = require('./models');
// const { hashPassword, comparePassword, generateToken, verifyToken, requireRole } = require('./auth');

// // Import enhanced email functions
// const { 
//   sendEnhancedThresholdAlert, 
//   sendEnhancedBudgetExceededAlert, 
//   sendAIRecommendationEmail,
//   sendBudgetHealthReport,
//   sendNotificationEmail
// } = require('./email');

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Enhanced CORS configuration
// app.use(cors({
//   origin: [
//     'http://localhost:3000',
//     'http://localhost:5000',
//     process.env.FRONTEND_URL
//   ].filter(Boolean),
//   credentials: true
// }));

// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// // Enhanced file upload configuration
// const uploadsDir = path.join(__dirname, '../uploads');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadsDir),
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = ['.pdf', '.xlsx', '.xls', '.docx', '.doc', '.csv', '.txt'];
//     const fileExt = path.extname(file.originalname).toLowerCase();
//     if (allowedTypes.includes(fileExt)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Invalid file type. Please upload PDF, Excel, Word, CSV, or text files only.'));
//     }
//   }
// });

// // Enhanced MongoDB connection
// const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_budget_enforcer';
// console.log('🔗 Connecting to MongoDB:', mongoUri);

// mongoose.connect(mongoUri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => console.log('✅ Connected to MongoDB successfully'))
//   .catch((error) => {
//     console.error('❌ MongoDB connection error:', error);
//     process.exit(1);
//   });

// // Health check endpoint
// app.get('/api/health', (req, res) => {
//   res.json({
//     success: true,
//     message: 'Enhanced Smart Budget Enforcer API is running!',
//     version: '2.0.0',
//     features: ['AI-Powered Recommendations', 'Pattern Analysis', 'Predictive Alerts'],
//     timestamp: new Date().toISOString()
//   });
// });

// // ==================== AUTHENTICATION ROUTES ====================

// app.post('/api/auth/register', async (req, res) => {
//   try {
//     const { email, password, name, role } = req.body;

//     if (!email || !password || !name) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email, password, and name are required'
//       });
//     }

//     const existingUser = await User.findOne({ email: email.toLowerCase() });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: 'User with this email already exists'
//       });
//     }

//     const hashedPassword = await hashPassword(password);
//     const newUser = new User({
//       email: email.toLowerCase(),
//       password: hashedPassword,
//       name,
//       role: role || 'user'
//     });

//     await newUser.save();
//     const token = generateToken(newUser._id);

//     res.status(201).json({
//       success: true,
//       message: 'User registered successfully',
//       token,
//       user: {
//         id: newUser._id,
//         email: newUser.email,
//         name: newUser.name,
//         role: newUser.role
//       }
//     });

//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error during registration'
//     });
//   }
// });

// app.post('/api/auth/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email and password are required'
//       });
//     }

//     const user = await User.findOne({ email: email.toLowerCase() });
//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid email or password'
//       });
//     }

//     const isPasswordValid = await comparePassword(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid email or password'
//       });
//     }

//     const token = generateToken(user._id);

//     res.json({
//       success: true,
//       message: 'Login successful',
//       token,
//       user: {
//         id: user._id,
//         email: user.email,
//         name: user.name,
//         role: user.role
//       }
//     });

//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error during login'
//     });
//   }
// });


// app.get('/api/dashboard/summary', verifyToken, async (req, res) => {
//   try {
//     // Person Y: Get all budgets with aggregated data
//     const budgets = await Budget.find({ user_id: req.user.id });

//     // Person Y: Calculate summary statistics
//     const totalBudgets = budgets.length;
//     const totalAllocated = budgets.reduce((sum, b) => sum + b.limit_amount, 0);
//     const totalUsed = budgets.reduce((sum, b) => sum + b.used_amount, 0);
//     const totalRemaining = totalAllocated - totalUsed;

//     // Person Y: Group by department
//     const departmentSummary = budgets.reduce((acc, budget) => {
//       if (!acc[budget.department]) {
//         acc[budget.department] = {
//           department: budget.department,
//           allocated: 0,
//           used: 0,
//           remaining: 0,
//           categories: []
//         };
//       }

//       acc[budget.department].allocated += budget.limit_amount;
//       acc[budget.department].used += budget.used_amount;
//       acc[budget.department].remaining += (budget.limit_amount - budget.used_amount);
//       acc[budget.department].categories.push({
//         name: budget.category,
//         allocated: budget.limit_amount,
//         used: budget.used_amount,
//         remaining: budget.limit_amount - budget.used_amount,
//         percentage: (budget.used_amount / budget.limit_amount) * 100,
//         status: budget.status,
//         priority: budget.priority
//       });

//       return acc;
//     }, {});

//     // Person Y: Get recent alerts
//     const recentAlerts = await Alert.find({ user_id: req.user.id })
//       .sort({ createdAt: -1 })
//       .limit(5);

//     // Person Y: Get active recommendations
//     const activeRecommendations = await Recommendation.find({
//       user_id: req.user.id,
//       status: 'pending'
//     }).sort({ priority: 1, createdAt: -1 });

//     res.json({
//       success: true,
//       summary: {
//         totalBudgets,
//         totalAllocated,
//         totalUsed,
//         totalRemaining,
//         usagePercentage: totalAllocated > 0 ? (totalUsed / totalAllocated) * 100 : 0
//       },
//       departmentSummary: Object.values(departmentSummary),
//       recentAlerts,
//       activeRecommendations
//     });

//   } catch (error) {
//     console.error('Dashboard summary error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching dashboard data'
//     });
//   }
// });

// // ==================== ENHANCED DOCUMENT UPLOAD & AI PROCESSING ====================

// app.post('/api/upload/budget-document', verifyToken, upload.single('document'), async (req, res) => {
//   let tempFilePath = null;

//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: 'No file uploaded'
//       });
//     }

//     tempFilePath = req.file.path;
//     console.log('📄 Processing file:', req.file.filename, 'Size:', req.file.size);

//     // Enhanced FormData creation
//     const formData = new FormData();
//     const fileStream = fs.createReadStream(tempFilePath);
    
//     formData.append('file', fileStream, {
//       filename: req.file.filename,
//       contentType: req.file.mimetype
//     });
//     formData.append('user_id', req.user.id);

//     console.log('🧠 Sending to enhanced AI processing service...');

//     // Call enhanced Python service
//     const pythonUrl = process.env.PYTHON_RAG_URL || 'http://localhost:8001';
//     const pythonResponse = await axios.post(
//       `${pythonUrl}/process-document`,
//       formData,
//       {
//         headers: { ...formData.getHeaders() },
//         timeout: 300000, // 5 minute timeout for complex AI processing
//         maxContentLength: 100 * 1024 * 1024,
//         maxBodyLength: 100 * 1024 * 1024
//       }
//     );

//     console.log('🐍 Enhanced AI response status:', pythonResponse.status);

//     if (!pythonResponse.data || !pythonResponse.data.success) {
//       throw new Error(`AI Processing Error: ${pythonResponse.data?.error || 'Unknown error'}`);
//     }

//     const budgetItems = pythonResponse.data.budget_data;

//     if (!budgetItems || !Array.isArray(budgetItems) || budgetItems.length === 0) {
//       throw new Error('No budget data extracted. Please ensure your document contains structured budget information.');
//     }

//     console.log(`💾 Processing ${budgetItems.length} budget items with AI validation...`);

//     const savedBudgets = [];
//     const errors = [];
//     const aiInsights = pythonResponse.data.ai_insights || {};

//     for (let i = 0; i < budgetItems.length; i++) {
//       const item = budgetItems[i];
//       try {
//         // Enhanced validation with AI insights
//         const amount = parseFloat(item.amount) || parseFloat(item.limit_amount) || 0;
//         const limitAmount = parseFloat(item.limit_amount) || parseFloat(item.amount) || 0;

//         if (amount <= 0 || limitAmount <= 0) {
//           errors.push(`Item ${i + 1}: Invalid amount (${amount}) or limit (${limitAmount})`);
//           continue;
//         }

//         // AI-enhanced budget categorization
//         const enhancedCategory = await enhanceBudgetCategoryWithAI(item, aiInsights);

//         const budgetData = {
//           name: (item.name || `${item.department || 'General'} ${item.category || 'Budget'}`).trim(),
//           category: enhancedCategory.category || (item.category || 'General').trim(),
//           department: enhancedCategory.department || (item.department || 'General').trim(),
//           amount: amount,
//           limit_amount: limitAmount,
//           used_amount: 0,
//           warning_threshold: parseFloat(item.warning_threshold) || (limitAmount * 0.8),
//           priority: enhancedCategory.priority || item.priority || 'Medium',
//           vendor: (item.vendor || '').trim(),
//           email: item.email || req.user.email || 'gbharathitrs@gmail.com',
//           user_id: req.user.id,
//           status: 'active',
//           ai_metadata: {
//             confidence_score: enhancedCategory.confidence || 0.8,
//             suggested_optimizations: enhancedCategory.optimizations || [],
//             risk_factors: enhancedCategory.risks || [],
//             extraction_method: 'ai_enhanced'
//           }
//         };

//         const budget = new Budget(budgetData);
//         const savedBudget = await budget.save();
//         savedBudgets.push(savedBudget);

//         // Immediately trigger AI pattern analysis for new budget
//         await performInitialBudgetAnalysis(savedBudget, aiInsights);

//       } catch (saveError) {
//         console.error(`❌ Error processing budget item ${i + 1}:`, saveError);
//         errors.push(`Item ${i + 1}: ${saveError.message}`);
//         continue;
//       }
//     }

//     // Cleanup
//     if (tempFilePath && fs.existsSync(tempFilePath)) {
//       fs.unlinkSync(tempFilePath);
//     }

//     if (savedBudgets.length === 0) {
//       throw new Error(`Failed to save any budget items. Errors: ${errors.join('; ')}`);
//     }

//     // Generate initial AI recommendations for the user
//     if (savedBudgets.length > 0) {
//       setTimeout(() => {
//         generateInitialBudgetRecommendations(req.user.id, savedBudgets);
//       }, 5000); // Delay to allow processing
//     }

//     const response = {
//       success: true,
//       message: `Enhanced AI processing complete! Extracted and validated ${savedBudgets.length} budget items.`,
//       budget_count: savedBudgets.length,
//       total_extracted: budgetItems.length,
//       budgets: savedBudgets.map(b => ({
//         id: b._id,
//         name: b.name,
//         department: b.department,
//         category: b.category,
//         limit_amount: b.limit_amount,
//         warning_threshold: b.warning_threshold,
//         priority: b.priority,
//         email: b.email,
//         status: b.status,
//         ai_confidence: b.ai_metadata?.confidence_score || 0.8
//       })),
//       ai_insights: {
//         processing_time: pythonResponse.data.processing_time || 0,
//         confidence_score: aiInsights.overall_confidence || 0.85,
//         pattern_analysis: aiInsights.patterns || {},
//         optimization_suggestions: aiInsights.optimizations || []
//       }
//     };

//     if (errors.length > 0) {
//       response.warnings = errors;
//       response.message += ` Note: ${errors.length} items required manual review.`;
//     }

//     console.log(`✅ Enhanced AI processing complete: ${savedBudgets.length}/${budgetItems.length} items saved`);
//     res.json(response);

//   } catch (error) {
//     console.error('❌ Enhanced document upload error:', error);

//     if (tempFilePath && fs.existsSync(tempFilePath)) {
//       try {
//         fs.unlinkSync(tempFilePath);
//       } catch (cleanupError) {
//         console.warn('⚠️ Could not delete temporary file:', cleanupError.message);
//       }
//     }

//     let errorMessage = 'Error processing document with AI';
//     let statusCode = 500;

//     if (error.code === 'ECONNREFUSED') {
//       errorMessage = 'AI processing service is unavailable. Please try again later.';
//       statusCode = 503;
//     } else if (error.code === 'ETIMEDOUT') {
//       errorMessage = 'AI processing timed out. Please try with a smaller file or try again later.';
//       statusCode = 408;
//     } else if (error.response?.status === 422) {
//       errorMessage = error.response.data?.detail || 'The document format is not supported by our AI system.';
//       statusCode = 422;
//     } else if (error.message) {
//       errorMessage = error.message;
//     }

//     res.status(statusCode).json({
//       success: false,
//       message: errorMessage,
//       error_type: error.code || 'AI_PROCESSING_ERROR',
//       support_info: 'Contact support if this issue persists'
//     });
//   }
// });

// // ==================== ENHANCED EXPENSE MANAGEMENT ====================

// app.post('/api/expenses', verifyToken, async (req, res) => {
//   try {
//     const { amount, department, category, description, vendor_name, budget_id } = req.body;

//     if (!amount || !department || !category || !description || !budget_id) {
//       return res.status(400).json({
//         success: false,
//         message: 'Amount, department, category, description, and budget_id are required'
//       });
//     }

//     const budget = await Budget.findOne({
//       _id: budget_id,
//       user_id: req.user.id
//     });

//     if (!budget) {
//       return res.status(404).json({
//         success: false,
//         message: 'Budget not found'
//       });
//     }

//     // Enhanced expense creation with AI validation
//     const expense = new Expense({
//       amount: parseFloat(amount),
//       department,
//       category,
//       description,
//       vendor_name: vendor_name || '',
//       budget_id,
//       user_id: req.user.id,
//       ai_metadata: {
//         risk_score: await calculateExpenseRiskScore(amount, budget, category),
//         anomaly_flags: await detectExpenseAnomalies(amount, budget, category, vendor_name),
//         pattern_analysis: await analyzeSpendingPattern(req.user.id, category, amount)
//       }
//     });

//     await expense.save();

//     // Update budget with enhanced tracking
//     const newUsedAmount = budget.used_amount + parseFloat(amount);
//     const previousUsage = budget.used_amount;
    
//     budget.used_amount = newUsedAmount;
//     budget.last_expense_date = new Date();
//     budget.expense_count = (budget.expense_count || 0) + 1;
//     await budget.save();

//     // Enhanced threshold checking with AI predictions
//     const aiAnalysis = await performEnhancedThresholdAnalysis(budget, expense, previousUsage);
    
//     res.status(201).json({
//       success: true,
//       message: 'Expense added successfully with AI analysis',
//       expense: {
//         ...expense.toObject(),
//         ai_risk_score: expense.ai_metadata.risk_score
//       },
//       budget: {
//         ...budget.toObject(),
//         used_amount: newUsedAmount
//       },
//       ai_analysis: {
//         breach_risk: aiAnalysis.breach_risk,
//         recommendations_triggered: aiAnalysis.recommendations_count,
//         next_review_date: aiAnalysis.next_review
//       }
//     });

//   } catch (error) {
//     console.error('Enhanced expense creation error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error adding expense with AI analysis'
//     });
//   }
// });


// // /**
// //  * Get expenses by budget
// //  */
// app.get('/api/expenses/budget/:budgetId', verifyToken, async (req, res) => {
//   try {
//     const expenses = await Expense.find({
//       budget_id: req.params.budgetId,
//       user_id: req.user.id
//     }).sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       expenses
//     });

//   } catch (error) {
//     console.error('Get budget expenses error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching budget expenses'
//     });
//   }
// });

// app.get('/api/expenses', verifyToken, async (req, res) => {
//   try {
//     const expenses = await Expense.find({ user_id: req.user.id })
//       .populate('budget_id', 'name department category')
//       .sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       expenses
//     });

//   } catch (error) {
//     console.error('Get expenses error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching expenses'
//     });
//   }
// });


// // ==================== ENHANCED AI RECOMMENDATION SYSTEM ====================

// app.get('/api/recommendations/ai-generated', verifyToken, async (req, res) => {
//   try {
//     console.log('🧠 Generating real-time AI recommendations...');

//     // Get user's budget data for AI analysis
//     const budgets = await Budget.find({ user_id: req.user.id });
//     const recentExpenses = await Expense.find({ 
//       user_id: req.user.id,
//       createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
//     }).populate('budget_id');

//     // Prepare comprehensive data for AI
//     const aiRequestPayload = {
//       user_context: {
//         id: req.user.id,
//         email: req.user.email,
//         role: req.user.role
//       },
//       budget_portfolio: budgets.map(b => ({
//         id: b._id,
//         name: b.name,
//         department: b.department,
//         category: b.category,
//         limit_amount: b.limit_amount,
//         used_amount: b.used_amount,
//         usage_percentage: (b.used_amount / b.limit_amount) * 100,
//         priority: b.priority,
//         trend_analysis: calculateBudgetTrend(b, recentExpenses)
//       })),
//       spending_patterns: {
//         total_expenses: recentExpenses.length,
//         total_amount: recentExpenses.reduce((sum, e) => sum + e.amount, 0),
//         category_breakdown: generateCategoryBreakdown(recentExpenses),
//         vendor_analysis: generateVendorAnalysis(recentExpenses),
//         temporal_patterns: analyzeTemporalPatterns(recentExpenses)
//       },
//       request_type: 'comprehensive_portfolio_analysis'
//     };

//     // Call enhanced Python AI service
//     const pythonUrl = process.env.PYTHON_RAG_URL || 'http://localhost:8001';
//     const aiResponse = await axios.post(
//       `${pythonUrl}/generate-recommendations`,
//       aiRequestPayload,
//       {
//         timeout: 120000,
//         headers: {
//           'Content-Type': 'application/json',
//           'User-Agent': 'SmartBudgetEnforcer-Enhanced/2.0'
//         }
//       }
//     );

//     if (aiResponse.status === 200 && aiResponse.data.success) {
//       const aiRecommendations = aiResponse.data.recommendations || [];
      
//       // Store AI recommendations in database
//       const storedRecommendations = [];
//       for (const rec of aiRecommendations) {
//         try {
//           const storedRec = await createEnhancedRecommendation({
//             title: rec.title,
//             description: rec.description,
//             type: rec.type,
//             priority: rec.priority || 2,
//             department: rec.department || '',
//             category: rec.category || '',
//             estimated_savings: parseFloat(rec.estimated_savings) || 0,
//             user_id: req.user.id,
//             ai_metadata: {
//               confidence_score: rec.confidence_score || 0.8,
//               implementation_complexity: rec.implementation_complexity || 'medium',
//               risk_level: rec.risk_level || 'low',
//               roi_estimate: rec.roi_estimate || {},
//               generated_by: 'portfolio_analysis_ai',
//               analysis_date: new Date().toISOString()
//             }
//           });
//           storedRecommendations.push(storedRec);
//         } catch (storeError) {
//           console.error('❌ Error storing AI recommendation:', storeError);
//         }
//       }

//       res.json({
//         success: true,
//         message: `Generated ${storedRecommendations.length} AI-powered recommendations`,
//         recommendations: storedRecommendations,
//         ai_analysis: {
//           total_generated: aiRecommendations.length,
//           confidence_score: aiResponse.data.analysis_confidence || 0.85,
//           analysis_depth: 'comprehensive',
//           data_points_analyzed: budgets.length + recentExpenses.length,
//           next_analysis_due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
//         },
//         portfolio_insights: aiResponse.data.portfolio_insights || {}
//       });

//     } else {
//       throw new Error('AI service returned invalid response');
//     }

//   } catch (error) {
//     console.error('❌ AI recommendation generation error:', error);

//     // Fallback to rule-based recommendations
//     const fallbackRecommendations = await generateFallbackRecommendations(req.user.id);

//     res.json({
//       success: true,
//       message: 'Generated fallback recommendations (AI service temporarily unavailable)',
//       recommendations: fallbackRecommendations,
//       fallback_used: true,
//       error_context: error.message
//     });
//   }
// });

// // ==================== ENHANCED PATTERN ANALYSIS ====================

// app.get('/api/analytics/spending-patterns', verifyToken, async (req, res) => {
//   try {
//     console.log('📊 Performing enhanced spending pattern analysis...');

//     const { timeframe = '90', categories, departments } = req.query;
//     const days = parseInt(timeframe);

//     // Get historical data
//     const expenses = await Expense.find({
//       user_id: req.user.id,
//       createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
//       ...(categories && { category: { $in: categories.split(',') } }),
//       ...(departments && { department: { $in: departments.split(',') } })
//     }).populate('budget_id');

//     const budgets = await Budget.find({ user_id: req.user.id });

//     // Prepare data for AI pattern analysis
//     const patternAnalysisData = {
//       expenses: expenses.map(e => ({
//         amount: e.amount,
//         category: e.category,
//         department: e.department,
//         date: e.createdAt,
//         vendor: e.vendor_name,
//         description: e.description
//       })),
//       budgets: budgets.map(b => ({
//         department: b.department,
//         category: b.category,
//         limit: b.limit_amount,
//         used: b.used_amount
//       })),
//       timeframe_days: days
//     };

//     // Call AI pattern analysis service
//     const pythonUrl = process.env.PYTHON_RAG_URL || 'http://localhost:8001';
//     const aiAnalysisResponse = await axios.post(
//       `${pythonUrl}/analyze-patterns`,
//       patternAnalysisData,
//       {
//         timeout: 60000,
//         headers: { 'Content-Type': 'application/json' }
//       }
//     );

//     let aiPatternInsights = {};
//     if (aiAnalysisResponse.status === 200 && aiAnalysisResponse.data.success) {
//       aiPatternInsights = aiAnalysisResponse.data.patterns || {};
//     }

//     // Generate comprehensive analytics
//     const analytics = {
//       summary: {
//         total_expenses: expenses.length,
//         total_amount: expenses.reduce((sum, e) => sum + e.amount, 0),
//         average_expense: expenses.length > 0 ? expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length : 0,
//         timeframe_days: days
//       },
//       trends: {
//         daily_spending: generateDailySpendingTrend(expenses, days),
//         category_trends: generateCategoryTrends(expenses),
//         department_trends: generateDepartmentTrends(expenses),
//         vendor_trends: generateVendorTrends(expenses)
//       },
//       predictions: {
//         next_30_days: predictSpending(expenses, 30),
//         budget_breach_risk: calculateBreachRisk(expenses, budgets),
//         seasonal_adjustments: calculateSeasonalAdjustments(expenses)
//       },
//       ai_insights: aiPatternInsights,
//       anomalies: detectSpendingAnomalies(expenses),
//       recommendations: generatePatternBasedRecommendations(expenses, budgets, aiPatternInsights)
//     };

//     res.json({
//       success: true,
//       analytics,
//       data_quality: {
//         completeness: calculateDataCompleteness(expenses),
//         confidence: aiPatternInsights.confidence_score || 0.8,
//         sample_size: expenses.length
//       }
//     });

//   } catch (error) {
//     console.error('❌ Pattern analysis error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error performing pattern analysis',
//       error: error.message
//     });
//   }
// });

// // ==================== HELPER FUNCTIONS ====================

// async function enhanceBudgetCategoryWithAI(item, aiInsights) {
//   // Simulate AI-enhanced categorization
//   const confidence = Math.random() * 0.3 + 0.7; // 0.7-1.0 confidence
  
//   return {
//     category: item.category || 'General',
//     department: item.department || 'General',
//     priority: item.priority || 'Medium',
//     confidence: confidence,
//     optimizations: [
//       'Consider quarterly review cycle',
//       'Monitor vendor price changes',
//       'Implement approval workflow'
//     ],
//     risks: confidence < 0.8 ? ['Low confidence categorization'] : []
//   };
// }

// async function performInitialBudgetAnalysis(budget, aiInsights) {
//   try {
//     // Create initial alert for budget setup
//     const alert = new Alert({
//       type: 'budget_setup',
//       severity: 'low',
//       message: `New budget created: ${budget.name} with AI validation`,
//       department: budget.department,
//       category: budget.category,
//       budget_id: budget._id,
//       user_id: budget.user_id,
//       ai_metadata: {
//         confidence_score: budget.ai_metadata?.confidence_score || 0.8,
//         setup_recommendations: aiInsights.setup_recommendations || []
//       }
//     });
    
//     await alert.save();
//     console.log(`✅ Initial analysis complete for budget: ${budget.name}`);
//   } catch (error) {
//     console.error('❌ Error in initial budget analysis:', error);
//   }
// }

// async function generateInitialBudgetRecommendations(userId, budgets) {
//   try {
//     console.log(`🧠 Generating initial recommendations for ${budgets.length} budgets...`);
    
//     for (const budget of budgets) {
//       // Generate setup recommendations
//       const recommendations = [
//         {
//           title: `Optimize ${budget.category} Budget Monitoring`,
//           description: `Set up automated alerts and approval workflows for ${budget.category} expenses to maintain budget compliance.`,
//           type: 'process_optimization',
//           priority: 2,
//           department: budget.department,
//           category: budget.category,
//           estimated_savings: budget.limit_amount * 0.05,
//           budget_id: budget._id,
//           user_id: userId
//         }
//       ];

//       for (const rec of recommendations) {
//         await createEnhancedRecommendation(rec);
//       }
//     }

//     console.log(`✅ Generated initial recommendations for user ${userId}`);
//   } catch (error) {
//     console.error('❌ Error generating initial recommendations:', error);
//   }
// }

// async function performEnhancedThresholdAnalysis(budget, expense, previousUsage) {
//   const usagePercentage = (budget.used_amount / budget.limit_amount) * 100;
//   const previousPercentage = (previousUsage / budget.limit_amount) * 100;
  
//   let breach_risk = 'low';
//   let recommendations_count = 0;
  
//   // Enhanced threshold checking
//   const thresholds = [25, 50, 75, 90, 100];
//   for (const threshold of thresholds) {
//     if (usagePercentage >= threshold && previousPercentage < threshold) {
//       console.log(`🚨 Enhanced threshold ${threshold}% reached for ${budget.department} - ${budget.category}`);
      
//       if (threshold >= 75) {
//         breach_risk = threshold >= 90 ? 'critical' : 'high';
        
//         // Trigger AI recommendations
//         const aiResult = await triggerEnhancedAIRecommendations(budget, expense, threshold);
//         recommendations_count = aiResult.recommendations_count || 0;
//       }
      
//       // Send enhanced email alert
//       await sendEnhancedThresholdAlert(budget, expense, threshold, {
//         spending_trend: `${threshold}% threshold reached`,
//         risk_factors: [`Usage at ${usagePercentage.toFixed(1)}%`],
//         prediction: `At current rate, budget will be depleted in ${calculateDaysToDepletion(budget)} days`
//       });
      
//       // Create enhanced alert
//       await createEnhancedAlert({
//         type: 'threshold_warning',
//         severity: threshold >= 90 ? 'critical' : threshold >= 75 ? 'high' : 'medium',
//         message: `Enhanced AI monitoring: ${threshold}% threshold reached for ${budget.department} - ${budget.category}`,
//         department: budget.department,
//         category: budget.category,
//         budget_id: budget._id,
//         expense_id: expense._id,
//         user_id: budget.user_id,
//         ai_metadata: {
//           threshold_percentage: threshold,
//           usage_percentage: usagePercentage,
//           risk_score: calculateRiskScore(usagePercentage, threshold),
//           prediction_accuracy: 0.85
//         }
//       });
//     }
//   }
  
//   return {
//     breach_risk,
//     recommendations_count,
//     next_review: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
//   };
// }

// async function triggerEnhancedAIRecommendations(budget, expense, threshold) {
//   try {
//     console.log(`🧠 Triggering enhanced AI recommendations for ${threshold}% threshold`);
    
//     // Get user's full budget context
//     const allBudgets = await Budget.find({ user_id: budget.user_id });
//     const recentExpenses = await Expense.find({
//       user_id: budget.user_id,
//       createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
//     });
    
//     const aiRequestPayload = {
//       trigger_context: {
//         type: 'threshold_breach',
//         threshold_percentage: threshold,
//         budget: {
//           id: budget._id,
//           name: budget.name,
//           department: budget.department,
//           category: budget.category,
//           limit_amount: budget.limit_amount,
//           used_amount: budget.used_amount,
//           usage_percentage: (budget.used_amount / budget.limit_amount) * 100
//         },
//         triggering_expense: {
//           amount: expense.amount,
//           description: expense.description,
//           vendor: expense.vendor_name,
//           date: expense.createdAt
//         }
//       },
//       portfolio_context: {
//         total_budgets: allBudgets.length,
//         total_allocated: allBudgets.reduce((sum, b) => sum + b.limit_amount, 0),
//         total_used: allBudgets.reduce((sum, b) => sum + b.used_amount, 0),
//         at_risk_budgets: allBudgets.filter(b => (b.used_amount / b.limit_amount) > 0.75).length
//       },
//       spending_history: {
//         recent_expenses_count: recentExpenses.length,
//         recent_total: recentExpenses.reduce((sum, e) => sum + e.amount, 0),
//         category_patterns: generateCategoryBreakdown(recentExpenses)
//       },
//       user_id: budget.user_id
//     };
    
//     const pythonUrl = process.env.PYTHON_RAG_URL || 'http://localhost:8001';
//     const response = await axios.post(
//       `${pythonUrl}/generate-recommendations`,
//       aiRequestPayload,
//       { timeout: 60000 }
//     );
    
//     if (response.status === 200 && response.data.success) {
//       const recommendations = response.data.recommendations || [];
      
//       // Store enhanced recommendations
//       const storedRecommendations = [];
//       for (const rec of recommendations) {
//         const stored = await createEnhancedRecommendation({
//           title: rec.title,
//           description: rec.description,
//           type: rec.type,
//           priority: rec.priority || 1,
//           department: budget.department,
//           category: budget.category,
//           estimated_savings: parseFloat(rec.estimated_savings) || 0,
//           budget_id: budget._id,
//           user_id: budget.user_id,
//           ai_metadata: {
//             trigger_type: 'threshold_breach',
//             threshold_percentage: threshold,
//             confidence_score: rec.confidence_score || 0.8,
//             urgency_level: threshold >= 90 ? 'critical' : 'high',
//             generated_at: new Date().toISOString()
//           }
//         });
//         storedRecommendations.push(stored);
//       }
      
//       return {
//         success: true,
//         recommendations_count: storedRecommendations.length,
//         ai_confidence: response.data.analysis_confidence || 0.8
//       };
//     }
    
//     return { success: false, recommendations_count: 0 };
    
//   } catch (error) {
//     console.error('❌ Enhanced AI recommendation error:', error);
//     return { success: false, recommendations_count: 0, error: error.message };
//   }
// }

// async function createEnhancedRecommendation(recData) {
//   try {
//     const recommendation = new Recommendation({
//       title: recData.title,
//       description: recData.description,
//       type: recData.type,
//       priority: recData.priority || 2,
//       department: recData.department || '',
//       category: recData.category || '',
//       estimated_savings: parseFloat(recData.estimated_savings) || 0,
//       budget_id: recData.budget_id || null,
//       user_id: recData.user_id,
//       status: 'pending',
//       ai_metadata: {
//         ...recData.ai_metadata,
//         created_at: new Date().toISOString(),
//         version: '2.0'
//       }
//     });
    
//     await recommendation.save();
//     return recommendation;
//   } catch (error) {
//     console.error('❌ Error creating enhanced recommendation:', error);
//     throw error;
//   }
// }

// async function createEnhancedAlert(alertData) {
//   try {
//     const alert = new Alert({
//       ...alertData,
//       created_at: new Date(),
//       read: false,
//       ai_enhanced: true
//     });
//     await alert.save();
//     return alert;
//   } catch (error) {
//     console.error('❌ Error creating enhanced alert:', error);
//     throw error;
//   }
// }

// // Additional helper functions for analytics
// function calculateDaysToDepletion(budget) {
//   const remainingAmount = budget.limit_amount - budget.used_amount;
//   if (remainingAmount <= 0) return 0;
  
//   // Simple calculation based on recent spending rate
//   const dailyRate = budget.used_amount / 30; // Assume 30 days
//   return Math.ceil(remainingAmount / (dailyRate || 1));
// }

// function calculateRiskScore(usagePercentage, threshold) {
//   return Math.min(10, (usagePercentage / 100) * 10 + (threshold / 100) * 5);
// }

// function generateCategoryBreakdown(expenses) {
//   const breakdown = {};
//   expenses.forEach(expense => {
//     if (!breakdown[expense.category]) {
//       breakdown[expense.category] = { count: 0, total: 0 };
//     }
//     breakdown[expense.category].count++;
//     breakdown[expense.category].total += expense.amount;
//   });
//   return breakdown;
// }

// function generateVendorAnalysis(expenses) {
//   const vendors = {};
//   expenses.forEach(expense => {
//     const vendor = expense.vendor_name || 'Unknown';
//     if (!vendors[vendor]) {
//       vendors[vendor] = { count: 0, total: 0 };
//     }
//     vendors[vendor].count++;
//     vendors[vendor].total += expense.amount;
//   });
//   return vendors;
// }

// function calculateBudgetTrend(budget, expenses) {
//   const budgetExpenses = expenses.filter(e => 
//     e.budget_id && e.budget_id.toString() === budget._id.toString()
//   );
  
//   return {
//     expense_count: budgetExpenses.length,
//     total_spent: budgetExpenses.reduce((sum, e) => sum + e.amount, 0),
//     trend: budgetExpenses.length > 0 ? 'active' : 'inactive'
//   };
// }

// // Keep all existing routes and add enhanced functionality
// // ... [rest of the existing routes remain the same]

// // Start server
// app.listen(PORT, () => {
//   console.log(`🚀 Enhanced Smart Budget Enforcer API running on port ${PORT}`);
//   console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
//   console.log(`🧠 AI-powered features: Pattern Analysis, Predictive Alerts, Smart Recommendations`);
// });




/**
 * Enhanced Smart Budget Enforcer - Node.js Express Server
 * Complete version with all routes and advanced AI integration
 */

// Load environment variables
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

// Import custom modules
const { User, Budget, Expense, Alert, Recommendation } = require('./models');
const { hashPassword, comparePassword, generateToken, verifyToken, requireRole } = require('./auth');

// Import enhanced email functions (fallback to original if enhanced not available)
const { 
  sendThresholdAlert, 
  sendBudgetExceededAlert, 
  sendNotificationEmail,
  sendRecommendationEmail,
  sendRecommendationSummaryEmail,
  sendEnhancedThresholdAlert,
  sendEnhancedBudgetExceededAlert,
  sendAIRecommendationEmail,
  sendBudgetHealthReport,
   getAIRecommendationsForBreach,  // NEW: For getting AI recommendations
  generateRecommendationsHTML 
} = require('./email');

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Enhanced file upload configuration
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.xlsx', '.xls', '.docx', '.doc', '.csv', '.txt'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload PDF, Excel, Word, CSV, or text files only.'));
    }
  }
});

// Enhanced MongoDB connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_budget_enforcer';
console.log('🔗 Connecting to MongoDB:', mongoUri);

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB successfully'))
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    console.log('💡 Make sure MongoDB is running: mongod --dbpath C:\\data\\db');
    process.exit(1);
  });

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Enhanced Smart Budget Enforcer API is running!',
    version: '2.0.0',
    features: ['AI-Powered Recommendations', 'Pattern Analysis', 'Predictive Alerts'],
    timestamp: new Date().toISOString()
  });
});

// ==================== AUTHENTICATION ROUTES ====================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: role || 'user'
    });

    await newUser.save();
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

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

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

// ==================== ENHANCED DOCUMENT UPLOAD & AI PROCESSING ====================

app.post('/api/upload/budget-document', verifyToken, upload.single('document'), async (req, res) => {
  let tempFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/csv',
      'text/plain'
    ];

    if (!allowedTypes.includes(req.file.mimetype)) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Please upload PDF, Excel, Word, CSV, or text files only.'
      });
    }

    tempFilePath = req.file.path;
    console.log('📄 Processing file:', req.file.filename, 'Size:', req.file.size);

    // Enhanced FormData creation
    const formData = new FormData();
    const fileStream = fs.createReadStream(tempFilePath);
    
    formData.append('file', fileStream, {
      filename: req.file.filename,
      contentType: req.file.mimetype
    });
    formData.append('user_id', req.user.id);

    console.log('🧠 Sending to enhanced AI processing service...');

    // Call enhanced Python service
    const pythonUrl = process.env.PYTHON_RAG_URL || 'http://localhost:8001';
    const pythonResponse = await axios.post(
      `${pythonUrl}/process-document`,
      formData,
      {
        headers: { ...formData.getHeaders() },
        timeout: 300000, // 5 minute timeout
        maxContentLength: 100 * 1024 * 1024,
        maxBodyLength: 100 * 1024 * 1024
      }
    );

    console.log('🐍 Enhanced AI response status:', pythonResponse.status);

    if (!pythonResponse.data || !pythonResponse.data.success) {
      throw new Error(`AI Processing Error: ${pythonResponse.data?.error || 'Unknown error'}`);
    }

    const budgetItems = pythonResponse.data.budget_data;

    if (!budgetItems || !Array.isArray(budgetItems) || budgetItems.length === 0) {
      throw new Error('No budget data extracted. Please ensure your document contains structured budget information.');
    }

    console.log(`💾 Processing ${budgetItems.length} budget items with AI validation...`);

    const savedBudgets = [];
    const errors = [];
    const aiInsights = pythonResponse.data.ai_insights || {};

    for (let i = 0; i < budgetItems.length; i++) {
      const item = budgetItems[i];
      try {
        // Enhanced validation with AI insights
        const amount = parseFloat(item.amount) || parseFloat(item.limit_amount) || 0;
        const limitAmount = parseFloat(item.limit_amount) || parseFloat(item.amount) || 0;

        if (amount <= 0 || limitAmount <= 0) {
          errors.push(`Item ${i + 1}: Invalid amount (${amount}) or limit (${limitAmount})`);
          continue;
        }

        // AI-enhanced budget categorization
        const enhancedCategory = await enhanceBudgetCategoryWithAI(item, aiInsights);

        const budgetData = {
          name: (item.name || `${item.department || 'General'} ${item.category || 'Budget'}`).trim(),
          category: enhancedCategory.category || (item.category || 'General').trim(),
          department: enhancedCategory.department || (item.department || 'General').trim(),
          amount: amount,
          limit_amount: limitAmount,
          used_amount: 0,
          warning_threshold: parseFloat(item.warning_threshold) || (limitAmount * 0.8),
          priority: enhancedCategory.priority || item.priority || 'Medium',
          vendor: (item.vendor || '').trim(),
          email: item.email || req.user.email || 'gbharathitrs@gmail.com',
          user_id: req.user.id,
          status: 'active',
          ai_metadata: {
            confidence_score: enhancedCategory.confidence || 0.8,
            suggested_optimizations: enhancedCategory.optimizations || [],
            risk_factors: enhancedCategory.risks || [],
            extraction_method: 'ai_enhanced'
          }
        };

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(budgetData.email)) {
          budgetData.email = req.user.email || 'gbharathitrs@gmail.com';
        }

        const budget = new Budget(budgetData);
        const savedBudget = await budget.save();
        savedBudgets.push(savedBudget);

        // Immediately trigger AI pattern analysis for new budget
        await performInitialBudgetAnalysis(savedBudget, aiInsights);

      } catch (saveError) {
        console.error(`❌ Error processing budget item ${i + 1}:`, saveError);
        errors.push(`Item ${i + 1}: ${saveError.message}`);
        continue;
      }
    }

    // Cleanup
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    if (savedBudgets.length === 0) {
      throw new Error(`Failed to save any budget items. Errors: ${errors.join('; ')}`);
    }

    // Generate initial AI recommendations for the user
    if (savedBudgets.length > 0) {
      setTimeout(() => {
        generateInitialBudgetRecommendations(req.user.id, savedBudgets);
      }, 5000);
    }

    const response = {
      success: true,
      message: `Enhanced AI processing complete! Extracted and validated ${savedBudgets.length} budget items.`,
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
        status: b.status,
        ai_confidence: b.ai_metadata?.confidence_score || 0.8
      })),
      processing_info: {
        processing_time: pythonResponse.data.processing_time || 0,
        processing_steps: pythonResponse.data.processing_steps || []
      },
      ai_insights: {
        confidence_score: aiInsights.overall_confidence || 0.85,
        pattern_analysis: aiInsights.patterns || {},
        optimization_suggestions: aiInsights.optimizations || []
      }
    };

    if (errors.length > 0) {
      response.warnings = errors;
      response.message += ` Note: ${errors.length} items required manual review.`;
    }

    console.log(`✅ Enhanced AI processing complete: ${savedBudgets.length}/${budgetItems.length} items saved`);
    res.json(response);

  } catch (error) {
    console.error('❌ Enhanced document upload error:', error);

    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.warn('⚠️ Could not delete temporary file:', cleanupError.message);
      }
    }

    let errorMessage = 'Error processing document with AI';
    let statusCode = 500;

    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'AI processing service is unavailable. Please try again later.';
      statusCode = 503;
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'AI processing timed out. Please try with a smaller file or try again later.';
      statusCode = 408;
    } else if (error.response?.status === 422) {
      errorMessage = error.response.data?.detail || 'The document format is not supported by our AI system.';
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
      error_type: error.code || 'AI_PROCESSING_ERROR'
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse.debug_info = {
        python_url: process.env.PYTHON_RAG_URL || 'http://localhost:8001',
        file_info: req.file ? {
          name: req.file.filename,
          size: req.file.size,
          type: req.file.mimetype
        } : null,
        stack: error.stack
      };
    }

    res.status(statusCode).json(errorResponse);
  }
});

// ==================== BUDGET MANAGEMENT ROUTES ====================

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

// ==================== ENHANCED EXPENSE MANAGEMENT ====================

app.post('/api/expenses', verifyToken, async (req, res) => {
  try {
    const { amount, department, category, description, vendor_name, budget_id } = req.body;

    if (!amount || !department || !category || !description || !budget_id) {
      return res.status(400).json({
        success: false,
        message: 'Amount, department, category, description, and budget_id are required'
      });
    }

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

    // Enhanced expense creation with AI validation
    const expense = new Expense({
      amount: parseFloat(amount),
      department,
      category,
      description,
      vendor_name: vendor_name || '',
      budget_id,
      user_id: req.user.id,
      ai_metadata: {
        risk_score: await calculateExpenseRiskScore(amount, budget, category),
        anomaly_flags: await detectExpenseAnomalies(amount, budget, category, vendor_name),
        pattern_analysis: await analyzeSpendingPattern(req.user.id, category, amount)
      }
    });

    await expense.save();

    // Update budget with enhanced tracking
    const newUsedAmount = budget.used_amount + parseFloat(amount);
    const previousUsage = budget.used_amount;
    
    budget.used_amount = newUsedAmount;
    budget.last_expense_date = new Date();
    budget.expense_count = (budget.expense_count || 0) + 1;
    await budget.save();

    // Enhanced threshold checking with AI predictions
    await checkEnhancedBudgetThresholds(budget, expense, previousUsage);
    
    res.status(201).json({
      success: true,
      message: 'Expense added successfully with AI analysis',
      expense: {
        ...expense.toObject(),
        ai_risk_score: expense.ai_metadata?.risk_score || 0
      },
      budget: {
        ...budget.toObject(),
        used_amount: newUsedAmount
      }
    });

  } catch (error) {
    console.error('Enhanced expense creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding expense with AI analysis'
    });
  }
});

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

app.get('/api/dashboard/summary', verifyToken, async (req, res) => {
  try {
    const budgets = await Budget.find({ user_id: req.user.id });
    const recentExpenses = await Expense.find({ 
      user_id: req.user.id,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    // Calculate summary statistics
    const totalBudgets = budgets.length;
    const totalAllocated = budgets.reduce((sum, b) => sum + b.limit_amount, 0);
    const totalUsed = budgets.reduce((sum, b) => sum + b.used_amount, 0);
    const totalRemaining = totalAllocated - totalUsed;

    // Group by department
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

    // Get recent alerts
    const recentAlerts = await Alert.find({ user_id: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get active recommendations
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

// ==================== ENHANCED AI RECOMMENDATION SYSTEM ====================

app.get('/api/recommendations/ai-generated', verifyToken, async (req, res) => {
  try {
    console.log('🧠 Generating real-time AI recommendations...');

    // Get user's budget data for AI analysis
    const budgets = await Budget.find({ user_id: req.user.id });
    const recentExpenses = await Expense.find({ 
      user_id: req.user.id,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).populate('budget_id');

    // Prepare comprehensive data for AI
    const aiRequestPayload = {
      user_context: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      },
      budget_portfolio: budgets.map(b => ({
        id: b._id,
        name: b.name,
        department: b.department,
        category: b.category,
        limit_amount: b.limit_amount,
        used_amount: b.used_amount,
        usage_percentage: (b.used_amount / b.limit_amount) * 100,
        priority: b.priority,
        trend_analysis: calculateBudgetTrend(b, recentExpenses)
      })),
      spending_patterns: {
        total_expenses: recentExpenses.length,
        total_amount: recentExpenses.reduce((sum, e) => sum + e.amount, 0),
        category_breakdown: generateCategoryBreakdown(recentExpenses),
        vendor_analysis: generateVendorAnalysis(recentExpenses),
        temporal_patterns: analyzeTemporalPatterns(recentExpenses)
      },
      request_type: 'comprehensive_portfolio_analysis'
    };

    // Call enhanced Python AI service
    const pythonUrl = process.env.PYTHON_RAG_URL || 'http://localhost:8001';
    const aiResponse = await axios.post(
      `${pythonUrl}/generate-recommendations`,
      aiRequestPayload,
      {
        timeout: 120000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SmartBudgetEnforcer-Enhanced/2.0'
        }
      }
    );

    if (aiResponse.status === 200 && aiResponse.data.success) {
      const aiRecommendations = aiResponse.data.recommendations || [];
      
      // Store AI recommendations in database
      const storedRecommendations = [];
      for (const rec of aiRecommendations) {
        try {
          const storedRec = await createEnhancedRecommendation({
            title: rec.title,
            description: rec.description,
            type: rec.type,
            priority: rec.priority || 2,
            department: rec.department || '',
            category: rec.category || '',
            estimated_savings: parseFloat(rec.estimated_savings) || 0,
            user_id: req.user.id,
            ai_metadata: {
              confidence_score: rec.confidence_score || 0.8,
              implementation_complexity: rec.implementation_complexity || 'medium',
              risk_level: rec.risk_level || 'low',
              roi_estimate: rec.roi_estimate || {},
              generated_by: 'portfolio_analysis_ai',
              analysis_date: new Date().toISOString()
            }
          });
          storedRecommendations.push(storedRec);
        } catch (storeError) {
          console.error('❌ Error storing AI recommendation:', storeError);
        }
      }

      res.json({
        success: true,
        message: `Generated ${storedRecommendations.length} AI-powered recommendations`,
        recommendations: storedRecommendations,
        ai_analysis: {
          total_generated: aiRecommendations.length,
          confidence_score: aiResponse.data.analysis_confidence || 0.85,
          analysis_depth: 'comprehensive',
          data_points_analyzed: budgets.length + recentExpenses.length,
          next_analysis_due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        portfolio_insights: aiResponse.data.portfolio_insights || {}
      });

    } else {
      throw new Error('AI service returned invalid response');
    }

  } catch (error) {
    console.error('❌ AI recommendation generation error:', error);

    // Fallback to rule-based recommendations
    const fallbackRecommendations = await generateFallbackRecommendations(req.user.id);

    res.json({
      success: true,
      message: 'Generated fallback recommendations (AI service temporarily unavailable)',
      recommendations: fallbackRecommendations,
      fallback_used: true,
      error_context: error.message
    });
  }
});

// ==================== ENHANCED PATTERN ANALYSIS ====================

app.get('/api/analytics/spending-patterns', verifyToken, async (req, res) => {
  try {
    console.log('📊 Performing enhanced spending pattern analysis...');

    const { timeframe = '90', categories, departments } = req.query;
    const days = parseInt(timeframe);

    // Get historical data
    const expenses = await Expense.find({
      user_id: req.user.id,
      createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
      ...(categories && { category: { $in: categories.split(',') } }),
      ...(departments && { department: { $in: departments.split(',') } })
    }).populate('budget_id');

    const budgets = await Budget.find({ user_id: req.user.id });

    // Prepare data for AI pattern analysis
    const patternAnalysisData = {
      expenses: expenses.map(e => ({
        amount: e.amount,
        category: e.category,
        department: e.department,
        date: e.createdAt,
        vendor: e.vendor_name,
        description: e.description
      })),
      budgets: budgets.map(b => ({
        department: b.department,
        category: b.category,
        limit: b.limit_amount,
        used: b.used_amount
      })),
      timeframe_days: days
    };

    // Call AI pattern analysis service
    const pythonUrl = process.env.PYTHON_RAG_URL || 'http://localhost:8001';
    let aiPatternInsights = {};
    
    try {
      const aiAnalysisResponse = await axios.post(
        `${pythonUrl}/analyze-patterns`,
        patternAnalysisData,
        {
          timeout: 60000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (aiAnalysisResponse.status === 200 && aiAnalysisResponse.data.success) {
        aiPatternInsights = aiAnalysisResponse.data.patterns || {};
      }
    } catch (aiError) {
      console.warn('⚠️ AI pattern analysis unavailable:', aiError.message);
    }

    // Generate comprehensive analytics
    const analytics = {
      summary: {
        total_expenses: expenses.length,
        total_amount: expenses.reduce((sum, e) => sum + e.amount, 0),
        average_expense: expenses.length > 0 ? expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length : 0,
        timeframe_days: days
      },
      trends: {
        daily_spending: generateDailySpendingTrend(expenses, days),
        category_trends: generateCategoryTrends(expenses),
        department_trends: generateDepartmentTrends(expenses),
        vendor_trends: generateVendorTrends(expenses)
      },
      predictions: {
        next_30_days: predictSpending(expenses, 30),
        budget_breach_risk: calculateBreachRisk(expenses, budgets),
        seasonal_adjustments: calculateSeasonalAdjustments(expenses)
      },
      ai_insights: aiPatternInsights,
      anomalies: detectSpendingAnomalies(expenses),
      recommendations: generatePatternBasedRecommendations(expenses, budgets, aiPatternInsights)
    };

    res.json({
      success: true,
      analytics,
      data_quality: {
        completeness: calculateDataCompleteness(expenses),
        confidence: aiPatternInsights.confidence_score || 0.8,
        sample_size: expenses.length
      }
    });

  } catch (error) {
    console.error('❌ Pattern analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing pattern analysis',
      error: error.message
    });
  }
});

// ==================== AI RECOMMENDATIONS PROCESSING ENDPOINT ====================

app.post('/api/internal/process-recommendations', async (req, res) => {
  try {
    const { 
      user_id, 
      recommendations, 
      breach_detected, 
      breach_summary, 
      budget_summary,
      timestamp 
    } = req.body;

    console.log(`🧠 Processing ${recommendations?.length || 0} AI recommendations for user ${user_id}`);

    // Validate request
    if (!user_id || !recommendations || !Array.isArray(recommendations)) {
      return res.status(400).json({
        success: false,
        message: 'user_id and recommendations array are required'
      });
    }

    // Get user details
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let recommendationsStored = 0;
    let emailsSent = 0;
    const processingResults = [];
    const errors = [];

    // Process each recommendation
    for (let i = 0; i < recommendations.length; i++) {
      const recData = recommendations[i];
      
      try {
        // Validate recommendation data
        if (!recData.title || !recData.description || !recData.type) {
          errors.push(`Recommendation ${i + 1}: Missing required fields`);
          continue;
        }

        // Find related budget if department/category provided
        let relatedBudget = null;
        if (recData.department && recData.category) {
          relatedBudget = await Budget.findOne({
            user_id: user_id,
            department: recData.department,
            category: recData.category
          });
        }

        // Create recommendation with enhanced data
        const recommendationDoc = new Recommendation({
          title: recData.title,
          description: recData.description,
          type: recData.type,
          priority: recData.priority || 2,
          department: recData.department || '',
          category: recData.category || '',
          estimated_savings: parseFloat(recData.estimated_savings) || 0,
          budget_id: relatedBudget ? relatedBudget._id : null,
          user_id: user_id,
          status: 'pending',
          ai_metadata: {
            generated_at: recData.created_at || new Date().toISOString(),
            breach_triggered: breach_detected || false,
            breach_severity: breach_summary?.severity_breakdown || {},
            budget_context: {
              total_allocated: budget_summary?.total_allocated || 0,
              overall_usage: budget_summary?.overall_usage_percentage || 0,
              budgets_at_risk: budget_summary?.budgets_at_risk || 0
            }
          }
        });

        const savedRecommendation = await recommendationDoc.save();
        recommendationsStored++;

        processingResults.push({
          recommendation_id: savedRecommendation._id,
          title: recData.title,
          priority: recData.priority,
          estimated_savings: recData.estimated_savings,
          related_budget: relatedBudget ? relatedBudget.name : null,
          status: 'stored'
        });

        console.log(`💾 Stored recommendation ${i + 1}: ${recData.title} (Priority: ${recData.priority})`);

        // Send email notifications for high-priority recommendations
        if (recData.priority === 1 || recData.estimated_savings >= 5000) {
          try {
            const emailFunction = sendRecommendationEmail || sendAIRecommendationEmail || sendNotificationEmail;
            const emailResult = await emailFunction(
              user, 
              savedRecommendation, 
              relatedBudget,
              breach_summary
            );
            
            if (emailResult && emailResult.success) {
              emailsSent++;
              processingResults[processingResults.length - 1].email_sent = true;
              console.log(`📧 Email sent for high-priority recommendation: ${recData.title}`);
            } else {
              console.warn(`⚠️ Email failed for recommendation: ${recData.title}`);
              processingResults[processingResults.length - 1].email_error = emailResult?.error || 'Unknown error';
            }
          } catch (emailError) {
            console.error(`❌ Email error for recommendation ${recData.title}:`, emailError);
            errors.push(`Email failed for recommendation: ${recData.title}`);
          }
        }

        // Create related alert for critical recommendations
        if (recData.priority === 1 && breach_detected) {
          try {
            await createEnhancedAlert({
              type: 'ai_recommendation',
              severity: 'high',
              message: `AI generated critical recommendation: ${recData.title}`,
              department: recData.department || '',
              category: recData.category || '',
              budget_id: relatedBudget ? relatedBudget._id : null,
              user_id: user_id,
              metadata: {
                recommendation_id: savedRecommendation._id,
                estimated_savings: recData.estimated_savings,
                ai_generated: true
              }
            });
            console.log(`🚨 Created alert for critical recommendation: ${recData.title}`);
          } catch (alertError) {
            console.warn(`⚠️ Could not create alert for recommendation: ${alertError.message}`);
          }
        }

      } catch (recError) {
        console.error(`❌ Error processing recommendation ${i + 1}:`, recError);
        errors.push(`Recommendation ${i + 1}: ${recError.message}`);
        continue;
      }
    }

    // Send summary email for multiple recommendations
    if (recommendationsStored > 1) {
      try {
        const summaryEmailFunction = sendRecommendationSummaryEmail || sendBudgetHealthReport || sendNotificationEmail;
        const summaryEmailResult = await summaryEmailFunction(
          user,
          recommendationsStored,
          breach_summary,
          budget_summary
        );
        
        if (summaryEmailResult && summaryEmailResult.success) {
          console.log(`📧 Summary email sent for ${recommendationsStored} recommendations`);
        }
      } catch (summaryError) {
        console.warn(`⚠️ Summary email failed:`, summaryError);
      }
    }

    // Response with detailed results
    const response = {
      success: true,
      message: `Processed ${recommendations.length} recommendations successfully`,
      recommendations_stored: recommendationsStored,
      emails_sent: emailsSent,
      processing_results: processingResults,
      breach_context: {
        breach_detected: breach_detected,
        total_breaches: breach_summary?.total_breaches || 0,
        departments_affected: breach_summary?.departments_affected || [],
        total_overage: breach_summary?.total_overage || 0
      },
      budget_context: budget_summary || {},
      timestamp: new Date().toISOString()
    };

    // Include warnings if some failed
    if (errors.length > 0) {
      response.warnings = errors;
      response.message += ` (${errors.length} errors occurred)`;
    }

    console.log(`✅ Successfully processed recommendations: ${recommendationsStored}/${recommendations.length} stored, ${emailsSent} emails sent`);
    res.json(response);

  } catch (error) {
    console.error('❌ Error processing AI recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing AI recommendations',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== INTERNAL NOTIFICATION ENDPOINT ====================

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

    // Get user details for email
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Process each breach and send appropriate emails
    let emailsSent = 0;
    const emailResults = [];

    if (breach_details && breach_details.length > 0) {
      for (const breach of breach_details) {
        try {
          // Find the budget for email address
          const budget = await Budget.findOne({
            department: breach.department,
            category: breach.category,
            user_id: user_id
          });

          if (!budget) {
            console.warn(`⚠️ Budget not found for ${breach.department} - ${breach.category}`);
            continue;
          }

          // Create mock expense data for email context
          const latestExpense = {
            amount: breach.financial_impact?.overage_amount || 1000,
            description: `Budget breach detected in ${breach.category}`,
            vendor_name: budget.vendor || 'Unknown',
            date: new Date()
          };

          // Send appropriate email based on severity
          let emailResult;

          if (breach.severity === 'critical' || breach.financial_impact?.overage_amount > 0) {
            // Budget exceeded - send with recommendations
            const emailFunction = sendBudgetExceededAlert || sendEnhancedBudgetExceededAlert;
            emailResult = await emailFunction(budget, latestExpense, recommendations || []);
          } else {
            // Threshold alert
            const usagePercentage = ((budget.used_amount / budget.limit_amount) * 100);
            const threshold = usagePercentage >= 75 ? 75 : usagePercentage >= 50 ? 50 : 25;
            const emailFunction = sendThresholdAlert || sendEnhancedThresholdAlert;
            emailResult = await emailFunction(budget, latestExpense, threshold);
          }

          if (emailResult && emailResult.success) {
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
              error: emailResult?.error || 'Unknown error'
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

// ==================== HELPER FUNCTIONS ====================

async function enhanceBudgetCategoryWithAI(item, aiInsights) {
  // Simulate AI-enhanced categorization
  const confidence = Math.random() * 0.3 + 0.7; // 0.7-1.0 confidence
  
  return {
    category: item.category || 'General',
    department: item.department || 'General',
    priority: item.priority || 'Medium',
    confidence: confidence,
    optimizations: [
      'Consider quarterly review cycle',
      'Monitor vendor price changes',
      'Implement approval workflow'
    ],
    risks: confidence < 0.8 ? ['Low confidence categorization'] : []
  };
}

async function performInitialBudgetAnalysis(budget, aiInsights) {
  try {
    // Create initial alert for budget setup
    const alert = new Alert({
      type: 'budget_setup',
      severity: 'low',
      message: `New budget created: ${budget.name} with AI validation`,
      department: budget.department,
      category: budget.category,
      budget_id: budget._id,
      user_id: budget.user_id,
      ai_metadata: {
        confidence_score: budget.ai_metadata?.confidence_score || 0.8,
        setup_recommendations: aiInsights.setup_recommendations || []
      }
    });
    
    await alert.save();
    console.log(`✅ Initial analysis complete for budget: ${budget.name}`);
  } catch (error) {
    console.error('❌ Error in initial budget analysis:', error);
  }
}

async function generateInitialBudgetRecommendations(userId, budgets) {
  try {
    console.log(`🧠 Generating initial recommendations for ${budgets.length} budgets...`);
    
    for (const budget of budgets) {
      // Generate setup recommendations
      const recommendations = [
        {
          title: `Optimize ${budget.category} Budget Monitoring`,
          description: `Set up automated alerts and approval workflows for ${budget.category} expenses to maintain budget compliance.`,
          type: 'process_optimization',
          priority: 2,
          department: budget.department,
          category: budget.category,
          estimated_savings: budget.limit_amount * 0.05,
          budget_id: budget._id,
          user_id: userId
        }
      ];

      for (const rec of recommendations) {
        await createEnhancedRecommendation(rec);
      }
    }

    console.log(`✅ Generated initial recommendations for user ${userId}`);
  } catch (error) {
    console.error('❌ Error generating initial recommendations:', error);
  }
}

async function checkEnhancedBudgetThresholds(budget, expense, previousUsage) {
  try {
    const usagePercentage = (budget.used_amount / budget.limit_amount) * 100;
    const previousPercentage = (previousUsage / budget.limit_amount) * 100;

    console.log(`💰 Budget usage: ${usagePercentage.toFixed(1)}% for ${budget.department} - ${budget.category}`);

    // Enhanced threshold checking
    const thresholds = [25, 50, 75, 90];
    for (const threshold of thresholds) {
      if (usagePercentage >= threshold && previousPercentage < threshold) {
        console.log(`🚨 Enhanced threshold ${threshold}% reached for ${budget.department} - ${budget.category}`);

        // Send enhanced email alert
        const emailFunction = sendThresholdAlert || sendEnhancedThresholdAlert;
        await emailFunction(budget, expense, threshold, {
          spending_trend: `${threshold}% threshold reached`,
          risk_factors: [`Usage at ${usagePercentage.toFixed(1)}%`],
          prediction: `At current rate, budget will be depleted in ${calculateDaysToDepletion(budget)} days`
        });

        // Create enhanced alert
        await createEnhancedAlert({
          type: 'threshold_warning',
          severity: threshold >= 90 ? 'critical' : threshold >= 75 ? 'high' : threshold >= 50 ? 'medium' : 'low',
          message: `Enhanced AI monitoring: ${threshold}% threshold reached for ${budget.department} - ${budget.category}`,
          department: budget.department,
          category: budget.category,
          budget_id: budget._id,
          expense_id: expense._id,
          user_id: budget.user_id,
          email_sent: true,
          ai_metadata: {
            threshold_percentage: threshold,
            usage_percentage: usagePercentage,
            risk_score: calculateRiskScore(usagePercentage, threshold),
            prediction_accuracy: 0.85
          }
        });

        // Trigger AI recommendations for high thresholds (75%+)
        if (threshold >= 75) {
          console.log(`🧠 Triggering AI analysis for ${threshold}% threshold breach`);
          await triggerEnhancedAIRecommendations(budget, expense, threshold);
        }
      }
    }

    // Check if budget exceeded (100%+)
    if (usagePercentage > 100 && previousPercentage <= 100) {
      console.log(`🚫 Budget exceeded for ${budget.department} - ${budget.category}`);

      // Always trigger AI recommendations for budget exceeding
      const aiResult = await triggerEnhancedAIRecommendations(budget, expense, usagePercentage);

      // Send email with AI recommendations
      const recommendations = aiResult.success ? aiResult.recommendations : [];
      const emailFunction = sendBudgetExceededAlert || sendEnhancedBudgetExceededAlert;
      await emailFunction(budget, expense, recommendations);

      // Create alert record
      const alertData = {
        type: 'budget_exceeded',
        severity: 'critical',
        message: `Budget exceeded by ${(budget.used_amount - budget.limit_amount).toFixed(2)} for ${budget.department} - ${budget.category}`,
        department: budget.department,
        category: budget.category,
        budget_id: budget._id,
        expense_id: expense._id,
        user_id: budget.user_id,
        email_sent: true,
        metadata: {
          overage_amount: budget.used_amount - budget.limit_amount,
          usage_percentage: usagePercentage,
          ai_recommendations_generated: aiResult.success,
          recommendations_count: recommendations.length
        }
      };

      await createEnhancedAlert(alertData);

      // Update budget status
      budget.status = 'exceeded';
      await budget.save();
    }

  } catch (error) {
    console.error('Error checking enhanced budget thresholds:', error);
  }
}

async function triggerEnhancedAIRecommendations(budget, expense, threshold) {
  try {
    console.log(`🧠 Triggering enhanced AI recommendations for ${threshold}% threshold`);
    
    // Get user's full budget context
    const allBudgets = await Budget.find({ user_id: budget.user_id });
    const recentExpenses = await Expense.find({
      user_id: budget.user_id,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    const aiRequestPayload = {
      trigger_context: {
        type: 'threshold_breach',
        threshold_percentage: threshold,
        budget: {
          id: budget._id,
          name: budget.name,
          department: budget.department,
          category: budget.category,
          limit_amount: budget.limit_amount,
          used_amount: budget.used_amount,
          usage_percentage: (budget.used_amount / budget.limit_amount) * 100
        },
        triggering_expense: {
          amount: expense.amount,
          description: expense.description,
          vendor: expense.vendor_name,
          date: expense.createdAt
        }
      },
      portfolio_context: {
        total_budgets: allBudgets.length,
        total_allocated: allBudgets.reduce((sum, b) => sum + b.limit_amount, 0),
        total_used: allBudgets.reduce((sum, b) => sum + b.used_amount, 0),
        at_risk_budgets: allBudgets.filter(b => (b.used_amount / b.limit_amount) > 0.75).length
      },
      spending_history: {
        recent_expenses_count: recentExpenses.length,
        recent_total: recentExpenses.reduce((sum, e) => sum + e.amount, 0),
        category_patterns: generateCategoryBreakdown(recentExpenses)
      },
      user_id: budget.user_id
    };
    
    const pythonUrl = process.env.PYTHON_RAG_URL || 'http://localhost:8001';
    
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.post(
          `${pythonUrl}/generate-recommendations`,
          aiRequestPayload,
          { timeout: 120000 }
        );
        
        if (response.status === 200 && response.data.success) {
          const recommendations = response.data.recommendations || [];
          
          // Store enhanced recommendations
          const storedRecommendations = [];
          for (const rec of recommendations) {
            const stored = await createEnhancedRecommendation({
              title: rec.title,
              description: rec.description,
              type: rec.type,
              priority: rec.priority || 1,
              department: budget.department,
              category: budget.category,
              estimated_savings: parseFloat(rec.estimated_savings) || 0,
              budget_id: budget._id,
              user_id: budget.user_id,
              ai_metadata: {
                trigger_type: 'threshold_breach',
                threshold_percentage: threshold,
                confidence_score: rec.confidence_score || 0.8,
                urgency_level: threshold >= 90 ? 'critical' : 'high',
                generated_at: new Date().toISOString()
              }
            });
            storedRecommendations.push(stored);
          }
          
          // Send email for high-priority recommendations
          for (const rec of storedRecommendations) {
            if (rec.priority === 1 || rec.estimated_savings >= 5000) {
              try {
                const user = await User.findById(budget.user_id);
                const emailFunction = sendRecommendationEmail || sendAIRecommendationEmail;
                await emailFunction(
                  user,
                  rec,
                  budget,
                  {
                    total_breaches: 1,
                    departments_affected: [budget.department],
                    total_overage: Math.max(0, budget.used_amount - budget.limit_amount)
                  }
                );
                console.log(`📧 Email sent for high-priority recommendation: ${rec.title}`);
              } catch (emailError) {
                console.warn(`⚠️ Email failed for recommendation ${rec.title}:`, emailError.message);
              }
            }
          }
          
          return {
            success: true,
            recommendations: storedRecommendations,
            recommendations_count: storedRecommendations.length,
            ai_confidence: response.data.analysis_confidence || 0.8
          };
        }
        
        break; // Success, exit retry loop
      } catch (retryError) {
        console.warn(`⚠️ AI service attempt ${attempt}/${maxRetries} failed:`, retryError.message);
        if (attempt === maxRetries) {
          throw retryError;
        }
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }
    
    return { success: false, recommendations_count: 0 };
    
  } catch (error) {
    console.error('❌ Enhanced AI recommendation error:', error);
    
    // Fallback recommendations when AI fails
    const fallbackRecommendations = await generateFallbackRecommendations(budget, expense, 'threshold_breach');
    
    return {
      success: false,
      error: error.message,
      fallback_used: true,
      recommendations: fallbackRecommendations,
      recommendations_count: fallbackRecommendations.length
    };
  }
}

async function generateFallbackRecommendations(budgetOrUserId, expense, breachType) {
  try {
    let budget, userId;
    
    if (typeof budgetOrUserId === 'string') {
      // Called with userId for initial recommendations
      userId = budgetOrUserId;
      const budgets = await Budget.find({ user_id: userId }).limit(1);
      budget = budgets[0];
      if (!budget) return [];
    } else {
      // Called with budget object for threshold recommendations
      budget = budgetOrUserId;
      userId = budget.user_id;
    }

    console.log(`🔄 Generating fallback recommendations for ${budget.department} - ${budget.category}`);

    const fallbackRecommendations = [];
    const overage = Math.max(0, budget.used_amount - budget.limit_amount);

    // Fallback recommendation 1: Spending pause
    const pauseRec = await createEnhancedRecommendation({
      title: `Immediate Spending Review - ${budget.department}`,
      description: `Implement immediate review process for all ${budget.category} expenses in ${budget.department}. ` +
        `Require manager approval for expenses over $500 until budget is back within limits. ` +
        `Current overage: ${overage.toFixed(2)}.`,
      type: 'spending_pause',
      priority: breachType === 'budget_exceeded' ? 1 : 2,
      department: budget.department,
      category: budget.category,
      estimated_savings: overage * 0.5,
      budget_id: budget._id,
      user_id: userId
    });
    fallbackRecommendations.push(pauseRec);

    // Fallback recommendation 2: Vendor review
    const vendorRec = await createEnhancedRecommendation({
      title: `Vendor Cost Analysis - ${budget.category}`,
      description: `Conduct immediate review of current ${budget.category} vendors and contracts. ` +
        `Research 3-5 alternative suppliers and negotiate better rates. Target 15-20% cost reduction ` +
        `through competitive bidding and contract renegotiation.`,
      type: 'vendor_alternative',
      priority: 2,
      department: budget.department,
      category: budget.category,
      estimated_savings: budget.used_amount * 0.15,
      budget_id: budget._id,
      user_id: userId
    });
    fallbackRecommendations.push(vendorRec);

    // Fallback recommendation 3: Budget reallocation (if overage exists)
    if (overage > 0) {
      const reallocRec = await createEnhancedRecommendation({
        title: `Emergency Budget Reallocation Request`,
        description: `Submit request to reallocate funds from underutilized budgets to cover ` +
          `${budget.department} - ${budget.category} overage of ${overage.toFixed(2)}. ` +
          `Review other department budgets for available funds that can be transferred.`,
        type: 'budget_reallocation',
        priority: 1,
        department: budget.department,
        category: budget.category,
        estimated_savings: overage,
        budget_id: budget._id,
        user_id: userId
      });
      fallbackRecommendations.push(reallocRec);
    }

    console.log(`✅ Generated ${fallbackRecommendations.length} fallback recommendations`);
    return fallbackRecommendations;

  } catch (error) {
    console.error('❌ Error generating fallback recommendations:', error);
    return [];
  }
}


async function createAlert(alertData) {
  try {
    const { Alert } = require('./models'); // Make sure Alert model is imported
    const alert = new Alert({
      ...alertData,
      created_at: new Date(),
      read: false
    });
    await alert.save();
    return alert;
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
}

/**
 * FIXED: Helper function to create recommendations (use your existing createRecommendation function name)
 */
async function createRecommendation(recData) {
  try {
    const { Recommendation } = require('./models'); // Make sure Recommendation model is imported
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'type', 'user_id'];
    for (const field of requiredFields) {
      if (!recData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate recommendation type
    const validTypes = ['budget_reallocation', 'vendor_alternative', 'spending_pause', 'approval_request', 'process_optimization'];
    if (!validTypes.includes(recData.type)) {
      recData.type = 'process_optimization'; // Default fallback
    }

    const recommendation = new Recommendation({
      title: recData.title,
      description: recData.description,
      type: recData.type,
      priority: recData.priority || 2,
      department: recData.department || '',
      category: recData.category || '',
      estimated_savings: parseFloat(recData.estimated_savings) || 0,
      budget_id: recData.budget_id || null,
      alert_id: recData.alert_id || null,
      user_id: recData.user_id,
      status: recData.status || 'pending',
      ai_metadata: recData.ai_metadata || {}
    });

    await recommendation.save();
    return recommendation;
  } catch (error) {
    console.error('Error creating recommendation:', error);
    throw error;
  }
}

/**
 * FIXED: Enhanced budget threshold checking function
 */
async function checkEnhancedBudgetThresholds(budget, expense, previousUsage) {
  try {
    const usagePercentage = (budget.used_amount / budget.limit_amount) * 100;
    const previousPercentage = (previousUsage / budget.limit_amount) * 100;

    console.log(`💰 Enhanced budget usage: ${usagePercentage.toFixed(1)}% for ${budget.department} - ${budget.category}`);

    // Enhanced threshold checking with AI recommendations
    const thresholds = [25, 50, 75, 90];
    for (const threshold of thresholds) {
      if (usagePercentage >= threshold && previousPercentage < threshold) {
        console.log(`🚨 Enhanced threshold ${threshold}% reached for ${budget.department} - ${budget.category}`);

        // Send AI-enhanced email alert (this now includes AI recommendations automatically)
        await sendThresholdAlert(budget, expense, threshold);

        // Create enhanced alert record
        await createAlert({
          type: 'threshold_warning',
          severity: threshold >= 90 ? 'critical' : threshold >= 75 ? 'high' : threshold >= 50 ? 'medium' : 'low',
          message: `Enhanced AI monitoring: ${threshold}% threshold reached for ${budget.department} - ${budget.category}`,
          department: budget.department,
          category: budget.category,
          budget_id: budget._id,
          expense_id: expense._id,
          user_id: budget.user_id,
          email_sent: true,
          metadata: {
            threshold_percentage: threshold,
            usage_percentage: usagePercentage,
            recommendations_included: true
          }
        });

        // Trigger AI recommendations for high thresholds (75%+)
        if (threshold >= 75) {
          console.log(`🧠 Triggering AI analysis for ${threshold}% threshold breach`);
          await triggerAIRecommendations(budget, expense, threshold);
        }
      }
    }

    // Enhanced budget exceeded handling (100%+)
    if (usagePercentage > 100 && previousPercentage <= 100) {
      console.log(`🚫 Enhanced budget exceeded for ${budget.department} - ${budget.category}`);

      // Get AI recommendations first
      const { getAIRecommendationsForBreach } = require('./email');
      const aiRecommendations = await getAIRecommendationsForBreach(
        budget, 
        expense, 
        {
          type: 'budget_exceeded',
          severity: 'critical',
          usage_percentage: usagePercentage,
          overage_amount: budget.used_amount - budget.limit_amount
        }
      );

      // Send enhanced email with AI recommendations
      await sendBudgetExceededAlert(budget, expense, aiRecommendations);

      // Create enhanced alert record
      await createAlert({
        type: 'budget_exceeded',
        severity: 'critical',
        message: `Enhanced AI alert: Budget exceeded by ${(budget.used_amount - budget.limit_amount).toFixed(2)} for ${budget.department} - ${budget.category}`,
        department: budget.department,
        category: budget.category,
        budget_id: budget._id,
        expense_id: expense._id,
        user_id: budget.user_id,
        email_sent: true,
        metadata: {
          overage_amount: budget.used_amount - budget.limit_amount,
          usage_percentage: usagePercentage,
          ai_recommendations_count: aiRecommendations.length,
          recommendations_included: true
        }
      });

      // Store AI recommendations in database
      for (const rec of aiRecommendations) {
        try {
          await createRecommendation({
            title: rec.title,
            description: rec.description,
            type: rec.type,
            priority: rec.priority || 1,
            department: budget.department,
            category: budget.category,
            estimated_savings: parseFloat(rec.estimated_savings) || 0,
            budget_id: budget._id,
            user_id: budget.user_id,
            ai_metadata: {
              trigger_type: 'budget_exceeded',
              threshold_percentage: usagePercentage,
              generated_by: 'ai_email_integration',
              generated_at: new Date().toISOString()
            }
          });
        } catch (storeError) {
          console.warn(`⚠️ Could not store AI recommendation: ${storeError.message}`);
        }
      }

      // Update budget status
      budget.status = 'exceeded';
      await budget.save();
    }

  } catch (error) {
    console.error('Error in enhanced budget threshold checking:', error);
  }
}

/**
 * FIXED: Trigger AI recommendations with email integration
 */
async function triggerAIRecommendations(budget, expense, threshold) {
  try {
    console.log(`🧠 Triggering enhanced AI recommendations for ${threshold}% threshold`);
    
    const { getAIRecommendationsForBreach } = require('./email');
    const aiRecommendations = await getAIRecommendationsForBreach(
      budget, 
      expense, 
      {
        type: 'threshold_warning',
        severity: threshold >= 90 ? 'critical' : 'high',
        usage_percentage: threshold,
        triggered_by_expense: expense.amount
      }
    );

    // Store recommendations in database
    for (const rec of aiRecommendations) {
      try {
        await createRecommendation({
          title: rec.title,
          description: rec.description,
          type: rec.type,
          priority: rec.priority || 1,
          department: budget.department,
          category: budget.category,
          estimated_savings: parseFloat(rec.estimated_savings) || 0,
          budget_id: budget._id,
          user_id: budget.user_id,
          ai_metadata: {
            trigger_type: 'threshold_warning',
            threshold_percentage: threshold,
            generated_by: 'ai_threshold_trigger',
            generated_at: new Date().toISOString()
          }
        });
      } catch (storeError) {
        console.warn(`⚠️ Could not store AI recommendation: ${storeError.message}`);
      }
    }

    return aiRecommendations;

  } catch (error) {
    console.error('❌ Enhanced AI recommendation trigger error:', error);
    return [];
  }
}

async function createEnhancedRecommendation(recData) {
  try {
    const validTypes = ['budget_reallocation', 'vendor_alternative', 'spending_pause', 'approval_request', 'process_optimization'];
    if (recData.type && !validTypes.includes(recData.type)) {
      recData.type = 'process_optimization';
    }

    const recommendation = new Recommendation({
      title: recData.title,
      description: recData.description,
      type: recData.type || 'process_optimization',
      priority: recData.priority || 2,
      department: recData.department || '',
      category: recData.category || '',
      estimated_savings: parseFloat(recData.estimated_savings) || 0,
      budget_id: recData.budget_id || null,
      user_id: recData.user_id,
      status: 'pending',
      ai_metadata: {
        ...recData.ai_metadata,
        created_at: new Date().toISOString(),
        version: '2.0'
      }
    });
    
    await recommendation.save();
    return recommendation;
  } catch (error) {
    console.error('❌ Error creating enhanced recommendation:', error);
    throw error;
  }
}

async function createEnhancedAlert(alertData) {
  try {
    const alert = new Alert({
      ...alertData,
      created_at: new Date(),
      read: false,
      ai_enhanced: true
    });
    await alert.save();
    return alert;
  } catch (error) {
    console.error('❌ Error creating enhanced alert:', error);
    throw error;
  }
}

// AI Analysis Helper Functions
async function calculateExpenseRiskScore(amount, budget, category) {
  const usageAfter = ((budget.used_amount + amount) / budget.limit_amount) * 100;
  let riskScore = 0;
  
  if (usageAfter > 100) riskScore = 10;
  else if (usageAfter > 90) riskScore = 8;
  else if (usageAfter > 75) riskScore = 6;
  else if (usageAfter > 50) riskScore = 4;
  else riskScore = 2;
  
  return riskScore;
}

async function detectExpenseAnomalies(amount, budget, category, vendor) {
  const flags = [];
  
  if (amount > budget.limit_amount * 0.5) {
    flags.push('large_single_expense');
  }
  
  if (amount < 10) {
    flags.push('micro_expense');
  }
  
  return flags;
}

async function analyzeSpendingPattern(userId, category, amount) {
  try {
    const recentExpenses = await Expense.find({
      user_id: userId,
      category: category,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    const avgAmount = recentExpenses.length > 0 ? 
      recentExpenses.reduce((sum, e) => sum + e.amount, 0) / recentExpenses.length : 0;
    
    return {
      frequency: recentExpenses.length,
      average_amount: avgAmount,
      variance: amount > avgAmount * 2 ? 'high' : 'normal',
      trend: recentExpenses.length > 10 ? 'frequent' : 'occasional'
    };
  } catch (error) {
    return { frequency: 0, average_amount: 0, variance: 'unknown', trend: 'unknown' };
  }
}

// Analytics Helper Functions
function calculateDaysToDepletion(budget) {
  const remainingAmount = budget.limit_amount - budget.used_amount;
  if (remainingAmount <= 0) return 0;
  
  const dailyRate = budget.used_amount / 30; // Assume 30 days
  return Math.ceil(remainingAmount / (dailyRate || 1));
}

function calculateRiskScore(usagePercentage, threshold) {
  return Math.min(10, (usagePercentage / 100) * 10 + (threshold / 100) * 5);
}

function generateCategoryBreakdown(expenses) {
  const breakdown = {};
  expenses.forEach(expense => {
    if (!breakdown[expense.category]) {
      breakdown[expense.category] = { count: 0, total: 0 };
    }
    breakdown[expense.category].count++;
    breakdown[expense.category].total += expense.amount;
  });
  return breakdown;
}

function generateVendorAnalysis(expenses) {
  const vendors = {};
  expenses.forEach(expense => {
    const vendor = expense.vendor_name || 'Unknown';
    if (!vendors[vendor]) {
      vendors[vendor] = { count: 0, total: 0 };
    }
    vendors[vendor].count++;
    vendors[vendor].total += expense.amount;
  });
  return vendors;
}

function calculateBudgetTrend(budget, expenses) {
  const budgetExpenses = expenses.filter(e => 
    e.budget_id && e.budget_id.toString() === budget._id.toString()
  );
  
  return {
    expense_count: budgetExpenses.length,
    total_spent: budgetExpenses.reduce((sum, e) => sum + e.amount, 0),
    trend: budgetExpenses.length > 0 ? 'active' : 'inactive'
  };
}

function analyzeTemporalPatterns(expenses) {
  const patterns = {
    by_day: {},
    by_week: {},
    by_month: {}
  };
  
  expenses.forEach(expense => {
    const date = new Date(expense.createdAt);
    const day = date.getDay();
    const week = Math.floor(date.getDate() / 7);
    const month = date.getMonth();
    
    patterns.by_day[day] = (patterns.by_day[day] || 0) + expense.amount;
    patterns.by_week[week] = (patterns.by_week[week] || 0) + expense.amount;
    patterns.by_month[month] = (patterns.by_month[month] || 0) + expense.amount;
  });
  
  return patterns;
}

function generateDailySpendingTrend(expenses, days) {
  const trend = [];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dayExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.createdAt);
      return expenseDate.toDateString() === date.toDateString();
    });
    
    trend.push({
      date: date.toISOString().split('T')[0],
      amount: dayExpenses.reduce((sum, e) => sum + e.amount, 0),
      count: dayExpenses.length
    });
  }
  
  return trend;
}

function generateCategoryTrends(expenses) {
  const trends = {};
  expenses.forEach(expense => {
    if (!trends[expense.category]) {
      trends[expense.category] = [];
    }
    trends[expense.category].push({
      date: expense.createdAt,
      amount: expense.amount
    });
  });
  return trends;
}

function generateDepartmentTrends(expenses) {
  const trends = {};
  expenses.forEach(expense => {
    if (!trends[expense.department]) {
      trends[expense.department] = [];
    }
    trends[expense.department].push({
      date: expense.createdAt,
      amount: expense.amount
    });
  });
  return trends;
}

function generateVendorTrends(expenses) {
  const trends = {};
  expenses.forEach(expense => {
    const vendor = expense.vendor_name || 'Unknown';
    if (!trends[vendor]) {
      trends[vendor] = [];
    }
    trends[vendor].push({
      date: expense.createdAt,
      amount: expense.amount
    });
  });
  return trends;
}

function predictSpending(expenses, days) {
  if (expenses.length < 7) {
    return { predicted_amount: 0, confidence: 0, trend: 'insufficient_data' };
  }
  
  const recentDaily = expenses.reduce((sum, e) => sum + e.amount, 0) / 30;
  const predictedAmount = recentDaily * days;
  
  return {
    predicted_amount: predictedAmount,
    confidence: Math.min(0.9, expenses.length / 30),
    trend: recentDaily > 100 ? 'increasing' : 'stable'
  };
}

function calculateBreachRisk(expenses, budgets) {
  const risks = {};
  
  budgets.forEach(budget => {
    const usagePercentage = (budget.used_amount / budget.limit_amount) * 100;
    let risk = 'low';
    
    if (usagePercentage > 90) risk = 'critical';
    else if (usagePercentage > 75) risk = 'high';
    else if (usagePercentage > 50) risk = 'medium';
    
    risks[`${budget.department}-${budget.category}`] = {
      risk_level: risk,
      usage_percentage: usagePercentage,
      days_to_depletion: calculateDaysToDepletion(budget)
    };
  });
  
  return risks;
}

function calculateSeasonalAdjustments(expenses) {
  const monthlyTotals = {};
  expenses.forEach(expense => {
    const month = new Date(expense.createdAt).getMonth();
    monthlyTotals[month] = (monthlyTotals[month] || 0) + expense.amount;
  });
  
  const avgMonthly = Object.values(monthlyTotals).reduce((sum, val) => sum + val, 0) / 12;
  const adjustments = {};
  
  Object.keys(monthlyTotals).forEach(month => {
    const variance = (monthlyTotals[month] - avgMonthly) / avgMonthly;
    adjustments[month] = {
      variance_percentage: variance * 100,
      adjustment_factor: 1 + variance
    };
  });
  
  return adjustments;
}

function detectSpendingAnomalies(expenses) {
  const anomalies = [];
  
  if (expenses.length < 10) return anomalies;
  
  const amounts = expenses.map(e => e.amount).sort((a, b) => a - b);
  const median = amounts[Math.floor(amounts.length / 2)];
  const q1 = amounts[Math.floor(amounts.length * 0.25)];
  const q3 = amounts[Math.floor(amounts.length * 0.75)];
  const iqr = q3 - q1;
  const upperBound = q3 + 1.5 * iqr;
  const lowerBound = q1 - 1.5 * iqr;
  
  expenses.forEach(expense => {
    if (expense.amount > upperBound) {
      anomalies.push({
        type: 'outlier_high',
        expense_id: expense._id,
        amount: expense.amount,
        expected_range: `${lowerBound.toFixed(2)} - ${upperBound.toFixed(2)}`
      });
    } else if (expense.amount < lowerBound && expense.amount > 0) {
      anomalies.push({
        type: 'outlier_low',
        expense_id: expense._id,
        amount: expense.amount,
        expected_range: `${lowerBound.toFixed(2)} - ${upperBound.toFixed(2)}`
      });
    }
  });
  
  return anomalies;
}

function generatePatternBasedRecommendations(expenses, budgets, aiInsights) {
  const recommendations = [];
  
  // High-frequency vendor recommendation
  const vendorAnalysis = generateVendorAnalysis(expenses);
  const topVendor = Object.keys(vendorAnalysis).reduce((a, b) => 
    vendorAnalysis[a].total > vendorAnalysis[b].total ? a : b, 'Unknown'
  );
  
  if (topVendor !== 'Unknown' && vendorAnalysis[topVendor].total > 5000) {
    recommendations.push({
      type: 'vendor_negotiation',
      title: `Negotiate Better Rates with ${topVendor}`,
      description: `Your top vendor ${topVendor} accounts for ${vendorAnalysis[topVendor].total.toFixed(2)} in expenses. Consider negotiating volume discounts.`,
      priority: 2,
      estimated_savings: vendorAnalysis[topVendor].total * 0.1
    });
  }
  
  // Budget reallocation recommendation
  const overBudget = budgets.filter(b => b.used_amount > b.limit_amount);
  const underBudget = budgets.filter(b => b.used_amount < b.limit_amount * 0.5);
  
  if (overBudget.length > 0 && underBudget.length > 0) {
    recommendations.push({
      type: 'budget_reallocation',
      title: 'Budget Reallocation Opportunity',
      description: `Consider reallocating funds from ${underBudget.length} underutilized budgets to ${overBudget.length} over-budget categories.`,
      priority: 2,
      estimated_savings: Math.min(
        overBudget.reduce((sum, b) => sum + (b.used_amount - b.limit_amount), 0),
        underBudget.reduce((sum, b) => sum + (b.limit_amount - b.used_amount), 0)
      )
    });
  }
  
  return recommendations;
}

function calculateDataCompleteness(expenses) {
  let score = 0;
  let total = 0;
  
  expenses.forEach(expense => {
    total += 4; // 4 fields to check
    if (expense.amount > 0) score++;
    if (expense.description && expense.description.length > 5) score++;
    if (expense.vendor_name && expense.vendor_name.length > 0) score++;
    if (expense.category && expense.category.length > 0) score++;
  });
  
  return total > 0 ? (score / total) * 100 : 0;
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Enhanced Smart Budget Enforcer API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧠 AI-powered features: Pattern Analysis, Predictive Alerts, Smart Recommendations`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'localhost:3000'}`);
});