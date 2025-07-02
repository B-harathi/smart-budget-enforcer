# # """
# # LangChain Correction Recommender Agent
# # Agent 4: AI-powered recommendation generation using LangChain tools and LLM
# # """

# # import json
# # import logging
# # from typing import Dict, Any, List, Optional
# # from langchain.schema import AgentAction, AgentFinish
# # from langchain.tools import BaseTool
# # from langchain_google_genai import ChatGoogleGenerativeAI
# # from langchain.prompts import PromptTemplate
# # from langchain_core.callbacks import CallbackManagerForToolRun
# # from models import AgentState, RecommendationData, RecommendationType

# # logger = logging.getLogger(__name__)

# # class BudgetAnalysisTool(BaseTool):
# #     """LangChain tool for analyzing budget patterns and usage"""
    
# #     name: str = "budget_analyzer"
# #     description: str = "Analyze budget data to identify spending patterns, risks, and opportunities"
    
# #     def _run(
# #         self,
# #         budget_data: str,
# #         expense_data: str,
# #         breach_context: str,
# #         llm = None,
# #         run_manager: Optional[CallbackManagerForToolRun] = None,
# #     ) -> str:
# #         """Analyze budget and expense data"""
# #         try:
# #             analysis_prompt = """You are an expert financial analyst specializing in budget optimization.

# # TASK: Analyze the provided budget and expense data to identify key insights.

# # ANALYSIS CONTEXT:
# # Budget Data: {budget_data}
# # Expense Data: {expense_data}
# # Breach Context: {breach_context}

# # ANALYSIS QUESTIONS:
# # 1. What are the main spending patterns?
# # 2. Which categories are at risk of exceeding budget?
# # 3. What are the root causes of budget issues?
# # 4. What opportunities exist for cost optimization?
# # 5. What immediate actions are needed?

# # Provide a structured analysis focusing on actionable insights.
# # """
            
# #             prompt = analysis_prompt.format(
# #                 budget_data=budget_data,
# #                 expense_data=expense_data,
# #                 breach_context=breach_context
# #             )
            
# #             if llm:
# #                 response = llm.invoke(prompt)
# #                 return response.content
# #             else:
# #                 return f"Analysis failed: No LLM available"
            
# #         except Exception as e:
# #             logger.error(f"❌ Budget analysis error: {e}")
# #             return f"Analysis failed: {str(e)}"

# # class RecommendationGeneratorTool(BaseTool):
# #     """LangChain tool for generating AI-powered recommendations"""
    
# #     name: str = "recommendation_generator"
# #     description: str = "Generate intelligent budget recommendations using AI analysis"
    
# #     def _run(
# #         self,
# #         analysis: str,
# #         budget_data: str,
# #         expense_data: str,
# #         breach_context: str,
# #         llm = None,
# #         run_manager: Optional[CallbackManagerForToolRun] = None,
# #     ) -> str:
# #         """Generate AI-powered recommendations"""
# #         try:
# #             recommendation_prompt = """You are an expert financial advisor and budget optimization specialist.

# # TASK: Generate specific, actionable budget recommendations based on the analysis.

# # CONTEXT:
# # Budget Analysis: {analysis}
# # Budget Data: {budget_data}
# # Expense Data: {expense_data}
# # Breach Context: {breach_context}

# # RECOMMENDATION REQUIREMENTS:
# # 1. Generate 3-5 specific, actionable recommendations
# # 2. Each recommendation must include:
# #    - Clear title
# #    - Detailed description with rationale
# #    - Estimated cost savings
# #    - Implementation priority (1=highest, 3=lowest)
# #    - Recommendation type (budget_reallocation, vendor_alternative, spending_pause, approval_request)

# # 3. Focus on:
# #    - Immediate cost savings
# #    - Long-term budget optimization
# #    - Risk mitigation
# #    - Process improvements

# # 4. Consider:
# #    - Current spending patterns
# #    - Budget constraints
# #    - Business impact
# #    - Implementation feasibility

# # RETURN FORMAT (JSON only):
# # [
# #   {
# #     "title": "Specific Recommendation Title",
# #     "description": "Detailed explanation with rationale and implementation steps",
# #     "type": "budget_reallocation",
# #     "priority": 1,
# #     "estimated_savings": 1000.0
# #   }
# # ]

# # Generate recommendations that are practical, specific, and immediately actionable.
# # """
            
# #             prompt = recommendation_prompt.format(
# #                 analysis=analysis,
# #                 budget_data=budget_data,
# #                 expense_data=expense_data,
# #                 breach_context=breach_context
# #             )
            
# #             if llm:
# #                 response = llm.invoke(prompt)
# #                 # Extract JSON from response
# #                 json_str = self._extract_json_from_response(response.content)
# #                 if json_str:
# #                     # Validate JSON
# #                     try:
# #                         recommendations = json.loads(json_str)
# #                         if isinstance(recommendations, list):
# #                             return json_str
# #                     except json.JSONDecodeError:
# #                         pass
# #             # Fallback to structured recommendations
# #             return self._generate_fallback_recommendations(analysis, breach_context)
# #         except Exception as e:
# #             logger.error(f"❌ Recommendation generation error: {e}")
# #             return "[]"
    
# #     def _extract_json_from_response(self, content: str) -> Optional[str]:
# #         """Extract JSON from LLM response"""
# #         import re
# #         try:
# #             # Look for JSON array in response
# #             json_match = re.search(r'\[.*\]', content, re.DOTALL)
# #             if json_match:
# #                 return json_match.group(0)
# #             return None
# #         except Exception:
# #             return None
    
# #     def _generate_fallback_recommendations(self, analysis: str, breach_context: str) -> str:
# #         """Generate fallback recommendations based on breach context"""
# #         try:
# #             breach_type = breach_context.get('type', 'threshold_warning')
# #             severity = breach_context.get('severity', 'medium')
            
# #             recommendations = []
            
# #             if breach_type == 'budget_exceeded':
# #                 recommendations.extend([
# #                     {
# #                         "title": "Immediate Spending Freeze",
# #                         "description": "Implement a temporary spending freeze on non-essential items to prevent further budget overruns",
# #                         "type": "spending_pause",
# #                         "priority": 1,
# #                         "estimated_savings": 500.0
# #                     },
# #                     {
# #                         "title": "Budget Reallocation Review",
# #                         "description": "Review and reallocate funds from underutilized categories to cover overages",
# #                         "type": "budget_reallocation",
# #                         "priority": 1,
# #                         "estimated_savings": 300.0
# #                     }
# #                 ])
# #             elif breach_type == 'threshold_warning':
# #                 recommendations.extend([
# #                     {
# #                         "title": "Proactive Cost Monitoring",
# #                         "description": "Implement enhanced monitoring and approval processes for upcoming expenses",
# #                         "type": "approval_request",
# #                         "priority": 2,
# #                         "estimated_savings": 200.0
# #                     },
# #                     {
# #                         "title": "Vendor Negotiation Initiative",
# #                         "description": "Contact current vendors to negotiate better rates or explore alternative suppliers",
# #                         "type": "vendor_alternative",
# #                         "priority": 2,
# #                         "estimated_savings": 150.0
# #                     }
# #                 ])
            
# #             # Add general optimization recommendation
# #             recommendations.append({
# #                 "title": "Process Optimization Review",
# #                 "description": "Review current spending processes and identify areas for efficiency improvements",
# #                 "type": "budget_reallocation",
# #                 "priority": 3,
# #                 "estimated_savings": 100.0
# #             })
            
# #             return json.dumps(recommendations)
            
# #         except Exception as e:
# #             logger.error(f"❌ Fallback recommendation error: {e}")
# #             return "[]"

# # class LangChainCorrectionRecommenderAgent:
# #     """LangChain agent for generating AI-powered budget recommendations"""
    
# #     def __init__(self, google_api_key: str):
# #         self.google_api_key = google_api_key
# #         self.is_mock_mode = google_api_key.startswith("mock_")
        
# #         if not self.is_mock_mode:
# #             # Initialize LLM
# #             self.llm = ChatGoogleGenerativeAI(
# #                 model="gemini-1.5-flash",
# #                 google_api_key=google_api_key,
# #                 temperature=0.3,
# #                 max_output_tokens=2048
# #             )
            
# #             # Initialize tools
# #             self.budget_analyzer = BudgetAnalysisTool()
# #             self.recommendation_generator = RecommendationGeneratorTool()
        
# #         logger.info("🤖 LangChain Correction Recommender Agent initialized")
    
# #     def execute(self, state: AgentState) -> AgentFinish:
# #         """Execute AI-powered recommendation generation"""
# #         try:
# #             logger.info("💡 Generating AI-powered budget recommendations...")
            
# #             if self.is_mock_mode:
# #                 logger.info("🔧 Using mock mode for development")
# #                 return self._generate_mock_recommendations()
            
# #             # Prepare data for analysis
# #             budget_data = self._format_budget_data(state.structured_budget_data)
# #             expense_data = self._format_expense_data(state.expense_data)
# #             breach_context = self._format_breach_context(state)
            
# #             # Step 1: Analyze budget patterns
# #             logger.info("📊 Step 1: Analyzing budget patterns...")
# #             analysis = self.budget_analyzer._run(
# #                 budget_data=budget_data,
# #                 expense_data=expense_data,
# #                 breach_context=breach_context,
# #                 llm=self.llm
# #             )
            
# #             # Step 2: Generate AI recommendations
# #             logger.info("🧠 Step 2: Generating AI recommendations...")
# #             recommendations_json = self.recommendation_generator._run(
# #                 analysis=analysis,
# #                 budget_data=budget_data,
# #                 expense_data=expense_data,
# #                 breach_context=breach_context,
# #                 llm=self.llm
# #             )
            
# #             # Parse recommendations
# #             try:
# #                 recommendations_data = json.loads(recommendations_json)
# #                 if not isinstance(recommendations_data, list):
# #                     recommendations_data = []
# #             except json.JSONDecodeError:
# #                 logger.warning("⚠️ Failed to parse recommendations JSON, using fallback")
# #                 recommendations_data = []
            
# #             logger.info(f"✅ Generated {len(recommendations_data)} AI recommendations")
            
# #             return AgentFinish(
# #                 return_values={
# #                     'recommendations': recommendations_data,
# #                     'analysis': analysis
# #                 },
# #                 log=f"AI recommendations generated successfully: {len(recommendations_data)} items"
# #             )
            
# #         except Exception as e:
# #             logger.error(f"❌ Correction recommender agent error: {e}")
# #             return AgentFinish(
# #                 return_values={'recommendations': []},
# #                 log=f"Recommendation generation failed: {str(e)}"
# #             )
    
# #     def _format_budget_data(self, budget_data: List) -> str:
# #         """Format budget data for analysis"""
# #         try:
# #             if not budget_data:
# #                 return "No budget data available"
            
# #             formatted = []
# #             for budget in budget_data:
# #                 if hasattr(budget, 'dict'):
# #                     budget_dict = budget.dict()
# #                 elif hasattr(budget, 'model_dump'):
# #                     budget_dict = budget.model_dump()
# #                 else:
# #                     budget_dict = budget.__dict__
                
# #                 formatted.append({
# #                     'name': budget_dict.get('name', 'Unknown'),
# #                     'department': budget_dict.get('department', 'Unknown'),
# #                     'category': budget_dict.get('category', 'Unknown'),
# #                     'amount': budget_dict.get('amount', 0),
# #                     'limit_amount': budget_dict.get('limit_amount', 0),
# #                     'warning_threshold': budget_dict.get('warning_threshold', 0),
# #                     'priority': str(budget_dict.get('priority', 'Medium'))
# #                 })
            
# #             return json.dumps(formatted, indent=2)
# #         except Exception as e:
# #             logger.error(f"❌ Budget data formatting error: {e}")
# #             return "Budget data formatting failed"
    
# #     def _format_expense_data(self, expense_data) -> str:
# #         """Format expense data for analysis"""
# #         try:
# #             if not expense_data:
# #                 return "No expense data available"
            
# #             if hasattr(expense_data, 'dict'):
# #                 expense_dict = expense_data.dict()
# #             elif hasattr(expense_data, 'model_dump'):
# #                 expense_dict = expense_data.model_dump()
# #             else:
# #                 expense_dict = expense_data.__dict__
            
# #             return json.dumps(expense_dict, indent=2)
# #         except Exception as e:
# #             logger.error(f"❌ Expense data formatting error: {e}")
# #             return "Expense data formatting failed"
    
# #     def _format_breach_context(self, state: AgentState) -> str:
# #         """Format breach context for analysis"""
# #         try:
# #             context = {
# #                 'breach_detected': getattr(state, 'breach_detected', False),
# #                 'breach_severity': getattr(state, 'breach_severity', 'none'),
# #                 'breach_context': getattr(state, 'breach_context', {})
# #             }
# #             return json.dumps(context, indent=2)
# #         except Exception as e:
# #             logger.error(f"❌ Breach context formatting error: {e}")
# #             return "Breach context formatting failed"
    
# #     def _generate_mock_recommendations(self) -> AgentFinish:
# #         """Generate mock recommendations for development"""
# #         mock_recommendations = [
# #             {
# #                 "title": "AI-Powered Budget Reallocation",
# #                 "description": "Based on spending patterns, reallocate 15% from underutilized categories to high-priority areas",
# #                 "type": "budget_reallocation",
# #                 "priority": 1,
# #                 "estimated_savings": 500.0
# #             },
# #             {
# #                 "title": "Vendor Optimization Strategy",
# #                 "description": "Negotiate with current vendors and explore alternative suppliers for better pricing",
# #                 "type": "vendor_alternative",
# #                 "priority": 2,
# #                 "estimated_savings": 200.0
# #             },
# #             {
# #                 "title": "Smart Spending Controls",
# #                 "description": "Implement automated approval workflows for expenses above threshold levels",
# #                 "type": "spending_pause",
# #                 "priority": 1,
# #                 "estimated_savings": 300.0
# #             }
# #         ]
        
# #         return AgentFinish(
# #             return_values={
# #                 'recommendations': mock_recommendations,
# #                 'analysis': 'Mock analysis for development mode'
# #             },
# #             log="Mock recommendations generated for development"
# #         )



# """
# Enhanced LangChain Correction Recommender Agent
# Agent 4: Advanced AI-powered recommendation generation with spending pattern analysis
# """

# import json
# import logging
# from typing import Dict, Any, List, Optional
# from datetime import datetime, timedelta
# from langchain.schema import AgentAction, AgentFinish
# from langchain.tools import BaseTool
# from langchain_google_genai import ChatGoogleGenerativeAI
# from langchain.prompts import PromptTemplate
# from langchain_core.callbacks import CallbackManagerForToolRun
# from models import AgentState, RecommendationData, RecommendationType

# logger = logging.getLogger(__name__)

# class SpendingPatternAnalyzerTool(BaseTool):
#     """Enhanced LangChain tool for deep spending pattern analysis"""
    
#     name: str = "spending_pattern_analyzer"
#     description: str = "Analyze historical spending patterns, trends, and anomalies to inform recommendations"
    
#     def _run(
#         self,
#         historical_data: str,
#         current_expense: str,
#         budget_context: str,
#         time_period: str = "3_months",
#         llm = None,
#         run_manager: Optional[CallbackManagerForToolRun] = None,
#     ) -> str:
#         """Analyze spending patterns with LLM intelligence"""
#         try:
#             pattern_analysis_prompt = """You are an expert financial data scientist specializing in spending pattern analysis and anomaly detection.

# TASK: Analyze the provided spending data to identify patterns, trends, and anomalies that will inform budget recommendations.

# ANALYSIS DATA:
# Historical Spending Data: {historical_data}
# Current Triggering Expense: {current_expense}
# Budget Context: {budget_context}
# Analysis Period: {time_period}

# ANALYSIS FRAMEWORK:
# 1. TREND ANALYSIS
#    - Spending velocity (increasing/decreasing/stable)
#    - Seasonal patterns and cyclical behavior
#    - Month-over-month growth rates
#    - Category-wise spending distribution changes

# 2. ANOMALY DETECTION
#    - Unusual transaction amounts or frequencies
#    - Vendor spending concentration risks
#    - Off-pattern spending behaviors
#    - Budget threshold breach patterns

# 3. PREDICTIVE INSIGHTS
#    - Projected spending for next 30/60/90 days
#    - Risk of future budget breaches
#    - Optimal spending allocation recommendations
#    - Cash flow impact analysis

# 4. CONTEXTUAL FACTORS
#    - Business seasonality effects
#    - Market conditions impact
#    - Operational necessity vs. discretionary spending
#    - Vendor relationship dependencies

# RETURN FORMAT (JSON only):
# {{
#   "spending_trends": {{
#     "overall_trend": "increasing/decreasing/stable/volatile",
#     "trend_percentage": 15.5,
#     "velocity_score": 7.2,
#     "trend_confidence": 0.85
#   }},
#   "anomaly_detection": [
#     {{
#       "type": "amount_spike/frequency_change/vendor_concentration/timing_irregular",
#       "description": "Detailed anomaly description",
#       "severity": "low/medium/high/critical",
#       "impact_estimate": 1500.0,
#       "recommendation": "Immediate action needed"
#     }}
#   ],
#   "seasonal_patterns": {{
#     "has_seasonality": true,
#     "peak_months": ["March", "December"],
#     "low_months": ["July", "August"],
#     "seasonal_variance": 25.3
#   }},
#   "predictive_analysis": {{
#     "30_day_projection": 12000.0,
#     "60_day_projection": 25000.0,
#     "90_day_projection": 38000.0,
#     "breach_probability": 0.75,
#     "days_to_breach": 45
#   }},
#   "vendor_analysis": {{
#     "top_vendors": [
#       {{
#         "name": "Vendor ABC",
#         "spending_share": 35.2,
#         "trend": "increasing",
#         "risk_level": "medium"
#       }}
#     ],
#     "concentration_risk": "high/medium/low",
#     "alternative_opportunities": ["Vendor diversification", "Contract renegotiation"]
#   }},
#   "category_insights": [
#     {{
#       "category": "Office Supplies",
#       "usage_efficiency": 0.72,
#       "optimization_potential": 1200.0,
#       "key_insight": "20% spending increase with no productivity gain"
#     }}
#   ],
#   "actionable_insights": [
#     "Immediate spending freeze on non-essential Office Supplies",
#     "Negotiate bulk discount with Vendor ABC for 15% savings",
#     "Implement approval workflow for expenses >$500"
#   ]
# }}

# Provide comprehensive analysis with specific, actionable insights for budget optimization."""
            
#             prompt = pattern_analysis_prompt.format(
#                 historical_data=historical_data,
#                 current_expense=current_expense,
#                 budget_context=budget_context,
#                 time_period=time_period
#             )
            
#             if llm:
#                 response = llm.invoke(prompt)
#                 json_str = self._extract_json_from_response(response.content)
#                 if json_str:
#                     try:
#                         analysis = json.loads(json_str)
#                         if isinstance(analysis, dict):
#                             return json_str
#                     except json.JSONDecodeError:
#                         pass
            
#             # Fallback to rule-based analysis
#             return self._rule_based_pattern_analysis(historical_data, current_expense)
            
#         except Exception as e:
#             logger.error(f"❌ Spending pattern analysis error: {e}")
#             return self._rule_based_pattern_analysis(historical_data, current_expense)
    
#     def _extract_json_from_response(self, content: str) -> Optional[str]:
#         """Extract JSON from LLM response"""
#         import re
#         try:
#             json_match = re.search(r'\{.*\}', content, re.DOTALL)
#             if json_match:
#                 return json_match.group(0)
#             return None
#         except Exception:
#             return None
    
#     def _rule_based_pattern_analysis(self, historical_data: str, current_expense: str) -> str:
#         """Fallback rule-based pattern analysis"""
#         try:
#             # Basic pattern analysis
#             analysis = {
#                 "spending_trends": {
#                     "overall_trend": "stable",
#                     "trend_percentage": 0.0,
#                     "velocity_score": 5.0,
#                     "trend_confidence": 0.6
#                 },
#                 "anomaly_detection": [],
#                 "seasonal_patterns": {
#                     "has_seasonality": False,
#                     "peak_months": [],
#                     "low_months": [],
#                     "seasonal_variance": 0.0
#                 },
#                 "predictive_analysis": {
#                     "30_day_projection": 10000.0,
#                     "60_day_projection": 20000.0,
#                     "90_day_projection": 30000.0,
#                     "breach_probability": 0.5,
#                     "days_to_breach": 60
#                 },
#                 "vendor_analysis": {
#                     "top_vendors": [],
#                     "concentration_risk": "medium",
#                     "alternative_opportunities": ["Review vendor contracts"]
#                 },
#                 "category_insights": [],
#                 "actionable_insights": [
#                     "Monitor spending closely",
#                     "Review vendor contracts quarterly",
#                     "Implement expense approval workflow"
#                 ]
#             }
            
#             return json.dumps(analysis)
            
#         except Exception as e:
#             logger.error(f"❌ Rule-based pattern analysis error: {e}")
#             return "{}"

# class SmartRecommendationGeneratorTool(BaseTool):
#     """Enhanced LangChain tool for generating intelligent, context-aware recommendations"""
    
#     name: str = "smart_recommendation_generator"
#     description: str = "Generate intelligent, actionable budget recommendations based on comprehensive analysis"
    
#     def _run(
#         self,
#         pattern_analysis: str,
#         budget_data: str,
#         expense_data: str,
#         breach_context: str,
#         company_context: str = "",
#         llm = None,
#         run_manager: Optional[CallbackManagerForToolRun] = None,
#     ) -> str:
#         """Generate smart recommendations using LLM"""
#         try:
#             recommendation_prompt = """You are an expert CFO and financial strategist with 20+ years of experience in budget optimization and cost management.

# TASK: Generate specific, actionable, and immediately implementable budget recommendations based on comprehensive financial analysis.

# COMPREHENSIVE CONTEXT:
# Pattern Analysis: {pattern_analysis}
# Budget Data: {budget_data}
# Current Expense: {expense_data}
# Breach Context: {breach_context}
# Company Context: {company_context}

# RECOMMENDATION REQUIREMENTS:
# 1. IMMEDIATE ACTIONS (Priority 1 - Critical)
#    - Actions needed within 24-48 hours
#    - Direct impact on current breach situation
#    - Minimal disruption to operations

# 2. SHORT-TERM OPTIMIZATIONS (Priority 2 - High)
#    - Actions for next 2-4 weeks
#    - Process improvements and vendor negotiations
#    - Budget reallocation opportunities

# 3. STRATEGIC INITIATIVES (Priority 3 - Medium)
#    - Long-term structural changes
#    - Policy improvements and system upgrades
#    - Preventive measures for future breaches

# RECOMMENDATION CATEGORIES:
# - budget_reallocation: Moving funds between categories
# - vendor_alternative: Switching to cost-effective vendors
# - spending_pause: Temporary spending freezes
# - approval_request: Enhanced approval processes
# - process_optimization: Workflow improvements
# - contract_renegotiation: Vendor contract updates

# FINANCIAL IMPACT ANALYSIS:
# - Calculate realistic savings estimates
# - Consider implementation costs
# - Account for business continuity risks
# - Include timeline for ROI realization

# RETURN FORMAT (JSON only):
# [
#   {{
#     "title": "Specific, Action-Oriented Title",
#     "description": "Detailed implementation plan with specific steps, timelines, and expected outcomes. Include who should implement, how to measure success, and potential risks.",
#     "type": "budget_reallocation",
#     "priority": 1,
#     "estimated_savings": 2500.0,
#     "implementation_timeline": "2-3 business days",
#     "implementation_steps": [
#       "Step 1: Contact vendor ABC to negotiate 15% discount",
#       "Step 2: Redirect $2000 from underutilized Marketing budget",
#       "Step 3: Implement approval workflow for expenses >$500"
#     ],
#     "success_metrics": [
#       "Monthly spending reduced by $2500",
#       "Approval compliance at 95%",
#       "Vendor cost reduction of 15%"
#     ],
#     "risk_factors": [
#       "Vendor relationship impact: Low",
#       "Operational disruption: Minimal",
#       "Implementation complexity: Medium"
#     ],
#     "responsible_party": "Finance Manager",
#     "follow_up_required": true,
#     "related_categories": ["Office Supplies", "Vendor Management"]
#   }}
# ]

# CRITICAL GUIDELINES:
# - Each recommendation must be specific and actionable
# - Include realistic savings estimates with justification
# - Consider operational impact and feasibility
# - Provide clear implementation steps
# - Address root causes, not just symptoms
# - Ensure recommendations align with business priorities

# Generate 3-5 high-quality recommendations that directly address the current situation while building long-term financial resilience."""
            
#             prompt = recommendation_prompt.format(
#                 pattern_analysis=pattern_analysis,
#                 budget_data=budget_data,
#                 expense_data=expense_data,
#                 breach_context=breach_context,
#                 company_context=company_context or "No specific company context provided"
#             )
            
#             if llm:
#                 response = llm.invoke(prompt)
#                 json_str = self._extract_json_from_response(response.content)
#                 if json_str:
#                     try:
#                         recommendations = json.loads(json_str)
#                         if isinstance(recommendations, list):
#                             return json_str
#                     except json.JSONDecodeError:
#                         pass
            
#             # Fallback to structured recommendations
#             return self._generate_fallback_recommendations(breach_context)
            
#         except Exception as e:
#             logger.error(f"❌ Smart recommendation generation error: {e}")
#             return "[]"
    
#     def _extract_json_from_response(self, content: str) -> Optional[str]:
#         """Extract JSON from LLM response"""
#         import re
#         try:
#             json_match = re.search(r'\[.*\]', content, re.DOTALL)
#             if json_match:
#                 return json_match.group(0)
#             return None
#         except Exception:
#             return None
    
#     def _generate_fallback_recommendations(self, breach_context: str) -> str:
#         """Generate fallback recommendations"""
#         try:
#             recommendations = [
#                 {
#                     "title": "Immediate Spending Review and Approval Process",
#                     "description": "Implement enhanced approval workflow for all expenses above $500. Require manager approval and business justification for non-essential spending to prevent further budget breaches.",
#                     "type": "approval_request",
#                     "priority": 1,
#                     "estimated_savings": 1500.0,
#                     "implementation_timeline": "1-2 business days",
#                     "implementation_steps": [
#                         "Configure approval workflow in expense system",
#                         "Notify all staff of new approval requirements",
#                         "Train managers on approval criteria"
#                     ],
#                     "success_metrics": [
#                         "100% compliance with approval process",
#                         "30% reduction in discretionary spending"
#                     ],
#                     "risk_factors": [
#                         "Process delay: Low",
#                         "Staff resistance: Medium"
#                     ],
#                     "responsible_party": "Finance Manager",
#                     "follow_up_required": True,
#                     "related_categories": ["Process Improvement"]
#                 },
#                 {
#                     "title": "Vendor Contract Renegotiation Initiative",
#                     "description": "Initiate immediate renegotiation with top 3 vendors to secure 10-15% cost reduction through volume discounts, extended payment terms, or service bundling.",
#                     "type": "vendor_alternative",
#                     "priority": 2,
#                     "estimated_savings": 2000.0,
#                     "implementation_timeline": "2-3 weeks",
#                     "implementation_steps": [
#                         "Identify top vendors by spending volume",
#                         "Prepare negotiation strategy and alternatives",
#                         "Schedule vendor meetings and present proposals"
#                     ],
#                     "success_metrics": [
#                         "10-15% cost reduction achieved",
#                         "Improved payment terms secured"
#                     ],
#                     "risk_factors": [
#                         "Vendor relationship impact: Medium",
#                         "Service quality risk: Low"
#                     ],
#                     "responsible_party": "Procurement Manager",
#                     "follow_up_required": True,
#                     "related_categories": ["Vendor Management"]
#                 }
#             ]
            
#             return json.dumps(recommendations)
            
#         except Exception as e:
#             logger.error(f"❌ Fallback recommendation error: {e}")
#             return "[]"

# class LangChainCorrectionRecommenderAgent:
#     """Enhanced LangChain agent for generating AI-powered budget recommendations with spending pattern analysis"""
    
#     def __init__(self, google_api_key: str):
#         self.google_api_key = google_api_key
#         self.is_mock_mode = google_api_key.startswith("mock_")
        
#         if not self.is_mock_mode:
#             # Initialize LLM with enhanced configuration
#             self.llm = ChatGoogleGenerativeAI(
#                 model="gemini-1.5-flash",
#                 google_api_key=google_api_key,
#                 temperature=0.4,  # Slightly higher for creative recommendations
#                 max_output_tokens=4096,  # Increased for detailed recommendations
#                 top_p=0.9,
#                 top_k=40
#             )
            
#             # Initialize enhanced tools
#             self.pattern_analyzer = SpendingPatternAnalyzerTool()
#             self.recommendation_generator = SmartRecommendationGeneratorTool()
        
#         logger.info("🤖 Enhanced LangChain Correction Recommender Agent initialized")
    
#     def execute(self, state: AgentState) -> AgentFinish:
#         """Execute enhanced AI-powered recommendation generation with pattern analysis"""
#         try:
#             logger.info("💡 Generating enhanced AI-powered budget recommendations...")
            
#             if self.is_mock_mode:
#                 logger.info("🔧 Using mock mode for development")
#                 return self._generate_mock_recommendations()
            
#             # Prepare comprehensive data for analysis
#             budget_data = self._format_budget_data(state.structured_budget_data)
#             expense_data = self._format_expense_data(state.expense_data)
#             breach_context = self._format_breach_context(state)
#             historical_data = self._get_historical_spending_data(state)
#             company_context = self._get_company_context(state)
            
#             # Step 1: Deep spending pattern analysis
#             logger.info("📊 Step 1: Performing deep spending pattern analysis...")
#             pattern_analysis = self.pattern_analyzer._run(
#                 historical_data=historical_data,
#                 current_expense=expense_data,
#                 budget_context=budget_data,
#                 time_period="3_months",
#                 llm=self.llm
#             )
            
#             # Step 2: Generate intelligent recommendations based on patterns
#             logger.info("🧠 Step 2: Generating intelligent recommendations...")
#             recommendations_json = self.recommendation_generator._run(
#                 pattern_analysis=pattern_analysis,
#                 budget_data=budget_data,
#                 expense_data=expense_data,
#                 breach_context=breach_context,
#                 company_context=company_context,
#                 llm=self.llm
#             )
            
#             # Parse and validate recommendations
#             try:
#                 recommendations_data = json.loads(recommendations_json)
#                 if not isinstance(recommendations_data, list):
#                     recommendations_data = []
                
#                 # Validate and enrich recommendations
#                 validated_recommendations = []
#                 for rec in recommendations_data:
#                     if self._validate_recommendation(rec):
#                         validated_recommendations.append(self._enrich_recommendation(rec))
                
#                 pattern_insights = json.loads(pattern_analysis) if pattern_analysis else {}
                
#             except json.JSONDecodeError:
#                 logger.warning("⚠️ Failed to parse recommendations JSON, using fallback")
#                 validated_recommendations = []
#                 pattern_insights = {}
            
#             logger.info(f"✅ Generated {len(validated_recommendations)} enhanced AI recommendations")
            
#             return AgentFinish(
#                 return_values={
#                     'recommendations': validated_recommendations,
#                     'pattern_analysis': pattern_insights,
#                     'analysis_metadata': {
#                         'analysis_date': datetime.now().isoformat(),
#                         'data_quality_score': self._calculate_data_quality_score(state),
#                         'confidence_level': self._calculate_confidence_level(validated_recommendations),
#                         'implementation_priority': self._determine_implementation_priority(validated_recommendations)
#                     }
#                 },
#                 log=f"Enhanced AI recommendations generated successfully: {len(validated_recommendations)} items"
#             )
            
#         except Exception as e:
#             logger.error(f"❌ Enhanced correction recommender agent error: {e}")
#             return AgentFinish(
#                 return_values={'recommendations': [], 'pattern_analysis': {}},
#                 log=f"Enhanced recommendation generation failed: {str(e)}"
#             )
    
#     def _get_historical_spending_data(self, state: AgentState) -> str:
#         """Get historical spending data for pattern analysis"""
#         try:
#             # In a real implementation, this would query historical expense data
#             # For now, return mock historical data structure
#             historical_data = {
#                 "time_period": "last_3_months",
#                 "total_expenses": [],
#                 "monthly_breakdown": {},
#                 "vendor_spending": {},
#                 "category_trends": {},
#                 "anomalies_detected": []
#             }
            
#             return json.dumps(historical_data)
#         except Exception as e:
#             logger.error(f"❌ Error getting historical data: {e}")
#             return "{}"
    
#     def _get_company_context(self, state: AgentState) -> str:
#         """Get company-specific context for recommendations"""
#         try:
#             # In a real implementation, this would include company policies, preferences, etc.
#             company_context = {
#                 "industry": "Technology",
#                 "company_size": "SMB",
#                 "fiscal_year": "Calendar Year",
#                 "budget_policies": {
#                     "approval_thresholds": {"small": 500, "medium": 2000, "large": 5000},
#                     "vendor_preferences": ["established_relationships", "cost_effectiveness"],
#                     "spending_philosophy": "conservative"
#                 },
#                 "seasonal_considerations": ["Q4_increased_spending", "Q1_budget_reset"]
#             }
            
#             return json.dumps(company_context)
#         except Exception as e:
#             logger.error(f"❌ Error getting company context: {e}")
#             return "{}"
    
#     def _validate_recommendation(self, rec: Dict[str, Any]) -> bool:
#         """Validate recommendation structure and content"""
#         required_fields = ['title', 'description', 'type', 'priority']
        
#         for field in required_fields:
#             if field not in rec or not rec[field]:
#                 return False
        
#         # Validate priority range
#         if not isinstance(rec.get('priority'), int) or rec['priority'] not in [1, 2, 3]:
#             return False
        
#         # Validate type
#         valid_types = ['budget_reallocation', 'vendor_alternative', 'spending_pause', 'approval_request', 'process_optimization', 'contract_renegotiation']
#         if rec.get('type') not in valid_types:
#             return False
        
#         return True
    
#     def _enrich_recommendation(self, rec: Dict[str, Any]) -> Dict[str, Any]:
#         """Enrich recommendation with additional metadata"""
#         enriched = rec.copy()
        
#         # Add timestamps
#         enriched['created_at'] = datetime.now().isoformat()
#         enriched['valid_until'] = (datetime.now() + timedelta(days=30)).isoformat()
        
#         # Add default values for missing fields
#         enriched.setdefault('estimated_savings', 0.0)
#         enriched.setdefault('implementation_timeline', 'To be determined')
#         enriched.setdefault('responsible_party', 'Finance Team')
#         enriched.setdefault('risk_level', 'Medium')
        
#         # Calculate recommendation score
#         enriched['recommendation_score'] = self._calculate_recommendation_score(rec)
        
#         return enriched
    
#     def _calculate_recommendation_score(self, rec: Dict[str, Any]) -> float:
#         """Calculate a score for recommendation prioritization"""
#         score = 0.0
        
#         # Priority weight (higher priority = higher score)
#         priority_weights = {1: 100, 2: 70, 3: 40}
#         score += priority_weights.get(rec.get('priority', 3), 40)
        
#         # Savings impact
#         savings = float(rec.get('estimated_savings', 0))
#         if savings > 5000:
#             score += 50
#         elif savings > 1000:
#             score += 30
#         elif savings > 500:
#             score += 15
        
#         # Implementation feasibility (shorter timeline = higher score)
#         timeline = rec.get('implementation_timeline', '').lower()
#         if 'day' in timeline and ('1' in timeline or '2' in timeline):
#             score += 30
#         elif 'week' in timeline:
#             score += 20
#         elif 'month' in timeline:
#             score += 10
        
#         return min(score, 200)  # Cap at 200
    
#     def _calculate_data_quality_score(self, state: AgentState) -> float:
#         """Calculate data quality score for analysis confidence"""
#         score = 0.0
#         max_score = 100.0
        
#         # Budget data completeness
#         if hasattr(state, 'structured_budget_data') and state.structured_budget_data:
#             score += 30
        
#         # Expense data availability
#         if hasattr(state, 'expense_data') and state.expense_data:
#             score += 25
        
#         # Breach context richness
#         if hasattr(state, 'breach_context') and state.breach_context:
#             score += 25
        
#         # Historical data presence (would be implemented with real data)
#         score += 20
        
#         return score
    
#     def _calculate_confidence_level(self, recommendations: List[Dict]) -> str:
#         """Calculate confidence level for recommendations"""
#         if not recommendations:
#             return "Low"
        
#         avg_score = sum(rec.get('recommendation_score', 0) for rec in recommendations) / len(recommendations)
        
#         if avg_score >= 150:
#             return "High"
#         elif avg_score >= 100:
#             return "Medium"
#         else:
#             return "Low"
    
#     def _determine_implementation_priority(self, recommendations: List[Dict]) -> str:
#         """Determine overall implementation priority"""
#         if not recommendations:
#             return "None"
        
#         priority_counts = {1: 0, 2: 0, 3: 0}
#         for rec in recommendations:
#             priority = rec.get('priority', 3)
#             priority_counts[priority] += 1
        
#         if priority_counts[1] > 0:
#             return "Critical"
#         elif priority_counts[2] > 0:
#             return "High"
#         else:
#             return "Medium"
    
#     # Keep existing methods for compatibility...
#     def _format_budget_data(self, budget_data: List) -> str:
#         """Format budget data for analysis"""
#         try:
#             if not budget_data:
#                 return "No budget data available"
            
#             formatted = []
#             for budget in budget_data:
#                 if hasattr(budget, 'dict'):
#                     budget_dict = budget.dict()
#                 elif hasattr(budget, 'model_dump'):
#                     budget_dict = budget.model_dump()
#                 else:
#                     budget_dict = budget.__dict__
                
#                 formatted.append({
#                     'name': budget_dict.get('name', 'Unknown'),
#                     'department': budget_dict.get('department', 'Unknown'),
#                     'category': budget_dict.get('category', 'Unknown'),
#                     'amount': budget_dict.get('amount', 0),
#                     'limit_amount': budget_dict.get('limit_amount', 0),
#                     'used_amount': budget_dict.get('used_amount', 0),
#                     'warning_threshold': budget_dict.get('warning_threshold', 0),
#                     'priority': str(budget_dict.get('priority', 'Medium'))
#                 })
            
#             return json.dumps(formatted, indent=2)
#         except Exception as e:
#             logger.error(f"❌ Budget data formatting error: {e}")
#             return "Budget data formatting failed"
    
#     def _format_expense_data(self, expense_data) -> str:
#         """Format expense data for analysis"""
#         try:
#             if not expense_data:
#                 return "No expense data available"
            
#             if hasattr(expense_data, 'dict'):
#                 expense_dict = expense_data.dict()
#             elif hasattr(expense_data, 'model_dump'):
#                 expense_dict = expense_data.model_dump()
#             else:
#                 expense_dict = expense_data.__dict__
            
#             return json.dumps(expense_dict, indent=2)
#         except Exception as e:
#             logger.error(f"❌ Expense data formatting error: {e}")
#             return "Expense data formatting failed"
    
#     def _format_breach_context(self, state: AgentState) -> str:
#         """Format breach context for analysis"""
#         try:
#             context = {
#                 'breach_detected': getattr(state, 'breach_detected', False),
#                 'breach_severity': getattr(state, 'breach_severity', 'none'),
#                 'breach_context': getattr(state, 'breach_context', {})
#             }
#             return json.dumps(context, indent=2)
#         except Exception as e:
#             logger.error(f"❌ Breach context formatting error: {e}")
#             return "Breach context formatting failed"
    
#     def _generate_mock_recommendations(self) -> AgentFinish:
#         """Generate enhanced mock recommendations for development"""
#         mock_recommendations = [
#             {
#                 "title": "AI-Optimized Budget Reallocation Strategy",
#                 "description": "Based on spending pattern analysis, reallocate 20% from underutilized Marketing budget to high-priority Operations category. Historical data shows Operations consistently over budget while Marketing remains 40% underutilized.",
#                 "type": "budget_reallocation",
#                 "priority": 1,
#                 "estimated_savings": 1500.0,
#                 "implementation_timeline": "2-3 business days",
#                 "implementation_steps": [
#                     "Review Marketing budget utilization over last 3 months",
#                     "Transfer $1500 from Marketing to Operations budget",
#                     "Update approval workflows for both categories"
#                 ],
#                 "success_metrics": [
#                     "Operations budget compliance improved to 95%",
#                     "No impact on Marketing deliverables"
#                 ],
#                 "risk_factors": [
#                     "Marketing team concerns: Low",
#                     "Process disruption: Minimal"
#                 ],
#                 "responsible_party": "Finance Manager",
#                 "follow_up_required": True,
#                 "related_categories": ["Marketing", "Operations"],
#                 "recommendation_score": 175.0,
#                 "created_at": datetime.now().isoformat()
#             },
#             {
#                 "title": "Vendor Diversification and Cost Optimization",
#                 "description": "Analysis reveals 60% spending concentration with single vendor. Implement vendor diversification strategy and negotiate volume discounts to reduce costs by 12-15%.",
#                 "type": "vendor_alternative",
#                 "priority": 2,
#                 "estimated_savings": 800.0,
#                 "implementation_timeline": "2-3 weeks",
#                 "implementation_steps": [
#                     "Identify 2-3 alternative vendors for key categories",
#                     "Request competitive quotes and proposals",
#                     "Negotiate volume discounts with current vendor",
#                     "Implement phased vendor transition plan"
#                 ],
#                 "success_metrics": [
#                     "12-15% cost reduction achieved",
#                     "Vendor risk diversification completed",
#                     "Service quality maintained"
#                 ],
#                 "risk_factors": [
#                     "Vendor relationship impact: Medium",
#                     "Service transition risk: Low"
#                 ],
#                 "responsible_party": "Procurement Team",
#                 "follow_up_required": True,
#                 "related_categories": ["Vendor Management"],
#                 "recommendation_score": 145.0,
#                 "created_at": datetime.now().isoformat()
#             },
#             {
#                 "title": "Smart Expense Approval Workflow Implementation",
#                 "description": "Deploy AI-enhanced approval workflow with dynamic thresholds based on spending patterns. Reduce manual approvals by 40% while improving budget compliance.",
#                 "type": "process_optimization",
#                 "priority": 1,
#                 "estimated_savings": 600.0,
#                 "implementation_timeline": "1 week",
#                 "implementation_steps": [
#                     "Configure smart approval rules in expense system",
#                     "Set dynamic approval thresholds by category",
#                     "Train staff on new approval process",
#                     "Implement AI-powered expense categorization"
#                 ],
#                 "success_metrics": [
#                     "40% reduction in manual approvals",
#                     "95% budget compliance rate",
#                     "50% faster expense processing"
#                 ],
#                 "risk_factors": [
#                     "User adoption: Medium",
#                     "System complexity: Low"
#                 ],
#                 "responsible_party": "IT and Finance Teams",
#                 "follow_up_required": True,
#                 "related_categories": ["Process Improvement"],
#                 "recommendation_score": 165.0,
#                 "created_at": datetime.now().isoformat()
#             }
#         ]
        
#         pattern_analysis = {
#             "spending_trends": {
#                 "overall_trend": "increasing",
#                 "trend_percentage": 12.5,
#                 "velocity_score": 7.8,
#                 "trend_confidence": 0.92
#             },
#             "anomaly_detection": [
#                 {
#                     "type": "vendor_concentration",
#                     "description": "60% of spending concentrated with single vendor",
#                     "severity": "medium",
#                     "impact_estimate": 2000.0,
#                     "recommendation": "Implement vendor diversification strategy"
#                 }
#             ],
#             "predictive_analysis": {
#                 "30_day_projection": 15000.0,
#                 "60_day_projection": 32000.0,
#                 "90_day_projection": 48000.0,
#                 "breach_probability": 0.85,
#                 "days_to_breach": 22
#             }
#         }
        
#         return AgentFinish(
#             return_values={
#                 'recommendations': mock_recommendations,
#                 'pattern_analysis': pattern_analysis,
#                 'analysis_metadata': {
#                     'analysis_date': datetime.now().isoformat(),
#                     'data_quality_score': 85.0,
#                     'confidence_level': 'High',
#                     'implementation_priority': 'Critical'
#                 }
#             },
#             log="Enhanced mock recommendations generated for development"
#         )



"""
Enhanced LangChain Correction Recommender Agent
Agent 4: Advanced AI-powered recommendation generation with email integration support
UPDATED: Now generates recommendations optimized for email display
"""

import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from langchain.schema import AgentAction, AgentFinish
from langchain.tools import BaseTool
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain_core.callbacks import CallbackManagerForToolRun
from models import AgentState, RecommendationData, RecommendationType

logger = logging.getLogger(__name__)

class EmailOptimizedRecommendationGeneratorTool(BaseTool):
    """Enhanced LangChain tool for generating email-optimized AI recommendations"""
    
    name: str = "email_optimized_recommendation_generator"
    description: str = "Generate intelligent, email-friendly budget recommendations with detailed implementation guidance"
    
    def _run(
        self,
        budget_data: str,
        expense_data: str,
        breach_context: str,
        user_context: str = "",
        llm = None,
        run_manager: Optional[CallbackManagerForToolRun] = None,
    ) -> str:
        """Generate email-optimized recommendations using LLM"""
        try:
            recommendation_prompt = """You are an expert CFO and financial strategist specializing in budget optimization and crisis management.

TASK: Generate specific, actionable budget recommendations optimized for email delivery and immediate implementation.

CONTEXT:
Budget Data: {budget_data}
Triggering Expense: {expense_data}
Breach Context: {breach_context}
User Context: {user_context}

EMAIL OPTIMIZATION REQUIREMENTS:
- Clear, scannable titles that grab attention
- Concise but comprehensive descriptions
- Action-oriented language
- Specific implementation steps
- Realistic timelines and savings estimates
- Clear priority levels for decision making

RECOMMENDATION CATEGORIES (choose most appropriate):
- budget_reallocation: Moving funds between categories
- vendor_alternative: Switching suppliers or renegotiating contracts  
- spending_pause: Temporary spending freezes or controls
- approval_request: Enhanced approval processes
- process_optimization: Workflow and policy improvements
- contract_renegotiation: Vendor contract updates

PRIORITY LEVELS:
- Priority 1 (Critical): Immediate action required within 24-48 hours
- Priority 2 (High): Action needed within 1-2 weeks  
- Priority 3 (Medium): Strategic improvements for next month

RETURN FORMAT (JSON only):
[
  {{
    "title": "Immediate Budget Reallocation - Office Supplies",
    "description": "Transfer $2,000 from underutilized Marketing budget to Operations to cover immediate overage. Marketing budget shows only 45% utilization while Operations is 120% over budget. This reallocation will restore budget compliance while maintaining all planned marketing activities.",
    "type": "budget_reallocation",
    "priority": 1,
    "estimated_savings": 2000.0,
    "implementation_timeline": "24-48 hours",
    "implementation_steps": [
      "Review Marketing budget utilization reports for Q4",
      "Get approval from Marketing Manager for $2,000 transfer",
      "Execute budget transfer in financial system",
      "Update approval thresholds for Operations category",
      "Notify Operations team of restored budget availability"
    ],
    "success_metrics": [
      "Operations budget compliance restored to 100%",
      "No disruption to planned Marketing activities", 
      "Approval process delays reduced by 50%"
    ],
    "risk_factors": [
      "Marketing team coordination required: Low risk",
      "Future Marketing needs: Monitor quarterly",
      "Operations spending discipline: Medium risk"
    ],
    "responsible_party": "Finance Manager with Operations approval",
    "follow_up_required": true,
    "related_categories": ["Operations", "Marketing"],
    "confidence_score": 0.92
  }}
]

CRITICAL GUIDELINES FOR EMAIL OPTIMIZATION:
1. Titles must be specific and action-oriented (not generic)
2. Descriptions should tell a story: problem → solution → outcome
3. Include specific dollar amounts and percentages where possible
4. Implementation steps should be actionable by real people
5. Success metrics must be measurable and realistic
6. Risk factors should be honest but not alarmist
7. Timelines must be achievable given organizational constraints

Generate 3-5 high-impact recommendations that a busy executive can quickly understand and act upon via email."""
            
            prompt = recommendation_prompt.format(
                budget_data=budget_data,
                expense_data=expense_data,
                breach_context=breach_context,
                user_context=user_context or "Standard business context"
            )
            
            if llm:
                response = llm.invoke(prompt)
                json_str = self._extract_json_from_response(response.content)
                if json_str:
                    try:
                        recommendations = json.loads(json_str)
                        if isinstance(recommendations, list):
                            # Validate and enhance each recommendation
                            enhanced_recommendations = []
                            for rec in recommendations:
                                if self._validate_email_recommendation(rec):
                                    enhanced_rec = self._enhance_for_email(rec)
                                    enhanced_recommendations.append(enhanced_rec)
                            
                            if enhanced_recommendations:
                                return json.dumps(enhanced_recommendations)
                    except json.JSONDecodeError as e:
                        logger.warning(f"⚠️ JSON parsing error: {e}")
            
            # Fallback to structured recommendations
            return self._generate_email_optimized_fallback(breach_context)
            
        except Exception as e:
            logger.error(f"❌ Email-optimized recommendation generation error: {e}")
            return self._generate_email_optimized_fallback(breach_context)
    
    def _extract_json_from_response(self, content: str) -> Optional[str]:
        """Extract JSON from LLM response"""
        import re
        try:
            # Look for JSON array in response
            json_match = re.search(r'\[.*\]', content, re.DOTALL)
            if json_match:
                return json_match.group(0)
            return None
        except Exception:
            return None
    
    def _validate_email_recommendation(self, rec: Dict[str, Any]) -> bool:
        """Validate recommendation for email optimization"""
        required_fields = ['title', 'description', 'type', 'priority']
        
        # Check required fields
        for field in required_fields:
            if field not in rec or not rec[field]:
                return False
        
        # Validate title length (should be descriptive but not too long)
        if len(rec['title']) < 10 or len(rec['title']) > 80:
            return False
        
        # Validate description (should be substantial but not overwhelming)
        if len(rec['description']) < 50 or len(rec['description']) > 500:
            return False
        
        # Validate priority
        if not isinstance(rec.get('priority'), int) or rec['priority'] not in [1, 2, 3]:
            return False
        
        return True
    
    def _enhance_for_email(self, rec: Dict[str, Any]) -> Dict[str, Any]:
        """Enhance recommendation for email display"""
        enhanced = rec.copy()
        
        # Add email-specific metadata
        enhanced['email_optimized'] = True
        enhanced['created_for_email'] = datetime.now().isoformat()
        
        # Ensure all email-friendly fields are present with defaults
        enhanced.setdefault('implementation_timeline', 'To be determined')
        enhanced.setdefault('implementation_steps', ['Contact Finance team for implementation'])
        enhanced.setdefault('success_metrics', ['Implementation completed successfully'])
        enhanced.setdefault('risk_factors', ['Standard implementation risks'])
        enhanced.setdefault('responsible_party', 'Finance Team')
        enhanced.setdefault('follow_up_required', True)
        enhanced.setdefault('related_categories', [])
        enhanced.setdefault('confidence_score', 0.8)
        
        # Format estimated savings
        if 'estimated_savings' in enhanced:
            enhanced['estimated_savings'] = float(enhanced['estimated_savings'])
        
        return enhanced
    
    def _generate_email_optimized_fallback(self, breach_context: str) -> str:
        """Generate email-optimized fallback recommendations"""
        try:
            # Parse breach context to determine appropriate fallback
            breach_info = json.loads(breach_context) if isinstance(breach_context, str) else breach_context
            breach_type = breach_info.get('type', 'budget_exceeded') if isinstance(breach_info, dict) else 'budget_exceeded'
            
            recommendations = []
            
            if breach_type == 'budget_exceeded':
                recommendations.extend([
                    {
                        "title": "Emergency Spending Freeze - Non-Essential Items",
                        "description": "Implement immediate 48-hour spending freeze on all non-essential purchases to prevent further budget deterioration. This temporary measure will provide time to analyze the situation and implement strategic solutions while maintaining critical operations.",
                        "type": "spending_pause",
                        "priority": 1,
                        "estimated_savings": 1000.0,
                        "implementation_timeline": "Immediate (within 2 hours)",
                        "implementation_steps": [
                            "Send company-wide spending freeze notification",
                            "Create emergency approval process for critical expenses",
                            "Designate Finance Manager as approval authority",
                            "Set up daily spending review meetings",
                            "Plan strategic review for 48-hour mark"
                        ],
                        "success_metrics": [
                            "Zero non-essential spending for 48 hours",
                            "All critical operations maintained",
                            "Emergency approval process operational"
                        ],
                        "risk_factors": [
                            "Employee compliance: Monitor closely",
                            "Critical purchase delays: Low risk with approval process",
                            "Vendor relationship impact: Minimal for 48-hour period"
                        ],
                        "responsible_party": "Finance Manager with executive support",
                        "follow_up_required": True,
                        "related_categories": ["All Departments"],
                        "confidence_score": 0.95,
                        "email_optimized": True
                    },
                    {
                        "title": "Urgent Budget Reallocation from Underutilized Categories",
                        "description": "Identify and reallocate funds from departments with less than 70% budget utilization to cover current overage. Analysis of spending patterns typically reveals 15-20% of budgets are underutilized and can be safely reallocated without operational impact.",
                        "type": "budget_reallocation",
                        "priority": 1,
                        "estimated_savings": 2500.0,
                        "implementation_timeline": "24-48 hours",
                        "implementation_steps": [
                            "Generate utilization report for all budget categories",
                            "Identify categories with <70% utilization",
                            "Contact department heads for reallocation approval",
                            "Execute budget transfers in financial system",
                            "Update spending limits and approval thresholds"
                        ],
                        "success_metrics": [
                            "Budget compliance restored to 100%",
                            "No operational impact on contributing departments",
                            "Improved overall budget utilization efficiency"
                        ],
                        "risk_factors": [
                            "Department cooperation: Schedule meetings immediately",
                            "Future needs of contributing departments: Quarterly review",
                            "System implementation complexity: Low"
                        ],
                        "responsible_party": "Finance Manager with Department Head coordination",
                        "follow_up_required": True,
                        "related_categories": ["Cross-departmental"],
                        "confidence_score": 0.88,
                        "email_optimized": True
                    }
                ])
            else:
                # Threshold warning recommendations
                recommendations.extend([
                    {
                        "title": "Enhanced Approval Workflow - Expenses Over $500",
                        "description": "Implement immediate approval requirement for all expenses over $500 to prevent budget breach. This proactive measure will slow spending velocity while maintaining operational flexibility for smaller, routine expenses.",
                        "type": "approval_request",
                        "priority": 2,
                        "estimated_savings": 800.0,
                        "implementation_timeline": "2-4 hours",
                        "implementation_steps": [
                            "Configure $500 approval threshold in expense system",
                            "Notify all staff of new approval requirements",
                            "Train managers on approval criteria and process",
                            "Set up automated approval routing",
                            "Create approval tracking dashboard"
                        ],
                        "success_metrics": [
                            "100% compliance with new approval process",
                            "Average approval time under 4 hours",
                            "25-30% reduction in discretionary spending"
                        ],
                        "risk_factors": [
                            "Process adoption: Provide clear training",
                            "Approval delays: Set 4-hour SLA",
                            "Staff resistance: Emphasize temporary nature"
                        ],
                        "responsible_party": "Finance Manager with IT support",
                        "follow_up_required": True,
                        "related_categories": ["Process Improvement"],
                        "confidence_score": 0.92,
                        "email_optimized": True
                    }
                ])
            
            return json.dumps(recommendations)
            
        except Exception as e:
            logger.error(f"❌ Fallback recommendation error: {e}")
            return "[]"

class LangChainCorrectionRecommenderAgent:
    """Enhanced LangChain agent with email-optimized AI recommendations"""
    
    def __init__(self, google_api_key: str):
        self.google_api_key = google_api_key
        self.is_mock_mode = google_api_key.startswith("mock_")
        
        if not self.is_mock_mode:
            # Initialize LLM with enhanced configuration for email optimization
            self.llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                google_api_key=google_api_key,
                temperature=0.3,  # Lower temperature for more consistent email formatting
                max_output_tokens=4096,
                top_p=0.8,
                top_k=40
            )
            
            # Initialize email-optimized recommendation generator
            self.email_recommendation_generator = EmailOptimizedRecommendationGeneratorTool()
        
        logger.info("🤖 Enhanced LangChain Correction Recommender Agent (Email-Optimized) initialized")
    
    def execute(self, state: AgentState) -> AgentFinish:
        """Execute email-optimized AI-powered recommendation generation"""
        try:
            logger.info("💡 Generating email-optimized AI recommendations...")
            
            if self.is_mock_mode:
                logger.info("🔧 Using email-optimized mock mode for development")
                return self._generate_email_optimized_mock_recommendations()
            
            # Prepare comprehensive data for email-optimized analysis
            budget_data = self._format_budget_data(state.structured_budget_data)
            expense_data = self._format_expense_data(state.expense_data)
            breach_context = self._format_breach_context(state)
            user_context = self._get_user_context(state)
            
            # Generate email-optimized recommendations
            logger.info("📧 Generating email-optimized recommendations...")
            recommendations_json = self.email_recommendation_generator._run(
                budget_data=budget_data,
                expense_data=expense_data,
                breach_context=breach_context,
                user_context=user_context,
                llm=self.llm
            )
            
            # Parse and validate recommendations
            try:
                recommendations_data = json.loads(recommendations_json)
                if not isinstance(recommendations_data, list):
                    recommendations_data = []
                
                # Additional validation for email optimization
                email_ready_recommendations = []
                for rec in recommendations_data:
                    if self._final_email_validation(rec):
                        email_ready_recommendations.append(rec)
                
            except json.JSONDecodeError:
                logger.warning("⚠️ Failed to parse email-optimized recommendations, using fallback")
                email_ready_recommendations = []
            
            logger.info(f"✅ Generated {len(email_ready_recommendations)} email-optimized AI recommendations")
            
            return AgentFinish(
                return_values={
                    'recommendations': email_ready_recommendations,
                    'email_optimized': True,
                    'analysis_metadata': {
                        'email_ready': True,
                        'generation_date': datetime.now().isoformat(),
                        'optimization_level': 'email_enhanced',
                        'confidence_level': self._calculate_confidence_level(email_ready_recommendations)
                    }
                },
                log=f"Email-optimized AI recommendations generated successfully: {len(email_ready_recommendations)} items"
            )
            
        except Exception as e:
            logger.error(f"❌ Email-optimized correction recommender agent error: {e}")
            return AgentFinish(
                return_values={'recommendations': [], 'email_optimized': False},
                log=f"Email-optimized recommendation generation failed: {str(e)}"
            )
    
    def _get_user_context(self, state: AgentState) -> str:
        """Get user context for email-optimized recommendations"""
        try:
            context = {
                "organization_type": "business",
                "communication_preference": "email_optimized",
                "urgency_level": "high" if getattr(state, 'breach_detected', False) else "medium",
                "decision_maker_level": "manager_executive"
            }
            return json.dumps(context)
        except Exception as e:
            logger.error(f"❌ Error getting user context: {e}")
            return "{}"
    
    def _final_email_validation(self, rec: Dict[str, Any]) -> bool:
        """Final validation for email readiness"""
        try:
            # Check that all email-optimized fields are present
            email_fields = ['implementation_steps', 'success_metrics', 'risk_factors', 'responsible_party']
            for field in email_fields:
                if field not in rec:
                    return False
                
                # Ensure lists have content
                if isinstance(rec[field], list) and len(rec[field]) == 0:
                    return False
            
            # Validate that priority is appropriate for email urgency
            if rec.get('priority') not in [1, 2, 3]:
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Final email validation error: {e}")
            return False
    
    def _calculate_confidence_level(self, recommendations: List[Dict]) -> str:
        """Calculate confidence level for email-optimized recommendations"""
        if not recommendations:
            return "Low"
        
        # Check for email optimization features
        email_optimized_count = sum(1 for rec in recommendations if rec.get('email_optimized', False))
        avg_confidence = sum(rec.get('confidence_score', 0.8) for rec in recommendations) / len(recommendations)
        
        if email_optimized_count == len(recommendations) and avg_confidence >= 0.9:
            return "High"
        elif email_optimized_count >= len(recommendations) * 0.7 and avg_confidence >= 0.8:
            return "Medium"
        else:
            return "Low"
    
    # Keep existing methods for compatibility...
    def _format_budget_data(self, budget_data: List) -> str:
        """Format budget data for email-optimized analysis"""
        try:
            if not budget_data:
                return "No budget data available"
            
            formatted = []
            for budget in budget_data:
                if hasattr(budget, 'dict'):
                    budget_dict = budget.dict()
                elif hasattr(budget, 'model_dump'):
                    budget_dict = budget.model_dump()
                else:
                    budget_dict = budget.__dict__
                
                formatted.append({
                    'name': budget_dict.get('name', 'Unknown'),
                    'department': budget_dict.get('department', 'Unknown'),
                    'category': budget_dict.get('category', 'Unknown'),
                    'amount': budget_dict.get('amount', 0),
                    'limit_amount': budget_dict.get('limit_amount', 0),
                    'used_amount': budget_dict.get('used_amount', 0),
                    'usage_percentage': (budget_dict.get('used_amount', 0) / budget_dict.get('limit_amount', 1)) * 100,
                    'warning_threshold': budget_dict.get('warning_threshold', 0),
                    'priority': str(budget_dict.get('priority', 'Medium'))
                })
            
            return json.dumps(formatted, indent=2)
        except Exception as e:
            logger.error(f"❌ Budget data formatting error: {e}")
            return "Budget data formatting failed"
    
    def _format_expense_data(self, expense_data) -> str:
        """Format expense data for email-optimized analysis"""
        try:
            if not expense_data:
                return "No expense data available"
            
            if hasattr(expense_data, 'dict'):
                expense_dict = expense_data.dict()
            elif hasattr(expense_data, 'model_dump'):
                expense_dict = expense_data.model_dump()
            else:
                expense_dict = expense_data.__dict__
            
            return json.dumps(expense_dict, indent=2)
        except Exception as e:
            logger.error(f"❌ Expense data formatting error: {e}")
            return "Expense data formatting failed"
    
    def _format_breach_context(self, state: AgentState) -> str:
        """Format breach context for email-optimized analysis"""
        try:
            context = {
                'breach_detected': getattr(state, 'breach_detected', False),
                'breach_severity': getattr(state, 'breach_severity', 'none'),
                'breach_context': getattr(state, 'breach_context', {}),
                'email_notification_required': True,
                'urgency_level': 'high' if getattr(state, 'breach_detected', False) else 'medium'
            }
            return json.dumps(context, indent=2)
        except Exception as e:
            logger.error(f"❌ Breach context formatting error: {e}")
            return "Breach context formatting failed"
    
    def _generate_email_optimized_mock_recommendations(self) -> AgentFinish:
        """Generate email-optimized mock recommendations for development"""
        mock_recommendations = [
            {
                "title": "Emergency Budget Reallocation - Marketing to Operations",
                "description": "Transfer $3,000 from underutilized Marketing budget (currently at 55% usage) to Operations which has exceeded budget by $2,800. This reallocation will restore Operations budget compliance while preserving all planned Marketing activities for Q4.",
                "type": "budget_reallocation",
                "priority": 1,
                "estimated_savings": 3000.0,
                "implementation_timeline": "24 hours",
                "implementation_steps": [
                    "Review Marketing Q4 spending plan with Marketing Manager",
                    "Confirm $3,000 can be safely reallocated without impact",
                    "Get formal approval from Marketing Manager and CFO",
                    "Execute budget transfer in financial management system",
                    "Update Operations approval thresholds and notify team",
                    "Schedule follow-up review in 30 days"
                ],
                "success_metrics": [
                    "Operations budget restored to 98% utilization",
                    "No delay or cancellation of Marketing initiatives",
                    "Approval processing time reduced from 3 days to 4 hours"
                ],
                "risk_factors": [
                    "Marketing Q4 surge needs: Low risk with current projections",
                    "Operations spending discipline: Medium risk - implement monitoring",
                    "Cross-department coordination: Low risk with clear communication"
                ],
                "responsible_party": "Finance Manager with Marketing & Operations Manager approval",
                "follow_up_required": True,
                "related_categories": ["Marketing", "Operations"],
                "confidence_score": 0.95,
                "email_optimized": True,
                "created_for_email": datetime.now().isoformat()
            },
            {
                "title": "Vendor Contract Renegotiation - Office Supplies",
                "description": "Immediately contact our top 3 office supply vendors to negotiate 12-15% cost reduction through bulk ordering and extended payment terms. Current analysis shows we're paying 18% above market rate due to outdated contracts from 2022.",
                "type": "vendor_alternative",
                "priority": 2,
                "estimated_savings": 1800.0,
                "implementation_timeline": "7-10 business days",
                "implementation_steps": [
                    "Compile current spending data by vendor for last 6 months",
                    "Research current market rates for office supplies",
                    "Schedule renegotiation meetings with top 3 vendors",
                    "Prepare negotiation strategy with target 15% reduction",
                    "Execute contract amendments with legal review",
                    "Implement new pricing in procurement system"
                ],
                "success_metrics": [
                    "Achieve 12-15% cost reduction on office supplies",
                    "Secure improved payment terms (Net 45 vs Net 30)",
                    "Maintain or improve service quality scores"
                ],
                "risk_factors": [
                    "Vendor pushback on pricing: Medium risk - have alternatives ready",
                    "Contract renegotiation timeline: Low risk with existing relationships",
                    "Quality of service changes: Low risk with performance clauses"
                ],
                "responsible_party": "Procurement Manager with Finance support",
                "follow_up_required": True,
                "related_categories": ["Vendor Management", "Office Operations"],
                "confidence_score": 0.87,
                "email_optimized": True,
                "created_for_email": datetime.now().isoformat()
            },
            {
                "title": "Smart Approval Workflow Implementation",
                "description": "Deploy intelligent expense approval system with dynamic thresholds based on department, expense type, and current budget utilization. This will reduce manual approvals by 40% while improving budget compliance through automated controls.",
                "type": "process_optimization",
                "priority": 2,
                "estimated_savings": 1200.0,
                "implementation_timeline": "3-5 business days",
                "implementation_steps": [
                    "Configure smart approval rules in expense management system",
                    "Set department-specific thresholds and escalation paths",
                    "Train department managers on new approval criteria",
                    "Implement automated budget utilization checks",
                    "Create real-time budget dashboard for managers",
                    "Launch pilot with Operations and Marketing departments"
                ],
                "success_metrics": [
                    "40% reduction in manual approval processing time",
                    "95% budget compliance across all departments",
                    "Employee expense submission time reduced by 60%"
                ],
                "risk_factors": [
                    "User adoption curve: Medium risk - provide comprehensive training",
                    "System integration complexity: Low risk with current platform",
                    "Over-automation concerns: Low risk with manager override capability"
                ],
                "responsible_party": "IT Manager with Finance and HR coordination",
                "follow_up_required": True,
                "related_categories": ["Process Improvement", "Technology"],
                "confidence_score": 0.91,
                "email_optimized": True,
                "created_for_email": datetime.now().isoformat()
            }
        ]
        
        return AgentFinish(
            return_values={
                'recommendations': mock_recommendations,
                'email_optimized': True,
                'analysis_metadata': {
                    'email_ready': True,
                    'generation_date': datetime.now().isoformat(),
                    'optimization_level': 'email_enhanced_mock',
                    'confidence_level': 'High'
                }
            },
            log="Email-optimized mock recommendations generated for development"
        )