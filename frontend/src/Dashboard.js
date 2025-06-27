
// /**
//  * Dashboard Component for Smart Budget Enforcer
//  * Person Y Guide: This displays real-time budget overview with charts and metrics
//  * Person X: This is the main screen showing all your budget information
//  */

// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Grid,
//   Card,
//   CardContent,
//   Typography,
//   LinearProgress,
//   Chip,
//   Alert,
//   Button,
//   IconButton,
//   Tooltip,
//   CircularProgress,
//   Container,
// } from '@mui/material';
// import {
//   Refresh as RefreshIcon,
//   TrendingUp as TrendingUpIcon,
//   Warning as WarningIcon,
//   CheckCircle as CheckCircleIcon,
//   Error as ErrorIcon,
//   Info as InfoIcon,
// } from '@mui/icons-material';
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip as RechartsTooltip,
//   Legend,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
// } from 'recharts';

// import { getDashboardSummary, formatCurrency, formatPercentage, getStatusColor } from './api';

// const Dashboard = () => {
//   const [dashboardData, setDashboardData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [lastUpdated, setLastUpdated] = useState(new Date());

//   // Person Y: Load dashboard data on component mount
//   useEffect(() => {
//     loadDashboardData();

//     // Person Y: Auto-refresh every 30 seconds for real-time updates
//     const interval = setInterval(loadDashboardData, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   // Person Y: Fetch dashboard data from API
//   const loadDashboardData = async () => {
//     try {
//       setError('');
//       const response = await getDashboardSummary();

//       if (response.success) {
//         setDashboardData(response);
//         setLastUpdated(new Date());
//       } else {
//         setError('Failed to load dashboard data');
//       }
//     } catch (error) {
//       console.error('Dashboard load error:', error);
//       setError('Unable to load dashboard. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Person Y: Manual refresh handler
//   const handleRefresh = () => {
//     setLoading(true);
//     loadDashboardData();
//   };

//   // Person Y: Get status icon based on usage percentage
//   const getStatusIcon = (usagePercentage) => {
//     if (usagePercentage >= 100) return <ErrorIcon color="error" />;
//     if (usagePercentage >= 90) return <WarningIcon color="warning" />;
//     if (usagePercentage >= 75) return <InfoIcon color="info" />;
//     return <CheckCircleIcon color="success" />;
//   };

//   // Person Y: Get status text and color
//   const getStatusInfo = (usagePercentage) => {
//     if (usagePercentage >= 100) return { text: 'Exceeded', color: 'error' };
//     if (usagePercentage >= 90) return { text: 'Critical', color: 'warning' };
//     if (usagePercentage >= 75) return { text: 'Warning', color: 'info' };
//     if (usagePercentage >= 50) return { text: 'Moderate', color: 'primary' };
//     return { text: 'Safe', color: 'success' };
//   };

//   // Person Y: Colors for charts
//   const chartColors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

//   if (loading && !dashboardData) {
//     return (
//       <Box
//         display="flex"
//         justifyContent="center"
//         alignItems="center"
//         minHeight="60vh"
//       >
//         <CircularProgress size={50} />
//       </Box>
//     );
//   }

//   if (error && !dashboardData) {
//     return (
//       <Container maxWidth="lg" sx={{ mt: 4 }}>
//         <Alert severity="error" action={
//           <Button color="inherit" size="small" onClick={handleRefresh}>
//             Retry
//           </Button>
//         }>
//           {error}
//         </Alert>
//       </Container>
//     );
//   }

//   if (!dashboardData) {
//     return (
//       <Container maxWidth="lg" sx={{ mt: 4 }}>
//         <Alert severity="info">
//           No budget data available. Please upload a budget document first.
//           <Button variant="contained" sx={{ ml: 2 }} href="/upload">
//             Upload Budget
//           </Button>
//         </Alert>
//       </Container>
//     );
//   }

//   const { summary, departmentSummary, recentAlerts, activeRecommendations } = dashboardData;

//   // Person Y: Prepare chart data
//   const departmentChartData = departmentSummary.map(dept => ({
//     department: dept.department,
//     allocated: dept.total_allocated,
//     used: dept.total_used,
//     remaining: dept.total_remaining,
//     usagePercentage: dept.usage_percentage,
//   }));

//   // Person Y: Prepare pie chart data for overall budget distribution
//   const budgetDistributionData = departmentSummary.map((dept, index) => ({
//     name: dept.department,
//     value: dept.total_allocated,
//     color: chartColors[index % chartColors.length],
//   }));

//   return (
//     <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
//       {/* Person Y: Header with refresh button */}
//       <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
//         <Box>
//           <Typography variant="h4" component="h1" gutterBottom>
//             📊 Budget Dashboard
//           </Typography>
//           <Typography variant="subtitle1" color="text.secondary">
//             Last updated: {lastUpdated.toLocaleTimeString()}
//           </Typography>
//         </Box>
//         <Tooltip title="Refresh Dashboard">
//           <IconButton onClick={handleRefresh} disabled={loading}>
//             <RefreshIcon />
//           </IconButton>
//         </Tooltip>
//       </Box>

//       {/* Person Y: Summary Cards */}
//       <Grid container spacing={3} mb={4}>
//         <Grid item xs={12} sm={6} md={3}>
//           <Card>
//             <CardContent>
//               <Typography color="text.secondary" gutterBottom>
//                 Total Allocated
//               </Typography>
//               <Typography variant="h5">
//                 {formatCurrency(summary.totalAllocated)}
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 {summary.totalBudgets} budget items
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid item xs={12} sm={6} md={3}>
//           <Card>
//             <CardContent>
//               <Typography color="text.secondary" gutterBottom>
//                 Total Used
//               </Typography>
//               <Typography variant="h5" color="primary">
//                 {formatCurrency(summary.totalUsed)}
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 {formatPercentage(summary.usagePercentage)} of budget
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid item xs={12} sm={6} md={3}>
//           <Card>
//             <CardContent>
//               <Typography color="text.secondary" gutterBottom>
//                 Remaining
//               </Typography>
//               <Typography variant="h5" color="success.main">
//                 {formatCurrency(summary.totalRemaining)}
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 Available to spend
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid item xs={12} sm={6} md={3}>
//           <Card>
//             <CardContent>
//               <Typography color="text.secondary" gutterBottom>
//                 Overall Status
//               </Typography>
//               <Box display="flex" alignItems="center" gap={1}>
//                 {getStatusIcon(summary.usagePercentage)}
//                 <Chip
//                   label={getStatusInfo(summary.usagePercentage).text}
//                   color={getStatusInfo(summary.usagePercentage).color}
//                   size="small"
//                 />
//               </Box>
//               <LinearProgress
//                 variant="determinate"
//                 value={Math.min(summary.usagePercentage, 100)}
//                 color={getStatusColor(summary.usagePercentage)}
//                 sx={{ mt: 1 }}
//               />
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       {/* Person Y: Alert Banner for Critical Issues */}
//       {recentAlerts && recentAlerts.length > 0 && (
//         <Alert
//           severity={recentAlerts.some(alert => alert.severity === 'critical') ? 'error' : 'warning'}
//           sx={{ mb: 3 }}
//           action={
//             <Button color="inherit" size="small" href="/alerts">
//               View All Alerts
//             </Button>
//           }
//         >
//           <Typography variant="body1" fontWeight="bold">
//             {recentAlerts.length} Active Alert{recentAlerts.length > 1 ? 's' : ''}
//           </Typography>
//           {recentAlerts.slice(0, 2).map((alert, index) => (
//             <Typography key={index} variant="body2">
//               • {alert.message}
//             </Typography>
//           ))}
//         </Alert>
//       )}

//       {/* Person Y: Charts Section */}
//       <Grid container spacing={3} mb={4}>
//         {/* Department Budget Overview */}
//         <Grid item xs={12} lg={8}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>
//                 Department Budget Overview
//               </Typography>
//               <ResponsiveContainer width="100%" height={400}>
//                 <BarChart data={departmentChartData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="department" />
//                   <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
//                   <RechartsTooltip
//                     formatter={(value, name) => [formatCurrency(value), name]}
//                   />
//                   <Legend />
//                   <Bar dataKey="allocated" fill="#667eea" name="Allocated" />
//                   <Bar dataKey="used" fill="#764ba2" name="Used" />
//                   <Bar dataKey="remaining" fill="#4facfe" name="Remaining" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Budget Distribution Pie Chart */}
//         <Grid item xs={12} lg={4}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>
//                 Budget Allocation
//               </Typography>
//               <ResponsiveContainer width="100%" height={400}>
//                 <PieChart>
//                   <Pie
//                     data={budgetDistributionData}
//                     cx="50%"
//                     cy="50%"
//                     labelLine={false}
//                     label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                     outerRadius={120}
//                     fill="#8884d8"
//                     dataKey="value"
//                   >
//                     {budgetDistributionData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={entry.color} />
//                     ))}
//                   </Pie>
//                   <RechartsTooltip formatter={(value) => formatCurrency(value)} />
//                 </PieChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       {/* Person Y: Department Details */}
//       <Grid container spacing={3} mb={4}>
//         <Grid item xs={12}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>
//                 Department Details
//               </Typography>
//               <Grid container spacing={2}>
//                 {departmentSummary.map((dept, index) => (
//                   <Grid item xs={12} sm={6} md={4} key={dept.department}>
//                     <Card variant="outlined">
//                       <CardContent>
//                         <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
//                           <Typography variant="h6">{dept.department}</Typography>
//                           {getStatusIcon(dept.usage_percentage)}
//                         </Box>

//                         <Box mb={2}>
//                           <Typography variant="body2" color="text.secondary">
//                             {dept.used} of {dept.allocated}
//                           </Typography>
//                           <LinearProgress
//                             variant="determinate"
//                             value={Math.min(dept.categories.percentage, 100)}
//                             color={getStatusColor(dept.categories.percentage)}
//                             sx={{ mt: 1, height: 8, borderRadius: 4 }}
//                           />
//                           <Typography variant="body2" color="text.secondary" mt={0.5}>
//                             {formatPercentage(dept?.categories?.percentage)} used
//                           </Typography>
//                         </Box>

//                         <Box>
//                           <Typography variant="body2" color="text.secondary">
//                             Categories: {dept.categories.map(cat => cat.name).join(', ')}
//                           </Typography>
//                           <Typography variant="body2" color="success.main">
//                             Remaining: {formatCurrency(dept.remaining)}
//                           </Typography>
//                         </Box>
//                       </CardContent>
//                     </Card>
//                   </Grid>
//                 ))}
//               </Grid>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       {/* Person Y: Active Recommendations */}
//       {activeRecommendations && activeRecommendations.length > 0 && (
//         <Grid container spacing={3}>
//           <Grid item xs={12}>
//             <Card>
//               <CardContent>
//                 <Typography variant="h6" gutterBottom>
//                   💡 AI Recommendations
//                 </Typography>
//                 {activeRecommendations.slice(0, 3).map((rec, index) => (
//                   <Alert
//                     key={index}
//                     severity="info"
//                     sx={{ mb: 1 }}
//                     action={
//                       <Button size="small" color="inherit">
//                         Review
//                       </Button>
//                     }
//                   >
//                     <Typography variant="body2" fontWeight="bold">
//                       {rec.title}
//                     </Typography>
//                     <Typography variant="body2">
//                       {rec.description.slice(0, 120)}...
//                     </Typography>
//                   </Alert>
//                 ))}
//                 <Button
//                   variant="outlined"
//                   size="small"
//                   href="/alerts"
//                   sx={{ mt: 1 }}
//                 >
//                   View All Recommendations
//                 </Button>
//               </CardContent>
//             </Card>
//           </Grid>
//         </Grid>
//       )}
//     </Container>
//   );
// };

// export default Dashboard;


/**
 * Dashboard Component for Smart Budget Enforcer
 * Person Y Guide: This displays real-time budget overview with charts and metrics
 * Person X: This is the main screen showing all your budget information
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Alert,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Container,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { getDashboardSummary, formatCurrency, formatPercentage, getStatusColor } from './api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Person Y: Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData();

    // Person Y: Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Person Y: Fetch dashboard data from API
  const loadDashboardData = async () => {
    try {
      setError('');
      const response = await getDashboardSummary();

      if (response.success) {
        setDashboardData(response);
        setLastUpdated(new Date());
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
      setError('Unable to load dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Person Y: Manual refresh handler
  const handleRefresh = () => {
    setLoading(true);
    loadDashboardData();
  };

  // Person Y: Get status icon based on usage percentage
  const getStatusIcon = (usagePercentage) => {
    if (usagePercentage >= 100) return <ErrorIcon color="error" />;
    if (usagePercentage >= 90) return <WarningIcon color="warning" />;
    if (usagePercentage >= 75) return <InfoIcon color="info" />;
    return <CheckCircleIcon color="success" />;
  };

  // Person Y: Get status text and color
  const getStatusInfo = (usagePercentage) => {
    if (usagePercentage >= 100) return { text: 'Exceeded', color: 'error' };
    if (usagePercentage >= 90) return { text: 'Critical', color: 'warning' };
    if (usagePercentage >= 75) return { text: 'Warning', color: 'info' };
    if (usagePercentage >= 50) return { text: 'Moderate', color: 'primary' };
    return { text: 'Safe', color: 'success' };
  };

  // Person Y: Colors for charts
  const chartColors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

  if (loading && !dashboardData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress size={50} />
      </Box>
    );
  }

  if (error && !dashboardData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!dashboardData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="info">
          No budget data available. Please upload a budget document first.
          <Button variant="contained" sx={{ ml: 2 }} href="/upload">
            Upload Budget
          </Button>
        </Alert>
      </Container>
    );
  }

  // Use the actual data structure from your JSON
  const departmentSummary = dashboardData.departmentSummary || dashboardData || [];
  const { summary, recentAlerts, activeRecommendations } = dashboardData;

  // Calculate summary if not provided
  const calculatedSummary = summary || {
    totalAllocated: departmentSummary.reduce((sum, dept) => sum + dept.allocated, 0),
    totalUsed: departmentSummary.reduce((sum, dept) => sum + dept.used, 0),
    totalRemaining: departmentSummary.reduce((sum, dept) => sum + dept.remaining, 0),
    totalBudgets: departmentSummary.length,
    usagePercentage: departmentSummary.length > 0 ? 
      (departmentSummary.reduce((sum, dept) => sum + dept.used, 0) / 
       departmentSummary.reduce((sum, dept) => sum + dept.allocated, 0)) * 100 : 0
  };

  // Person Y: Prepare chart data - Fixed to match actual data structure
  const departmentChartData = departmentSummary.map(dept => ({
    department: dept.department,
    allocated: dept.allocated,
    used: dept.used,
    remaining: dept.remaining,
    usagePercentage: dept.allocated > 0 ? (dept.used / dept.allocated) * 100 : 0,
  }));

  // Person Y: Prepare pie chart data for overall budget distribution
  const budgetDistributionData = departmentSummary.map((dept, index) => ({
    name: dept.department,
    value: dept.allocated,
    color: chartColors[index % chartColors.length],
  }));

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Person Y: Header with refresh button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            📊 Budget Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Typography>
        </Box>
        <Tooltip title="Refresh Dashboard">
          <IconButton onClick={handleRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Person Y: Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Allocated
              </Typography>
              <Typography variant="h5">
                {formatCurrency(calculatedSummary.totalAllocated)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {calculatedSummary.totalBudgets} budget items
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Used
              </Typography>
              <Typography variant="h5" color="primary">
                {formatCurrency(calculatedSummary.totalUsed)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatPercentage(calculatedSummary.usagePercentage)} of budget
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Remaining
              </Typography>
              <Typography variant="h5" color="success.main">
                {formatCurrency(calculatedSummary.totalRemaining)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available to spend
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Overall Status
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                {getStatusIcon(calculatedSummary.usagePercentage)}
                <Chip
                  label={getStatusInfo(calculatedSummary.usagePercentage).text}
                  color={getStatusInfo(calculatedSummary.usagePercentage).color}
                  size="small"
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(calculatedSummary.usagePercentage, 100)}
                color={getStatusColor(calculatedSummary.usagePercentage)}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Person Y: Alert Banner for Critical Issues */}
      {recentAlerts && recentAlerts.length > 0 && (
        <Alert
          severity={recentAlerts.some(alert => alert.severity === 'critical') ? 'error' : 'warning'}
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" href="/alerts">
              View All Alerts
            </Button>
          }
        >
          <Typography variant="body1" fontWeight="bold">
            {recentAlerts.length} Active Alert{recentAlerts.length > 1 ? 's' : ''}
          </Typography>
          {recentAlerts.slice(0, 2).map((alert, index) => (
            <Typography key={index} variant="body2">
              • {alert.message}
            </Typography>
          ))}
        </Alert>
      )}

      {/* Person Y: Charts Section - FIXED BAR CHART */}
      <Grid container spacing={3} mb={4}>
        {/* Department Budget Overview */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Department Budget Overview
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={departmentChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="department" 
                    tick={{ fontSize: 12 }}
                    interval={0}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    tick={{ fontSize: 12 }}
                  />
                  <RechartsTooltip
                    formatter={(value, name) => [formatCurrency(value), name]}
                    labelStyle={{ color: '#000' }}
                    contentStyle={{ backgroundColor: '#f5f5f5', border: '1px solid #ccc' }}
                  />
                  <Legend />
                  <Bar dataKey="allocated" fill="#667eea" name="Allocated" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="used" fill="#764ba2" name="Used" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="remaining" fill="#4facfe" name="Remaining" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Budget Distribution Pie Chart */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Budget Allocation
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={budgetDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {budgetDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Person Y: Department Details - FIXED */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Department Details
              </Typography>
              <Grid container spacing={2}>
                {departmentSummary.map((dept, index) => {
                  const usagePercentage = dept.allocated > 0 ? (dept.used / dept.allocated) * 100 : 0;
                  return (
                    <Grid item xs={12} sm={6} md={4} key={dept.department}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="h6">{dept.department}</Typography>
                            {getStatusIcon(usagePercentage)}
                          </Box>

                          <Box mb={2}>
                            <Typography variant="body2" color="text.secondary">
                              {formatCurrency(dept.used)} of {formatCurrency(dept.allocated)}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(usagePercentage, 100)}
                              color={getStatusColor(usagePercentage)}
                              sx={{ mt: 1, height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="body2" color="text.secondary" mt={0.5}>
                              {formatPercentage(usagePercentage)} used
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Categories: {dept.categories.map(cat => cat.name).join(', ')}
                            </Typography>
                            <Typography variant="body2" color="success.main">
                              Remaining: {formatCurrency(dept.remaining)}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Person Y: Active Recommendations */}
      {activeRecommendations && activeRecommendations.length > 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  💡 AI Recommendations
                </Typography>
                {activeRecommendations.slice(0, 3).map((rec, index) => (
                  <Alert
                    key={index}
                    severity="info"
                    sx={{ mb: 1 }}
                    action={
                      <Button size="small" color="inherit">
                        Review
                      </Button>
                    }
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {rec.title}
                    </Typography>
                    <Typography variant="body2">
                      {rec.description.slice(0, 120)}...
                    </Typography>
                  </Alert>
                ))}
                <Button
                  variant="outlined"
                  size="small"
                  href="/alerts"
                  sx={{ mt: 1 }}
                >
                  View All Recommendations
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Dashboard;