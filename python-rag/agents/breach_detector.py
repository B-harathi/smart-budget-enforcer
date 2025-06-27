"""
Agent 3: Breach Detector Agent
Person Y Guide: This agent identifies budget violations and categorizes severity
Person X: Think of this as a smart alarm system that detects overspending
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import logging

from models import AgentState, ExpenseData, BudgetData

logger = logging.getLogger(__name__)

class BreachDetectorAgent:
    """
    Person Y: Agent 3 - Detects budget breaches and categorizes by severity
    Provides detailed context about violations for corrective action
    """
    
    def __init__(self):
        self.severity_levels = {
            "low": (1, 10),      # 1-10% over limit
            "medium": (10, 25),   # 10-25% over limit  
            "high": (25, 50),     # 25-50% over limit
            "critical": (50, float('inf'))  # 50%+ over limit
        }
        
        self.breach_types = [
            "budget_limit_exceeded",
            "warning_threshold_exceeded", 
            "rapid_spending_detected",
            "recurring_overage",
            "high_priority_breach"
        ]
    
    def calculate_overage_percentage(self, used_amount: float, limit_amount: float) -> float:
        """Calculate percentage by which budget is exceeded"""
        if limit_amount <= 0:
            return 0.0
        if used_amount <= limit_amount:
            return 0.0
        
        overage = used_amount - limit_amount
        return (overage / limit_amount) * 100
    
    def determine_severity(self, overage_percentage: float, priority: str) -> str:
        """
        Person Y: Determine breach severity based on overage and priority
        Higher priority budgets get escalated severity levels
        """
        base_severity = "low"
        
        # Person Y: Determine base severity from overage percentage
        for severity, (min_pct, max_pct) in self.severity_levels.items():
            if min_pct <= overage_percentage < max_pct:
                base_severity = severity
                break
        
        # Person Y: Escalate severity for high-priority budgets
        if priority in ["High", "Critical"]:
            severity_order = ["low", "medium", "high", "critical"]
            current_index = severity_order.index(base_severity)
            
            if priority == "High" and current_index < 2:
                return severity_order[current_index + 1]
            elif priority == "Critical" and current_index < 3:
                return severity_order[min(current_index + 2, 3)]
        
        return base_severity
    
    def detect_budget_breaches(self, usage_map: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Person Y: Detect all types of budget breaches from usage map
        Returns detailed breach information with context
        """
        breaches = []
        
        try:
            current_time = datetime.now()
            
            for budget in usage_map.get("individual_budgets", []):
                breach_data = {
                    "budget_name": budget["name"],
                    "department": budget["department"],
                    "category": budget["category"],
                    "breach_types": [],
                    "severity": "low",
                    "priority": budget["priority"],
                    "detection_time": current_time.isoformat(),
                    "financial_impact": {},
                    "context": {}
                }
                
                # Person Y: 1. Check budget limit breaches
                if budget["over_limit"]:
                    overage_amount = budget["used_amount"] - budget["limit_amount"]
                    overage_percentage = self.calculate_overage_percentage(
                        budget["used_amount"], 
                        budget["limit_amount"]
                    )
                    
                    breach_data["breach_types"].append("budget_limit_exceeded")
                    breach_data["severity"] = self.determine_severity(
                        overage_percentage, 
                        budget["priority"]
                    )
                    
                    breach_data["financial_impact"] = {
                        "overage_amount": round(overage_amount, 2),
                        "overage_percentage": round(overage_percentage, 2),
                        "limit_amount": budget["limit_amount"],
                        "used_amount": budget["used_amount"]
                    }
                    
                    breach_data["context"]["limit_breach"] = {
                        "description": f"Budget exceeded by ${overage_amount:,.2f} ({overage_percentage:.1f}%)",
                        "impact_level": breach_data["severity"]
                    }
                
                # Person Y: 2. Check warning threshold breaches
                elif budget["over_warning"]:
                    threshold_usage = (budget["used_amount"] / budget["warning_threshold"]) * 100
                    
                    breach_data["breach_types"].append("warning_threshold_exceeded")
                    breach_data["severity"] = "medium" if budget["priority"] in ["High", "Critical"] else "low"
                    
                    breach_data["context"]["warning_breach"] = {
                        "description": f"Warning threshold exceeded ({threshold_usage:.1f}% of warning limit)",
                        "warning_threshold": budget["warning_threshold"],
                        "remaining_before_limit": budget["limit_amount"] - budget["used_amount"]
                    }
                
                # Person Y: 3. Check high usage without breach (approaching limit)
                elif budget["usage_percentage"] >= 85:
                    breach_data["breach_types"].append("rapid_spending_detected")
                    breach_data["severity"] = "medium" if budget["usage_percentage"] >= 95 else "low"
                    
                    breach_data["context"]["rapid_spending"] = {
                        "description": f"Rapid spending detected ({budget['usage_percentage']:.1f}% used)",
                        "days_remaining_estimate": self._estimate_days_to_breach(budget),
                        "burn_rate_warning": True
                    }
                
                # Person Y: 4. Check for high-priority budget concerns
                if budget["priority"] in ["High", "Critical"] and budget["usage_percentage"] >= 70:
                    if "high_priority_breach" not in breach_data["breach_types"]:
                        breach_data["breach_types"].append("high_priority_breach")
                    
                    # Person Y: Upgrade severity for critical priority budgets
                    if budget["priority"] == "Critical":
                        current_severity = breach_data["severity"]
                        if current_severity == "low":
                            breach_data["severity"] = "medium"
                        elif current_severity == "medium":
                            breach_data["severity"] = "high"
                    
                    breach_data["context"]["priority_concern"] = {
                        "description": f"{budget['priority']} priority budget at {budget['usage_percentage']:.1f}% usage",
                        "requires_immediate_attention": budget["priority"] == "Critical"
                    }
                
                # Person Y: Only add to breaches if violations detected
                if breach_data["breach_types"]:
                    # Person Y: Add general context
                    breach_data["context"]["general"] = {
                        "vendor": budget.get("vendor", "Not specified"),
                        "budget_status": budget["status"],
                        "remaining_amount": budget["remaining_amount"]
                    }
                    
                    breaches.append(breach_data)
            
            # Person Y: Sort breaches by severity and impact
            breaches.sort(key=lambda x: (
                ["low", "medium", "high", "critical"].index(x["severity"]),
                -x["financial_impact"].get("overage_amount", 0)
            ), reverse=True)
            
            logger.info(f"✅ Detected {len(breaches)} budget breaches")
            return breaches
            
        except Exception as e:
            logger.error(f"❌ Error detecting breaches: {e}")
            return []
    
    def _estimate_days_to_breach(self, budget: Dict[str, Any]) -> int:
        """
        Person Y: Estimate days until budget breach based on current spending rate
        This is a simple projection - could be enhanced with historical data
        """
        try:
            # Person Y: Simple estimation assuming current daily rate continues
            remaining_amount = budget["remaining_amount"]
            if remaining_amount <= 0:
                return 0
            
            # Person Y: Assume monthly budget, estimate daily burn rate
            days_in_month = 30
            daily_burn_rate = budget["used_amount"] / (days_in_month * (budget["usage_percentage"] / 100))
            
            if daily_burn_rate <= 0:
                return days_in_month  # Fallback
            
            days_to_breach = remaining_amount / daily_burn_rate
            return max(1, int(days_to_breach))
            
        except:
            return 7  # Default fallback
    
    def analyze_breach_patterns(self, breaches: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Person Y: Analyze patterns in breaches to provide insights
        Identifies recurring issues and systemic problems
        """
        try:
            analysis = {
                "total_breaches": len(breaches),
                "severity_breakdown": {"low": 0, "medium": 0, "high": 0, "critical": 0},
                "department_analysis": {},
                "category_analysis": {},
                "priority_analysis": {},
                "financial_impact": {"total_overage": 0.0, "average_overage": 0.0},
                "patterns": [],
                "recommendations": []
            }
            
            if not breaches:
                return analysis
            
            total_overage = 0.0
            overages = []
            
            for breach in breaches:
                # Person Y: Severity breakdown
                analysis["severity_breakdown"][breach["severity"]] += 1
                
                # Person Y: Department analysis
                dept = breach["department"]
                if dept not in analysis["department_analysis"]:
                    analysis["department_analysis"][dept] = {"count": 0, "severity_levels": []}
                analysis["department_analysis"][dept]["count"] += 1
                analysis["department_analysis"][dept]["severity_levels"].append(breach["severity"])
                
                # Person Y: Category analysis  
                cat = breach["category"]
                if cat not in analysis["category_analysis"]:
                    analysis["category_analysis"][cat] = {"count": 0, "departments": []}
                analysis["category_analysis"][cat]["count"] += 1
                analysis["category_analysis"][cat]["departments"].append(dept)
                
                # Person Y: Priority analysis
                priority = breach["priority"]
                if priority not in analysis["priority_analysis"]:
                    analysis["priority_analysis"][priority] = 0
                analysis["priority_analysis"][priority] += 1
                
                # Person Y: Financial impact
                overage = breach["financial_impact"].get("overage_amount", 0)
                if overage > 0:
                    total_overage += overage
                    overages.append(overage)
            
            # Person Y: Calculate financial metrics
            analysis["financial_impact"]["total_overage"] = round(total_overage, 2)
            if overages:
                analysis["financial_impact"]["average_overage"] = round(sum(overages) / len(overages), 2)
                analysis["financial_impact"]["largest_overage"] = round(max(overages), 2)
            
            # Person Y: Identify patterns
            if analysis["severity_breakdown"]["critical"] > 0:
                analysis["patterns"].append("Critical budget violations detected - immediate action required")
            
            # Person Y: Department with most breaches
            if analysis["department_analysis"]:
                dept_counts = {dept: data["count"] for dept, data in analysis["department_analysis"].items()}
                worst_dept = max(dept_counts, key=dept_counts.get)
                if dept_counts[worst_dept] > 1:
                    analysis["patterns"].append(f"Multiple breaches in {worst_dept} department")
            
            # Person Y: High-priority budget issues
            if analysis["priority_analysis"].get("High", 0) + analysis["priority_analysis"].get("Critical", 0) > 0:
                analysis["patterns"].append("High-priority budgets affected - escalation recommended")
            
            return analysis
            
        except Exception as e:
            logger.error(f"❌ Error analyzing breach patterns: {e}")
            return {"error": str(e)}
    
    def process_breach_detection(self, state: AgentState) -> AgentState:
        """
        Person Y: Main processing function for LangGraph workflow
        Detects and analyzes all budget breaches
        """
        try:
            logger.info("🤖 Breach Detector Agent starting...")
            state.processing_steps.append("Breach Detector Agent started")
            
            # Person Y: Check if we have usage data to analyze
            if not state.budget_usage_map:
                logger.warning("⚠️ No budget usage data available for breach detection")
                state.breach_detected = False
                state.breach_context = {"message": "No usage data available"}
                return state
            
            logger.info("🔍 Analyzing budget usage for breaches...")
            
            # Person Y: Detect breaches
            breaches = self.detect_budget_breaches(state.budget_usage_map)
            
            # Person Y: Update state with breach information
            state.breach_detected = len(breaches) > 0
            
            if breaches:
                # Person Y: Analyze breach patterns
                breach_analysis = self.analyze_breach_patterns(breaches)
                
                # Person Y: Store comprehensive breach context
                state.breach_context = {
                    "breaches_found": True,
                    "total_breaches": len(breaches),
                    "breach_details": breaches,
                    "analysis": breach_analysis,
                    "requires_immediate_action": any(b["severity"] in ["high", "critical"] for b in breaches),
                    "requires_escalation": any(b["priority"] in ["High", "Critical"] for b in breaches)
                }
                
                state.processing_steps.append(f"Detected {len(breaches)} breaches")
                logger.info(f"🚨 Found {len(breaches)} budget breaches requiring attention")
                
                # Person Y: Log critical breaches
                critical_breaches = [b for b in breaches if b["severity"] == "critical"]
                if critical_breaches:
                    logger.warning(f"⚠️ {len(critical_breaches)} CRITICAL breaches detected!")
                    
            else:
                state.breach_context = {
                    "breaches_found": False,
                    "message": "No budget breaches detected",
                    "all_budgets_within_limits": True
                }
                state.processing_steps.append("No breaches detected - all budgets within limits")
                logger.info("✅ No budget breaches detected")
            
            logger.info("✅ Breach Detector Agent completed successfully")
            return state
            
        except Exception as e:
            error_msg = f"❌ Breach Detector Agent error: {e}"
            logger.error(error_msg)
            state.errors.append(error_msg)
            return state

    def detect_breaches(self, state):
        """Detect budget breaches (stub)"""
        return state

# Person Y: Export agent instance
breach_detector_agent = None

def initialize_agent() -> BreachDetectorAgent:
    """Initialize the breach detector agent"""
    global breach_detector_agent
    breach_detector_agent = BreachDetectorAgent()
    return breach_detector_agent