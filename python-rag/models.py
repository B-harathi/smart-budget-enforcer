"""
Pydantic Models for Smart Budget Enforcer Python Service
Person Y Guide: These define the data structures for API requests/responses
Person X: Think of these as templates that ensure data has the right format
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class PriorityLevel(str, Enum):
    """Budget priority levels"""
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

class BudgetData(BaseModel):
    """
    Person Y: Extracted budget information from documents
    This matches the MongoDB budget schema
    """
    name: str = Field(..., description="Budget item name")
    category: str = Field(..., description="Budget category (e.g., Advertising)")
    department: str = Field(..., description="Department (e.g., Marketing)")
    amount: float = Field(..., gt=0, description="Initial budget amount")
    limit_amount: float = Field(..., gt=0, description="Maximum spending limit")
    warning_threshold: float = Field(..., gt=0, description="Warning threshold amount")
    priority: PriorityLevel = Field(default=PriorityLevel.MEDIUM, description="Budget priority")
    vendor: Optional[str] = Field(default="", description="Associated vendor")
    email: str = Field(..., description="Notification email address")

class ExpenseData(BaseModel):
    """Expense information for breach analysis"""
    amount: float = Field(..., gt=0)
    department: str
    category: str
    description: str
    vendor_name: Optional[str] = ""
    date: datetime = Field(default_factory=datetime.now)

class DocumentProcessingRequest(BaseModel):
    """Request model for document processing"""
    user_id: str = Field(..., description="User ID from Node.js backend")

class DocumentProcessingResponse(BaseModel):
    """Response model for document processing"""
    success: bool
    message: str
    budget_data: List[BudgetData] = []
    processing_time: float = 0.0

class RecommendationData(BaseModel):
    """AI-generated recommendation"""
    title: str = Field(..., description="Recommendation title")
    description: str = Field(..., description="Detailed recommendation description")
    type: RecommendationType = Field(..., description="Type of recommendation")
    priority: int = Field(..., ge=1, le=3, description="Priority (1=highest, 3=lowest)")
    estimated_savings: float = Field(default=0.0, description="Potential cost savings")

class RecommendationRequest(BaseModel):
    """Request for generating recommendations"""
    budget_data: Dict[str, Any] = Field(..., description="Budget information")
    expense_data: Dict[str, Any] = Field(..., description="Triggering expense")
    user_id: str = Field(..., description="User ID")

class RecommendationResponse(BaseModel):
    """Response with AI recommendations"""
    success: bool
    message: str
    recommendations: List[RecommendationData] = []
    processing_time: float = 0.0

class AgentState(BaseModel):
    """
    Person Y: LangGraph state that flows between agents
    This maintains context as data moves through the AI pipeline
    """
    # Input data
    file_path: Optional[str] = None
    file_content: Optional[str] = None
    user_id: Optional[str] = None
    
    # Budget Policy Loader outputs
    extracted_text: Optional[str] = None
    structured_budget_data: List[BudgetData] = []
    
    # Expense Tracker inputs/outputs
    expense_data: Optional[ExpenseData] = None
    budget_usage_map: Dict[str, Any] = {}
    
    # Breach Detector outputs
    breach_detected: bool = False
    breach_severity: Optional[str] = None
    breach_context: Dict[str, Any] = {}
    
    # Correction Recommender outputs
    recommendations: List[RecommendationData] = []
    
    # Escalation Communicator outputs
    notifications_sent: List[str] = []
    
    # Processing metadata
    processing_steps: List[str] = []
    errors: List[str] = []
    start_time: datetime = Field(default_factory=datetime.now)

class HealthResponse(BaseModel):
    """Health check response"""
    status: str = "healthy"
    service: str = "Smart Budget Enforcer - Python RAG Service"
    timestamp: datetime = Field(default_factory=datetime.now)
    version: str = "1.0.0"
    agents_loaded: bool = False
    vector_db_connected: bool = False

class ProcessDocumentRequest(BaseModel):
    """
    Request model for /process-document endpoint (frontend input)
    """
    user_id: str = Field(..., description="User ID for document processing")
    # Note: file upload is handled separately via UploadFile in FastAPI
    # This model is for additional request parameters if needed

class ProcessDocumentPayload(BaseModel):
    """
    Payload model for /process-document endpoint (frontend consumption)
    """
    success: bool
    message: str
    budget_data: List[BudgetData]
    budget_count: int
    processing_time: float
    processing_steps: List[str] = []