/**
 * API Service for Smart Budget Enforcer Frontend
 * Person Y Guide: This handles all communication with the Node.js backend
 * Person X: Think of this as a messenger that talks to the server
 */

import axios from 'axios';
import toast from 'react-hot-toast';

// Person Y: Configure axios with base URL and interceptors
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // Person Y: 120 second timeout for file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Person Y: Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Person Y: Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      // Person Y: Handle unauthorized - redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.data?.message) {
      // Person Y: Show server error message
      toast.error(error.response.data.message);
    } else if (error.message) {
      // Person Y: Show network error
      toast.error(error.message);
    }
    
    return Promise.reject(error);
  }
);

// ==================== AUTHENTICATION APIs ====================

/**
 * Person X: User registration
 */
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    
    if (response.data.success) {
      // Person Y: Store token and user data
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Registration successful!');
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Person X: User login
 */
export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    
    if (response.data.success) {
      // Person Y: Store token and user data
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Login successful!');
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Person X: Logout user
 */
export const logoutUser = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  toast.success('Logged out successfully');
};

/**
 * Person X: Get current user from localStorage
 */
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

/**
 * Person X: Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

// ==================== DOCUMENT UPLOAD APIs ====================

/**
 * Person X: Upload budget document for AI processing
 */
export const uploadBudgetDocument = async (file, onProgress = null) => {
  try {
    const formData = new FormData();
    formData.append('document', file);
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // Person Y: 120 seconds for large files
    };
    
    // Person Y: Add progress tracking if callback provided
    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      };
    }
    
    const response = await api.post('/upload/budget-document', formData, config);
    
    if (response.data.success) {
      toast.success(`Document processed! Found ${response.data.budget_count} budget items.`);
    }
    
    return response.data;
  } catch (error) {
    toast.error('Failed to upload document');
    throw error;
  }
};

// ==================== BUDGET MANAGEMENT APIs ====================

/**
 * Person X: Get all budgets for current user
 */
export const getBudgets = async () => {
  try {
    const response = await api.get('/budgets');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Person X: Get specific budget by ID
 */
export const getBudgetById = async (budgetId) => {
  try {
    const response = await api.get(`/budgets/${budgetId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Person X: Update budget information
 */
export const updateBudget = async (budgetId, budgetData) => {
  try {
    const response = await api.put(`/budgets/${budgetId}`, budgetData);
    
    if (response.data.success) {
      toast.success('Budget updated successfully');
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Person X: Delete budget
 */
export const deleteBudget = async (budgetId) => {
  try {
    const response = await api.delete(`/budgets/${budgetId}`);
    
    if (response.data.success) {
      toast.success('Budget deleted successfully');
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ==================== EXPENSE MANAGEMENT APIs ====================

/**
 * Person X: Add new expense
 */
export const addExpense = async (expenseData) => {
  try {
    const response = await api.post('/expenses', expenseData);
    
    if (response.data.success) {
      toast.success('Expense added successfully');
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Person X: Get all expenses
 */
export const getExpenses = async () => {
  try {
    const response = await api.get('/expenses');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Person X: Get expenses for specific budget
 */
export const getExpensesByBudget = async (budgetId) => {
  try {
    const response = await api.get(`/expenses/budget/${budgetId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ==================== DASHBOARD APIs ====================

/**
 * Person X: Get dashboard summary data
 */
export const getDashboardSummary = async () => {
  try {
    const response = await api.get('/dashboard/summary');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ==================== ALERTS & RECOMMENDATIONS APIs ====================

/**
 * Person X: Get all alerts
 */
export const getAlerts = async () => {
  try {
    const response = await api.get('/alerts');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Person X: Mark alert as read
 */
export const markAlertAsRead = async (alertId) => {
  try {
    const response = await api.put(`/alerts/${alertId}/read`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Person X: Get all recommendations
 */
export const getRecommendations = async () => {
  try {
    const response = await api.get('/recommendations');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Person X: Update recommendation status
 */
export const updateRecommendationStatus = async (recommendationId, status) => {
  try {
    const response = await api.put(`/recommendations/${recommendationId}/status`, { status });
    
    if (response.data.success) {
      toast.success(`Recommendation ${status}`);
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ==================== UTILITY APIs ====================

/**
 * Person X: Health check
 */
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Person Y: Format currency for display
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Person Y: Format percentage for display
 */
export const formatPercentage = (value, decimals = 1) => {
  return `${Number(value).toFixed(decimals)}%`;
};

/**
 * Person Y: Get status color based on usage percentage
 */
export const getStatusColor = (usagePercentage) => {
  if (usagePercentage >= 100) return 'error';
  if (usagePercentage >= 90) return 'warning';
  if (usagePercentage >= 75) return 'info';
  return 'success';
};

/**
 * Person Y: Get status text based on usage percentage
 */
export const getStatusText = (usagePercentage) => {
  if (usagePercentage >= 100) return 'Exceeded';
  if (usagePercentage >= 90) return 'Critical';
  if (usagePercentage >= 75) return 'Warning';
  if (usagePercentage >= 50) return 'Moderate';
  return 'Safe';
};

export default api;