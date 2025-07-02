# """
# LangChain Breach Detector Agent
# Agent 2: AI-powered budget breach detection using LangChain tools and LLM
# """

# import json
# import logging
# from typing import Dict, Any, List, Optional
# from langchain.schema import AgentAction, AgentFinish
# from langchain.tools import BaseTool
# from langchain_google_genai import ChatGoogleGenerativeAI
# from langchain.prompts import PromptTemplate
# from langchain_core.callbacks import CallbackManagerForToolRun
# from models import AgentState, BudgetData

# logger = logging.getLogger(__name__)

# class BudgetUsageAnalyzerTool(BaseTool):
#     """LangChain tool for analyzing budget usage patterns"""
    
#     name: str = "budget_usage_analyzer"
#     description: str = "Analyze budget usage to identify potential breaches and risks"
    
#     def _run(
#         self,
#         budget_data: str,
#         current_usage: str,
#         historical_patterns: str = "",
#         llm = None,
#         run_manager: Optional[CallbackManagerForToolRun] = None,
#     ) -> str:
#         """Analyze budget usage for breaches"""
#         try:
#             analysis_prompt = """You are an expert financial analyst specializing in budget monitoring and risk assessment.

# TASK: Analyze budget usage data to identify potential breaches, risks, and anomalies.

# ANALYSIS CONTEXT:
# Budget Data: {budget_data}
# Current Usage: {current_usage}
# Historical Patterns: {historical_patterns}

# ANALYSIS CRITERIA:
# 1. Threshold Breaches: Usage exceeding warning_threshold or limit_amount
# 2. Spending Velocity: Unusual spending patterns or acceleration
# 3. Category Risks: Categories approaching or exceeding limits
# 4. Seasonal Patterns: Expected vs actual spending patterns
# 5. Anomaly Detection: Unusual transactions or spending spikes

# RISK LEVELS:
# - LOW: Usage < 70% of budget, normal patterns
# - MEDIUM: Usage 70-85% of budget, requires monitoring
# - HIGH: Usage 85-95% of budget, immediate attention needed
# - CRITICAL: Usage > 95% of budget, breach imminent

# RETURN FORMAT (JSON only):
# {
#   "breach_detected": true/false,
#   "breach_severity": "low/medium/high/critical",
#   "breach_context": {
#     "type": "threshold_warning/budget_exceeded/spending_anomaly",
#     "affected_categories": ["category1", "category2"],
#     "risk_factors": ["factor1", "factor2"],
#     "immediate_actions": ["action1", "action2"],
#     "estimated_impact": "description"
#   },
#   "usage_analysis": {
#     "overall_usage_percentage": 75.5,
#     "highest_risk_category": "category_name",
#     "trend_analysis": "description"
#   }
# }

# Provide detailed analysis with specific risk factors and actionable insights.
# """
            
#             prompt = analysis_prompt.format(
#                 budget_data=budget_data,
#                 current_usage=current_usage,
#                 historical_patterns=historical_patterns or "No historical data available"
#             )
            
#             if llm:
#                 response = llm.invoke(prompt)
                
#                 # Extract JSON from response
#                 json_str = self._extract_json_from_response(response.content)
#                 if json_str:
#                     # Validate JSON
#                     try:
#                         analysis = json.loads(json_str)
#                         if isinstance(analysis, dict):
#                             return json_str
#                     except json.JSONDecodeError:
#                         pass
            
#             # Fallback to rule-based analysis
#             return self._rule_based_analysis(budget_data, current_usage)
            
#         except Exception as e:
#             logger.error(f"❌ Budget usage analysis error: {e}")
#             return self._rule_based_analysis(budget_data, current_usage)
    
#     def _extract_json_from_response(self, content: str) -> Optional[str]:
#         """Extract JSON from LLM response"""
#         import re
#         try:
#             # Look for JSON object in response
#             json_match = re.search(r'\{.*\}', content, re.DOTALL)
#             if json_match:
#                 return json_match.group(0)
#             return None
#         except Exception:
#             return None
    
#     def _rule_based_analysis(self, budget_data: str, current_usage: str) -> str:
#         """Fallback rule-based analysis"""
#         try:
#             # Parse budget and usage data
#             budget_list = json.loads(budget_data) if budget_data else []
#             usage_dict = json.loads(current_usage) if current_usage else {}
            
#             breach_detected = False
#             affected_categories = []
#             risk_factors = []
#             overall_usage = 0
#             total_budget = 0
#             total_used = 0
            
#             for budget in budget_list:
#                 if isinstance(budget, dict):
#                     amount = budget.get('amount', 0) or budget.get('limit_amount', 0)
#                     warning_threshold = budget.get('warning_threshold', amount * 0.8)
#                     category = budget.get('category', 'Unknown')
                    
#                     total_budget += amount
                    
#                     # Get usage for this category
#                     category_usage = usage_dict.get(category, {}).get('amount', 0)
#                     total_used += category_usage
                    
#                     usage_percentage = (category_usage / amount * 100) if amount > 0 else 0
                    
#                     if usage_percentage > 95:
#                         breach_detected = True
#                         affected_categories.append(category)
#                         risk_factors.append(f"Critical: {category} at {usage_percentage:.1f}%")
#                     elif usage_percentage > 85:
#                         breach_detected = True
#                         affected_categories.append(category)
#                         risk_factors.append(f"High: {category} at {usage_percentage:.1f}%")
#                     elif usage_percentage > 70:
#                         risk_factors.append(f"Medium: {category} at {usage_percentage:.1f}%")
            
#             overall_usage = (total_used / total_budget * 100) if total_budget > 0 else 0
            
#             analysis = {
#                 "breach_detected": breach_detected,
#                 "breach_severity": "critical" if overall_usage > 95 else "high" if overall_usage > 85 else "medium" if overall_usage > 70 else "low",
#                 "breach_context": {
#                     "type": "threshold_warning" if not breach_detected else "budget_exceeded",
#                     "affected_categories": affected_categories,
#                     "risk_factors": risk_factors,
#                     "immediate_actions": ["Monitor spending", "Review budget allocations"] if breach_detected else ["Continue monitoring"],
#                     "estimated_impact": f"Overall usage at {overall_usage:.1f}%"
#                 },
#                 "usage_analysis": {
#                     "overall_usage_percentage": overall_usage,
#                     "highest_risk_category": affected_categories[0] if affected_categories else "None",
#                     "trend_analysis": "Rule-based analysis completed"
#                 }
#             }
            
#             return json.dumps(analysis)
            
#         except Exception as e:
#             logger.error(f"❌ Rule-based analysis error: {e}")
#             return json.dumps({
#                 "breach_detected": False,
#                 "breach_severity": "low",
#                 "breach_context": {"type": "none", "affected_categories": [], "risk_factors": [], "immediate_actions": [], "estimated_impact": "Analysis failed"},
#                 "usage_analysis": {"overall_usage_percentage": 0, "highest_risk_category": "None", "trend_analysis": "Analysis failed"}
#             })

# class LangChainBreachDetectorAgent:
#     """LangChain agent for AI-powered budget breach detection"""
    
#     def __init__(self, google_api_key: str):
#         self.google_api_key = google_api_key
#         self.is_mock_mode = google_api_key.startswith("mock_")
        
#         if not self.is_mock_mode:
#             # Initialize LLM
#             self.llm = ChatGoogleGenerativeAI(
#                 model="gemini-1.5-flash",
#                 google_api_key=google_api_key,
#                 temperature=0.2,
#                 max_output_tokens=2048
#             )
            
#             # Initialize tools
#             self.usage_analyzer = BudgetUsageAnalyzerTool()
        
#         logger.info("🤖 LangChain Breach Detector Agent initialized")
    
#     def execute(self, state: AgentState) -> AgentFinish:
#         """Execute AI-powered breach detection"""
#         try:
#             logger.info("🚨 Performing AI-powered breach detection...")
            
#             if self.is_mock_mode:
#                 logger.info("🔧 Using mock mode for development")
#                 return self._mock_breach_detection()
            
#             # Prepare data for analysis
#             budget_data = self._format_budget_data(state.structured_budget_data)
#             current_usage = self._format_usage_data(state)
            
#             # Analyze budget usage patterns
#             logger.info("📊 Analyzing budget usage patterns...")
#             usage_analysis = self.usage_analyzer._run(
#                 budget_data=budget_data,
#                 current_usage=current_usage,
#                 llm=self.llm
#             )
            
#             # Parse analysis results
#             try:
#                 usage_result = json.loads(usage_analysis)
#                 breach_detected = usage_result.get('breach_detected', False)
#                 breach_severity = usage_result.get('breach_severity', 'low')
                
#                 breach_context = {
#                     'usage_analysis': usage_result,
#                     'overall_breach_detected': breach_detected,
#                     'severity': breach_severity
#                 }
                
#                 logger.info(f"✅ Breach detection completed: {breach_detected}")
                
#                 return AgentFinish(
#                     return_values={
#                         'breach_detected': breach_detected,
#                         'breach_context': breach_context,
#                         'breach_severity': breach_severity
#                     },
#                     log=f"AI breach detection completed: {breach_detected}"
#                 )
                
#             except json.JSONDecodeError as e:
#                 logger.error(f"❌ JSON parsing error: {e}")
#                 return self._fallback_breach_detection()
                
#         except Exception as e:
#             logger.error(f"❌ Breach detector agent error: {e}")
#             return self._fallback_breach_detection()
    
#     def _format_budget_data(self, budget_data: List) -> str:
#         """Format budget data for analysis"""
#         try:
#             if not budget_data:
#                 return "[]"
            
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
#                     'warning_threshold': budget_dict.get('warning_threshold', 0),
#                     'priority': str(budget_dict.get('priority', 'Medium'))
#                 })
            
#             return json.dumps(formatted)
#         except Exception as e:
#             logger.error(f"❌ Budget data formatting error: {e}")
#             return "[]"
    
#     def _format_usage_data(self, state: AgentState) -> str:
#         """Format usage data for analysis"""
#         try:
#             usage_map = getattr(state, 'budget_usage_map', {})
#             return json.dumps(usage_map)
#         except Exception as e:
#             logger.error(f"❌ Usage data formatting error: {e}")
#             return "{}"
    
#     def _mock_breach_detection(self) -> AgentFinish:
#         """Mock breach detection for development"""
#         return AgentFinish(
#             return_values={
#                 'breach_detected': False,
#                 'breach_context': {
#                     'usage_analysis': {'breach_detected': False, 'breach_severity': 'low'},
#                     'overall_breach_detected': False,
#                     'severity': 'low'
#                 },
#                 'breach_severity': 'low'
#             },
#             log="Mock breach detection completed"
#         )
    
#     def _fallback_breach_detection(self) -> AgentFinish:
#         """Fallback breach detection"""
#         return AgentFinish(
#             return_values={
#                 'breach_detected': False,
#                 'breach_context': {},
#                 'breach_severity': 'low'
#             },
#             log="Fallback breach detection completed"
#         )



"""
Enhanced LangChain Breach Detector Agent
Agent 2: Advanced AI-powered budget breach detection with predictive analysis
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
from models import AgentState, BudgetData

logger = logging.getLogger(__name__)

class AdvancedBreachAnalyzerTool(BaseTool):
    """Enhanced LangChain tool for comprehensive breach detection and risk analysis"""
    
    name: str = "advanced_breach_analyzer"
    description: str = "Perform comprehensive breach analysis with predictive risk assessment"
    
    def _run(
        self,
        budget_data: str,
        current_usage: str,
        historical_patterns: str = "",
        market_context: str = "",
        llm = None,
        run_manager: Optional[CallbackManagerForToolRun] = None,
    ) -> str:
        """Perform advanced breach analysis with AI intelligence"""
        try:
            breach_analysis_prompt = """You are a senior financial risk analyst with expertise in budget monitoring, breach detection, and predictive financial modeling.

TASK: Perform comprehensive breach analysis to identify current violations, predict future risks, and assess financial impact with high precision.

ANALYSIS CONTEXT:
Budget Data: {budget_data}
Current Usage: {current_usage}
Historical Patterns: {historical_patterns}
Market Context: {market_context}

COMPREHENSIVE ANALYSIS FRAMEWORK:

1. IMMEDIATE BREACH DETECTION
   - Current threshold violations (25%, 50%, 75%, 90%, 100%+)
   - Severity classification based on overage amount and percentage
   - Impact assessment on business operations
   - Urgency level for corrective action

2. PREDICTIVE RISK ANALYSIS
   - Probability of future breaches based on spending velocity
   - Days until breach if current trend continues
   - Seasonal adjustment factors
   - External risk factors (market conditions, economic indicators)

3. CASCADE IMPACT ASSESSMENT
   - How one budget breach affects related categories
   - Department-wide financial impact
   - Cash flow implications
   - Vendor relationship risks

4. SEVERITY SCORING MATRIX
   - Financial impact score (1-10)
   - Operational disruption risk (1-10)
   - Recovery difficulty (1-10)
   - Strategic importance (1-10)

5. ANOMALY DETECTION
   - Unusual spending patterns or spikes
   - Vendor concentration risks
   - Timing irregularities
   - Category misallocation patterns

RETURN FORMAT (JSON only):
{{
  "breach_analysis": {{
    "immediate_breaches": [
      {{
        "department": "Marketing",
        "category": "Advertising",
        "breach_type": "threshold_exceeded/budget_exceeded",
        "current_usage_percentage": 125.5,
        "overage_amount": 2500.0,
        "days_since_breach": 5,
        "severity_level": "critical/high/medium/low",
        "financial_impact_score": 8.5,
        "operational_risk_score": 7.2,
        "immediate_actions_required": [
          "Freeze non-essential advertising spend",
          "Review upcoming campaign budgets",
          "Negotiate vendor payment terms"
        ]
      }}
    ],
    "threshold_warnings": [
      {{
        "department": "Operations",
        "category": "Equipment",
        "threshold_level": 75,
        "current_usage_percentage": 78.3,
        "days_to_breach": 12,
        "risk_probability": 0.85,
        "preventive_actions": [
          "Monitor equipment purchases closely",
          "Defer non-critical equipment orders"
        ]
      }}
    ]
  }},
  "predictive_analysis": {{
    "high_risk_categories": [
      {{
        "category": "Office Supplies",
        "breach_probability_30_days": 0.75,
        "projected_overage": 1200.0,
        "confidence_level": 0.88,
        "key_risk_factors": [
          "Spending velocity increased 40% this month",
          "Seasonal demand spike expected",
          "New vendor pricing 15% higher"
        ]
      }}
    ],
    "financial_projections": {{
      "total_projected_overages_30_days": 5500.0,
      "total_projected_overages_60_days": 12000.0,
      "total_projected_overages_90_days": 18500.0,
      "cash_flow_impact": {{
        "immediate": "moderate",
        "short_term": "significant", 
        "long_term": "manageable"
      }}
    }}
  }},
  "risk_assessment": {{
    "overall_risk_score": 7.8,
    "risk_category": "high/medium/low",
    "primary_risk_factors": [
      "Multiple categories approaching limits",
      "Seasonal spending increase expected",
      "Vendor price increases implemented"
    ],
    "mitigation_urgency": "immediate/high/medium/low"
  }},
  "anomaly_detection": {{
    "spending_anomalies": [
      {{
        "type": "velocity_spike/amount_outlier/timing_irregular/vendor_concentration",
        "description": "Office supplies spending increased 300% in last week",
        "anomaly_score": 9.2,
        "potential_causes": [
          "New office setup",
          "Bulk purchase for discount",
          "Invoice processing backlog"
        ],
        "investigation_required": true
      }}
    ],
    "pattern_deviations": [
      {{
        "category": "Travel",
        "deviation_type": "seasonal_anomaly",
        "description": "Q4 travel spending 40% below historical average",
        "impact": "positive",
        "potential_reallocation": 3000.0
      }}
    ]
  }},
  "cascade_analysis": {{
    "affected_budgets": [
      {{
        "primary_breach": "Marketing - Advertising",
        "secondary_impacts": [
          {{
            "budget": "Marketing - Events",
            "impact_type": "resource_competition",
            "estimated_effect": "15% increase in pressure"
          }}
        ]
      }}
    ],
    "vendor_relationship_risks": [
      {{
        "vendor": "ABC Supplies",
        "risk_level": "medium",
        "outstanding_amount": 5000.0,
        "payment_delay_risk": "low"
      }}
    ]
  }},
  "recommended_monitoring": {{
    "daily_monitoring_required": ["Marketing - Advertising", "Operations - Equipment"],
    "weekly_review_categories": ["Office Supplies", "Travel"],
    "key_metrics_to_track": [
      "Average daily spend rate",
      "Vendor payment terms utilization",
      "Approval compliance percentage"
    ]
  }}
}}

Provide comprehensive, actionable analysis with specific risk quantification and clear next steps."""
            
            prompt = breach_analysis_prompt.format(
                budget_data=budget_data,
                current_usage=current_usage,
                historical_patterns=historical_patterns or "No historical data available",
                market_context=market_context or "No market context provided"
            )
            
            if llm:
                response = llm.invoke(prompt)
                
                # Extract JSON from response
                json_str = self._extract_json_from_response(response.content)
                if json_str:
                    # Validate JSON
                    try:
                        analysis = json.loads(json_str)
                        if isinstance(analysis, dict):
                            return json_str
                    except json.JSONDecodeError:
                        pass
            
            # Fallback to enhanced rule-based analysis
            return self._enhanced_rule_based_analysis(budget_data, current_usage)
            
        except Exception as e:
            logger.error(f"❌ Advanced breach analysis error: {e}")
            return self._enhanced_rule_based_analysis(budget_data, current_usage)
    
    def _extract_json_from_response(self, content: str) -> Optional[str]:
        """Extract JSON from LLM response"""
        import re
        try:
            # Look for JSON object in response
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                return json_match.group(0)
            return None
        except Exception:
            return None
    
    def _enhanced_rule_based_analysis(self, budget_data: str, current_usage: str) -> str:
        """Enhanced fallback rule-based analysis"""
        try:
            # Parse budget and usage data
            budget_list = json.loads(budget_data) if budget_data else []
            usage_dict = json.loads(current_usage) if current_usage else {}
            
            immediate_breaches = []
            threshold_warnings = []
            high_risk_categories = []
            spending_anomalies = []
            
            overall_risk_score = 0
            total_budgets = len(budget_list)
            breached_budgets = 0
            warning_budgets = 0
            
            for budget in budget_list:
                if isinstance(budget, dict):
                    amount = budget.get('amount', 0) or budget.get('limit_amount', 0)
                    warning_threshold = budget.get('warning_threshold', amount * 0.8)
                    category = budget.get('category', 'Unknown')
                    department = budget.get('department', 'Unknown')
                    
                    # Get usage for this category/department
                    category_usage = usage_dict.get(category, {}).get('amount', 0)
                    usage_percentage = (category_usage / amount * 100) if amount > 0 else 0
                    overage_amount = max(0, category_usage - amount)
                    
                    # Breach detection
                    if usage_percentage > 100:
                        breached_budgets += 1
                        severity = "critical" if usage_percentage > 150 else "high" if usage_percentage > 120 else "medium"
                        
                        immediate_breaches.append({
                            "department": department,
                            "category": category,
                            "breach_type": "budget_exceeded",
                            "current_usage_percentage": round(usage_percentage, 1),
                            "overage_amount": round(overage_amount, 2),
                            "days_since_breach": 1,  # Assume recent
                            "severity_level": severity,
                            "financial_impact_score": min(10, usage_percentage / 10),
                            "operational_risk_score": 7.0 if severity == "critical" else 5.0,
                            "immediate_actions_required": [
                                f"Freeze non-essential {category.lower()} spending",
                                f"Review {department} budget allocation",
                                "Implement enhanced approval process"
                            ]
                        })
                        overall_risk_score += 20
                        
                    elif usage_percentage > 75:
                        warning_budgets += 1
                        threshold_level = 90 if usage_percentage > 90 else 75
                        days_to_breach = max(1, int((amount - category_usage) / (category_usage / 30)))
                        
                        threshold_warnings.append({
                            "department": department,
                            "category": category,
                            "threshold_level": threshold_level,
                            "current_usage_percentage": round(usage_percentage, 1),
                            "days_to_breach": days_to_breach,
                            "risk_probability": min(1.0, usage_percentage / 100),
                            "preventive_actions": [
                                f"Monitor {category.lower()} spending daily",
                                f"Review upcoming {department} expenses"
                            ]
                        })
                        overall_risk_score += 10
                        
                        # Add to high risk if very close to breach
                        if usage_percentage > 85:
                            high_risk_categories.append({
                                "category": category,
                                "breach_probability_30_days": min(1.0, usage_percentage / 100),
                                "projected_overage": max(0, (category_usage * 1.2) - amount),
                                "confidence_level": 0.75,
                                "key_risk_factors": [
                                    f"Current usage at {usage_percentage:.1f}%",
                                    "Spending trend analysis needed",
                                    "Approaching budget limit"
                                ]
                            })
                    
                    # Anomaly detection (simple rules)
                    if usage_percentage > 50 and category_usage > amount * 0.3:
                        # Check for potential spending spike
                        monthly_expected = amount / 12  # Assume annual budget
                        if category_usage > monthly_expected * 2:
                            spending_anomalies.append({
                                "type": "velocity_spike",
                                "description": f"{category} spending {usage_percentage:.1f}% of budget used early",
                                "anomaly_score": min(10, usage_percentage / 10),
                                "potential_causes": [
                                    "Seasonal spending increase",
                                    "Large purchase or contract",
                                    "Budget calculation error"
                                ],
                                "investigation_required": usage_percentage > 75
                            })
            
            # Calculate overall risk
            if total_budgets > 0:
                breach_rate = breached_budgets / total_budgets
                warning_rate = warning_budgets / total_budgets
                overall_risk_score += (breach_rate * 50) + (warning_rate * 25)
            
            risk_category = "high" if overall_risk_score > 60 else "medium" if overall_risk_score > 30 else "low"
            
            analysis = {
                "breach_analysis": {
                    "immediate_breaches": immediate_breaches,
                    "threshold_warnings": threshold_warnings
                },
                "predictive_analysis": {
                    "high_risk_categories": high_risk_categories,
                    "financial_projections": {
                        "total_projected_overages_30_days": sum(b.get('overage_amount', 0) for b in immediate_breaches) * 1.5,
                        "total_projected_overages_60_days": sum(b.get('overage_amount', 0) for b in immediate_breaches) * 2.0,
                        "total_projected_overages_90_days": sum(b.get('overage_amount', 0) for b in immediate_breaches) * 2.5,
                        "cash_flow_impact": {
                            "immediate": "moderate" if breached_budgets > 0 else "low",
                            "short_term": "significant" if breached_budgets > 2 else "moderate",
                            "long_term": "manageable"
                        }
                    }
                },
                "risk_assessment": {
                    "overall_risk_score": round(overall_risk_score, 1),
                    "risk_category": risk_category,
                    "primary_risk_factors": [
                        f"{breached_budgets} budgets currently exceeded",
                        f"{warning_budgets} budgets approaching limits",
                        "Enhanced monitoring required"
                    ],
                    "mitigation_urgency": "immediate" if breached_budgets > 0 else "high" if warning_budgets > 0 else "medium"
                },
                "anomaly_detection": {
                    "spending_anomalies": spending_anomalies,
                    "pattern_deviations": []
                },
                "cascade_analysis": {
                    "affected_budgets": [],
                    "vendor_relationship_risks": []
                },
                "recommended_monitoring": {
                    "daily_monitoring_required": [f"{b['department']} - {b['category']}" for b in immediate_breaches],
                    "weekly_review_categories": [w['category'] for w in threshold_warnings],
                    "key_metrics_to_track": [
                        "Daily spending velocity",
                        "Budget utilization rate",
                        "Approval compliance percentage"
                    ]
                }
            }
            
            return json.dumps(analysis)
            
        except Exception as e:
            logger.error(f"❌ Enhanced rule-based analysis error: {e}")
            return json.dumps({
                "breach_analysis": {"immediate_breaches": [], "threshold_warnings": []},
                "predictive_analysis": {"high_risk_categories": [], "financial_projections": {}},
                "risk_assessment": {"overall_risk_score": 0, "risk_category": "low"},
                "anomaly_detection": {"spending_anomalies": [], "pattern_deviations": []},
                "cascade_analysis": {"affected_budgets": [], "vendor_relationship_risks": []},
                "recommended_monitoring": {"daily_monitoring_required": [], "weekly_review_categories": []}
            })

class RiskScoringTool(BaseTool):
    """LangChain tool for advanced risk scoring and impact assessment"""
    
    name: str = "risk_scoring_calculator"
    description: str = "Calculate comprehensive risk scores and impact assessments"
    
    def _run(
        self,
        breach_data: str,
        financial_context: str,
        business_impact: str = "",
        llm = None,
        run_manager: Optional[CallbackManagerForToolRun] = None,
    ) -> str:
        """Calculate risk scores with AI-enhanced assessment"""
        try:
            risk_scoring_prompt = """You are a financial risk assessment expert with deep experience in quantitative risk modeling and business impact analysis.

TASK: Calculate comprehensive risk scores and provide detailed impact assessments for budget breaches and financial risks.

RISK ASSESSMENT CONTEXT:
Breach Data: {breach_data}
Financial Context: {financial_context}
Business Impact Factors: {business_impact}

RISK SCORING METHODOLOGY:

1. FINANCIAL IMPACT SCORE (0-10)
   - Amount of overage relative to total budget
   - Cash flow implications
   - Recovery time and difficulty
   - Compound effect on other budgets

2. OPERATIONAL RISK SCORE (0-10)
   - Business disruption potential
   - Service delivery impact
   - Customer satisfaction risk
   - Employee productivity effects

3. STRATEGIC RISK SCORE (0-10)
   - Long-term business objectives impact
   - Market position effects
   - Investor/stakeholder confidence
   - Regulatory compliance implications

4. TIMING RISK SCORE (0-10)
   - Urgency of corrective action needed
   - Window for effective intervention
   - Seasonal or cyclical factors
   - Market timing considerations

5. CASCADE RISK SCORE (0-10)
   - Risk of spreading to other budgets
   - Vendor relationship impacts
   - Department morale effects
   - Process breakdown risks

RETURN FORMAT (JSON only):
{{
  "risk_scores": {{
    "overall_risk_score": 7.8,
    "financial_impact_score": 8.2,
    "operational_risk_score": 6.5,
    "strategic_risk_score": 7.0,
    "timing_risk_score": 9.1,
    "cascade_risk_score": 5.8
  }},
  "impact_assessment": {{
    "immediate_impact": {{
      "cash_flow_effect": "moderate/significant/severe",
      "operational_disruption": "minimal/moderate/significant",
      "estimated_recovery_time": "2-4 weeks",
      "mitigation_cost": 2500.0
    }},
    "short_term_impact": {{
      "budget_reallocation_needed": 5000.0,
      "process_changes_required": true,
      "vendor_relationship_strain": "low/medium/high",
      "team_productivity_impact": "minimal"
    }},
    "long_term_impact": {{
      "strategic_objective_delay": false,
      "market_position_effect": "neutral",
      "stakeholder_confidence": "stable",
      "future_budget_adjustments": 3000.0
    }}
  }},
  "risk_mitigation": {{
    "immediate_actions": [
      "Implement spending freeze on non-essential items",
      "Accelerate payment collections where possible",
      "Review and defer optional expenditures"
    ],
    "short_term_strategies": [
      "Renegotiate vendor payment terms",
      "Implement enhanced approval workflows",
      "Conduct budget reallocation analysis"
    ],
    "long_term_improvements": [
      "Implement predictive budget monitoring",
      "Enhance financial planning processes",
      "Establish contingency fund protocols"
    ]
  }},
  "monitoring_recommendations": {{
    "critical_metrics": [
      "Daily cash position",
      "Weekly spending velocity",
      "Monthly budget variance"
    ],
    "review_frequency": {{
      "executive_review": "weekly",
      "department_review": "bi-weekly",
      "operational_review": "daily"
    }},
    "escalation_triggers": [
      "Additional 5% budget overage",
      "Cash flow drops below 30-day operating needs",
      "Vendor payment delays exceed 15 days"
    ]
  }}
}}

Provide precise, quantitative risk assessment with clear justification for all scores."""
            
            prompt = risk_scoring_prompt.format(
                breach_data=breach_data,
                financial_context=financial_context,
                business_impact=business_impact or "No specific business impact data provided"
            )
            
            if llm:
                response = llm.invoke(prompt)
                json_str = self._extract_json_from_response(response.content)
                if json_str:
                    try:
                        risk_assessment = json.loads(json_str)
                        if isinstance(risk_assessment, dict):
                            return json_str
                    except json.JSONDecodeError:
                        pass
            
            # Fallback to basic risk scoring
            return self._basic_risk_scoring(breach_data)
            
        except Exception as e:
            logger.error(f"❌ Risk scoring error: {e}")
            return self._basic_risk_scoring(breach_data)
    
    def _extract_json_from_response(self, content: str) -> Optional[str]:
        """Extract JSON from LLM response"""
        import re
        try:
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                return json_match.group(0)
            return None
        except Exception:
            return None
    
    def _basic_risk_scoring(self, breach_data: str) -> str:
        """Basic risk scoring fallback"""
        try:
            breach_info = json.loads(breach_data) if breach_data else {}
            
            # Calculate basic scores
            financial_score = 5.0
            operational_score = 4.0
            strategic_score = 3.0
            timing_score = 6.0
            cascade_score = 4.0
            
            if breach_info.get('breach_detected', False):
                financial_score += 3.0
                operational_score += 2.0
                timing_score += 3.0
            
            overall_score = (financial_score + operational_score + strategic_score + timing_score + cascade_score) / 5
            
            risk_assessment = {
                "risk_scores": {
                    "overall_risk_score": round(overall_score, 1),
                    "financial_impact_score": financial_score,
                    "operational_risk_score": operational_score,
                    "strategic_risk_score": strategic_score,
                    "timing_risk_score": timing_score,
                    "cascade_risk_score": cascade_score
                },
                "impact_assessment": {
                    "immediate_impact": {
                        "cash_flow_effect": "moderate",
                        "operational_disruption": "minimal",
                        "estimated_recovery_time": "2-4 weeks",
                        "mitigation_cost": 1000.0
                    },
                    "short_term_impact": {
                        "budget_reallocation_needed": 2000.0,
                        "process_changes_required": True,
                        "vendor_relationship_strain": "low",
                        "team_productivity_impact": "minimal"
                    },
                    "long_term_impact": {
                        "strategic_objective_delay": False,
                        "market_position_effect": "neutral",
                        "stakeholder_confidence": "stable",
                        "future_budget_adjustments": 1500.0
                    }
                },
                "risk_mitigation": {
                    "immediate_actions": [
                        "Review current spending priorities",
                        "Implement enhanced monitoring",
                        "Consider budget reallocation"
                    ],
                    "short_term_strategies": [
                        "Improve approval processes",
                        "Negotiate better vendor terms",
                        "Enhance budget tracking"
                    ],
                    "long_term_improvements": [
                        "Implement predictive analytics",
                        "Improve financial planning",
                        "Establish contingency protocols"
                    ]
                },
                "monitoring_recommendations": {
                    "critical_metrics": [
                        "Weekly spending rate",
                        "Budget variance tracking",
                        "Cash flow monitoring"
                    ],
                    "review_frequency": {
                        "executive_review": "monthly",
                        "department_review": "weekly",
                        "operational_review": "daily"
                    },
                    "escalation_triggers": [
                        "10% additional overage",
                        "Cash flow concerns",
                        "Vendor payment issues"
                    ]
                }
            }
            
            return json.dumps(risk_assessment)
            
        except Exception as e:
            logger.error(f"❌ Basic risk scoring error: {e}")
            return "{}"

class LangChainBreachDetectorAgent:
    """Enhanced LangChain agent for advanced AI-powered budget breach detection"""
    
    def __init__(self, google_api_key: str):
        self.google_api_key = google_api_key
        self.is_mock_mode = google_api_key.startswith("mock_")
        
        if not self.is_mock_mode:
            # Initialize LLM with enhanced configuration
            self.llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                google_api_key=google_api_key,
                temperature=0.1,  # Low temperature for precise analysis
                max_output_tokens=4096,
                top_p=0.8,
                top_k=30
            )
            
            # Initialize enhanced tools
            self.breach_analyzer = AdvancedBreachAnalyzerTool()
            self.risk_scorer = RiskScoringTool()
        
        logger.info("🤖 Enhanced LangChain Breach Detector Agent initialized")
    
    def execute(self, state: AgentState) -> AgentFinish:
        """Execute enhanced AI-powered breach detection and risk analysis"""
        try:
            logger.info("🚨 Performing enhanced AI-powered breach detection...")
            
            if self.is_mock_mode:
                logger.info("🔧 Using mock mode for development")
                return self._mock_breach_detection()
            
            # Prepare comprehensive data for analysis
            budget_data = self._format_budget_data(state.structured_budget_data)
            current_usage = self._format_usage_data(state)
            historical_patterns = self._get_historical_patterns(state)
            market_context = self._get_market_context()
            
            # Step 1: Comprehensive breach analysis
            logger.info("📊 Step 1: Performing comprehensive breach analysis...")
            breach_analysis = self.breach_analyzer._run(
                budget_data=budget_data,
                current_usage=current_usage,
                historical_patterns=historical_patterns,
                market_context=market_context,
                llm=self.llm
            )
            
            # Step 2: Advanced risk scoring
            logger.info("⚠️ Step 2: Calculating risk scores and impact assessment...")
            risk_assessment = self.risk_scorer._run(
                breach_data=breach_analysis,
                financial_context=budget_data,
                business_impact=self._assess_business_impact(state),
                llm=self.llm
            )
            
            # Parse and combine results
            try:
                breach_data = json.loads(breach_analysis) if breach_analysis else {}
                risk_data = json.loads(risk_assessment) if risk_assessment else {}
                
                # Extract key findings
                immediate_breaches = breach_data.get('breach_analysis', {}).get('immediate_breaches', [])
                threshold_warnings = breach_data.get('breach_analysis', {}).get('threshold_warnings', [])
                overall_risk_score = risk_data.get('risk_scores', {}).get('overall_risk_score', 0)
                
                # Determine overall breach status
                breach_detected = len(immediate_breaches) > 0
                breach_severity = self._calculate_breach_severity(immediate_breaches, overall_risk_score)
                
                # Create comprehensive breach context
                comprehensive_context = {
                    'breach_analysis': breach_data,
                    'risk_assessment': risk_data,
                    'summary': {
                        'total_breaches': len(immediate_breaches),
                        'total_warnings': len(threshold_warnings),
                        'highest_risk_score': overall_risk_score,
                        'critical_categories': self._identify_critical_categories(breach_data),
                        'immediate_actions_count': len(self._extract_immediate_actions(breach_data)),
                        'financial_impact_total': self._calculate_total_financial_impact(breach_data, risk_data)
                    },
                    'predictive_insights': breach_data.get('predictive_analysis', {}),
                    'monitoring_plan': self._create_monitoring_plan(breach_data, risk_data),
                    'escalation_matrix': self._create_escalation_matrix(immediate_breaches, risk_data)
                }
                
                logger.info(f"✅ Enhanced breach detection completed: {len(immediate_breaches)} breaches, {len(threshold_warnings)} warnings")
                
                return AgentFinish(
                    return_values={
                        'breach_detected': breach_detected,
                        'breach_severity': breach_severity,
                        'breach_context': comprehensive_context,
                        'immediate_breaches': immediate_breaches,
                        'threshold_warnings': threshold_warnings,
                        'risk_scores': risk_data.get('risk_scores', {}),
                        'recommended_actions': self._prioritize_actions(breach_data, risk_data),
                        'analysis_metadata': {
                            'analysis_timestamp': datetime.now().isoformat(),
                            'data_sources': ['budget_data', 'usage_data', 'historical_patterns', 'market_context'],
                            'confidence_score': self._calculate_analysis_confidence(breach_data, risk_data),
                            'next_review_date': (datetime.now() + timedelta(days=1)).isoformat()
                        }
                    },
                    log=f"Enhanced AI breach detection completed: {breach_detected}, severity: {breach_severity}"
                )
                
            except json.JSONDecodeError as e:
                logger.error(f"❌ JSON parsing error in breach detection: {e}")
                return self._fallback_breach_detection()
                
        except Exception as e:
            logger.error(f"❌ Enhanced breach detector agent error: {e}")
            return self._fallback_breach_detection()
    
    def _get_historical_patterns(self, state: AgentState) -> str:
        """Get historical spending patterns for analysis"""
        try:
            # In a real implementation, this would query historical data
            historical_data = {
                "spending_trends": {
                    "last_3_months": {
                        "average_monthly_spend": 15000,
                        "peak_spending_month": "March",
                        "lowest_spending_month": "February",
                        "volatility_score": 0.25
                    },
                    "year_over_year": {
                        "growth_rate": 0.12,
                        "seasonal_patterns": ["Q4_spike", "Q1_conservative"],
                        "category_shifts": ["increased_software", "reduced_travel"]
                    }
                },
                "breach_history": {
                    "previous_breaches": 2,
                    "most_common_categories": ["Office Supplies", "Marketing"],
                    "average_recovery_time": "2_weeks",
                    "successful_interventions": 4
                },
                "vendor_patterns": {
                    "payment_cycles": "monthly",
                    "discount_periods": ["end_of_quarter"],
                    "price_increases": ["annual_january"]
                }
            }
            
            return json.dumps(historical_data)
        except Exception as e:
            logger.error(f"❌ Error getting historical patterns: {e}")
            return "{}"
    
    def _get_market_context(self) -> str:
        """Get relevant market context for breach analysis"""
        try:
            market_context = {
                "economic_indicators": {
                    "inflation_rate": 3.2,
                    "interest_rates": "rising",
                    "supply_chain_status": "normalizing",
                    "vendor_price_trends": "moderate_increases"
                },
                "industry_factors": {
                    "sector_performance": "stable",
                    "competitive_pressure": "moderate",
                    "regulatory_changes": "minimal",
                    "technology_adoption": "accelerating"
                },
                "seasonal_factors": {
                    "current_quarter": "Q4",
                    "seasonal_adjustments": ["holiday_spending", "year_end_purchases"],
                    "upcoming_events": ["budget_cycle_renewal", "annual_contracts"]
                }
            }
            
            return json.dumps(market_context)
        except Exception as e:
            logger.error(f"❌ Error getting market context: {e}")
            return "{}"
    
    def _assess_business_impact(self, state: AgentState) -> str:
        """Assess business impact context for risk analysis"""
        try:
            business_impact = {
                "operational_dependencies": {
                    "critical_processes": ["payroll", "vendor_payments", "customer_service"],
                    "backup_options": ["credit_line", "budget_reallocation", "payment_deferrals"],
                    "stakeholder_impact": ["employees", "vendors", "customers"]
                },
                "strategic_alignment": {
                    "current_priorities": ["growth", "efficiency", "innovation"],
                    "budget_flexibility": "moderate",
                    "risk_tolerance": "conservative"
                },
                "timing_considerations": {
                    "critical_deadlines": ["quarter_end", "contract_renewals"],
                    "seasonal_factors": ["holiday_season", "fiscal_year_end"],
                    "market_timing": "stable"
                }
            }
            
            return json.dumps(business_impact)
        except Exception as e:
            logger.error(f"❌ Error assessing business impact: {e}")
            return "{}"
    
    def _calculate_breach_severity(self, immediate_breaches: List[Dict], overall_risk_score: float) -> str:
        """Calculate overall breach severity"""
        if not immediate_breaches:
            return "none"
        
        # Count breaches by severity
        critical_count = sum(1 for b in immediate_breaches if b.get('severity_level') == 'critical')
        high_count = sum(1 for b in immediate_breaches if b.get('severity_level') == 'high')
        
        # Calculate severity based on count and risk score
        if critical_count > 0 or overall_risk_score > 8.0:
            return "critical"
        elif high_count > 1 or overall_risk_score > 6.0:
            return "high"
        elif len(immediate_breaches) > 0 or overall_risk_score > 4.0:
            return "medium"
        else:
            return "low"
    
    def _identify_critical_categories(self, breach_data: Dict) -> List[str]:
        """Identify critical categories requiring immediate attention"""
        critical_categories = []
        
        immediate_breaches = breach_data.get('breach_analysis', {}).get('immediate_breaches', [])
        for breach in immediate_breaches:
            if breach.get('severity_level') in ['critical', 'high']:
                category = f"{breach.get('department', 'Unknown')} - {breach.get('category', 'Unknown')}"
                if category not in critical_categories:
                    critical_categories.append(category)
        
        return critical_categories
    
    def _extract_immediate_actions(self, breach_data: Dict) -> List[str]:
        """Extract all immediate actions from breach analysis"""
        actions = []
        
        immediate_breaches = breach_data.get('breach_analysis', {}).get('immediate_breaches', [])
        for breach in immediate_breaches:
            breach_actions = breach.get('immediate_actions_required', [])
            actions.extend(breach_actions)
        
        # Remove duplicates while preserving order
        return list(dict.fromkeys(actions))
    
    def _calculate_total_financial_impact(self, breach_data: Dict, risk_data: Dict) -> float:
        """Calculate total financial impact from breaches and risks"""
        total_impact = 0.0
        
        # Add overage amounts from immediate breaches
        immediate_breaches = breach_data.get('breach_analysis', {}).get('immediate_breaches', [])
        for breach in immediate_breaches:
            total_impact += breach.get('overage_amount', 0)
        
        # Add projected overages
        projections = breach_data.get('predictive_analysis', {}).get('financial_projections', {})
        total_impact += projections.get('total_projected_overages_30_days', 0)
        
        # Add mitigation costs from risk assessment
        immediate_impact = risk_data.get('impact_assessment', {}).get('immediate_impact', {})
        total_impact += immediate_impact.get('mitigation_cost', 0)
        
        return round(total_impact, 2)
    
    def _create_monitoring_plan(self, breach_data: Dict, risk_data: Dict) -> Dict:
        """Create comprehensive monitoring plan"""
        monitoring = breach_data.get('recommended_monitoring', {})
        risk_monitoring = risk_data.get('monitoring_recommendations', {})
        
        return {
            "daily_monitoring": monitoring.get('daily_monitoring_required', []),
            "weekly_reviews": monitoring.get('weekly_review_categories', []),
            "critical_metrics": risk_monitoring.get('critical_metrics', []),
            "review_schedule": risk_monitoring.get('review_frequency', {}),
            "escalation_triggers": risk_monitoring.get('escalation_triggers', []),
            "automated_alerts": [
                "Budget threshold exceeded",
                "Spending velocity anomaly",
                "Vendor payment due"
            ]
        }
    
    def _create_escalation_matrix(self, immediate_breaches: List[Dict], risk_data: Dict) -> Dict:
        """Create escalation matrix based on breach severity and risk"""
        escalation_matrix = {
            "level_1": {
                "trigger": "Any budget breach detected",
                "notify": ["Finance Manager", "Department Head"],
                "timeline": "Within 4 hours",
                "actions": ["Immediate spending review", "Preliminary action plan"]
            },
            "level_2": {
                "trigger": "Multiple breaches or high-risk score",
                "notify": ["CFO", "Finance Manager", "Department Heads"],
                "timeline": "Within 2 hours",
                "actions": ["Emergency budget meeting", "Immediate corrective measures"]
            },
            "level_3": {
                "trigger": "Critical breaches or severe financial impact",
                "notify": ["CEO", "CFO", "Board Finance Committee"],
                "timeline": "Within 1 hour",
                "actions": ["Crisis management protocol", "External financial review"]
            }
        }
        
        # Determine current escalation level
        critical_breaches = sum(1 for b in immediate_breaches if b.get('severity_level') == 'critical')
        overall_risk = risk_data.get('risk_scores', {}).get('overall_risk_score', 0)
        
        if critical_breaches > 0 or overall_risk > 8.0:
            current_level = "level_3"
        elif len(immediate_breaches) > 1 or overall_risk > 6.0:
            current_level = "level_2"
        elif len(immediate_breaches) > 0:
            current_level = "level_1"
        else:
            current_level = "none"
        
        escalation_matrix["current_level"] = current_level
        return escalation_matrix
    
    def _prioritize_actions(self, breach_data: Dict, risk_data: Dict) -> List[Dict]:
        """Prioritize recommended actions by urgency and impact"""
        actions = []
        
        # Extract immediate actions from breaches
        immediate_breaches = breach_data.get('breach_analysis', {}).get('immediate_breaches', [])
        for breach in immediate_breaches:
            for action in breach.get('immediate_actions_required', []):
                actions.append({
                    "action": action,
                    "priority": "critical",
                    "category": f"{breach.get('department')} - {breach.get('category')}",
                    "estimated_impact": breach.get('overage_amount', 0),
                    "timeline": "immediate"
                })
        
        # Extract risk mitigation actions
        risk_mitigation = risk_data.get('risk_mitigation', {})
        for action in risk_mitigation.get('immediate_actions', []):
            actions.append({
                "action": action,
                "priority": "high",
                "category": "Risk Mitigation",
                "estimated_impact": 1000,  # Default impact estimate
                "timeline": "24-48 hours"
            })
        
        # Sort by priority and impact
        priority_order = {"critical": 1, "high": 2, "medium": 3, "low": 4}
        actions.sort(key=lambda x: (priority_order.get(x["priority"], 4), -x["estimated_impact"]))
        
        return actions[:10]  # Return top 10 prioritized actions
    
    def _calculate_analysis_confidence(self, breach_data: Dict, risk_data: Dict) -> float:
        """Calculate confidence score for the analysis"""
        confidence_factors = {
            "data_completeness": 0.8,  # Assume good data quality
            "model_accuracy": 0.85,    # LLM analysis quality
            "historical_context": 0.7, # Limited historical data
            "market_context": 0.75     # General market data available
        }
        
        # Adjust based on data quality indicators
        if breach_data and isinstance(breach_data, dict):
            confidence_factors["data_completeness"] = 0.9
        
        if risk_data and isinstance(risk_data, dict):
            confidence_factors["model_accuracy"] = 0.9
        
        return round(sum(confidence_factors.values()) / len(confidence_factors), 2)
    
    # Keep existing utility methods for compatibility
    def _format_budget_data(self, budget_data: List) -> str:
        """Format budget data for analysis"""
        try:
            if not budget_data:
                return "[]"
            
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
                    'warning_threshold': budget_dict.get('warning_threshold', 0),
                    'priority': str(budget_dict.get('priority', 'Medium'))
                })
            
            return json.dumps(formatted)
        except Exception as e:
            logger.error(f"❌ Budget data formatting error: {e}")
            return "[]"
    
    def _format_usage_data(self, state: AgentState) -> str:
        """Format usage data for analysis"""
        try:
            usage_map = getattr(state, 'budget_usage_map', {})
            return json.dumps(usage_map)
        except Exception as e:
            logger.error(f"❌ Usage data formatting error: {e}")
            return "{}"
    
    def _mock_breach_detection(self) -> AgentFinish:
        """Enhanced mock breach detection for development"""
        mock_breaches = [
            {
                "department": "Marketing",
                "category": "Advertising",
                "breach_type": "budget_exceeded",
                "current_usage_percentage": 125.5,
                "overage_amount": 2500.0,
                "days_since_breach": 3,
                "severity_level": "high",
                "financial_impact_score": 8.2,
                "operational_risk_score": 6.5,
                "immediate_actions_required": [
                    "Freeze non-essential advertising spend",
                    "Review Q4 campaign budgets",
                    "Negotiate vendor payment terms"
                ]
            }
        ]
        
        mock_warnings = [
            {
                "department": "Operations",
                "category": "Equipment",
                "threshold_level": 75,
                "current_usage_percentage": 78.3,
                "days_to_breach": 12,
                "risk_probability": 0.85,
                "preventive_actions": [
                    "Monitor equipment purchases",
                    "Defer non-critical orders"
                ]
            }
        ]
        
        mock_context = {
            'breach_analysis': {
                'immediate_breaches': mock_breaches,
                'threshold_warnings': mock_warnings
            },
            'risk_assessment': {
                'risk_scores': {
                    'overall_risk_score': 7.2,
                    'financial_impact_score': 8.2,
                    'operational_risk_score': 6.5
                }
            },
            'summary': {
                'total_breaches': 1,
                'total_warnings': 1,
                'highest_risk_score': 7.2,
                'critical_categories': ['Marketing - Advertising'],
                'immediate_actions_count': 3,
                'financial_impact_total': 3500.0
            }
        }
        
        return AgentFinish(
            return_values={
                'breach_detected': True,
                'breach_severity': 'high',
                'breach_context': mock_context,
                'immediate_breaches': mock_breaches,
                'threshold_warnings': mock_warnings,
                'risk_scores': {'overall_risk_score': 7.2},
                'recommended_actions': [
                    {
                        "action": "Freeze non-essential advertising spend",
                        "priority": "critical",
                        "category": "Marketing - Advertising",
                        "estimated_impact": 2500.0,
                        "timeline": "immediate"
                    }
                ]
            },
            log="Enhanced mock breach detection completed: True, severity: high"
        )
    
    def _fallback_breach_detection(self) -> AgentFinish:
        """Enhanced fallback breach detection"""
        return AgentFinish(
            return_values={
                'breach_detected': False,
                'breach_severity': 'low',
                'breach_context': {
                    'breach_analysis': {'immediate_breaches': [], 'threshold_warnings': []},
                    'risk_assessment': {'risk_scores': {'overall_risk_score': 0}},
                    'summary': {'total_breaches': 0, 'total_warnings': 0}
                },
                'immediate_breaches': [],
                'threshold_warnings': [],
                'risk_scores': {'overall_risk_score': 0},
                'recommended_actions': []
            },
            log="Enhanced fallback breach detection completed"
        )