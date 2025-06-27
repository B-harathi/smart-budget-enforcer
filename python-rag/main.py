"""
Smart Budget Enforcer - Python RAG Service - FINAL FIXED VERSION
Person Y Guide: This is the main FastAPI service that handles AI processing
Person X: This is the brain of the system - it processes documents and generates insights
"""

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
from dotenv import load_dotenv
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
    allow_origins=["http://localhost:5000", "http://localhost:3000"],  # Node.js backend and React frontend
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
        workflow_instance = initialize_workflow(GOOGLE_API_KEY, NODE_BACKEND_URL)
        
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
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

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
        logger.info(f"📄 Processing document: {file.filename} for user: {user_id}")
        
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        allowed_extensions = ['.pdf', '.xlsx', '.xls', '.docx', '.doc', '.csv', '.txt']
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
                raise HTTPException(status_code=400, detail="Uploaded file is empty")
            
            # Create temporary file with proper cleanup
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=file_ext)
            temp_file.write(content)
            temp_file.close()  # ✅ FIXED: Close file handle before processing
            temp_file_path = temp_file.name
            
            logger.info(f"📁 File saved temporarily: {temp_file_path}")
            
        except Exception as e:
            logger.error(f"❌ Error saving file: {e}")
            raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")
        
        # ✅ FIXED: Process through LangGraph workflow with better error handling
        try:
            workflow = get_workflow()
            result = workflow.process_document_upload(temp_file_path, user_id)
            
            logger.info(f"📊 Workflow result type: {type(result)}")
            logger.info(f"📊 Workflow result success: {result.get('success', 'Unknown')}")
            
        except Exception as e:
            logger.error(f"❌ Workflow error: {e}")
            raise HTTPException(status_code=422, detail=f"Document processing failed: {str(e)}")
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # ✅ FIXED: Handle workflow result properly
        if not isinstance(result, dict):
            logger.error(f"❌ Unexpected result type: {type(result)}")
            raise HTTPException(status_code=500, detail="Internal workflow error")
        
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
                    required_fields = ['name', 'category', 'department', 'amount', 'limit_amount']
                    if all(field in item for field in required_fields):
                        # Ensure numeric fields are valid
                        item['amount'] = float(item.get('amount', 0))
                        item['limit_amount'] = float(item.get('limit_amount', 0))
                        item['warning_threshold'] = float(item.get('warning_threshold', item['amount'] * 0.8))
                        
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
                        
                        item['email'] = str(item.get('email', 'finance@company.com'))
                        item['vendor'] = str(item.get('vendor', ''))
                        
                        validated_budget_data.append(item)
                    else:
                        logger.warning(f"⚠️ Skipping item {i} missing required fields: {item}")
                else:
                    logger.warning(f"⚠️ Skipping item {i} with unknown type: {type(item)}")
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
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    
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
                            logger.warning(f"⚠️ Could not delete temporary file after 3 attempts: {temp_file_path}")
            except Exception as e:
                logger.warning(f"⚠️ Cleanup error: {e}")

@app.post("/generate-recommendations")
async def generate_recommendations(
    request: RecommendationRequest,
    _: None = Depends(validate_workflow)
):
    """
    Person Y: Generate AI recommendations for budget breaches
    Person X: This creates smart suggestions when budgets are exceeded
    """
    start_time = datetime.now()
    
    try:
        logger.info(f"🧠 Generating recommendations for user: {request.user_id}")
        
        # Process through expense analysis workflow
        workflow = get_workflow()
        
        # Convert request data to proper format
        budget_data = [request.budget_data] if isinstance(request.budget_data, dict) else [request.budget_data]
        expense_data = request.expense_data
        
        result = workflow.process_expense_analysis(
            budget_data=budget_data,
            expense_data=expense_data,
            user_id=request.user_id
        )
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        if result["success"]:
            recommendations = result.get("recommendations", [])
            logger.info(f"✅ Generated {len(recommendations)} recommendations in {processing_time:.2f}s")
            
            return JSONResponse(content={
                "success": True,
                "message": f"Generated {len(recommendations)} AI recommendations",
                "recommendations": recommendations,
                "processing_time": processing_time
            })
        else:
            logger.error(f"❌ Recommendation generation failed: {result.get('error', 'Unknown error')}")
            raise HTTPException(
                status_code=500,
                detail=f"Recommendation generation failed: {result.get('error', 'Unknown error')}"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Unexpected error generating recommendations: {e}")
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")

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
        raise HTTPException(status_code=500, detail=f"Vector DB error: {str(e)}")

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
        raise HTTPException(status_code=500, detail=f"Workflow status error: {str(e)}")

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
        raise HTTPException(status_code=500, detail=f"Document search error: {str(e)}")

@app.post("/debug/test-extraction")
async def debug_test_extraction(
    file: UploadFile = File(...),
    _: None = Depends(validate_workflow)
):
    """Debug endpoint to test document extraction without full workflow"""
    if not DEBUG:
        raise HTTPException(status_code=404, detail="Debug endpoint not available")
    
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
            raise HTTPException(status_code=500, detail="Google API key not configured")
        
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
        raise HTTPException(status_code=500, detail=f"Debug extraction error: {str(e)}")
    
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
        raise HTTPException(status_code=403, detail="Reset only allowed in debug mode")
    
    try:
        success = vector_store_manager.reset_collection()
        if success:
            return JSONResponse(content={
                "success": True,
                "message": "Vector database reset successfully"
            })
        else:
            raise HTTPException(status_code=500, detail="Failed to reset vector database")
            
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