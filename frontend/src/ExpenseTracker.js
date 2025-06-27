 
/**
 * Expense Tracker Component for Smart Budget Enforcer
 * Person Y Guide: This handles adding new expenses and monitoring real-time budget usage
 * Person X: This is where you add your expenses and see how they affect your budgets
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Fab,
  Container,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Receipt as ReceiptIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  AttachMoney as AttachMoneyIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

import { 
  getBudgets, 
  addExpense, 
  getExpenses, 
  formatCurrency, 
  getStatusColor,
  getStatusText 
} from './api';

const ExpenseTracker = () => {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    department: '',
    category: '',
    description: '',
    vendor_name: '',
    budget_id: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [alert, setAlert] = useState(null);

  // Person Y: Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Person Y: Load budgets and expenses
  const loadData = async () => {
    try {
      setLoading(true);
      const [budgetsResponse, expensesResponse] = await Promise.all([
        getBudgets(),
        getExpenses(),
      ]);

      if (budgetsResponse.success) {
        setBudgets(budgetsResponse.budgets);
      }

      if (expensesResponse.success) {
        setExpenses(expensesResponse.expenses);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setAlert({
        type: 'error',
        message: 'Failed to load data. Please refresh the page.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Person Y: Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Person Y: Clear specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Person Y: Auto-select budget when department and category are chosen
    if (name === 'department' || name === 'category') {
      const updatedData = { ...formData, [name]: value };
      if (updatedData.department && updatedData.category) {
        const matchingBudget = budgets.find(
          budget => 
            budget.department === updatedData.department && 
            budget.category === updatedData.category
        );
        if (matchingBudget) {
          setFormData(prev => ({ ...prev, budget_id: matchingBudget._id }));
          setSelectedBudget(matchingBudget);
        }
      }
    }
  };

  // Person Y: Validate form data
  const validateForm = () => {
    const errors = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Please enter a valid amount';
    }
    
    if (!formData.department) {
      errors.department = 'Please select a department';
    }
    
    if (!formData.category) {
      errors.category = 'Please select a category';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Please enter a description';
    }
    
    if (!formData.budget_id) {
      errors.budget_id = 'Please select a budget';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Person Y: Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    
    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      const response = await addExpense(expenseData);
      
      if (response.success) {
        // Person Y: Show success message
        setAlert({
          type: 'success',
          message: `Expense added successfully! Budget usage updated.`,
        });
        
        // Person Y: Reset form and close dialog
        setFormData({
          amount: '',
          department: '',
          category: '',
          description: '',
          vendor_name: '',
          budget_id: '',
        });
        setSelectedBudget(null);
        setDialogOpen(false);
        
        // Person Y: Reload data to show updates
        loadData();
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Failed to add expense. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Person Y: Get available departments
  const getAvailableDepartments = () => {
    return [...new Set(budgets.map(budget => budget.department))];
  };

  // Person Y: Get available categories for selected department
  const getAvailableCategories = () => {
    if (!formData.department) return [];
    return budgets
      .filter(budget => budget.department === formData.department)
      .map(budget => budget.category);
  };

  // Person Y: Calculate budget usage after potential expense
  const calculateUsageAfterExpense = (budget, expenseAmount) => {
    const newUsedAmount = budget.used_amount + expenseAmount;
    return (newUsedAmount / budget.limit_amount) * 100;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={50} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            💳 Expense Tracker
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Add expenses and monitor real-time budget impact
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          disabled={budgets.length === 0}
        >
          Add Expense
        </Button>
      </Box>

      {/* Person Y: Alert messages */}
      {alert && (
        <Alert 
          severity={alert.type} 
          onClose={() => setAlert(null)}
          sx={{ mb: 3 }}
        >
          {alert.message}
        </Alert>
      )}

      {/* Person Y: No budgets warning */}
      {budgets.length === 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          No budgets found. Please upload a budget document first.
          <Button variant="outlined" size="small" href="/upload" sx={{ ml: 2 }}>
            Upload Budget
          </Button>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Person Y: Budget Overview Cards */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            📊 Current Budget Status
          </Typography>
          <Grid container spacing={2}>
            {budgets.map((budget) => {
              const usagePercentage = (budget.used_amount / budget.limit_amount) * 100;
              const statusColor = getStatusColor(usagePercentage);
              const statusText = getStatusText(usagePercentage);
              
              return (
                <Grid item xs={12} sm={6} md={4} key={budget._id}>
                  <Card 
                    variant="outlined"
                    sx={{
                      borderColor: usagePercentage >= 90 ? 'error.main' : 
                                  usagePercentage >= 75 ? 'warning.main' : 'divider'
                    }}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="h6" noWrap>
                          {budget.department}
                        </Typography>
                        <Chip 
                          label={statusText} 
                          color={statusColor} 
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {budget.category}
                      </Typography>
                      
                      <Box mb={1}>
                        <Typography variant="body2">
                          {formatCurrency(budget.used_amount)} of {formatCurrency(budget.limit_amount)}
                        </Typography>
                        <Box 
                          sx={{ 
                            width: '100%', 
                            height: 8, 
                            backgroundColor: 'grey.200', 
                            borderRadius: 4,
                            mt: 0.5
                          }}
                        >
                          <Box
                            sx={{
                              width: `${Math.min(usagePercentage, 100)}%`,
                              height: '100%',
                              backgroundColor: usagePercentage >= 100 ? 'error.main' :
                                             usagePercentage >= 90 ? 'warning.main' :
                                             usagePercentage >= 75 ? 'info.main' : 'success.main',
                              borderRadius: 4,
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" mt={0.5}>
                          {usagePercentage.toFixed(1)}% used
                        </Typography>
                      </Box>

                      {usagePercentage >= 85 && (
                        <Alert severity="warning" size="small">
                          <Typography variant="caption">
                            Approaching limit!
                          </Typography>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        {/* Person Y: Recent Expenses Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📋 Recent Expenses
              </Typography>
              
              {expenses.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <ReceiptIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No expenses recorded yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add your first expense to start monitoring budget usage
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Vendor</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expenses.slice(0, 10).map((expense) => (
                        <TableRow key={expense._id}>
                          <TableCell>
                            {format(new Date(expense.createdAt), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell>{expense.department}</TableCell>
                          <TableCell>{expense.category}</TableCell>
                          <TableCell>{expense.vendor_name || '-'}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="bold">
                              {formatCurrency(expense.amount)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Person Y: Add Expense Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Add New Expense</Typography>
            <IconButton onClick={() => setDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              {/* Amount */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange}
                  error={!!formErrors.amount}
                  helperText={formErrors.amount}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon />
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{
                    step: "0.01",
                    min: "0",
                  }}
                />
              </Grid>

              {/* Department */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!formErrors.department}>
                  <InputLabel>Department</InputLabel>
                  <Select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    startAdornment={<BusinessIcon sx={{ mr: 1, color: 'action.active' }} />}
                  >
                    {getAvailableDepartments().map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.department && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                      {formErrors.department}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Category */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!formErrors.category}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    disabled={!formData.department}
                    startAdornment={<CategoryIcon sx={{ mr: 1, color: 'action.active' }} />}
                  >
                    {getAvailableCategories().map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.category && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                      {formErrors.category}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Vendor */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Vendor (Optional)"
                  name="vendor_name"
                  value={formData.vendor_name}
                  onChange={handleInputChange}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  error={!!formErrors.description}
                  helperText={formErrors.description}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>

            {/* Person Y: Budget Impact Preview */}
            {selectedBudget && formData.amount && (
              <Card variant="outlined" sx={{ mt: 2, p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  📊 Budget Impact Preview
                </Typography>
                
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Current Usage:</Typography>
                  <Typography variant="body2">
                    {formatCurrency(selectedBudget.used_amount)} / {formatCurrency(selectedBudget.limit_amount)}
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">After This Expense:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatCurrency(selectedBudget.used_amount + parseFloat(formData.amount || 0))} / {formatCurrency(selectedBudget.limit_amount)}
                  </Typography>
                </Box>
                
                {formData.amount && (
                  <Box>
                    {(() => {
                      const newUsage = calculateUsageAfterExpense(selectedBudget, parseFloat(formData.amount));
                      if (newUsage > 100) {
                        return (
                          <Alert severity="error" size="small">
                            <Typography variant="caption">
                              ⚠️ This expense will exceed the budget limit by {formatCurrency((selectedBudget.used_amount + parseFloat(formData.amount)) - selectedBudget.limit_amount)}!
                            </Typography>
                          </Alert>
                        );
                      } else if (newUsage > 90) {
                        return (
                          <Alert severity="warning" size="small">
                            <Typography variant="caption">
                              ⚠️ This expense will push usage to {newUsage.toFixed(1)}% (Critical level)
                            </Typography>
                          </Alert>
                        );
                      } else if (newUsage > 75) {
                        return (
                          <Alert severity="info" size="small">
                            <Typography variant="caption">
                              ℹ️ This expense will push usage to {newUsage.toFixed(1)}% (Warning level)
                            </Typography>
                          </Alert>
                        );
                      }
                      return null;
                    })()}
                  </Box>
                )}
              </Card>
            )}
          </DialogContent>
          
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => setDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="contained"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : <AddIcon />}
            >
              {submitting ? 'Adding...' : 'Add Expense'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Person Y: Floating Action Button for mobile */}
      <Fab
        color="primary"
        aria-label="add expense"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', sm: 'none' },
        }}
        onClick={() => setDialogOpen(true)}
        disabled={budgets.length === 0}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default ExpenseTracker;