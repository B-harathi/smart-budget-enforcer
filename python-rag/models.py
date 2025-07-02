# # """
# # Pydantic Models for Smart Budget Enforcer Python Service
# # Person Y Guide: These define the data structures for API requests/responses
# # Person X: Think of these as templates that ensure data has the right format
# # """

# # from pydantic import BaseModel, Field
# # from typing import List, Optional, Dict, Any
# # from datetime import datetime
# # from enum import Enum

# # class PriorityLevel(str, Enum):
# #     """Budget priority levels"""
# #     LOW = "Low"
# #     MEDIUM = "Medium"
# #     HIGH = "High"
# #     CRITICAL = "Critical"

# # class RecommendationType(str, Enum):
# #     """Types of AI recommendations"""
# #     BUDGET_REALLOCATION = "budget_reallocation"
# #     VENDOR_ALTERNATIVE = "vendor_alternative"
# #     SPENDING_PAUSE = "spending_pause"
# #     APPROVAL_REQUEST = "approval_request"

# # class BudgetData(BaseModel):
# #     """
# #     Person Y: Extracted budget information from documents
# #     This matches the MongoDB budget schema
# #     """
# #     name: str = Field(..., description="Budget item name")
# #     category: str = Field(..., description="Budget category (e.g., Advertising)")
# #     department: str = Field(..., description="Department (e.g., Marketing)")
# #     amount: float = Field(..., gt=0, description="Initial budget amount")
# #     limit_amount: float = Field(..., gt=0, description="Maximum spending limit")
# #     warning_threshold: float = Field(..., gt=0, description="Warning threshold amount")
# #     priority: PriorityLevel = Field(default=PriorityLevel.MEDIUM, description="Budget priority")
# #     vendor: Optional[str] = Field(default="", description="Associated vendor")
# #     email: str = Field(..., description="Notification email address")

# # class ExpenseData(BaseModel):
# #     """Expense information for breach analysis"""
# #     amount: float = Field(..., gt=0)
# #     department: str
# #     category: str
# #     description: str
# #     vendor_name: Optional[str] = ""
# #     date: datetime = Field(default_factory=datetime.now)

# # class DocumentProcessingRequest(BaseModel):
# #     """Request model for document processing"""
# #     user_id: str = Field(..., description="User ID from Node.js backend")

# # class DocumentProcessingResponse(BaseModel):
# #     """Response model for document processing"""
# #     success: bool
# #     message: str
# #     budget_data: List[BudgetData] = []
# #     processing_time: float = 0.0

# # class RecommendationData(BaseModel):
# #     """AI-generated recommendation"""
# #     title: str = Field(..., description="Recommendation title")
# #     description: str = Field(..., description="Detailed recommendation description")
# #     type: RecommendationType = Field(..., description="Type of recommendation")
# #     priority: int = Field(..., ge=1, le=3, description="Priority (1=highest, 3=lowest)")
# #     estimated_savings: float = Field(default=0.0, description="Potential cost savings")

# # class RecommendationRequest(BaseModel):
# #     """Request for generating recommendations"""
# #     budget_data: Dict[str, Any] = Field(..., description="Budget information")
# #     expense_data: Dict[str, Any] = Field(..., description="Triggering expense")
# #     user_id: str = Field(..., description="User ID")

# # class RecommendationResponse(BaseModel):
# #     """Response with AI recommendations"""
# #     success: bool
# #     message: str
# #     recommendations: List[RecommendationData] = []
# #     processing_time: float = 0.0

# # class AgentState(BaseModel):
# #     """
# #     Person Y: LangGraph state that flows between agents
# #     This maintains context as data moves through the AI pipeline
# #     """
# #     # Input data
# #     file_path: Optional[str] = None
# #     file_content: Optional[str] = None
# #     user_id: Optional[str] = None
    
# #     # Budget Policy Loader outputs
# #     extracted_text: Optional[str] = None
# #     structured_budget_data: List[BudgetData] = []
    
# #     # Expense Tracker inputs/outputs
# #     expense_data: Optional[ExpenseData] = None
# #     budget_usage_map: Dict[str, Any] = {}
    
# #     # Breach Detector outputs
# #     breach_detected: bool = False
# #     breach_severity: Optional[str] = None
# #     breach_context: Dict[str, Any] = {}
    
# #     # Correction Recommender outputs
# #     recommendations: List[RecommendationData] = []
    
# #     # Escalation Communicator outputs
# #     notifications_sent: List[str] = []
    
# #     # Processing metadata
# #     processing_steps: List[str] = []
# #     errors: List[str] = []
# #     start_time: datetime = Field(default_factory=datetime.now)

# # class HealthResponse(BaseModel):
# #     """Health check response"""
# #     status: str = "healthy"
# #     service: str = "Smart Budget Enforcer - Python RAG Service"
# #     timestamp: datetime = Field(default_factory=datetime.now)
# #     version: str = "1.0.0"
# #     agents_loaded: bool = False
# #     vector_db_connected: bool = False

# # class ProcessDocumentRequest(BaseModel):
# #     """
# #     Request model for /process-document endpoint (frontend input)
# #     """
# #     user_id: str = Field(..., description="User ID for document processing")
# #     # Note: file upload is handled separately via UploadFile in FastAPI
# #     # This model is for additional request parameters if needed

# # class ProcessDocumentPayload(BaseModel):
# #     """
# #     Payload model for /process-document endpoint (frontend consumption)
# #     """
# #     success: bool
# #     message: str
# #     budget_data: List[BudgetData]
# #     budget_count: int
# #     processing_time: float
# #     processing_steps: List[str] = []


# """
# Pydantic Models for Smart Budget Enforcer Python Service
# UPDATED VERSION - Enhanced compatibility with all agent types
# """

# from pydantic import BaseModel, Field
# from typing import List, Optional, Dict, Any, Union
# from datetime import datetime
# from enum import Enum

# class PriorityLevel(str, Enum):
#     """Budget priority levels"""
#     LOW = "Low"
#     MEDIUM = "Medium"
#     HIGH = "High"
#     CRITICAL = "Critical"

# class RecommendationType(str, Enum):
#     """Types of AI recommendations"""
#     BUDGET_REALLOCATION = "budget_reallocation"
#     VENDOR_ALTERNATIVE = "vendor_alternative"
#     SPENDING_PAUSE = "spending_pause"
#     APPROVAL_REQUEST = "approval_request"
#     PROCESS_OPTIMIZATION = "process_optimization"
#     CONTRACT_RENEGOTIATION = "contract_renegotiation"

# class BudgetData(BaseModel):
#     """
#     Extracted budget information from documents
#     Compatible with both original and enhanced processing
#     """
#     name: str = Field(..., description="Budget item name")
#     category: str = Field(..., description="Budget category (e.g., Advertising)")
#     department: str = Field(..., description="Department (e.g., Marketing)")
#     amount: float = Field(..., gt=0, description="Initial budget amount")
#     limit_amount: float = Field(..., gt=0, description="Maximum spending limit")
#     warning_threshold: float = Field(..., gt=0, description="Warning threshold amount")
#     priority: PriorityLevel = Field(default=PriorityLevel.MEDIUM, description="Budget priority")
#     vendor: Optional[str] = Field(default="", description="Associated vendor")
#     email: str = Field(..., description="Notification email address")
    
#     # Enhanced fields (optional for compatibility)
#     ai_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="AI processing metadata")
#     confidence_score: Optional[float] = Field(default=0.8, description="AI confidence in categorization")
#     risk_factors: Optional[List[str]] = Field(default_factory=list, description="Identified risk factors")

# class ExpenseData(BaseModel):
#     """Expense information for breach analysis"""
#     amount: float = Field(..., gt=0)
#     department: str
#     category: str
#     description: str
#     vendor_name: Optional[str] = ""
#     date: datetime = Field(default_factory=datetime.now)
    
#     # Enhanced fields (optional)
#     ai_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="AI analysis metadata")
#     risk_score: Optional[float] = Field(default=0.0, description="AI-calculated risk score")
#     anomaly_flags: Optional[List[str]] = Field(default_factory=list, description="Detected anomalies")

# class DocumentProcessingRequest(BaseModel):
#     """Request model for document processing"""
#     user_id: str = Field(..., description="User ID from Node.js backend")

# class DocumentProcessingResponse(BaseModel):
#     """Response model for document processing"""
#     success: bool
#     message: str
#     budget_data: List[BudgetData] = []
#     processing_time: float = 0.0
    
#     # Enhanced fields (optional)
#     ai_insights: Optional[Dict[str, Any]] = Field(default_factory=dict, description="AI processing insights")
#     confidence_score: Optional[float] = Field(default=0.8, description="Overall processing confidence")

# class RecommendationData(BaseModel):
#     """AI-generated recommendation with enhanced fields"""
#     title: str = Field(..., description="Recommendation title")
#     description: str = Field(..., description="Detailed recommendation description")
#     type: RecommendationType = Field(..., description="Type of recommendation")
#     priority: int = Field(..., ge=1, le=3, description="Priority (1=highest, 3=lowest)")
#     estimated_savings: float = Field(default=0.0, description="Potential cost savings")
    
#     # Enhanced fields (optional for compatibility)
#     implementation_timeline: Optional[str] = Field(default="", description="Expected implementation time")
#     implementation_steps: Optional[List[str]] = Field(default_factory=list, description="Step-by-step implementation")
#     success_metrics: Optional[List[str]] = Field(default_factory=list, description="How to measure success")
#     risk_factors: Optional[List[str]] = Field(default_factory=list, description="Implementation risks")
#     responsible_party: Optional[str] = Field(default="", description="Who should implement")
#     follow_up_required: Optional[bool] = Field(default=False, description="Whether follow-up is needed")
#     related_categories: Optional[List[str]] = Field(default_factory=list, description="Related budget categories")
#     confidence_score: Optional[float] = Field(default=0.8, description="AI confidence in recommendation")
#     roi_estimate: Optional[Dict[str, Any]] = Field(default_factory=dict, description="ROI calculations")

# class RecommendationRequest(BaseModel):
#     """Request for generating recommendations"""
#     budget_data: Dict[str, Any] = Field(..., description="Budget information")
#     expense_data: Dict[str, Any] = Field(..., description="Triggering expense")
#     user_id: str = Field(..., description="User ID")

# class RecommendationResponse(BaseModel):
#     """Response with AI recommendations"""
#     success: bool
#     message: str
#     recommendations: List[RecommendationData] = []
#     processing_time: float = 0.0
    
#     # Enhanced fields (optional)
#     pattern_analysis: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Spending pattern analysis")
#     risk_assessment: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Risk assessment results")

# class AgentState(BaseModel):
#     """
#     Enhanced LangGraph state that flows between agents
#     Compatible with both original and enhanced agents
#     """
#     # Core input data
#     file_path: Optional[str] = None
#     file_content: Optional[str] = None
#     user_id: Optional[str] = None
    
#     # Budget Policy Loader outputs
#     extracted_text: Optional[str] = None
#     structured_budget_data: List[BudgetData] = []
    
#     # Expense Tracker inputs/outputs
#     expense_data: Optional[ExpenseData] = None
#     budget_usage_map: Dict[str, Any] = {}
    
#     # Enhanced expense tracking fields (optional)
#     expense_tracking_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Enhanced tracking data")
#     categorized_expenses: Optional[Dict[str, List]] = Field(default_factory=dict, description="Categorized expense data")
#     spending_insights: Optional[List[str]] = Field(default_factory=list, description="AI-generated insights")
#     anomalies: Optional[List[Dict]] = Field(default_factory=list, description="Detected anomalies")
#     trends: Optional[List[Dict]] = Field(default_factory=list, description="Spending trends")
    
#     # Breach Detector outputs (original)
#     breach_detected: bool = False
#     breach_severity: Optional[str] = None
#     breach_context: Dict[str, Any] = {}
    
#     # Enhanced breach detection fields (optional)
#     immediate_breaches: Optional[List[Dict]] = Field(default_factory=list, description="Immediate breach alerts")
#     threshold_warnings: Optional[List[Dict]] = Field(default_factory=list, description="Threshold warnings")
#     risk_scores: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Risk assessment scores")
#     recommended_actions: Optional[List[Dict]] = Field(default_factory=list, description="Recommended immediate actions")
    
#     # Correction Recommender outputs (original)
#     recommendations: List[RecommendationData] = []
    
#     # Enhanced recommendation fields (optional)
#     pattern_analysis: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Spending pattern analysis")
#     analysis_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Analysis metadata")
    
#     # Escalation Communicator outputs (original)
#     notifications_sent: List[str] = []
    
#     # Enhanced notification fields (optional)
#     notifications_failed: Optional[List[str]] = Field(default_factory=list, description="Failed notifications")
#     escalation_plan: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Escalation plan")
#     total_notifications_sent: Optional[int] = Field(default=0, description="Total notifications sent")
    
#     # Processing metadata
#     processing_steps: List[str] = []
#     errors: List[str] = []
#     start_time: datetime = Field(default_factory=datetime.now)

# class HealthResponse(BaseModel):
#     """Health check response"""
#     status: str = "healthy"
#     service: str = "Smart Budget Enforcer - Enhanced Python Service"
#     timestamp: datetime = Field(default_factory=datetime.now)
#     version: str = "3.1.0"
#     agents_loaded: bool = False
#     vector_db_connected: bool = False
    
#     # Enhanced fields (optional)
#     enhanced_features: Optional[List[str]] = Field(default_factory=list, description="Available enhanced features")
#     ai_model: Optional[str] = Field(default="gemini-1.5-flash", description="AI model in use")

# class ProcessDocumentRequest(BaseModel):
#     """
#     Request model for /process-document endpoint
#     """
#     user_id: str = Field(..., description="User ID for document processing")

# class ProcessDocumentPayload(BaseModel):
#     """
#     Payload model for /process-document endpoint
#     Enhanced with AI insights
#     """
#     success: bool
#     message: str
#     budget_data: List[BudgetData]
#     budget_count: int
#     processing_time: float
#     processing_steps: List[str] = []
    
#     # Enhanced fields (optional)
#     ai_insights: Optional[Dict[str, Any]] = Field(default_factory=dict, description="AI processing insights")
#     confidence_score: Optional[float] = Field(default=0.8, description="Processing confidence")
#     warnings: Optional[List[str]] = Field(default_factory=list, description="Processing warnings")

# # Enhanced models for new endpoints

# class PatternAnalysisRequest(BaseModel):
#     """Request for pattern analysis"""
#     user_id: str = Field(..., description="User ID")
#     time_period: Optional[str] = Field(default="3_months", description="Analysis time period")
#     categories: Optional[List[str]] = Field(default_factory=list, description="Specific categories to analyze")
#     departments: Optional[List[str]] = Field(default_factory=list, description="Specific departments to analyze")

# class PatternAnalysisResponse(BaseModel):
#     """Response with pattern analysis"""
#     success: bool
#     message: str
#     pattern_analysis: Dict[str, Any] = {}
#     processing_time: float = 0.0
#     confidence_score: float = 0.8

# class EnhancedRecommendationRequest(BaseModel):
#     """Enhanced request for AI recommendations"""
#     user_context: Dict[str, Any] = Field(..., description="User context information")
#     budget_portfolio: List[Dict[str, Any]] = Field(..., description="Complete budget portfolio")
#     spending_patterns: Dict[str, Any] = Field(..., description="Spending pattern data")
#     request_type: str = Field(default="comprehensive_analysis", description="Type of analysis requested")

# class RiskAssessmentResponse(BaseModel):
#     """Risk assessment response"""
#     success: bool
#     risk_scores: Dict[str, float] = {}
#     impact_assessment: Dict[str, Any] = {}
#     mitigation_recommendations: List[str] = []
#     confidence_level: float = 0.8

# # Utility classes for enhanced functionality

# class AIMetadata(BaseModel):
#     """AI processing metadata"""
#     confidence_score: float = Field(ge=0.0, le=1.0, description="AI confidence score")
#     processing_method: str = Field(description="AI processing method used")
#     model_version: str = Field(default="gemini-1.5-flash", description="AI model version")
#     timestamp: datetime = Field(default_factory=datetime.now)
#     data_quality_score: Optional[float] = Field(default=None, description="Input data quality assessment")

# class BreachAlert(BaseModel):
#     """Enhanced breach alert information"""
#     department: str
#     category: str
#     breach_type: str
#     severity_level: str
#     current_usage_percentage: float
#     overage_amount: Optional[float] = None
#     immediate_actions_required: List[str] = []
#     financial_impact_score: Optional[float] = None
#     operational_risk_score: Optional[float] = None

# class NotificationResult(BaseModel):
#     """Notification sending result"""
#     notification_type: str
#     recipient: str
#     status: str  # sent, failed, logged
#     message_id: Optional[str] = None
#     timestamp: datetime = Field(default_factory=datetime.now)
#     error_details: Optional[str] = None



"""
Corrected Models for Smart Budget Enforcer
Fixed to match Node.js payload structure and prevent 422 errors
"""

from pydantic import BaseModel, Field, validator
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, date
from enum import Enum

class PriorityLevel(str, Enum):
    """Priority levels for budget items"""
    LOW = "Low"
    MEDIUM = "Medium" 
    HIGH = "High"
    CRITICAL = "Critical"

class RecommendationType(str, Enum):
    """Types of AI recommendations"""
    BUDGET_REALLOCATION = "budget_reallocation"
    VENDOR_ALTERNATIVE = "vendor_alternative"
    SPENDING_PAUSE = "spending_pause"
    APPROVAL_REQUEST = "approval_request"
    PROCESS_OPTIMIZATION = "process_optimization"
    CONTRACT_RENEGOTIATION = "contract_renegotiation"

class BudgetData(BaseModel):
    """CORRECTED: Budget data model matching Node.js structure"""
    name: str = Field(..., description="Budget item name")
    category: str = Field(..., description="Budget category")
    department: str = Field(..., description="Department name")
    amount: float = Field(..., ge=0, description="Budget amount")
    limit_amount: float = Field(..., ge=0, description="Budget limit")
    warning_threshold: float = Field(default=0, ge=0, description="Warning threshold amount")
    priority: Union[PriorityLevel, str] = Field(default=PriorityLevel.MEDIUM, description="Priority level")
    vendor: str = Field(default="", description="Vendor information")
    email: str = Field(default="gbharathitrs@gmail.com", description="Notification email")
    
    @validator('warning_threshold', always=True)
    def set_warning_threshold(cls, v, values):
        if v == 0 and 'limit_amount' in values:
            return values['limit_amount'] * 0.8
        return v
    
    @validator('priority', pre=True)
    def validate_priority(cls, v):
        if isinstance(v, str):
            # Handle string priority values from various sources
            v = v.strip().title()
            priority_map = {
                'Low': PriorityLevel.LOW,
                'Medium': PriorityLevel.MEDIUM,
                'High': PriorityLevel.HIGH,
                'Critical': PriorityLevel.CRITICAL,
                '1': PriorityLevel.CRITICAL,
                '2': PriorityLevel.HIGH,
                '3': PriorityLevel.MEDIUM,
                '4': PriorityLevel.LOW
            }
            return priority_map.get(v, PriorityLevel.MEDIUM)
        return v

class ExpenseData(BaseModel):
    """CORRECTED: Expense data model matching Node.js structure"""
    amount: float = Field(..., gt=0, description="Expense amount")
    department: str = Field(..., description="Department name")
    category: str = Field(..., description="Expense category")
    description: str = Field(..., description="Expense description")
    vendor_name: str = Field(default="", description="Vendor name")
    budget_id: Optional[str] = Field(default=None, description="Associated budget ID")
    user_id: Optional[str] = Field(default=None, description="User ID")
    date: Optional[str] = Field(default=None, description="Expense date")
    
    @validator('date', always=True)
    def set_date(cls, v):
        if v is None:
            return datetime.now().isoformat()
        return v

class RecommendationData(BaseModel):
    """CORRECTED: Recommendation data model"""
    title: str = Field(..., description="Recommendation title")
    description: str = Field(..., description="Detailed description")
    type: RecommendationType = Field(..., description="Recommendation type")
    priority: int = Field(default=2, ge=1, le=5, description="Priority level (1=highest)")
    estimated_savings: float = Field(default=0, ge=0, description="Estimated savings amount")
    implementation_timeline: Optional[str] = Field(default="1-2 weeks", description="Implementation timeline")
    implementation_steps: Optional[List[str]] = Field(default=[], description="Implementation steps")
    success_metrics: Optional[List[str]] = Field(default=[], description="Success metrics")
    risk_factors: Optional[List[str]] = Field(default=[], description="Risk factors")
    confidence_score: Optional[float] = Field(default=0.8, ge=0, le=1, description="AI confidence score")

class AgentState(BaseModel):
    """CORRECTED: Agent state for workflow management"""
    # Core identification
    user_id: str = Field(..., description="User identifier")
    file_path: Optional[str] = Field(default=None, description="Uploaded file path")
    
    # Processing data
    structured_budget_data: List[BudgetData] = Field(default=[], description="Structured budget data")
    expense_data: Optional[ExpenseData] = Field(default=None, description="Current expense data")
    extracted_text: str = Field(default="", description="Extracted document text")
    
    # Analysis results
    budget_usage_map: Dict[str, Any] = Field(default={}, description="Budget usage mapping")
    breach_detected: bool = Field(default=False, description="Whether breach was detected")
    breach_context: Dict[str, Any] = Field(default={}, description="Breach context information")
    breach_severity: Optional[str] = Field(default=None, description="Breach severity level")
    
    # Enhanced analysis data
    immediate_breaches: List[Dict[str, Any]] = Field(default=[], description="Immediate breach alerts")
    threshold_warnings: List[Dict[str, Any]] = Field(default=[], description="Threshold warnings")
    risk_scores: Dict[str, float] = Field(default={}, description="Risk assessment scores")
    recommended_actions: List[str] = Field(default=[], description="Recommended actions")
    
    # Pattern analysis
    pattern_analysis: Optional[Dict[str, Any]] = Field(default=None, description="Pattern analysis results")
    expense_tracking_metadata: Optional[Dict[str, Any]] = Field(default=None, description="Expense tracking metadata")
    
    # Recommendations and notifications
    recommendations: List[RecommendationData] = Field(default=[], description="Generated recommendations")
    notifications_sent: List[str] = Field(default=[], description="Sent notifications")
    notifications_failed: List[str] = Field(default=[], description="Failed notifications")
    
    # Escalation management
    escalation_plan: Optional[Dict[str, Any]] = Field(default=None, description="Escalation plan")
    total_notifications_sent: int = Field(default=0, description="Total notifications sent")
    
    # Processing metadata
    processing_steps: List[str] = Field(default=[], description="Processing steps completed")
    errors: List[str] = Field(default=[], description="Processing errors")
    start_time: datetime = Field(default_factory=datetime.now, description="Processing start time")
    analysis_metadata: Optional[Dict[str, Any]] = Field(default=None, description="Analysis metadata")
    
    class Config:
        """Pydantic configuration"""
        arbitrary_types_allowed = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# CORRECTED: Request models for API endpoints
class ProcessDocumentRequest(BaseModel):
    """Document processing request"""
    user_id: str = Field(..., description="User identifier")
    file_type: Optional[str] = Field(default=None, description="File type hint")

class RecommendationRequest(BaseModel):
    """CORRECTED: Recommendation request matching Node.js payload structure"""
    budget_data: Dict[str, Any] = Field(..., description="Budget data from Node.js")
    expense_data: Dict[str, Any] = Field(..., description="Expense data from Node.js")
    breach_context: Optional[Dict[str, Any]] = Field(default={}, description="Breach context")
    user_id: str = Field(..., description="User identifier")
    request_type: Optional[str] = Field(default="threshold_breach", description="Request type")

class PatternAnalysisRequest(BaseModel):
    """Pattern analysis request"""
    expenses: List[Dict[str, Any]] = Field(..., description="Historical expense data")
    budgets: List[Dict[str, Any]] = Field(..., description="Budget data")
    timeframe_days: int = Field(default=90, description="Analysis timeframe in days")
    user_id: str = Field(..., description="User identifier")

class HealthResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="Service status")
    service: str = Field(..., description="Service name")
    agents_loaded: bool = Field(..., description="Whether agents are loaded")
    vector_db_connected: bool = Field(..., description="Vector DB connection status")
    version: str = Field(..., description="Service version")

class ProcessDocumentPayload(BaseModel):
    """Document processing response payload"""
    success: bool = Field(..., description="Processing success status")
    budget_count: int = Field(..., description="Number of budget items extracted")
    budget_data: List[Dict[str, Any]] = Field(..., description="Extracted budget data")
    processing_time: Optional[float] = Field(default=None, description="Processing time in seconds")
    processing_steps: Optional[List[str]] = Field(default=[], description="Processing steps")
    message: Optional[str] = Field(default=None, description="Success message")
    ai_insights: Optional[Dict[str, Any]] = Field(default={}, description="AI processing insights")

# CORRECTED: Response models
class RecommendationResponse(BaseModel):
    """Recommendation generation response"""
    success: bool = Field(..., description="Generation success status")
    message: str = Field(..., description="Response message")
    recommendations: List[Dict[str, Any]] = Field(..., description="Generated recommendations")
    processing_time: float = Field(..., description="Processing time in seconds")
    analysis_context: Dict[str, Any] = Field(..., description="Analysis context")
    processing_info: Dict[str, Any] = Field(..., description="Processing information")

class PatternAnalysisResponse(BaseModel):
    """Pattern analysis response"""
    success: bool = Field(..., description="Analysis success status")
    patterns: Dict[str, Any] = Field(..., description="Detected patterns")
    confidence_score: float = Field(..., description="Analysis confidence score")
    processing_time: float = Field(..., description="Processing time in seconds")

# CORRECTED: Internal workflow models
class BudgetThresholdMap(BaseModel):
    """Budget threshold mapping for departments/vendors/categories"""
    department: str = Field(..., description="Department name")
    category: str = Field(..., description="Budget category")
    vendor: Optional[str] = Field(default="", description="Vendor name")
    limit_amount: float = Field(..., ge=0, description="Budget limit")
    warning_threshold: float = Field(..., ge=0, description="Warning threshold")
    responsible_owner: str = Field(..., description="Responsible owner email")
    timeline: Optional[str] = Field(default="monthly", description="Budget timeline")
    constraints: List[str] = Field(default=[], description="Budget constraints")

class DocumentExtractionResult(BaseModel):
    """Document extraction result"""
    raw_text: str = Field(..., description="Extracted raw text")
    structured_data: List[Dict[str, Any]] = Field(default=[], description="Structured data extracted")
    tables: List[Dict[str, Any]] = Field(default=[], description="Extracted tables")
    metadata: Dict[str, Any] = Field(default={}, description="Extraction metadata")
    confidence_score: float = Field(default=0.8, description="Extraction confidence")

class AIAnalysisResult(BaseModel):
    """AI analysis result"""
    analysis_type: str = Field(..., description="Type of analysis performed")
    results: Dict[str, Any] = Field(..., description="Analysis results")
    confidence_score: float = Field(..., description="Analysis confidence")
    processing_time: float = Field(..., description="Processing time")
    model_used: str = Field(..., description="AI model used")
    recommendations: List[Dict[str, Any]] = Field(default=[], description="Generated recommendations")

class WorkflowState(BaseModel):
    """Workflow state tracking"""
    workflow_id: str = Field(..., description="Workflow identifier")
    current_step: str = Field(..., description="Current processing step")
    completed_steps: List[str] = Field(default=[], description="Completed steps")
    pending_steps: List[str] = Field(default=[], description="Pending steps")
    errors: List[str] = Field(default=[], description="Processing errors")
    metadata: Dict[str, Any] = Field(default={}, description="Workflow metadata")
    start_time: datetime = Field(default_factory=datetime.now, description="Workflow start time")
    last_updated: datetime = Field(default_factory=datetime.now, description="Last update time")

# CORRECTED: Validation helpers
def validate_budget_data(data: Dict[str, Any]) -> BudgetData:
    """Validate and convert budget data dictionary to BudgetData model"""
    try:
        # Handle different field names from various sources
        normalized_data = {}
        
        # Map common field variations
        field_mappings = {
            'name': ['name', 'budget_name', 'item_name', 'title'],
            'category': ['category', 'type', 'budget_type', 'class'],
            'department': ['department', 'dept', 'division', 'team'],
            'amount': ['amount', 'budget_amount', 'allocation'],
            'limit_amount': ['limit_amount', 'limit', 'max_amount', 'budget_limit'],
            'warning_threshold': ['warning_threshold', 'threshold', 'warning_limit'],
            'priority': ['priority', 'importance', 'level'],
            'vendor': ['vendor', 'supplier', 'provider'],
            'email': ['email', 'notification_email', 'contact_email']
        }
        
        for target_field, possible_names in field_mappings.items():
            for name in possible_names:
                if name in data and data[name] is not None:
                    normalized_data[target_field] = data[name]
                    break
        
        # Set defaults for required fields
        normalized_data.setdefault('name', 'Budget Item')
        normalized_data.setdefault('category', 'General')
        normalized_data.setdefault('department', 'General')
        normalized_data.setdefault('amount', 0)
        normalized_data.setdefault('limit_amount', normalized_data.get('amount', 0))
        normalized_data.setdefault('priority', 'Medium')
        normalized_data.setdefault('vendor', '')
        normalized_data.setdefault('email', 'gbharathitrs@gmail.com')
        
        return BudgetData(**normalized_data)
        
    except Exception as e:
        raise ValueError(f"Invalid budget data: {e}")

def validate_expense_data(data: Dict[str, Any]) -> ExpenseData:
    """Validate and convert expense data dictionary to ExpenseData model"""
    try:
        # Handle different field names from various sources
        normalized_data = {}
        
        field_mappings = {
            'amount': ['amount', 'expense_amount', 'cost'],
            'department': ['department', 'dept', 'division'],
            'category': ['category', 'type', 'expense_type'],
            'description': ['description', 'desc', 'details', 'note'],
            'vendor_name': ['vendor_name', 'vendor', 'supplier', 'provider'],
            'budget_id': ['budget_id', 'budgetId', 'budget'],
            'user_id': ['user_id', 'userId', 'user'],
            'date': ['date', 'expense_date', 'transaction_date', 'createdAt']
        }
        
        for target_field, possible_names in field_mappings.items():
            for name in possible_names:
                if name in data and data[name] is not None:
                    normalized_data[target_field] = data[name]
                    break
        
        # Set defaults for required fields
        normalized_data.setdefault('amount', 0)
        normalized_data.setdefault('department', 'General')
        normalized_data.setdefault('category', 'Other')
        normalized_data.setdefault('description', 'Expense')
        normalized_data.setdefault('vendor_name', '')
        
        return ExpenseData(**normalized_data)
        
    except Exception as e:
        raise ValueError(f"Invalid expense data: {e}")

# CORRECTED: Error response models
class ErrorResponse(BaseModel):
    """Standard error response"""
    success: bool = Field(default=False, description="Success status")
    error: str = Field(..., description="Error message")
    error_type: str = Field(..., description="Error type")
    detail: Optional[str] = Field(default=None, description="Detailed error information")
    timestamp: datetime = Field(default_factory=datetime.now, description="Error timestamp")

class ValidationError(BaseModel):
    """Validation error response"""
    success: bool = Field(default=False, description="Success status")
    message: str = Field(..., description="Validation error message")
    field_errors: Dict[str, List[str]] = Field(default={}, description="Field-specific errors")
    expected_format: Dict[str, Any] = Field(default={}, description="Expected data format")# CORRECTED: Export all models for easy importing
__all__ = [
    'PriorityLevel',
    'BudgetData',
    'ExpenseData', 
    'RecommendationData',
    'AgentState',
    'ProcessDocumentRequest',
    'RecommendationRequest',
    'PatternAnalysisRequest',
    'HealthResponse',
    'ProcessDocumentPayload',
    'RecommendationResponse',
    'PatternAnalysisResponse',
    'BudgetThresholdMap',
    'DocumentExtractionResult',
    'AIAnalysisResult',
    'WorkflowState',
    'ErrorResponse',
    'ValidationError',
    'validate_budget_data',
    'validate_expense_data'
]

