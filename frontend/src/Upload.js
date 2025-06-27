 
/**
 * Upload Component for Smart Budget Enforcer
 * Person Y Guide: This handles budget document upload and AI processing
 * Person X: This is where you upload your budget files for AI analysis
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Container,
  Paper,
  Grid,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  SmartToy as SmartToyIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

import { uploadBudgetDocument } from './api';

const Upload = () => {
  const [uploadState, setUploadState] = useState({
    file: null,
    uploading: false,
    progress: 0,
    result: null,
    error: null,
    step: 0, // 0: Select, 1: Processing, 2: Complete
  });

  // Person Y: Handle file drop/selection
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      setUploadState(prev => ({
        ...prev,
        error: `File rejected: ${rejection.errors[0]?.message || 'Invalid file type'}`,
        file: null,
      }));
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadState(prev => ({
        ...prev,
        file,
        error: null,
        result: null,
        step: 0,
      }));
    }
  }, []);

  // Person Y: Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  // Person Y: Handle file upload
  const handleUpload = async () => {
    if (!uploadState.file) return;

    setUploadState(prev => ({
      ...prev,
      uploading: true,
      progress: 0,
      error: null,
      step: 1,
    }));

    try {
      const result = await uploadBudgetDocument(
        uploadState.file,
        (progress) => {
          setUploadState(prev => ({ ...prev, progress }));
        }
      );

      setUploadState(prev => ({
        ...prev,
        uploading: false,
        result,
        step: 2,
        progress: 100,
      }));

    } catch (error) {
      console.error('Upload error:', error);
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        error: error.response?.data?.message || 'Upload failed. Please try again.',
        progress: 0,
        step: 0,
      }));
    }
  };

  // Person Y: Reset upload state
  const handleReset = () => {
    setUploadState({
      file: null,
      uploading: false,
      progress: 0,
      result: null,
      error: null,
      step: 0,
    });
  };

  // Person Y: Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Person Y: Get file type icon
  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return <DescriptionIcon color="primary" />;
  };

  const steps = [
    'Select Budget Document',
    'AI Processing',
    'Review Results',
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        📄 Upload Budget Document
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={4}>
        Upload your budget document and let AI extract the budget rules automatically
      </Typography>

      <Grid container spacing={4}>
        {/* Person Y: Upload Process Stepper */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload Process
              </Typography>
              <Stepper activeStep={uploadState.step} orientation="vertical">
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary">
                        {index === 0 && "Choose PDF, Excel, or Word document"}
                        {index === 1 && "AI extracts budget rules using RAG"}
                        {index === 2 && "View extracted budget items"}
                      </Typography>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>

          {/* Person Y: AI Features Info */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                🤖 AI Features
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <SmartToyIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Auto-Detection"
                    secondary="Detects tables and paragraphs"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SmartToyIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Smart Extraction"
                    secondary="Finds departments, categories, limits"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SmartToyIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="RAG Storage"
                    secondary="Stores for future recommendations"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Person Y: Main Upload Area */}
        <Grid item xs={12} md={8}>
          {uploadState.step === 0 && (
            <Card>
              <CardContent>
                {/* Person Y: File dropzone */}
                <Paper
                  {...getRootProps()}
                  sx={{
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : 'grey.300',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <input {...getInputProps()} />
                  <CloudUploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                  
                  {isDragActive ? (
                    <Typography variant="h6" color="primary">
                      Drop your budget document here
                    </Typography>
                  ) : (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Drop your budget document here
                      </Typography>
                      <Typography variant="body1" color="text.secondary" mb={2}>
                        or click to browse files
                      </Typography>
                      <Button variant="outlined" component="span">
                        Choose File
                      </Button>
                    </>
                  )}
                  
                  <Typography variant="body2" color="text.secondary" mt={2}>
                    Supported formats: PDF, Excel (.xlsx, .xls), Word (.docx, .doc)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Maximum file size: 10MB
                  </Typography>
                </Paper>

                {/* Person Y: Selected file display */}
                {uploadState.file && (
                  <Card variant="outlined" sx={{ mt: 3 }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={2}>
                        {getFileIcon(uploadState.file.name)}
                        <Box flexGrow={1}>
                          <Typography variant="body1" fontWeight="bold">
                            {uploadState.file.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatFileSize(uploadState.file.size)}
                          </Typography>
                        </Box>
                        <Chip label="Ready" color="success" size="small" />
                      </Box>
                      
                      <Box mt={2} display="flex" gap={2}>
                        <Button
                          variant="contained"
                          onClick={handleUpload}
                          disabled={uploadState.uploading}
                          startIcon={<SmartToyIcon />}
                        >
                          Process with AI
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={handleReset}
                          disabled={uploadState.uploading}
                        >
                          Clear
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {/* Person Y: Error display */}
                {uploadState.error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {uploadState.error}
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Person Y: Processing state */}
          {uploadState.step === 1 && (
            <Card>
              <CardContent>
                <Box textAlign="center" py={4}>
                  <SmartToyIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    🧠 AI Processing Your Document
                  </Typography>
                  <Typography variant="body1" color="text.secondary" mb={3}>
                    Our AI is reading your budget document and extracting all the important rules and limits...
                  </Typography>
                  
                  <Box sx={{ width: '100%', mb: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={uploadState.progress}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Typography variant="body2" color="primary" fontWeight="bold">
                    {uploadState.progress}% Complete
                  </Typography>
                  
                  <Box mt={3} p={2} bgcolor="grey.50" borderRadius={2}>
                    <Typography variant="body2" mb={1}>
                      Processing steps:
                    </Typography>
                    <Typography variant="body2">✅ Document uploaded successfully</Typography>
                    <Typography variant="body2">✅ File format validated</Typography>
                    <Typography variant="body2">🔄 Extracting budget rules with Gemini AI...</Typography>
                    <Typography variant="body2" color="text.secondary">⏳ Storing in vector database...</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Person Y: Results display */}
          {uploadState.step === 2 && uploadState.result && (
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" color="success.main">
                      ✅ Document Processed Successfully!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Found {uploadState.result.budget_count} budget items in {uploadState.result.processing_time?.toFixed(1)}s
                    </Typography>
                  </Box>
                </Box>

                {/* Person Y: Extracted budget items */}
                <Typography variant="h6" gutterBottom>
                  📊 Extracted Budget Items
                </Typography>
                
                <List>
                  {uploadState.result.budget_data?.map((budget, index) => (
                    <ListItem key={index} divider>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body1" fontWeight="bold">
                              {budget.name}
                            </Typography>
                            <Chip 
                              label={budget.priority} 
                              size="small" 
                              color={budget.priority === 'High' ? 'error' : budget.priority === 'Medium' ? 'warning' : 'default'}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              <strong>Department:</strong> {budget.department} | 
                              <strong> Category:</strong> {budget.category}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Budget Limit:</strong> ${budget.limit_amount?.toLocaleString()} | 
                              <strong> Warning at:</strong> ${budget.warning_threshold?.toLocaleString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Email:</strong> {budget.email}
                              {budget.vendor && <> | <strong>Vendor:</strong> {budget.vendor}</>}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>

                {/* Person Y: Action buttons */}
                <Box mt={3} display="flex" gap={2}>
                  <Button
                    variant="contained"
                    startIcon={<DashboardIcon />}
                    href="/dashboard"
                  >
                    View Dashboard
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleReset}
                  >
                    Upload Another
                  </Button>
                </Box>

                {/* Person Y: Next steps info */}
                <Alert severity="info" sx={{ mt: 3 }}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    🎯 Next Steps:
                  </Typography>
                  <Typography variant="body2">
                    • Your budget data is now ready for monitoring
                  </Typography>
                  <Typography variant="body2">
                    • Add expenses to start tracking usage
                  </Typography>
                  <Typography variant="body2">
                    • Receive automatic email alerts when thresholds are reached
                  </Typography>
                  <Typography variant="body2">
                    • Get AI recommendations for budget optimization
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Person Y: Help section */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📚 Document Format Guidelines
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                Excel Format
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use columns: Department, Category, Monthly_Limit, Warning_Threshold, Priority, Vendor, Email
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                PDF/Word Format
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Include keywords: "budget", "limit", "department", "category", "email" with corresponding values
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                Sample Entry
              </Typography>
              <Typography variant="body2" color="text.secondary">
                "Marketing Department advertising budget limit $10,000 monthly, warning at $8,000, contact marketing@company.com"
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Upload;