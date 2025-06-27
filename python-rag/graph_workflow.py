# """
# Smart Budget Enforcer - LangGraph Workflow
# Person Y Guide: This orchestrates all 5 AI agents using LangGraph
# Person X: This is the brain that coordinates all the AI assistants
# """

# import os
# import logging
# from typing import Dict, Any, List
# from datetime import datetime

# # LangGraph imports
# from langgraph.graph import StateGraph, END
# from langgraph.checkpoint.memory import MemorySaver

# # Local imports
# from models import AgentState, BudgetData, ExpenseData, RecommendationData
# from agents import (
#     BudgetPolicyLoaderAgent, 
#     ExpenseTrackerAgent, 
#     BreachDetectorAgent, 
#     CorrectionRecommenderAgent, 
#     EscalationCommunicatorAgent
# )

# logger = logging.getLogger(__name__)

# class SmartBudgetWorkflow:
#     """
#     Person Y: Main workflow orchestrator using LangGraph
#     This coordinates all 5 AI agents in sequence
#     """
    
#     def __init__(self):
#         self.workflow = None
#         self.agents_initialized = False
#         self.budget_loader = None
#         self.expense_tracker = None
#         self.breach_detector = None
#         self.correction_recommender = None
#         self.escalation_communicator = None
        
#     def initialize_agents(self, google_api_key: str, node_backend_url: str):
#         """Initialize all AI agents"""
#         try:
#             logger.info("🤖 Initializing AI agents for workflow...")
            
#             # Initialize each agent
#             self.budget_loader = BudgetPolicyLoaderAgent(google_api_key)
#             self.expense_tracker = ExpenseTrackerAgent()
#             self.breach_detector = BreachDetectorAgent()
#             self.correction_recommender = CorrectionRecommenderAgent(google_api_key)
#             self.escalation_communicator = EscalationCommunicatorAgent(node_backend_url)
            
#             self.agents_initialized = True
#             logger.info("✅ All AI agents initialized successfully")
            
#         except Exception as e:
#             logger.error(f"❌ Failed to initialize agents: {e}")
#             raise
    
#     def build_workflow(self):
#         """Build the LangGraph workflow with all 5 agents"""
#         try:
#             logger.info("🔧 Building LangGraph workflow...")
            
#             # Create the state graph
#             workflow = StateGraph(AgentState)
            
#             # Add nodes for each agent
#             workflow.add_node("budget_policy_loader", self._budget_policy_loader_node)
#             workflow.add_node("expense_tracker", self._expense_tracker_node)
#             workflow.add_node("breach_detector", self._breach_detector_node)
#             workflow.add_node("correction_recommender", self._correction_recommender_node)
#             workflow.add_node("escalation_communicator", self._escalation_communicator_node)
            
#             # Define the workflow edges
#             workflow.set_entry_point("budget_policy_loader")
#             workflow.add_edge("budget_policy_loader", "expense_tracker")
#             workflow.add_edge("expense_tracker", "breach_detector")
#             workflow.add_edge("breach_detector", "correction_recommender")
#             workflow.add_edge("correction_recommender", "escalation_communicator")
#             workflow.add_edge("escalation_communicator", END)
            
#             # Compile the workflow
#             self.workflow = workflow.compile(checkpointer=MemorySaver())
#             logger.info("✅ LangGraph workflow built successfully")
            
#         except Exception as e:
#             logger.error(f"❌ Failed to build workflow: {e}")
#             raise
    
#     def _budget_policy_loader_node(self, state: AgentState) -> AgentState:
#         """Agent 1: Budget Policy Loader - Extract budget data from documents"""
#         try:
#             logger.info("🤖 Budget Policy Loader Agent starting...")
#             state.processing_steps.append("Budget Policy Loader Agent started")
            
#             if not self.budget_loader:
#                 raise ValueError("Budget Policy Loader agent not initialized")
            
#             # Process the document through the agent
#             result_state = self.budget_loader.process_document(state)
            
#             logger.info("✅ Budget Policy Loader Agent completed")
#             return result_state if isinstance(result_state, AgentState) else state
            
#         except Exception as e:
#             error_msg = f"❌ Budget Policy Loader error: {e}"
#             logger.error(error_msg)
#             state.errors.append(error_msg)
#             return state
    
#     def _expense_tracker_node(self, state: AgentState) -> AgentState:
#         """Agent 2: Expense Tracker - Monitor budget usage"""
#         try:
#             logger.info("🤖 Expense Tracker Agent starting...")
#             state.processing_steps.append("Expense Tracker Agent started")
            
#             if not self.expense_tracker:
#                 raise ValueError("Expense Tracker agent not initialized")
            
#             # FIX: Use process_expense_tracking, not process_expense
#             result_state = self.expense_tracker.process_expense_tracking(state)
            
#             logger.info("✅ Expense Tracker Agent completed")
#             return result_state if isinstance(result_state, AgentState) else state
            
#         except Exception as e:
#             error_msg = f"❌ Expense Tracker error: {e}"
#             logger.error(error_msg)
#             state.errors.append(error_msg)
#             return state
    
#     def _breach_detector_node(self, state: AgentState) -> AgentState:
#         """Agent 3: Breach Detector - Detect budget violations"""
#         try:
#             logger.info("🤖 Breach Detector Agent starting...")
#             state.processing_steps.append("Breach Detector Agent started")
            
#             if not self.breach_detector:
#                 raise ValueError("Breach Detector agent not initialized")
            
#             # FIX: Use process_breach_detection, not detect_breaches
#             result_state = self.breach_detector.process_breach_detection(state)
            
#             logger.info("✅ Breach Detector Agent completed")
#             return result_state if isinstance(result_state, AgentState) else state
            
#         except Exception as e:
#             error_msg = f"❌ Breach Detector error: {e}"
#             logger.error(error_msg)
#             state.errors.append(error_msg)
#             return state
    
#     def _correction_recommender_node(self, state: AgentState) -> AgentState:
#         """Agent 4: Correction Recommender - Generate AI recommendations"""
#         try:
#             logger.info("🤖 Correction Recommender Agent starting...")
#             state.processing_steps.append("Correction Recommender Agent started")
            
#             if not self.correction_recommender:
#                 raise ValueError("Correction Recommender agent not initialized")
            
#             # FIX: Always use process_correction_recommendations, which returns AgentState
#             result_state = self.correction_recommender.process_correction_recommendations(state)
            
#             logger.info("✅ Correction Recommender Agent completed")
#             return result_state if isinstance(result_state, AgentState) else state
            
#         except Exception as e:
#             error_msg = f"❌ Correction Recommender error: {e}"
#             logger.error(error_msg)
#             state.errors.append(error_msg)
#             return state
    
#     def _escalation_communicator_node(self, state: AgentState) -> AgentState:
#         """Agent 5: Escalation Communicator - Send email alerts"""
#         try:
#             logger.info("🤖 Escalation Communicator Agent starting...")
#             state.processing_steps.append("Escalation Communicator Agent started")
            
#             if not self.escalation_communicator:
#                 raise ValueError("Escalation Communicator agent not initialized")
            
#             # FIX: Always use process_escalation_communication, which returns AgentState
#             result_state = self.escalation_communicator.process_escalation_communication(state)
            
#             logger.info("✅ Escalation Communicator Agent completed")
#             return result_state if isinstance(result_state, AgentState) else state
            
#         except Exception as e:
#             error_msg = f"❌ Escalation Communicator error: {e}"
#             logger.error(error_msg)
#             state.errors.append(error_msg)
#             return state
    
#     def process_document_upload(self, file_path: str, user_id: str) -> Dict[str, Any]:
#         """
#         ✅ FIXED: Main entry point for document processing
#         This runs the full 5-agent workflow
#         """
#         try:
#             if not self.agents_initialized:
#                 raise ValueError("Agents not initialized. Call initialize_agents() first.")
            
#             if not self.workflow:
#                 raise ValueError("Workflow not built. Call build_workflow() first.")
            
#             logger.info(f"🚀 Starting document processing workflow for file: {file_path}")
            
#             # ✅ FIXED: Create initial state with proper structure
#             initial_state = AgentState(
#                 file_path=file_path,
#                 user_id=user_id,
#                 start_time=datetime.now(),
#                 structured_budget_data=[],  # Initialize as empty list
#                 processing_steps=[],
#                 errors=[],
#                 notifications_sent=[],
#                 recommendations=[]
#             )
            
#             # Run the workflow with a unique thread_id for the checkpointer
#             logger.info("🔄 Executing LangGraph workflow...")
#             thread_id = f"doc_{user_id}_{int(datetime.now().timestamp())}"
#             result = self.workflow.invoke(
#                 initial_state,
#                 config={"configurable": {"thread_id": thread_id}}
#             )
#             # If result is not AgentState, return a clear error dict
#             if not isinstance(result, AgentState):
#                 logger.error(f"❌ Workflow did not return AgentState. Got: {type(result)} with keys: {getattr(result, 'keys', lambda: [])()}")
#                 return {
#                     "success": False,
#                     "error": "Unknown processing error",
#                     "budget_count": 0,
#                     "budget_data": [],
#                     "processing_steps": [],
#                     "errors": ["Workflow did not return AgentState"]
#                 }
            
#             # Extract results
#             budget_data = result.structured_budget_data
#             processing_steps = result.processing_steps
#             errors = result.errors
            
#             logger.info(f"✅ Workflow completed. Steps: {len(processing_steps)}, Errors: {len(errors)}")
            
#             if errors:
#                 logger.error(f"❌ Workflow errors: {errors}")
#                 return {
#                     "success": False,
#                     "error": "; ".join(errors),
#                     "budget_count": 0,
#                     "budget_data": []
#                 }
            
#             # Convert BudgetData objects to dicts for JSON response
#             budget_dicts = []
#             for budget in budget_data:
#                 budget_dicts.append(budget.dict())
            
#             return {
#                 "success": True,
#                 "budget_count": len(budget_data),
#                 "budget_data": budget_dicts,
#                 "processing_steps": processing_steps
#             }
            
#         except Exception as e:
#             logger.error(f"❌ Document processing workflow failed: {e}")
#             return {
#                 "success": False,
#                 "error": str(e),
#                 "budget_count": 0,
#                 "budget_data": []
#             }
    
#     def process_expense_analysis(self, budget_data: List[Dict], expense_data: Dict, user_id: str) -> Dict[str, Any]:
#         """
#         Person Y: Process expense analysis through the workflow
#         This is used for real-time expense monitoring
#         """
#         try:
#             if not self.agents_initialized:
#                 raise ValueError("Agents not initialized")
            
#             logger.info(f"💰 Processing expense analysis for user: {user_id}")
            
#             # Create state with expense data
#             initial_state = AgentState(
#                 user_id=user_id,
#                 expense_data=ExpenseData(**expense_data),
#                 start_time=datetime.now()
#             )
            
#             # Add budget data to state
#             budget_objects = [BudgetData(**budget) for budget in budget_data]
#             initial_state.structured_budget_data = budget_objects
            
#             # Run workflow from expense tracker onwards
#             # (Skip budget policy loader since we already have budget data)
#             result = self.workflow.invoke(initial_state, config={"configurable": {"thread_id": f"expense_{user_id}"}})
            
#             recommendations = result.recommendations
#             notifications = result.notifications_sent
            
#             return {
#                 "success": True,
#                 "recommendations": [rec.dict() for rec in recommendations],
#                 "notifications_sent": notifications,
#                 "breach_detected": result.breach_detected
#             }
            
#         except Exception as e:
#             logger.error(f"❌ Expense analysis failed: {e}")
#             return {
#                 "success": False,
#                 "error": str(e),
#                 "recommendations": []
#             }
    
#     def get_workflow_status(self) -> Dict[str, Any]:
#         """Get workflow and agent status"""
#         return {
#             "workflow_ready": self.workflow is not None,
#             "agents_initialized": self.agents_initialized,
#             "agents": {
#                 "budget_policy_loader": self.budget_loader is not None,
#                 "expense_tracker": self.expense_tracker is not None,
#                 "breach_detector": self.breach_detector is not None,
#                 "correction_recommender": self.correction_recommender is not None,
#                 "escalation_communicator": self.escalation_communicator is not None
#             }
#         }

# # Global workflow instance
# _workflow_instance = None

# def get_workflow() -> SmartBudgetWorkflow:
#     """Get the global workflow instance"""
#     global _workflow_instance
#     if _workflow_instance is None:
#         _workflow_instance = SmartBudgetWorkflow()
#     return _workflow_instance

# def initialize_workflow(google_api_key: str, node_backend_url: str):
#     """Initialize the global workflow instance"""
#     global _workflow_instance
#     if _workflow_instance is None:
#         _workflow_instance = SmartBudgetWorkflow()
    
#     _workflow_instance.initialize_agents(google_api_key, node_backend_url)
#     _workflow_instance.build_workflow()
    
#     return _workflow_instance


"""
Smart Budget Enforcer - LangGraph Workflow - FIXED VERSION
Person Y Guide: This orchestrates all 5 AI agents using LangGraph
Person X: This is the brain that coordinates all the AI assistants
"""

import os
import logging
from typing import Dict, Any, List
from datetime import datetime

# LangGraph imports
from langgraph.graph import StateGraph, END

# Local imports
from models import AgentState, BudgetData, ExpenseData, RecommendationData
from agents import (
    BudgetPolicyLoaderAgent, 
    ExpenseTrackerAgent, 
    BreachDetectorAgent, 
    CorrectionRecommenderAgent, 
    EscalationCommunicatorAgent
)

logger = logging.getLogger(__name__)

class SmartBudgetWorkflow:
    """
    Person Y: Main workflow orchestrator using LangGraph
    This coordinates all 5 AI agents in sequence
    """
    
    def __init__(self):
        self.workflow = None
        self.agents_initialized = False
        self.budget_loader = None
        self.expense_tracker = None
        self.breach_detector = None
        self.correction_recommender = None
        self.escalation_communicator = None
        
    def initialize_agents(self, google_api_key: str, node_backend_url: str):
        """Initialize all AI agents"""
        try:
            logger.info("🤖 Initializing AI agents for workflow...")
            
            # Initialize each agent
            self.budget_loader = BudgetPolicyLoaderAgent(google_api_key)
            self.expense_tracker = ExpenseTrackerAgent()
            self.breach_detector = BreachDetectorAgent()
            self.correction_recommender = CorrectionRecommenderAgent(google_api_key)
            self.escalation_communicator = EscalationCommunicatorAgent(node_backend_url)
            
            self.agents_initialized = True
            logger.info("✅ All AI agents initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize agents: {e}")
            raise
    
    def build_workflow(self):
        """Build the LangGraph workflow with all 5 agents"""
        try:
            logger.info("🔧 Building LangGraph workflow...")
            
            # Create the state graph
            workflow = StateGraph(AgentState)
            
            # Add nodes for each agent
            workflow.add_node("budget_policy_loader", self._budget_policy_loader_node)
            workflow.add_node("expense_tracker", self._expense_tracker_node)
            workflow.add_node("breach_detector", self._breach_detector_node)
            workflow.add_node("correction_recommender", self._correction_recommender_node)
            workflow.add_node("escalation_communicator", self._escalation_communicator_node)
            
            # Define the workflow edges
            workflow.set_entry_point("budget_policy_loader")
            workflow.add_edge("budget_policy_loader", "expense_tracker")
            workflow.add_edge("expense_tracker", "breach_detector")
            workflow.add_edge("breach_detector", "correction_recommender")
            workflow.add_edge("correction_recommender", "escalation_communicator")
            workflow.add_edge("escalation_communicator", END)
            
            # Compile the workflow
            # ✅ FIXED: Remove checkpointer since we don't need persistent state
            self.workflow = workflow.compile()
            logger.info("✅ LangGraph workflow built successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to build workflow: {e}")
            raise
    
    def _budget_policy_loader_node(self, state: AgentState) -> AgentState:
        """✅ FIXED: Agent 1: Budget Policy Loader - Extract budget data from documents"""
        try:
            logger.info("🤖 Budget Policy Loader Agent starting...")
            state.processing_steps.append("Budget Policy Loader Agent started")
            
            if not self.budget_loader:
                raise ValueError("Budget Policy Loader agent not initialized")
            
            # ✅ FIXED: Call the correct method
            result_state = self.budget_loader.process_document(state)
            
            logger.info("✅ Budget Policy Loader Agent completed")
            return result_state
            
        except Exception as e:
            error_msg = f"❌ Budget Policy Loader error: {e}"
            logger.error(error_msg)
            state.errors.append(error_msg)
            return state
    
    def _expense_tracker_node(self, state: AgentState) -> AgentState:
        """✅ FIXED: Agent 2: Expense Tracker - Monitor budget usage"""
        try:
            logger.info("🤖 Expense Tracker Agent starting...")
            state.processing_steps.append("Expense Tracker Agent started")
            
            if not self.expense_tracker:
                raise ValueError("Expense Tracker agent not initialized")
            
            # ✅ FIXED: Call the correct method
            result_state = self.expense_tracker.process_expense_tracking(state)
            
            logger.info("✅ Expense Tracker Agent completed")
            return result_state
            
        except Exception as e:
            error_msg = f"❌ Expense Tracker error: {e}"
            logger.error(error_msg)
            state.errors.append(error_msg)
            return state
    
    def _breach_detector_node(self, state: AgentState) -> AgentState:
        """✅ FIXED: Agent 3: Breach Detector - Detect budget violations"""
        try:
            logger.info("🤖 Breach Detector Agent starting...")
            state.processing_steps.append("Breach Detector Agent started")
            
            if not self.breach_detector:
                raise ValueError("Breach Detector agent not initialized")
            
            # ✅ FIXED: Call the correct method
            result_state = self.breach_detector.process_breach_detection(state)
            
            logger.info("✅ Breach Detector Agent completed")
            return result_state
            
        except Exception as e:
            error_msg = f"❌ Breach Detector error: {e}"
            logger.error(error_msg)
            state.errors.append(error_msg)
            return state
    
    def _correction_recommender_node(self, state: AgentState) -> AgentState:
        """✅ FIXED: Agent 4: Correction Recommender - Generate AI recommendations"""
        try:
            logger.info("🤖 Correction Recommender Agent starting...")
            state.processing_steps.append("Correction Recommender Agent started")
            
            if not self.correction_recommender:
                raise ValueError("Correction Recommender agent not initialized")
            
            # ✅ FIXED: Call the correct method
            result_state = self.correction_recommender.process_correction_recommendations(state)
            
            logger.info("✅ Correction Recommender Agent completed")
            return result_state
            
        except Exception as e:
            error_msg = f"❌ Correction Recommender error: {e}"
            logger.error(error_msg)
            state.errors.append(error_msg)
            return state
    
    def _escalation_communicator_node(self, state: AgentState) -> AgentState:
        """✅ FIXED: Agent 5: Escalation Communicator - Send email alerts"""
        try:
            logger.info("🤖 Escalation Communicator Agent starting...")
            state.processing_steps.append("Escalation Communicator Agent started")
            
            if not self.escalation_communicator:
                raise ValueError("Escalation Communicator agent not initialized")
            
            # ✅ FIXED: Call the correct method
            result_state = self.escalation_communicator.process_escalation_communication(state)
            
            logger.info("✅ Escalation Communicator Agent completed")
            return result_state
            
        except Exception as e:
            error_msg = f"❌ Escalation Communicator error: {e}"
            logger.error(error_msg)
            state.errors.append(error_msg)
            return state
    
    def process_document_upload(self, file_path: str, user_id: str) -> Dict[str, Any]:
        """
        ✅ FIXED: Main entry point for document processing
        This runs the full 5-agent workflow
        """
        try:
            if not self.agents_initialized:
                raise ValueError("Agents not initialized. Call initialize_agents() first.")
            
            if not self.workflow:
                raise ValueError("Workflow not built. Call build_workflow() first.")
            
            logger.info(f"🚀 Starting document processing workflow for file: {file_path}")
            
            # ✅ FIXED: Create initial state with proper structure
            initial_state = AgentState(
                file_path=file_path,
                user_id=user_id,
                start_time=datetime.now(),
                structured_budget_data=[],  # Initialize as empty list
                processing_steps=[],
                errors=[],
                notifications_sent=[],
                recommendations=[]
            )
            
            # Run the workflow
            logger.info("🔄 Executing LangGraph workflow...")
            workflow_result = self.workflow.invoke(initial_state)
            
            # ✅ FIXED: Handle both AgentState and dict results from LangGraph
            if isinstance(workflow_result, dict):
                logger.info(f"📊 Workflow returned dict with keys: {list(workflow_result.keys())}")
                
                # Extract data from dict result
                budget_data = workflow_result.get('structured_budget_data', [])
                processing_steps = workflow_result.get('processing_steps', [])
                errors = workflow_result.get('errors', [])
                
            elif hasattr(workflow_result, 'structured_budget_data'):
                logger.info(f"📊 Workflow returned AgentState object")
                
                # Extract data from AgentState object
                budget_data = getattr(workflow_result, 'structured_budget_data', []) or []
                processing_steps = getattr(workflow_result, 'processing_steps', []) or []
                errors = getattr(workflow_result, 'errors', []) or []
                
            else:
                logger.error(f"❌ Workflow returned unexpected type: {type(workflow_result)}")
                return {
                    "success": False,
                    "error": f"Invalid workflow result type: {type(workflow_result)}",
                    "budget_count": 0,
                    "budget_data": [],
                    "processing_steps": []
                }
            
            logger.info(f"✅ Workflow completed. Budget items: {len(budget_data)}, Steps: {len(processing_steps)}, Errors: {len(errors)}")
            
            if errors:
                logger.error(f"❌ Workflow errors: {errors}")
                return {
                    "success": False,
                    "error": "; ".join(errors),
                    "budget_count": 0,
                    "budget_data": [],
                    "processing_steps": processing_steps
                }
            
            # ✅ FIXED: Convert BudgetData objects to dicts for JSON response
            budget_dicts = []
            if budget_data:
                for i, budget in enumerate(budget_data):
                    try:
                        if hasattr(budget, 'dict'):
                            budget_dicts.append(budget.dict())
                        elif hasattr(budget, '__dict__'):
                            budget_dicts.append(budget.__dict__)
                        elif isinstance(budget, dict):
                            budget_dicts.append(budget)
                        else:
                            logger.warning(f"⚠️ Unknown budget type at index {i}: {type(budget)}")
                    except Exception as e:
                        logger.warning(f"⚠️ Error converting budget {i} to dict: {e}")
                        continue
            
            # Ensure we have valid budget data
            if not budget_dicts:
                return {
                    "success": False,
                    "error": "No valid budget data extracted from document",
                    "budget_count": 0,
                    "budget_data": [],
                    "processing_steps": processing_steps
                }
            
            return {
                "success": True,
                "budget_count": len(budget_dicts),
                "budget_data": budget_dicts,
                "processing_steps": processing_steps,
                "message": f"Successfully processed document and extracted {len(budget_dicts)} budget items."
            }
            
        except Exception as e:
            logger.error(f"❌ Document processing workflow failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "budget_count": 0,
                "budget_data": [],
                "processing_steps": []
            }
    
    def process_expense_analysis(self, budget_data: List[Dict], expense_data: Dict, user_id: str) -> Dict[str, Any]:
        """
        Person Y: Process expense analysis through the workflow
        This is used for real-time expense monitoring
        """
        try:
            if not self.agents_initialized:
                raise ValueError("Agents not initialized")
            
            logger.info(f"💰 Processing expense analysis for user: {user_id}")
            
            # Create state with expense data
            initial_state = AgentState(
                user_id=user_id,
                expense_data=ExpenseData(**expense_data),
                start_time=datetime.now(),
                structured_budget_data=[],
                processing_steps=[],
                errors=[],
                notifications_sent=[],
                recommendations=[]
            )
            
            # Add budget data to state
            budget_objects = [BudgetData(**budget) for budget in budget_data]
            initial_state.structured_budget_data = budget_objects
            
            # Run workflow  
            result = self.workflow.invoke(initial_state)
            
            recommendations = result.recommendations or []
            notifications = result.notifications_sent or []
            
            return {
                "success": True,
                "recommendations": [rec.dict() if hasattr(rec, 'dict') else rec for rec in recommendations],
                "notifications_sent": notifications,
                "breach_detected": result.breach_detected
            }
            
        except Exception as e:
            logger.error(f"❌ Expense analysis failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "recommendations": []
            }
    
    def get_workflow_status(self) -> Dict[str, Any]:
        """Get workflow and agent status"""
        return {
            "workflow_ready": self.workflow is not None,
            "agents_initialized": self.agents_initialized,
            "agents": {
                "budget_policy_loader": self.budget_loader is not None,
                "expense_tracker": self.expense_tracker is not None,
                "breach_detector": self.breach_detector is not None,
                "correction_recommender": self.correction_recommender is not None,
                "escalation_communicator": self.escalation_communicator is not None
            }
        }

# Global workflow instance
_workflow_instance = None

def get_workflow() -> SmartBudgetWorkflow:
    """Get the global workflow instance"""
    global _workflow_instance
    if _workflow_instance is None:
        _workflow_instance = SmartBudgetWorkflow()
    return _workflow_instance

def initialize_workflow(google_api_key: str, node_backend_url: str):
    """✅ FIXED: Initialize the global workflow instance"""
    global _workflow_instance
    if _workflow_instance is None:
        _workflow_instance = SmartBudgetWorkflow()
    
    _workflow_instance.initialize_agents(google_api_key, node_backend_url)
    _workflow_instance.build_workflow()
    
    return _workflow_instance