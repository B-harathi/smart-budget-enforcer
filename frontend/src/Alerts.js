/**
 * Complete Alerts Component for Smart Budget Enforcer
 * Person Y Guide: This displays budget breach alerts and AI recommendations
 * Person X: This is where you see all budget warnings and AI suggestions
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Alert,
  Button,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  Container,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Badge,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Lightbulb as LightbulbIcon,
  ExpandMore as ExpandMoreIcon,
  Email as EmailIcon,
  TrendingUp as TrendingUpIcon,
  SwapHoriz as SwapHorizIcon,
  Pause as PauseIcon,
  AssignmentTurnedIn as AssignmentIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

import { 
  getAlerts, 
  getRecommendations, 
  markAlertAsRead, 
  updateRecommendationStatus,
  formatCurrency 
} from './api';

const Alerts = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Person Y: Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Person Y: Load alerts and recommendations
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [alertsResponse, recommendationsResponse] = await Promise.all([
        getAlerts(),
        getRecommendations(),
      ]);

      if (alertsResponse.success) {
        setAlerts(alertsResponse.alerts);
      }

      if (recommendationsResponse.success) {
        setRecommendations(recommendationsResponse.recommendations);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
      setError('Failed to load alerts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Person Y: Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Person Y: Mark alert as read
  const handleMarkAsRead = async (alertId) => {
    try {
      await markAlertAsRead(alertId);
      setAlerts(prev => 
        prev.map(alert => 
          alert._id === alertId ? { ...alert, read: true } : alert
        )
      );
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  // Person Y: Update recommendation status
  const handleRecommendationAction = async (recommendationId, status) => {
    try {
      await updateRecommendationStatus(recommendationId, status);
      setRecommendations(prev =>
        prev.map(rec =>
          rec._id === recommendationId ? { ...rec, status } : rec
        )
      );
    } catch (error) {
      console.error('Error updating recommendation:', error);
    }
  };

  // Person Y: Get alert severity icon and color
  const getAlertSeverityInfo = (severity) => {
    switch (severity) {
      case 'critical':
        return { icon: <ErrorIcon />, color: 'error', bgColor: '#ffebee' };
      case 'high':
        return { icon: <WarningIcon />, color: 'warning', bgColor: '#fff3e0' };
      case 'medium':
        return { icon: <InfoIcon />, color: 'info', bgColor: '#e3f2fd' };
      default:
        return { icon: <CheckCircleIcon />, color: 'success', bgColor: '#e8f5e8' };
    }
  };

  // Person Y: Get recommendation type icon
  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'budget_reallocation':
        return <SwapHorizIcon color="primary" />;
      case 'vendor_alternative':
        return <TrendingUpIcon color="success" />;
      case 'spending_pause':
        return <PauseIcon color="warning" />;
      case 'approval_request':
        return <AssignmentIcon color="info" />;
      default:
        return <LightbulbIcon color="primary" />;
    }
  };

  // Person Y: Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1: return 'error';
      case 2: return 'warning';
      case 3: return 'info';
      default: return 'default';
    }
  };

  // Person Y: Count unread alerts
  const unreadAlertsCount = alerts.filter(alert => !alert.read).length;
  const pendingRecommendationsCount = recommendations.filter(rec => rec.status === 'pending').length;

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
            🚨 Alerts & Recommendations
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Monitor budget breaches and review AI-powered suggestions
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadData}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Person Y: Tabs for Alerts and Recommendations */}
      <Card sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <Tab 
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <WarningIcon />
                Budget Alerts
                {unreadAlertsCount > 0 && (
                  <Badge badgeContent={unreadAlertsCount} color="error" />
                )}
              </Box>
            } 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <LightbulbIcon />
                AI Recommendations
                {pendingRecommendationsCount > 0 && (
                  <Badge badgeContent={pendingRecommendationsCount} color="primary" />
                )}
              </Box>
            } 
          />
        </Tabs>
      </Card>

      {/* Person Y: Budget Alerts Tab */}
      {activeTab === 0 && (
        <Box>
          {alerts.length === 0 ? (
            <Card>
              <CardContent>
                <Box textAlign="center" py={4}>
                  <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" color="success.main" gutterBottom>
                    All Clear! No Active Alerts
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Your budgets are within limits. Keep monitoring for real-time updates.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={2}>
              {alerts.map((alert) => {
                const severityInfo = getAlertSeverityInfo(alert.severity);
                
                return (
                  <Grid item xs={12} key={alert._id}>
                    <Card 
                      sx={{ 
                        backgroundColor: alert.read ? 'background.paper' : severityInfo.bgColor,
                        border: alert.read ? '1px solid' : '2px solid',
                        borderColor: alert.read ? 'divider' : `${severityInfo.color}.main`,
                      }}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Box display="flex" alignItems="center" gap={2}>
                            {severityInfo.icon}
                            <Box>
                              <Typography variant="h6" color={severityInfo.color}>
                                {alert.type.replace('_', ' ').toUpperCase()}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {format(new Date(alert.createdAt), 'MMM dd, yyyy HH:mm')}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip 
                              label={alert.severity.toUpperCase()} 
                              color={severityInfo.color} 
                              size="small" 
                            />
                            {alert.email_sent && (
                              <Chip 
                                icon={<EmailIcon />} 
                                label="Email Sent" 
                                size="small" 
                                variant="outlined" 
                              />
                            )}
                            {!alert.read && (
                              <Button
                                size="small"
                                startIcon={<MarkEmailReadIcon />}
                                onClick={() => handleMarkAsRead(alert._id)}
                              >
                                Mark Read
                              </Button>
                            )}
                          </Box>
                        </Box>

                        <Typography variant="body1" gutterBottom>
                          {alert.message}
                        </Typography>

                        {alert.department && (
                          <Box display="flex" gap={2} mt={2}>
                            <Chip 
                              label={`Department: ${alert.department}`} 
                              size="small" 
                              variant="outlined" 
                            />
                            {alert.category && (
                              <Chip 
                                label={`Category: ${alert.category}`} 
                                size="small" 
                                variant="outlined" 
                              />
                            )}
                          </Box>
                        )}

                        {alert.budget_id && (
                          <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                              💡 This alert triggered automatic AI analysis for budget recommendations.
                            </Typography>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      )}

      {/* Person Y: AI Recommendations Tab */}
      {activeTab === 1 && (
        <Box>
          {recommendations.length === 0 ? (
            <Card>
              <CardContent>
                <Box textAlign="center" py={4}>
                  <LightbulbIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" color="primary" gutterBottom>
                    No Recommendations Available
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    AI recommendations will appear here when budget issues are detected.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={2}>
              {recommendations.map((recommendation) => (
                <Grid item xs={12} key={recommendation._id}>
                  <Card 
                    sx={{
                      border: recommendation.status === 'pending' ? '2px solid' : '1px solid',
                      borderColor: recommendation.status === 'pending' ? 'primary.main' : 'divider',
                    }}
                  >
                    <Accordion defaultExpanded={recommendation.status === 'pending'}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box display="flex" alignItems="center" gap={2} width="100%">
                          {getRecommendationIcon(recommendation.type)}
                          <Box flexGrow={1}>
                            <Typography variant="h6">
                              {recommendation.title}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                              <Chip 
                                label={`Priority ${recommendation.priority}`} 
                                color={getPriorityColor(recommendation.priority)} 
                                size="small" 
                              />
                              <Chip 
                                label={recommendation.type.replace('_', ' ').toUpperCase()} 
                                size="small" 
                                variant="outlined" 
                              />
                              <Chip 
                                label={recommendation.status.toUpperCase()} 
                                color={
                                  recommendation.status === 'accepted' ? 'success' :
                                  recommendation.status === 'rejected' ? 'error' :
                                  recommendation.status === 'implemented' ? 'info' : 'default'
                                }
                                size="small" 
                              />
                            </Box>
                          </Box>
                        </Box>
                      </AccordionSummary>
                      
                      <AccordionDetails>
                        <Divider sx={{ mb: 2 }} />
                        
                        <Typography variant="body1" paragraph>
                          {recommendation.description}
                        </Typography>

                        {recommendation.estimated_savings > 0 && (
                          <Alert severity="success" sx={{ mb: 2 }}>
                            <Typography variant="body2">
                              💰 <strong>Estimated Savings:</strong> {formatCurrency(recommendation.estimated_savings)}
                            </Typography>
                          </Alert>
                        )}

                        <Box display="flex" gap={1} mt={2}>
                          <Typography variant="body2" color="text.secondary">
                            Created: {format(new Date(recommendation.createdAt), 'MMM dd, yyyy HH:mm')}
                          </Typography>
                        </Box>

                        {/* Person Y: Action buttons for pending recommendations */}
                        {recommendation.status === 'pending' && (
                          <Box display="flex" gap={2} mt={3}>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => handleRecommendationAction(recommendation._id, 'accepted')}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              onClick={() => handleRecommendationAction(recommendation._id, 'implemented')}
                            >
                              Mark Implemented
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleRecommendationAction(recommendation._id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </Box>
                        )}

                        {/* Person Y: Implementation guidance */}
                        {recommendation.status === 'accepted' && (
                          <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                              ✅ <strong>Recommendation Accepted</strong><br />
                              Next: Implement the suggested changes and mark as implemented when complete.
                            </Typography>
                          </Alert>
                        )}

                        {recommendation.status === 'implemented' && (
                          <Alert severity="success" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                              🎉 <strong>Recommendation Implemented</strong><br />
                              Great job! Monitor the impact and continue optimizing your budget.
                            </Typography>
                          </Alert>
                        )}

                        {recommendation.status === 'rejected' && (
                          <Alert severity="warning" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                              ❌ <strong>Recommendation Rejected</strong><br />
                              This recommendation won't appear in active suggestions anymore.
                            </Typography>
                          </Alert>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Person Y: Recommendation Summary Stats */}
          {recommendations.length > 0 && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📊 Recommendations Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" p={2} bgcolor="grey.50" borderRadius={2}>
                      <Typography variant="h4" color="primary">
                        {recommendations.filter(r => r.status === 'pending').length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pending Review
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" p={2} bgcolor="green.50" borderRadius={2}>
                      <Typography variant="h4" color="success.main">
                        {recommendations.filter(r => r.status === 'accepted').length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Accepted
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" p={2} bgcolor="blue.50" borderRadius={2}>
                      <Typography variant="h4" color="info.main">
                        {recommendations.filter(r => r.status === 'implemented').length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Implemented
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" p={2} bgcolor="grey.50" borderRadius={2}>
                      <Typography variant="h4" color="success.main">
                        {formatCurrency(
                          recommendations
                            .filter(r => r.status === 'implemented')
                            .reduce((sum, r) => sum + (r.estimated_savings || 0), 0)
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Savings
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Person Y: Recommendation types guide */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💡 Understanding AI Recommendations
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <SwapHorizIcon color="primary" />
                    <Typography variant="subtitle2">Budget Reallocation</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Move funds between departments or categories to optimize spending
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <TrendingUpIcon color="success" />
                    <Typography variant="subtitle2">Vendor Alternative</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Switch to more cost-effective vendors or service providers
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <PauseIcon color="warning" />
                    <Typography variant="subtitle2">Spending Pause</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Temporarily halt non-essential spending in specific categories
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <AssignmentIcon color="info" />
                    <Typography variant="subtitle2">Approval Request</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Request additional budget approval from management
                  </Typography>
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>💡 Pro Tip:</strong> AI recommendations are generated based on your spending patterns, 
                  available budget in other categories, and historical data from your uploaded documents. 
                  Review each suggestion carefully and implement those that align with your business priorities.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Box>
      )}
    </Container>
  );
};

export default Alerts;