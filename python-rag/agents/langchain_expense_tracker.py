"""
LangChain Expense Tracker Agent
Agent 3: AI-powered expense tracking and analysis using LangChain tools and LLM
"""

import json
import logging
from typing import Dict, Any, List, Optional
from langchain.schema import AgentAction, AgentFinish
from langchain.tools import BaseTool
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain_core.callbacks import CallbackManagerForToolRun
from models import AgentState, BudgetData

logger = logging.getLogger(__name__)

class ExpenseAnalyzerTool(BaseTool):
    """LangChain tool for analyzing expense patterns and categorization"""
    
    name: str = "expense_analyzer"
    description: str = "Analyze expense data to categorize and track spending patterns"
    
    def _run(
        self,
        budget_data: str,
        expense_data: str,
        historical_spending: str = "",
        llm = None,
        run_manager: Optional[CallbackManagerForToolRun] = None,
    ) -> str:
        """Analyze and categorize expenses"""
        try:
            analysis_prompt = """You are an expert financial analyst specializing in expense tracking and categorization.

TASK: Analyze expense data and categorize spending against budget allocations.

ANALYSIS CONTEXT:
Budget Data: {budget_data}
Expense Data: {expense_data}
Historical Spending: {historical_spending}

ANALYSIS REQUIREMENTS:
1. Categorize each expense into appropriate budget categories
2. Calculate usage percentages for each category
3. Identify spending patterns and trends
4. Flag unusual or unexpected expenses
5. Calculate remaining budget amounts

CATEGORIZATION RULES:
- Office Supplies: Paper, pens, printer ink, office furniture
- Travel: Airfare, hotels, meals, transportation
- Software: Subscriptions, licenses, tools
- Marketing: Advertising, campaigns, materials
- Training: Courses, workshops, certifications
- Equipment: Computers, phones, hardware
- Utilities: Electricity, internet, phone bills
- Other: Uncategorized expenses

RETURN FORMAT (JSON only):
{
  "categorized_expenses": {
    "category_name": [
      {
        "description": "expense description",
        "amount": 100.0,
        "date": "2024-01-15",
        "vendor": "vendor name"
      }
    ]
  },
  "usage_summary": {
    "category_name": {
      "total_spent": 1000.0,
      "budget_limit": 1500.0,
      "remaining": 500.0,
      "percentage_used": 66.67,
      "status": "under_budget/approaching_limit/over_budget"
    }
  },
  "spending_insights": [
    "insight1",
    "insight2"
  ],
  "anomalies": [
    {
      "type": "unusual_amount/unexpected_category/timing",
      "description": "description",
      "severity": "low/medium/high"
    }
  ]
}

Provide detailed analysis with accurate categorization and actionable insights.
"""
            
            prompt = analysis_prompt.format(
                budget_data=budget_data,
                expense_data=expense_data,
                historical_spending=historical_spending or "No historical data available"
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
            
            # Fallback to rule-based categorization
            return self._rule_based_categorization(budget_data, expense_data)
            
        except Exception as e:
            logger.error(f"❌ Expense analysis error: {e}")
            return self._rule_based_categorization(budget_data, expense_data)
    
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
    
    def _rule_based_categorization(self, budget_data: str, expense_data: str) -> str:
        """Fallback rule-based expense categorization"""
        try:
            # Parse budget and expense data
            budget_list = json.loads(budget_data) if budget_data else []
            expenses = json.loads(expense_data) if expense_data else []
            
            categorized_expenses = {}
            usage_summary = {}
            
            # Initialize categories from budget data
            for budget in budget_list:
                if isinstance(budget, dict):
                    category = budget.get('category', 'Other')
                    budget_limit = budget.get('amount', 0) or budget.get('limit_amount', 0)
                    
                    categorized_expenses[category] = []
                    usage_summary[category] = {
                        'total_spent': 0.0,
                        'budget_limit': budget_limit,
                        'remaining': budget_limit,
                        'percentage_used': 0.0,
                        'status': 'under_budget'
                    }
            
            # Categorize expenses using simple keyword matching
            for expense in expenses:
                if isinstance(expense, dict):
                    description = expense.get('description', '').lower()
                    amount = expense.get('amount', 0)
                    
                    # Simple categorization logic
                    category = 'Other'
                    if any(word in description for word in ['paper', 'pen', 'supply', 'office']):
                        category = 'Office Supplies'
                    elif any(word in description for word in ['travel', 'flight', 'hotel', 'meal']):
                        category = 'Travel'
                    elif any(word in description for word in ['software', 'subscription', 'license']):
                        category = 'Software'
                    elif any(word in description for word in ['marketing', 'advertising', 'campaign']):
                        category = 'Marketing'
                    elif any(word in description for word in ['training', 'course', 'workshop']):
                        category = 'Training'
                    elif any(word in description for word in ['computer', 'phone', 'equipment']):
                        category = 'Equipment'
                    elif any(word in description for word in ['electricity', 'internet', 'utility']):
                        category = 'Utilities'
                    
                    # Add to categorized expenses
                    if category not in categorized_expenses:
                        categorized_expenses[category] = []
                        usage_summary[category] = {
                            'total_spent': 0.0,
                            'budget_limit': 0.0,
                            'remaining': 0.0,
                            'percentage_used': 0.0,
                            'status': 'under_budget'
                        }
                    
                    categorized_expenses[category].append(expense)
                    
                    # Update usage summary
                    usage_summary[category]['total_spent'] += amount
            
            # Calculate percentages and status
            for category, summary in usage_summary.items():
                if summary['budget_limit'] > 0:
                    summary['remaining'] = summary['budget_limit'] - summary['total_spent']
                    summary['percentage_used'] = (summary['total_spent'] / summary['budget_limit']) * 100
                    
                    if summary['percentage_used'] >= 100:
                        summary['status'] = 'over_budget'
                    elif summary['percentage_used'] >= 80:
                        summary['status'] = 'approaching_limit'
                    else:
                        summary['status'] = 'under_budget'
            
            return json.dumps({
                'categorized_expenses': categorized_expenses,
                'usage_summary': usage_summary,
                'spending_insights': [
                    f"Total expenses tracked: {len(expenses)}",
                    f"Categories with spending: {len([c for c, e in categorized_expenses.items() if e])}"
                ],
                'anomalies': []
            })
            
        except Exception as e:
            logger.error(f"❌ Rule-based categorization error: {e}")
            return json.dumps({
                'categorized_expenses': {},
                'usage_summary': {},
                'spending_insights': ['Categorization failed'],
                'anomalies': []
            })

class SpendingPatternAnalyzerTool(BaseTool):
    """LangChain tool for analyzing spending patterns and trends"""
    
    name: str = "spending_pattern_analyzer"
    description: str = "Analyze spending patterns to identify trends and predict future expenses"
    
    def _run(
        self,
        categorized_expenses: str,
        usage_summary: str,
        time_period: str = "current_month",
        llm = None,
        run_manager: Optional[CallbackManagerForToolRun] = None,
    ) -> str:
        """Analyze spending patterns and trends"""
        try:
            pattern_prompt = """You are an expert in financial forecasting and spending pattern analysis.

TASK: Analyze spending patterns to identify trends, predict future expenses, and provide insights.

ANALYSIS DATA:
Categorized Expenses: {categorized_expenses}
Usage Summary: {usage_summary}
Time Period: {time_period}

ANALYSIS FOCUS:
1. Spending trends over time
2. Seasonal patterns
3. Category-wise spending velocity
4. Predictions for upcoming expenses
5. Risk factors for budget overruns

PATTERN TYPES:
- Linear trends (consistent increase/decrease)
- Seasonal patterns (monthly/quarterly cycles)
- Irregular spikes (unusual spending events)
- Category correlations (related spending patterns)

RETURN FORMAT (JSON only):
{
  "trends": [
    {
      "category": "category_name",
      "trend_type": "increasing/decreasing/stable/seasonal",
      "velocity": "high/medium/low",
      "description": "trend description",
      "confidence": 0.85
    }
  ],
  "predictions": {
    "category_name": {
      "predicted_spend": 1000.0,
      "confidence": 0.8,
      "risk_level": "low/medium/high"
    }
  },
  "insights": [
    "insight1",
    "insight2"
  ],
  "recommendations": [
    "recommendation1",
    "recommendation2"
  ]
}

Provide actionable insights for budget planning and risk management.
"""
            
            prompt = pattern_prompt.format(
                categorized_expenses=categorized_expenses,
                usage_summary=usage_summary,
                time_period=time_period
            )
            
            if llm:
                response = llm.invoke(prompt)
                
                # Extract JSON from response
                json_str = self._extract_json_from_response(response.content)
                if json_str:
                    try:
                        analysis = json.loads(json_str)
                        if isinstance(analysis, dict):
                            return json_str
                    except json.JSONDecodeError:
                        pass
            
            # Fallback to basic pattern analysis
            return self._basic_pattern_analysis(categorized_expenses, usage_summary)
            
        except Exception as e:
            logger.error(f"❌ Pattern analysis error: {e}")
            return self._basic_pattern_analysis(categorized_expenses, usage_summary)
    
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
    
    def _basic_pattern_analysis(self, categorized_expenses: str, usage_summary: str) -> str:
        """Basic pattern analysis fallback"""
        try:
            usage_data = json.loads(usage_summary) if usage_summary else {}
            
            trends = []
            predictions = {}
            insights = []
            
            for category, data in usage_data.items():
                if isinstance(data, dict):
                    percentage_used = data.get('percentage_used', 0)
                    total_spent = data.get('total_spent', 0)
                    
                    # Simple trend analysis
                    if percentage_used > 80:
                        trend_type = "increasing"
                        velocity = "high"
                    elif percentage_used > 50:
                        trend_type = "increasing"
                        velocity = "medium"
                    else:
                        trend_type = "stable"
                        velocity = "low"
                    
                    trends.append({
                        "category": category,
                        "trend_type": trend_type,
                        "velocity": velocity,
                        "description": f"{category} usage at {percentage_used:.1f}%",
                        "confidence": 0.7
                    })
                    
                    # Simple predictions
                    if total_spent > 0:
                        predictions[category] = {
                            "predicted_spend": total_spent * 1.1,  # 10% increase
                            "confidence": 0.6,
                            "risk_level": "high" if percentage_used > 80 else "medium" if percentage_used > 50 else "low"
                        }
                    
                    # Basic insights
                    if percentage_used > 90:
                        insights.append(f"{category} is approaching budget limit")
                    elif percentage_used > 70:
                        insights.append(f"{category} requires monitoring")
            
            return json.dumps({
                "trends": trends,
                "predictions": predictions,
                "insights": insights,
                "recommendations": ["Monitor high-usage categories", "Review budget allocations"]
            })
            
        except Exception as e:
            logger.error(f"❌ Basic pattern analysis error: {e}")
            return json.dumps({
                "trends": [],
                "predictions": {},
                "insights": ["Pattern analysis failed"],
                "recommendations": ["Continue monitoring"]
            })

class LangChainExpenseTrackerAgent:
    """LangChain agent for AI-powered expense tracking and analysis"""
    
    def __init__(self, google_api_key: str):
        self.google_api_key = google_api_key
        self.is_mock_mode = google_api_key.startswith("mock_")
        
        if not self.is_mock_mode:
            # Initialize LLM
            self.llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                google_api_key=google_api_key,
                temperature=0.3,
                max_output_tokens=2048
            )
            
            # Initialize tools
            self.expense_analyzer = ExpenseAnalyzerTool()
            self.pattern_analyzer = SpendingPatternAnalyzerTool()
        
        logger.info("🤖 LangChain Expense Tracker Agent initialized")
    
    def execute(self, state: AgentState) -> AgentFinish:
        """Execute AI-powered expense tracking and analysis"""
        try:
            logger.info("💰 Performing AI-powered expense tracking...")
            
            if self.is_mock_mode:
                return self._mock_expense_tracking()
            
            # Get budget and expense data
            budget_data = state.get('budget_data', [])
            expense_data = state.get('expense_data', [])
            
            if not budget_data:
                logger.warning("⚠️ No budget data available for expense tracking")
                return self._fallback_expense_tracking()
            
            # Format data for analysis
            budget_str = self._format_budget_data(budget_data)
            expense_str = self._format_expense_data(state)
            
            # Perform expense analysis
            analysis_result = self.expense_analyzer._run(
                budget_data=budget_str,
                expense_data=expense_str,
                historical_spending="",
                llm=self.llm
            )
            
            # Perform pattern analysis
            pattern_result = self.pattern_analyzer._run(
                categorized_expenses=analysis_result,
                usage_summary=analysis_result,
                time_period="current_month",
                llm=self.llm
            )
            
            # Parse results
            try:
                analysis_data = json.loads(analysis_result)
                pattern_data = json.loads(pattern_result)
                
                # Create comprehensive expense tracking result
                result = {
                    'categorized_expenses': analysis_data.get('categorized_expenses', {}),
                    'usage_summary': analysis_data.get('usage_summary', {}),
                    'spending_insights': analysis_data.get('spending_insights', []),
                    'anomalies': analysis_data.get('anomalies', []),
                    'trends': pattern_data.get('trends', []),
                    'predictions': pattern_data.get('predictions', {}),
                    'pattern_insights': pattern_data.get('insights', []),
                    'recommendations': pattern_data.get('recommendations', [])
                }
                
                logger.info("✅ AI-powered expense tracking completed successfully")
                
                return AgentFinish(
                    return_values={
                        'expense_tracking_result': result,
                        'status': 'success',
                        'message': 'AI-powered expense tracking and analysis completed'
                    },
                    log="AI-powered expense tracking completed with comprehensive analysis"
                )
                
            except json.JSONDecodeError as e:
                logger.error(f"❌ Failed to parse analysis results: {e}")
                return self._fallback_expense_tracking()
            
        except Exception as e:
            logger.error(f"❌ Expense tracking error: {e}")
            return self._fallback_expense_tracking()
    
    def _format_budget_data(self, budget_data: List) -> str:
        """Format budget data for analysis"""
        try:
            formatted_budgets = []
            for budget in budget_data:
                if isinstance(budget, dict):
                    formatted_budgets.append({
                        'category': budget.get('category', 'Other'),
                        'amount': budget.get('amount', 0) or budget.get('limit_amount', 0),
                        'department': budget.get('department', 'General'),
                        'priority': budget.get('priority', 'Medium')
                    })
            return json.dumps(formatted_budgets)
        except Exception as e:
            logger.error(f"❌ Budget formatting error: {e}")
            return "[]"
    
    def _format_expense_data(self, state: AgentState) -> str:
        """Format expense data for analysis"""
        try:
            expense_data = state.get('expense_data', [])
            formatted_expenses = []
            for expense in expense_data:
                if isinstance(expense, dict):
                    formatted_expenses.append({
                        'description': expense.get('description', 'Unknown'),
                        'amount': expense.get('amount', 0),
                        'date': expense.get('date', '2024-01-01'),
                        'vendor': expense.get('vendor', 'Unknown')
                    })
            return json.dumps(formatted_expenses)
        except Exception as e:
            logger.error(f"❌ Expense formatting error: {e}")
            return "[]"
    
    def _mock_expense_tracking(self) -> AgentFinish:
        """Mock expense tracking for testing"""
        mock_result = {
            'categorized_expenses': {
                'Office Supplies': [
                    {'description': 'Office paper', 'amount': 50.0, 'date': '2024-01-15', 'vendor': 'Office Depot'}
                ]
            },
            'usage_summary': {
                'Office Supplies': {
                    'total_spent': 50.0,
                    'budget_limit': 500.0,
                    'remaining': 450.0,
                    'percentage_used': 10.0,
                    'status': 'under_budget'
                }
            },
            'spending_insights': ['Mock expense tracking completed'],
            'anomalies': [],
            'trends': [],
            'predictions': {},
            'pattern_insights': [],
            'recommendations': []
        }
        
        return AgentFinish(
            return_values={
                'expense_tracking_result': mock_result,
                'status': 'success',
                'message': 'Mock expense tracking completed'
            },
            log="Mock expense tracking completed"
        )
    
    def _fallback_expense_tracking(self) -> AgentFinish:
        """Fallback expense tracking when AI analysis fails"""
        return AgentFinish(
            return_values={
                'expense_tracking_result': {
                    'categorized_expenses': {},
                    'usage_summary': {},
                    'spending_insights': ['Expense tracking failed'],
                    'anomalies': [],
                    'trends': [],
                    'predictions': {},
                    'pattern_insights': [],
                    'recommendations': []
                },
                'status': 'error',
                'message': 'Expense tracking failed'
            },
            log="Expense tracking failed - fallback used"
        )