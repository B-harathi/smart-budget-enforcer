"""
Agent 2: Real-Time Expense Tracker Agent
Person Y Guide: This agent monitors expense usage against budget limits
Person X: Think of this as a smart calculator that tracks spending in real-time
"""

from typing import Dict, Any, List
from datetime import datetime
import logging

from models import AgentState, ExpenseData, BudgetData
from vector_store import vector_store_manager

logger = logging.getLogger(__name__)

class ExpenseTrackerAgent:
    """
    Person Y: Agent 2 - Monitors transactions and calculates usage vs budget
    Provides real-time budget status tracking
    """
    
    def __init__(self):
        self.status_categories = {
            "Safe": (0, 50),        # 0-50% usage
            "Moderate": (50, 75),   # 50-75% usage  
            "Approaching": (75, 90), # 75-90% usage
            "Warning": (90, 100),   # 90-100% usage
            "Exceeded": (100, float('inf'))  # 100%+ usage
        }
    
    def calculate_usage_percentage(self, used_amount: float, limit_amount: float) -> float:
        """Calculate percentage of budget used"""
        if limit_amount <= 0:
            return 0.0
        return (used_amount / limit_amount) * 100
    
    def get_status_tag(self, usage_percentage: float) -> str:
        """
        Person Y: Determine budget status based on usage percentage
        Returns status like "Safe", "Approaching", "Exceeded"
        """
        for status, (min_pct, max_pct) in self.status_categories.items():
            if min_pct <= usage_percentage < max_pct:
                return status
        return "Unknown"
    
    def create_budget_usage_map(self, budget_data: List[BudgetData], expense_data: ExpenseData = None) -> Dict[str, Any]:
        """
        Person Y: Create comprehensive usage map for all budgets
        Includes current status, remaining amounts, and projections
        """
        usage_map = {
            "summary": {
                "total_budgets": len(budget_data),
                "total_allocated": 0.0,
                "total_used": 0.0,
                "total_remaining": 0.0,
                "overall_usage_percentage": 0.0
            },
            "departments": {},
            "categories": {},
            "individual_budgets": [],
            "status_distribution": {
                "Safe": 0,
                "Moderate": 0, 
                "Approaching": 0,
                "Warning": 0,
                "Exceeded": 0
            }
        }
        
        try:
            for budget in budget_data:
                # Person Y: Calculate individual budget metrics
                used_amount = 0  # BudgetData has no used_amount; set to 0 initially
                usage_percentage = self.calculate_usage_percentage(
                    used_amount, 
                    budget.limit_amount
                )
                remaining_amount = budget.limit_amount - used_amount
                status = self.get_status_tag(usage_percentage)
                
                # Person Y: Individual budget entry
                budget_entry = {
                    "name": budget.name,
                    "department": budget.department,
                    "category": budget.category,
                    "limit_amount": budget.limit_amount,
                    "used_amount": used_amount,
                    "remaining_amount": remaining_amount,
                    "usage_percentage": round(usage_percentage, 2),
                    "status": status,
                    "priority": budget.priority,
                    "vendor": budget.vendor,
                    "warning_threshold": budget.warning_threshold,
                    "over_warning": used_amount >= budget.warning_threshold,
                    "over_limit": used_amount > budget.limit_amount
                }
                
                usage_map["individual_budgets"].append(budget_entry)
                
                # Person Y: Update status distribution
                usage_map["status_distribution"][status] += 1
                
                # Person Y: Aggregate by department
                dept = budget.department
                if dept not in usage_map["departments"]:
                    usage_map["departments"][dept] = {
                        "department": dept,
                        "total_allocated": 0.0,
                        "total_used": 0.0,
                        "total_remaining": 0.0,
                        "usage_percentage": 0.0,
                        "budget_count": 0,
                        "categories": []
                    }
                
                dept_data = usage_map["departments"][dept]
                dept_data["total_allocated"] += budget.limit_amount
                dept_data["total_used"] += used_amount
                dept_data["total_remaining"] += remaining_amount
                dept_data["budget_count"] += 1
                dept_data["categories"].append(budget.category)
                
                # Person Y: Aggregate by category
                cat = budget.category
                if cat not in usage_map["categories"]:
                    usage_map["categories"][cat] = {
                        "category": cat,
                        "total_allocated": 0.0,
                        "total_used": 0.0,
                        "total_remaining": 0.0,
                        "usage_percentage": 0.0,
                        "budget_count": 0,
                        "departments": []
                    }
                
                cat_data = usage_map["categories"][cat]
                cat_data["total_allocated"] += budget.limit_amount
                cat_data["total_used"] += used_amount
                cat_data["total_remaining"] += remaining_amount
                cat_data["budget_count"] += 1
                cat_data["departments"].append(budget.department)
                
                # Person Y: Update summary totals
                usage_map["summary"]["total_allocated"] += budget.limit_amount
                usage_map["summary"]["total_used"] += used_amount
                usage_map["summary"]["total_remaining"] += remaining_amount
            
            # Person Y: Calculate final percentages
            if usage_map["summary"]["total_allocated"] > 0:
                usage_map["summary"]["overall_usage_percentage"] = round(
                    (usage_map["summary"]["total_used"] / usage_map["summary"]["total_allocated"]) * 100, 2
                )
            
            # Person Y: Calculate department percentages
            for dept_data in usage_map["departments"].values():
                if dept_data["total_allocated"] > 0:
                    dept_data["usage_percentage"] = round(
                        (dept_data["total_used"] / dept_data["total_allocated"]) * 100, 2
                    )
                dept_data["categories"] = list(set(dept_data["categories"]))
            
            # Person Y: Calculate category percentages
            for cat_data in usage_map["categories"].values():
                if cat_data["total_allocated"] > 0:
                    cat_data["usage_percentage"] = round(
                        (cat_data["total_used"] / cat_data["total_allocated"]) * 100, 2
                    )
                cat_data["departments"] = list(set(cat_data["departments"]))
            
            # Person Y: Add expense context if provided
            if expense_data:
                usage_map["latest_expense"] = {
                    "amount": expense_data.amount,
                    "department": expense_data.department,
                    "category": expense_data.category,
                    "description": expense_data.description,
                    "vendor_name": expense_data.vendor_name,
                    "date": expense_data.date.isoformat()
                }
            
            logger.info(f"✅ Created usage map for {len(budget_data)} budgets")
            return usage_map
            
        except Exception as e:
            logger.error(f"❌ Error creating budget usage map: {e}")
            raise
    
    def identify_pressure_zones(self, usage_map: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Person Y: Identify budget areas under pressure (high usage)
        Returns list of budgets that need attention
        """
        pressure_zones = []
        
        try:
            for budget in usage_map["individual_budgets"]:
                # Person Y: Define pressure criteria
                is_pressure_zone = (
                    budget["usage_percentage"] >= 75 or  # High usage
                    budget["over_warning"] or            # Over warning threshold
                    budget["over_limit"] or              # Over budget limit
                    budget["priority"] in ["High", "Critical"]  # High priority budgets
                )
                
                if is_pressure_zone:
                    pressure_zone = {
                        "name": budget["name"],
                        "department": budget["department"],
                        "category": budget["category"],
                        "usage_percentage": budget["usage_percentage"],
                        "remaining_amount": budget["remaining_amount"],
                        "priority": budget["priority"],
                        "status": budget["status"],
                        "pressure_factors": []
                    }
                    
                    # Person Y: Identify specific pressure factors
                    if budget["usage_percentage"] >= 90:
                        pressure_zone["pressure_factors"].append("Critical usage level (90%+)")
                    elif budget["usage_percentage"] >= 75:
                        pressure_zone["pressure_factors"].append("High usage level (75%+)")
                    
                    if budget["over_warning"]:
                        pressure_zone["pressure_factors"].append("Exceeded warning threshold")
                    
                    if budget["over_limit"]:
                        pressure_zone["pressure_factors"].append("Budget limit exceeded")
                    
                    if budget["priority"] in ["High", "Critical"]:
                        pressure_zone["pressure_factors"].append(f"{budget['priority']} priority budget")
                    
                    pressure_zones.append(pressure_zone)
            
            # Person Y: Sort by severity (highest usage first)
            pressure_zones.sort(key=lambda x: x["usage_percentage"], reverse=True)
            
            logger.info(f"✅ Identified {len(pressure_zones)} pressure zones")
            return pressure_zones
            
        except Exception as e:
            logger.error(f"❌ Error identifying pressure zones: {e}")
            return []
    
    def get_budget_recommendations(self, usage_map: Dict[str, Any], user_id: str) -> List[str]:
        """
        Person Y: Generate basic budget recommendations based on usage patterns
        This provides quick insights before AI-powered recommendations
        """
        recommendations = []
        
        try:
            # Person Y: Overall usage recommendations
            overall_usage = usage_map["summary"]["overall_usage_percentage"]
            
            if overall_usage > 90:
                recommendations.append("⚠️ Overall budget usage is critical (90%+). Consider implementing spending freeze.")
            elif overall_usage > 75:
                recommendations.append("📊 High overall budget usage (75%+). Review non-essential expenses.")
            elif overall_usage < 25:
                recommendations.append("💰 Low budget utilization. Consider reallocating unused funds.")
            
            # Person Y: Department-specific recommendations
            for dept_data in usage_map["departments"].values():
                if dept_data["usage_percentage"] > 100:
                    recommendations.append(f"🚨 {dept_data['department']} department exceeded budget. Immediate action required.")
                elif dept_data["usage_percentage"] > 85:
                    recommendations.append(f"⚠️ {dept_data['department']} department approaching limit. Monitor closely.")
            
            # Person Y: Status distribution insights
            status_dist = usage_map["status_distribution"]
            if status_dist["Exceeded"] > 0:
                recommendations.append(f"❌ {status_dist['Exceeded']} budget(s) exceeded limits. Review and adjust.")
            
            if status_dist["Warning"] > 0:
                recommendations.append(f"⚠️ {status_dist['Warning']} budget(s) in warning zone. Take preventive action.")
            
            # Person Y: Search for historical context using RAG
            try:
                context_docs = vector_store_manager.search_similar_documents(
                    query="budget recommendations spending optimization cost reduction",
                    user_id=user_id,
                    k=3
                )
                
                if context_docs:
                    recommendations.append("📚 Check previous budget policies for additional guidance.")
                    
            except Exception as e:
                logger.warning(f"⚠️ Could not fetch historical context: {e}")
            
            return recommendations
            
        except Exception as e:
            logger.error(f"❌ Error generating recommendations: {e}")
            return ["❌ Unable to generate recommendations at this time."]
    
    def process_expense_tracking(self, state: AgentState) -> AgentState:
        """
        Person Y: Main processing function for LangGraph workflow
        Analyzes current budget usage and expense patterns
        """
        try:
            logger.info("🤖 Expense Tracker Agent starting...")
            state.processing_steps.append("Expense Tracker Agent started")
            
            # Person Y: Create comprehensive usage map
            if not state.structured_budget_data:
                logger.warning("⚠️ No budget data available for tracking")
                state.budget_usage_map = {}
                return state
            
            logger.info(f"📊 Analyzing {len(state.structured_budget_data)} budgets...")
            
            usage_map = self.create_budget_usage_map(
                budget_data=state.structured_budget_data,
                expense_data=state.expense_data
            )
            
            state.budget_usage_map = usage_map
            state.processing_steps.append("Budget usage map created")
            
            # Person Y: Identify pressure zones
            pressure_zones = self.identify_pressure_zones(usage_map)
            usage_map["pressure_zones"] = pressure_zones
            state.processing_steps.append(f"Identified {len(pressure_zones)} pressure zones")
            
            # Person Y: Generate basic recommendations
            if state.user_id:
                recommendations = self.get_budget_recommendations(usage_map, state.user_id)
                usage_map["basic_recommendations"] = recommendations
                state.processing_steps.append("Generated basic recommendations")
            
            logger.info("✅ Expense Tracker Agent completed successfully")
            return state
            
        except Exception as e:
            error_msg = f"❌ Expense Tracker Agent error: {e}"
            logger.error(error_msg)
            state.errors.append(error_msg)
            return state

    def process_expense(self, state):
        """Process expense tracking (stub)"""
        return state

# Person Y: Export agent instance
expense_tracker_agent = None

def initialize_agent() -> ExpenseTrackerAgent:
    """Initialize the expense tracker agent"""
    global expense_tracker_agent
    expense_tracker_agent = ExpenseTrackerAgent()
    return expense_tracker_agent