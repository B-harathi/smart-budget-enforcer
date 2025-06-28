"""
Smart Budget Enforcer - Python RAG Service - FINAL FIXED VERSION
Person Y Guide: This is the main FastAPI service that handles AI processing
Person X: This is the brain of the system - it processes documents and generates insights
"""

from dotenv import load_dotenv
import os
import logging
import tempfile
from datetime import datetime
from typing import Dict, Any, List
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

# ✅ FIXED: Add missing BudgetData import
from models import (
    DocumentProcessingResponse,
    RecommendationRequest,
    RecommendationResponse,
    HealthResponse,
    BudgetData,  # ✅ FIXED: Import BudgetData
    ProcessDocumentPayload  # ✅ FIXED: Import ProcessDocumentPayload
)
from vector_store import vector_store_manager
from graph_workflow import initialize_workflow, get_workflow

# Person Y: Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Person Y: Load environment variables
load_dotenv()

# Person Y: Initialize FastAPI app
app = FastAPI(
    title="Smart Budget Enforcer - Python RAG Service",
    description="AI-powered budget document processing and recommendation service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Person Y: Configure CORS
app.add_middleware(
    CORSMiddleware,
    # Node.js backend and React frontend
    allow_origins=["http://localhost:5000", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Person Y: Global variables for configuration
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
NODE_BACKEND_URL = os.getenv("NODE_BACKEND_URL", "http://localhost:5000")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

# Person Y: Global workflow instance
workflow_instance = None


@app.on_event("startup")
async def startup_event():
    """✅ FIXED: Initialize everything when the service starts"""
    global workflow_instance

    try:
        logger.info("🚀 Starting Smart Budget Enforcer Python Service...")

        # Check API key
        if not GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY environment variable is required")

        # ✅ FIXED: Initialize workflow with proper error handling
        logger.info("🤖 Initializing LangGraph workflow and agents...")
        workflow_instance = initialize_workflow(
            GOOGLE_API_KEY, NODE_BACKEND_URL)

        # Test vector database connection
        stats = vector_store_manager.get_collection_stats()
        logger.info(f"📊 Vector database stats: {stats}")

        logger.info("✅ Python service started successfully")

    except Exception as e:
        logger.error(f"❌ Startup failed: {e}")
        raise


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Person Y: Health check endpoint
    Person X: This tells you if the service is working properly
    """
    try:
        # Check workflow status
        workflow = get_workflow()
        workflow_status = workflow.get_workflow_status()

        # Check vector database
        vector_stats = vector_store_manager.get_collection_stats()
        vector_connected = vector_stats.get("status") == "healthy"

        return HealthResponse(
            agents_loaded=workflow_status.get("workflow_ready", False),
            vector_db_connected=vector_connected
        )

    except Exception as e:
        logger.error(f"❌ Health check failed: {e}")
        raise HTTPException(
            status_code=500, detail=f"Health check failed: {str(e)}")


def validate_workflow():
    """Person Y: Dependency to ensure workflow is initialized"""
    if workflow_instance is None:
        raise HTTPException(
            status_code=503,
            detail="Workflow not initialized. Please wait and try again."
        )


@app.post("/process-document", response_model=ProcessDocumentPayload)
async def process_document(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    _: None = Depends(validate_workflow)
):
    """✅ FIXED: Main document processing endpoint"""
    start_time = datetime.now()
    temp_file_path = None

    try:
        logger.info(
            f"📄 Processing document: {file.filename} for user: {user_id}")

        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")

        allowed_extensions = ['.pdf', '.xlsx',
                              '.xls', '.docx', '.doc', '.csv', '.txt']
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {file_ext}. Allowed: {', '.join(allowed_extensions)}"
            )

        # ✅ FIXED: Better file handling for Windows
        try:
            content = await file.read()
            if len(content) == 0:
                raise HTTPException(
                    status_code=400, detail="Uploaded file is empty")

            # Create temporary file with proper cleanup
            temp_file = tempfile.NamedTemporaryFile(
                delete=False, suffix=file_ext)
            temp_file.write(content)
            temp_file.close()  # ✅ FIXED: Close file handle before processing
            temp_file_path = temp_file.name

            logger.info(f"📁 File saved temporarily: {temp_file_path}")

        except Exception as e:
            logger.error(f"❌ Error saving file: {e}")
            raise HTTPException(
                status_code=400, detail=f"Error processing file: {str(e)}")

        # ✅ FIXED: Process through LangGraph workflow with better error handling
        try:
            workflow = get_workflow()
            result = workflow.process_document_upload(temp_file_path, user_id)

            logger.info(f"📊 Workflow result type: {type(result)}")
            logger.info(
                f"📊 Workflow result success: {result.get('success', 'Unknown')}")

        except Exception as e:
            logger.error(f"❌ Workflow error: {e}")
            raise HTTPException(
                status_code=422, detail=f"Document processing failed: {str(e)}")

        processing_time = (datetime.now() - start_time).total_seconds()

        # ✅ FIXED: Handle workflow result properly
        if not isinstance(result, dict):
            logger.error(f"❌ Unexpected result type: {type(result)}")
            raise HTTPException(
                status_code=500, detail="Internal workflow error")

        if not result.get("success", False):
            error_msg = result.get("error", "Unknown processing error")
            logger.error(f"❌ Workflow failed: {error_msg}")
            raise HTTPException(status_code=422, detail=error_msg)

        # ✅ FIXED: Extract and validate budget data
        raw_budget_data = result.get("budget_data", [])
        logger.info(f"📊 Raw budget data count: {len(raw_budget_data)}")

        if not raw_budget_data:
            logger.warning("⚠️ No budget data returned from workflow")
            raise HTTPException(
                status_code=422,
                detail="No budget data could be extracted from this document. Please ensure your file contains budget information in a recognizable format."
            )

        # Convert to proper format with validation
        validated_budget_data = []
        for i, item in enumerate(raw_budget_data):
            try:
                if isinstance(item, dict):
                    # Validate required fields
                    required_fields = ['name', 'category',
                                       'department', 'amount', 'limit_amount']
                    if all(field in item for field in required_fields):
                        # Ensure numeric fields are valid
                        item['amount'] = float(item.get('amount', 0))
                        item['limit_amount'] = float(
                            item.get('limit_amount', 0))
                        item['warning_threshold'] = float(
                            item.get('warning_threshold', item['amount'] * 0.8))

                        # Ensure string fields are strings
                        item['name'] = str(item.get('name', ''))
                        item['category'] = str(item.get('category', ''))
                        item['department'] = str(item.get('department', ''))

                        # Fix priority field - handle enum values properly
                        priority_value = item.get('priority', 'Medium')
                        if hasattr(priority_value, 'value'):  # If it's an enum
                            item['priority'] = priority_value.value
                        else:
                            item['priority'] = str(priority_value)

                        item['email'] = str(
                            item.get('email', 'finance@company.com'))
                        item['vendor'] = str(item.get('vendor', ''))

                        validated_budget_data.append(item)
                    else:
                        logger.warning(
                            f"⚠️ Skipping item {i} missing required fields: {item}")
                else:
                    logger.warning(
                        f"⚠️ Skipping item {i} with unknown type: {type(item)}")
            except Exception as e:
                logger.warning(f"⚠️ Error validating budget item {i}: {e}")
                continue

        logger.info(f"✅ Validated {len(validated_budget_data)} budget items")

        if not validated_budget_data:
            raise HTTPException(
                status_code=422,
                detail="Document processed but no valid budget data could be extracted. Please check that your file contains properly formatted budget information."
            )

        # Return success response
        response_data = {
            "success": True,
            "message": f"Document processed successfully. Extracted {len(validated_budget_data)} budget items.",
            "budget_data": validated_budget_data,
            "budget_count": len(validated_budget_data),
            "processing_time": processing_time,
            "processing_steps": result.get("processing_steps", [])
        }

        return JSONResponse(content=response_data)

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}")

    finally:
        # ✅ FIXED: Better cleanup for Windows
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                # Try multiple times to delete (Windows file locking issue)
                import time
                for attempt in range(3):
                    try:
                        os.unlink(temp_file_path)
                        logger.info("🗑️ Temporary file cleaned up")
                        break
                    except PermissionError:
                        if attempt < 2:
                            time.sleep(0.1)  # Wait a bit and retry
                            continue
                        else:
                            logger.warning(
                                f"⚠️ Could not delete temporary file after 3 attempts: {temp_file_path}")
            except Exception as e:
                logger.warning(f"⚠️ Cleanup error: {e}")

# @app.post("/generate-recommendations")
# async def generate_recommendations(
#     request: RecommendationRequest,
#     _: None = Depends(validate_workflow)
# ):
#     """
#     Person Y: Generate AI recommendations for budget breaches
#     Person X: This creates smart suggestions when budgets are exceeded
#     """
#     start_time = datetime.now()

#     try:
#         logger.info(f"🧠 Generating recommendations for user: {request.user_id}")

#         # Process through expense analysis workflow
#         workflow = get_workflow()

#         # Convert request data to proper format
#         budget_data = [request.budget_data] if isinstance(request.budget_data, dict) else [request.budget_data]
#         expense_data = request.expense_data

#         result = workflow.process_expense_analysis(
#             budget_data=budget_data,
#             expense_data=expense_data,
#             user_id=request.user_id
#         )

#         processing_time = (datetime.now() - start_time).total_seconds()

#         if result["success"]:
#             recommendations = result.get("recommendations", [])
#             logger.info(f"✅ Generated {len(recommendations)} recommendations in {processing_time:.2f}s")

#             return JSONResponse(content={
#                 "success": True,
#                 "message": f"Generated {len(recommendations)} AI recommendations",
#                 "recommendations": recommendations,
#                 "processing_time": processing_time
#             })
#         else:
#             logger.error(f"❌ Recommendation generation failed: {result.get('error', 'Unknown error')}")
#             raise HTTPException(
#                 status_code=500,
#                 detail=f"Recommendation generation failed: {result.get('error', 'Unknown error')}"
#             )

#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"❌ Unexpected error generating recommendations: {e}")
#         raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")

# ✅ ADD THIS TO YOUR main.py - Enhanced recommendation endpoint


@app.post("/generate-recommendations")
async def generate_recommendations(
    request: RecommendationRequest,
    _: None = Depends(validate_workflow)
):
    """
    ✅ ENHANCED: Generate AI recommendations for budget breaches with comprehensive analysis
    This endpoint is called by Node.js when expenses trigger threshold warnings or breaches
    """
    start_time = datetime.now()

    try:
        logger.info(
            f"🧠 Generating recommendations for user: {request.user_id}")
        logger.info(
            f"📊 Budget: {request.budget_data.get('department', 'Unknown')} - {request.budget_data.get('category', 'Unknown')}")

        # ✅ ENHANCED: Validate request data
        if not request.budget_data or not request.expense_data:
            raise HTTPException(
                status_code=400,
                detail="Both budget_data and expense_data are required"
            )

        # ✅ ENHANCED: Extract and validate budget information
        budget_data = request.budget_data
        expense_data = request.expense_data
        breach_context = getattr(request, 'breach_context', {})

        # Calculate usage metrics
        usage_percentage = (budget_data.get(
            'used_amount', 0) / budget_data.get('limit_amount', 1)) * 100
        overage_amount = max(0, budget_data.get(
            'used_amount', 0) - budget_data.get('limit_amount', 0))

        logger.info(
            f"📈 Budget usage: {usage_percentage:.1f}%, Overage: ${overage_amount:,.2f}")

        # ✅ ENHANCED: Get user's complete budget portfolio for better recommendations
        try:
            all_budgets_response = requests.get(
                f"{process.env.get('NODE_BACKEND_URL', 'http://localhost:5000')}/api/budgets",
                # Simplified for internal call
                headers={"Authorization": f"Bearer {request.user_id}"},
                timeout=30
            )

            if all_budgets_response.status_code == 200:
                user_budgets = all_budgets_response.json().get('budgets', [])
                logger.info(
                    f"📊 Retrieved {len(user_budgets)} user budgets for context")
            else:
                logger.warning(
                    "⚠️ Could not retrieve user budgets, using single budget context")
                user_budgets = [budget_data]
        except Exception as e:
            logger.warning(f"⚠️ Error retrieving user budgets: {e}")
            user_budgets = [budget_data]

        # ✅ ENHANCED: Create comprehensive budget usage map
        budget_usage_map = create_comprehensive_budget_map(
            user_budgets, budget_data, overage_amount)

        # ✅ ENHANCED: Create detailed breach context
        enhanced_breach_context = {
            "breach_detected": usage_percentage > 90,  # Consider 90%+ as breach
            "breach_details": [{
                "department": budget_data.get('department', 'Unknown'),
                "category": budget_data.get('category', 'Unknown'),
                "severity": determine_breach_severity(usage_percentage, overage_amount),
                "priority": budget_data.get('priority', 'Medium'),
                "breach_types": determine_breach_types(usage_percentage, overage_amount),
                "financial_impact": {
                    "overage_amount": overage_amount,
                    "budget_limit": budget_data.get('limit_amount', 0),
                    "used_amount": budget_data.get('used_amount', 0),
                    "usage_percentage": usage_percentage,
                    "projected_monthly_overage": estimate_monthly_overage(expense_data, budget_data)
                },
                "triggering_expense": {
                    "amount": expense_data.get('amount', 0),
                    "description": expense_data.get('description', ''),
                    "vendor": expense_data.get('vendor_name', ''),
                    "date": expense_data.get('date', datetime.now().isoformat())
                }
            }]
        }

        # ✅ ENHANCED: Create AgentState for workflow processing
        from models import AgentState, BudgetData, ExpenseData

        # Convert dictionaries to proper objects
        budget_object = BudgetData(**budget_data)
        expense_object = ExpenseData(**expense_data)

        workflow_state = AgentState(
            user_id=request.user_id,
            start_time=start_time,
            budget_usage_map=budget_usage_map,
            breach_context=enhanced_breach_context,
            breach_detected=enhanced_breach_context["breach_detected"],
            structured_budget_data=[budget_object],
            expense_data=expense_object,
            processing_steps=[],
            errors=[],
            recommendations=[],
            notifications_sent=[]
        )

        # ✅ ENHANCED: Process through CorrectionRecommenderAgent
        workflow = get_workflow()
        if not workflow.correction_recommender:
            raise HTTPException(
                status_code=503,
                detail="AI recommendation service not available"
            )

        logger.info("🔄 Processing through AI recommendation agent...")
        result_state = workflow.correction_recommender.process_correction_recommendations(
            workflow_state)

        if result_state.errors:
            logger.warning(f"⚠️ AI processing warnings: {result_state.errors}")

        recommendations = result_state.recommendations or []
        logger.info(f"🧠 Generated {len(recommendations)} AI recommendations")

        # ✅ ENHANCED: Add historical context and validation
        enhanced_recommendations = []
        for rec in recommendations:
            try:
                # Add implementation timeline and risk assessment
                enhanced_rec = enhance_recommendation_with_context(
                    rec, budget_data, expense_data, user_budgets)
                enhanced_recommendations.append(enhanced_rec)
            except Exception as e:
                logger.warning(f"⚠️ Error enhancing recommendation: {e}")
                enhanced_recommendations.append(rec)

        # ✅ ENHANCED: Sort by priority and estimated impact
        enhanced_recommendations.sort(
            key=lambda r: (r.priority, -r.estimated_savings))

        processing_time = (datetime.now() - start_time).total_seconds()

        # ✅ ENHANCED: Prepare comprehensive response
        response_data = {
            "success": True,
            "message": f"Generated {len(enhanced_recommendations)} AI-powered recommendations",
            "recommendations": [
                {
                    "title": rec.title,
                    "description": rec.description,
                    "type": rec.type.value if hasattr(rec.type, 'value') else str(rec.type),
                    "priority": rec.priority,
                    "estimated_savings": float(rec.estimated_savings),
                    "implementation_timeline": getattr(rec, 'implementation_timeline', 'Unknown'),
                    "risk_level": getattr(rec, 'risk_level', 'Medium'),
                    "confidence_score": getattr(rec, 'confidence_score', 0.8)
                }
                for rec in enhanced_recommendations
            ],
            "analysis_context": {
                "budget_health": determine_budget_health(budget_usage_map),
                "breach_severity": enhanced_breach_context["breach_details"][0]["severity"],
                "total_potential_savings": sum(rec.estimated_savings for rec in enhanced_recommendations),
                "reallocation_opportunities": len([b for b in user_budgets if b.get('usage_percentage', 100) < 50]),
                "high_priority_actions": len([r for r in enhanced_recommendations if r.priority == 1])
            },
            "processing_info": {
                "processing_time": processing_time,
                "ai_model": "gemini-1.5-flash",
                "analysis_type": "threshold_triggered" if usage_percentage < 100 else "breach_triggered",
                "context_budgets_analyzed": len(user_budgets),
                "processing_steps": result_state.processing_steps
            }
        }

        logger.info(
            f"✅ Recommendation generation completed in {processing_time:.2f}s")
        return JSONResponse(content=response_data)

    except HTTPException:
        raise
    except Exception as e:
        processing_time = (datetime.now() - start_time).total_seconds()
        logger.error(f"❌ Unexpected error generating recommendations: {e}")

        # ✅ ENHANCED: Return fallback recommendations on error
        fallback_recommendations = generate_fallback_recommendations_api(
            request.budget_data,
            request.expense_data,
            str(e)
        )

        return JSONResponse(
            status_code=200,  # Return 200 with fallback instead of error
            content={
                "success": True,
                "message": f"Generated {len(fallback_recommendations)} fallback recommendations (AI service temporarily unavailable)",
                "recommendations": fallback_recommendations,
                "fallback_used": True,
                "error_context": str(e),
                "processing_time": processing_time
            }
        )

# ✅ ENHANCED: Helper functions for recommendation processing


def create_comprehensive_budget_map(user_budgets, current_budget, overage_amount):
    """Create comprehensive budget usage map for AI analysis"""
    try:
        total_allocated = sum(b.get('limit_amount', 0) for b in user_budgets)
        total_used = sum(b.get('used_amount', 0) for b in user_budgets)

        individual_budgets = []
        for budget in user_budgets:
            limit_amount = budget.get('limit_amount', 0)
            used_amount = budget.get('used_amount', 0)
            usage_percentage = (used_amount / limit_amount *
                                100) if limit_amount > 0 else 0

            status = "Safe"
            if usage_percentage > 100:
                status = "Exceeded"
            elif usage_percentage > 90:
                status = "Critical"
            elif usage_percentage > 75:
                status = "Warning"
            elif usage_percentage > 50:
                status = "Caution"

            individual_budgets.append({
                "department": budget.get('department', 'Unknown'),
                "category": budget.get('category', 'Unknown'),
                "limit_amount": limit_amount,
                "used_amount": used_amount,
                "remaining_amount": limit_amount - used_amount,
                "usage_percentage": usage_percentage,
                "status": status,
                "priority": budget.get('priority', 'Medium')
            })

        return {
            "summary": {
                "total_allocated": total_allocated,
                "total_used": total_used,
                "overall_usage_percentage": (total_used / total_allocated * 100) if total_allocated > 0 else 0,
                "total_budgets": len(user_budgets),
                "budgets_over_limit": len([b for b in individual_budgets if b["status"] == "Exceeded"]),
                "budgets_at_risk": len([b for b in individual_budgets if b["status"] in ["Critical", "Warning"]])
            },
            "individual_budgets": individual_budgets
        }
    except Exception as e:
        logger.error(f"Error creating budget map: {e}")
        return {"summary": {"total_allocated": 0, "total_used": 0, "overall_usage_percentage": 0}, "individual_budgets": []}


def determine_breach_severity(usage_percentage, overage_amount):
    """Determine severity level based on usage and overage"""
    if overage_amount > 10000 or usage_percentage > 150:
        return "critical"
    elif overage_amount > 5000 or usage_percentage > 120:
        return "high"
    elif overage_amount > 1000 or usage_percentage > 100:
        return "medium"
    elif usage_percentage > 90:
        return "low"
    else:
        return "warning"


def determine_breach_types(usage_percentage, overage_amount):
    """Determine types of budget breaches"""
    breach_types = []

    if usage_percentage > 100:
        breach_types.append("budget_exceeded")
    if usage_percentage > 150:
        breach_types.append("severe_overage")
    if overage_amount > 10000:
        breach_types.append("high_financial_impact")
    if usage_percentage > 90:
        breach_types.append("threshold_breach")

    return breach_types if breach_types else ["threshold_warning"]


def estimate_monthly_overage(expense_data, budget_data):
    """Estimate projected monthly overage based on current trends"""
    try:
        current_usage = budget_data.get('used_amount', 0)
        budget_limit = budget_data.get('limit_amount', 0)

        # Simple projection: if current expense rate continues
        days_in_month = 30
        current_day = datetime.now().day

        if current_day > 0:
            daily_usage_rate = current_usage / current_day
            projected_monthly_usage = daily_usage_rate * days_in_month
            projected_overage = max(0, projected_monthly_usage - budget_limit)
            return projected_overage

        return 0
    except Exception:
        return 0


def enhance_recommendation_with_context(rec, budget_data, expense_data, user_budgets):
    """Enhance recommendation with additional context and metadata"""
    try:
        # Add implementation timeline
        if rec.type.value == "spending_pause":
            rec.implementation_timeline = "Immediate (within 24 hours)"
            rec.risk_level = "Low"
        elif rec.type.value == "budget_reallocation":
            rec.implementation_timeline = "2-3 business days"
            rec.risk_level = "Medium"
        elif rec.type.value == "vendor_alternative":
            rec.implementation_timeline = "1-2 weeks"
            rec.risk_level = "Medium"
        elif rec.type.value == "approval_request":
            rec.implementation_timeline = "3-5 business days"
            rec.risk_level = "High"

        # Add confidence score based on available data
        confidence_factors = []
        if budget_data.get('usage_percentage', 0) > 90:
            confidence_factors.append(0.3)  # High usage = high confidence
        if len(user_budgets) > 3:
            confidence_factors.append(0.2)  # More context = higher confidence
        if rec.estimated_savings > 1000:
            # Significant savings = higher confidence
            confidence_factors.append(0.3)
        if budget_data.get('priority') == 'High':
            # High priority budget = higher confidence
            confidence_factors.append(0.2)

        rec.confidence_score = min(
            1.0, sum(confidence_factors) + 0.5)  # Base confidence 0.5

        return rec
    except Exception as e:
        logger.warning(f"Error enhancing recommendation: {e}")
        return rec


def determine_budget_health(budget_usage_map):
    """Determine overall budget portfolio health"""
    try:
        overall_usage = budget_usage_map.get(
            "summary", {}).get("overall_usage_percentage", 0)
        budgets_exceeded = budget_usage_map.get(
            "summary", {}).get("budgets_over_limit", 0)
        budgets_at_risk = budget_usage_map.get(
            "summary", {}).get("budgets_at_risk", 0)
        total_budgets = budget_usage_map.get(
            "summary", {}).get("total_budgets", 1)

        if budgets_exceeded > 0 or overall_usage > 100:
            return "Critical"
        elif budgets_at_risk > total_budgets * 0.5 or overall_usage > 85:
            return "Poor"
        elif budgets_at_risk > 0 or overall_usage > 75:
            return "Fair"
        elif overall_usage > 60:
            return "Good"
        else:
            return "Excellent"
    except Exception:
        return "Unknown"


def generate_fallback_recommendations_api(budget_data, expense_data, error_context):
    """Generate fallback recommendations when AI service fails"""
    try:
        fallback_recs = []
        department = budget_data.get('department', 'Unknown')
        category = budget_data.get('category', 'Unknown')
        usage_percentage = budget_data.get('usage_percentage', 0)
        overage = max(0, budget_data.get('used_amount', 0) -
                      budget_data.get('limit_amount', 0))

        # Fallback 1: Immediate review
        fallback_recs.append({
            "title": f"Immediate Spending Review - {department}",
            "description": f"Implement immediate review process for all {category} expenses in {department} department. "
            f"Require manager approval for expenses over $500. Current usage: {usage_percentage:.1f}%.",
            "type": "spending_pause",
            "priority": 1 if usage_percentage > 100 else 2,
            "estimated_savings": overage * 0.5 if overage > 0 else 2000,
            "implementation_timeline": "Immediate",
            "risk_level": "Low",
            "confidence_score": 0.8
        })

        # Fallback 2: Vendor analysis
        fallback_recs.append({
            "title": f"Vendor Cost Analysis - {category}",
            "description": f"Review current {category} vendors and negotiate better rates. "
            f"Research alternative suppliers to achieve 15-20% cost reduction.",
            "type": "vendor_alternative",
            "priority": 2,
            "estimated_savings": budget_data.get('used_amount', 0) * 0.15,
            "implementation_timeline": "1-2 weeks",
            "risk_level": "Medium",
            "confidence_score": 0.7
        })

        # Fallback 3: Budget reallocation (if overage exists)
        if overage > 0:
            fallback_recs.append({
                "title": "Emergency Budget Reallocation",
                "description": f"Request fund reallocation from underutilized budgets to cover "
                f"{department} - {category} overage of ${overage:,.2f}.",
                "type": "budget_reallocation",
                "priority": 1,
                "estimated_savings": overage,
                "implementation_timeline": "2-3 business days",
                "risk_level": "Medium",
                "confidence_score": 0.6
            })

        return fallback_recs
    except Exception as e:
        logger.error(f"Error generating fallback recommendations: {e}")
        return [{
            "title": "Manual Budget Review Required",
            "description": "Due to system limitations, manual budget review is recommended. Contact finance team.",
            "type": "approval_request",
            "priority": 2,
            "estimated_savings": 0,
            "implementation_timeline": "3-5 business days",
            "risk_level": "High",
            "confidence_score": 0.5
        }]

# ✅ ENHANCED: Test endpoint for recommendation system


@app.post("/debug/test-recommendations")
async def debug_test_recommendations(
    budget_usage_percentage: float = 95.0,
    overage_amount: float = 2500.0,
    department: str = "Marketing",
    category: str = "Advertising",
    user_id: str = "test_user"
):
    """Debug endpoint to test recommendation generation"""
    if not DEBUG:
        raise HTTPException(
            status_code=404, detail="Debug endpoint not available")

    try:
        # Create mock data
        mock_budget_data = {
            "name": f"{department} {category} Budget",
            "department": department,
            "category": category,
            "limit_amount": 10000,
            "used_amount": 10000 * (budget_usage_percentage / 100),
            "usage_percentage": budget_usage_percentage,
            "priority": "High"
        }

        mock_expense_data = {
            "amount": 500,
            "description": f"Test {category} expense",
            "vendor_name": "Test Vendor",
            "date": datetime.now().isoformat()
        }

        # Create comprehensive request
        from models import RecommendationRequest
        test_request = RecommendationRequest(
            budget_data=mock_budget_data,
            expense_data=mock_expense_data,
            user_id=user_id
        )

        # Process through recommendation system
        logger.info(
            f"🧪 Testing recommendations for {budget_usage_percentage}% usage, ${overage_amount} overage")
        result = await generate_recommendations(test_request)

        return {
            "success": True,
            "test_parameters": {
                "budget_usage_percentage": budget_usage_percentage,
                "overage_amount": overage_amount,
                "department": department,
                "category": category
            },
            "recommendations": result,
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"❌ Debug test failed: {e}")
        raise HTTPException(status_code=500, detail=f"Test failed: {str(e)}")

# ✅ ENHANCED: Endpoint to test backend connectivity


@app.get("/test-backend-connection")
async def test_backend_connection():
    """Test connection to Node.js backend"""
    try:
        workflow = get_workflow()
        if not workflow.escalation_communicator:
            raise HTTPException(
                status_code=503, detail="Escalation communicator not initialized")

        connection_test = workflow.escalation_communicator.test_backend_connection()

        return JSONResponse(content={
            "success": connection_test["success"],
            "message": connection_test.get("message", "Connection test completed"),
            "backend_status": connection_test.get("backend_status", {}),
            "python_service": "Online",
            "timestamp": datetime.now().isoformat()
        })

    except Exception as e:
        logger.error(f"❌ Backend connection test failed: {e}")
        raise HTTPException(
            status_code=500, detail=f"Connection test failed: {str(e)}")


@app.get("/vector-db/stats")
async def get_vector_db_stats():
    """
    Person Y: Get vector database statistics
    Person X: This shows how many documents are stored in the AI memory
    """
    try:
        stats = vector_store_manager.get_collection_stats()
        return JSONResponse(content=stats)

    except Exception as e:
        logger.error(f"❌ Error getting vector DB stats: {e}")
        raise HTTPException(
            status_code=500, detail=f"Vector DB error: {str(e)}")


@app.get("/workflow/status")
async def get_workflow_status():
    """
    Person Y: Get workflow and agent status
    Person X: This tells you if all the AI agents are working properly
    """
    try:
        workflow = get_workflow()
        status = workflow.get_workflow_status()
        return JSONResponse(content=status)

    except Exception as e:
        logger.error(f"❌ Error getting workflow status: {e}")
        raise HTTPException(
            status_code=500, detail=f"Workflow status error: {str(e)}")


@app.get("/search-documents/{user_id}")
async def search_user_documents(user_id: str, query: str = "budget"):
    """
    Person Y: Search user's documents using semantic similarity
    Person X: This finds relevant information from your uploaded documents
    """
    try:
        results = vector_store_manager.search_similar_documents(
            query=query,
            user_id=user_id,
            k=5
        )

        return JSONResponse(content={
            "success": True,
            "query": query,
            "results_count": len(results),
            "results": results
        })

    except Exception as e:
        logger.error(f"❌ Error searching documents: {e}")
        raise HTTPException(
            status_code=500, detail=f"Document search error: {str(e)}")


@app.post("/debug/test-extraction")
async def debug_test_extraction(
    file: UploadFile = File(...),
    _: None = Depends(validate_workflow)
):
    """Debug endpoint to test document extraction without full workflow"""
    if not DEBUG:
        raise HTTPException(
            status_code=404, detail="Debug endpoint not available")

    temp_file_path = None

    try:
        # Save uploaded file
        content = await file.read()
        file_ext = os.path.splitext(file.filename)[1].lower()

        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=file_ext)
        temp_file.write(content)
        temp_file.close()
        temp_file_path = temp_file.name

        # Test extraction directly
        from agents.budget_policy_loader import BudgetPolicyLoaderAgent

        if not GOOGLE_API_KEY:
            raise HTTPException(
                status_code=500, detail="Google API key not configured")

        loader = BudgetPolicyLoaderAgent(GOOGLE_API_KEY)

        # Extract text
        extracted_text = loader.extract_text_from_file(temp_file_path)

        # Extract budget data
        budget_data = loader.extract_budget_data(extracted_text)

        return JSONResponse(content={
            "success": True,
            "filename": file.filename,
            "file_size": len(content),
            "extracted_text_length": len(extracted_text),
            "extracted_text_preview": extracted_text[:500] + "..." if len(extracted_text) > 500 else extracted_text,
            "budget_items_found": len(budget_data),
            "budget_data": [budget.dict() for budget in budget_data] if budget_data else []
        })

    except Exception as e:
        logger.error(f"❌ Debug extraction failed: {e}")
        raise HTTPException(
            status_code=500, detail=f"Debug extraction error: {str(e)}")

    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                import time
                for attempt in range(3):
                    try:
                        os.unlink(temp_file_path)
                        break
                    except PermissionError:
                        if attempt < 2:
                            time.sleep(0.1)
                        continue
            except:
                pass


@app.delete("/vector-db/reset")
async def reset_vector_database():
    """
    Person Y: Reset vector database (development only!)
    Person X: ⚠️ This deletes all stored documents - use with caution!
    """
    if not DEBUG:
        raise HTTPException(
            status_code=403, detail="Reset only allowed in debug mode")

    try:
        success = vector_store_manager.reset_collection()
        if success:
            return JSONResponse(content={
                "success": True,
                "message": "Vector database reset successfully"
            })
        else:
            raise HTTPException(
                status_code=500, detail="Failed to reset vector database")

    except Exception as e:
        logger.error(f"❌ Error resetting vector database: {e}")
        raise HTTPException(status_code=500, detail=f"Reset error: {str(e)}")

# Person Y: Error handlers


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Person Y: Global exception handler for better error messages"""
    logger.error(f"❌ Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": str(exc) if DEBUG else "An unexpected error occurred"
        }
    )

if __name__ == "__main__":
    # Person Y: Run the service
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=DEBUG,
        log_level="info"
    )
