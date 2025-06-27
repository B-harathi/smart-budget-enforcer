"""
Agent 5: Escalation Communicator Agent
Person Y Guide: This agent handles notifications and escalations for budget breaches
Person X: Think of this as a smart messenger that sends alerts to the right people
"""

from typing import List, Dict, Any, Optional
import logging
import requests
from datetime import datetime

from models import AgentState, RecommendationData

logger = logging.getLogger(__name__)

class EscalationCommunicatorAgent:
    """
    Person Y: Agent 5 - Handles notifications and escalation communications
    Sends contextual alerts via email and other channels
    """
    
    def __init__(self, node_backend_url: str):
        self.node_backend_url = node_backend_url
        self.escalation_levels = {
            "low": ["email"],
            "medium": ["email", "slack"],  
            "high": ["email", "slack", "sms"],
            "critical": ["email", "slack", "sms", "phone"]
        }
    
    def determine_escalation_level(self, breach_context: Dict[str, Any]) -> str:
        """
        Person Y: Determine appropriate escalation level based on breach severity
        """
        try:
            if not breach_context.get("breaches_found"):
                return "low"
            
            breach_details = breach_context.get("breach_details", [])
            if not breach_details:
                return "low"
            
            # Person Y: Find highest severity level
            severity_levels = [breach["severity"] for breach in breach_details]
            
            if "critical" in severity_levels:
                return "critical"
            elif "high" in severity_levels:
                return "high"
            elif "medium" in severity_levels:
                return "medium"
            else:
                return "low"
                
        except Exception as e:
            logger.error(f"❌ Error determining escalation level: {e}")
            return "medium"  # Default to medium for safety
    
    def prepare_notification_payload(self, state: AgentState) -> Dict[str, Any]:
        """
        Person Y: Prepare comprehensive notification payload for Node.js backend
        """
        try:
            current_time = datetime.now()
            escalation_level = self.determine_escalation_level(state.breach_context)
            
            payload = {
                "timestamp": current_time.isoformat(),
                "escalation_level": escalation_level,
                "user_id": state.user_id,
                "notification_type": "budget_breach_alert",
                "summary": {
                    "breaches_detected": state.breach_detected,
                    "total_breaches": 0,
                    "requires_immediate_action": False,
                    "recommendations_count": len(state.recommendations)
                },
                "breach_details": [],
                "recommendations": [],
                "budget_summary": {},
                "next_steps": []
            }
            
            # Person Y: Add breach information if available
            if state.breach_detected and state.breach_context.get("breaches_found"):
                breach_details = state.breach_context.get("breach_details", [])
                payload["summary"]["total_breaches"] = len(breach_details)
                payload["summary"]["requires_immediate_action"] = any(
                    b["severity"] in ["high", "critical"] for b in breach_details
                )
                
                # Person Y: Format breach details for notification
                for breach in breach_details:
                    formatted_breach = {
                        "department": breach["department"],
                        "category": breach["category"],
                        "severity": breach["severity"],
                        "priority": breach["priority"],
                        "breach_types": breach["breach_types"],
                        "financial_impact": breach.get("financial_impact", {}),
                        "description": self._generate_breach_description(breach)
                    }
                    payload["breach_details"].append(formatted_breach)
            
            # Person Y: Add recommendations
            for rec in state.recommendations:
                formatted_rec = {
                    "title": rec.title,
                    "description": rec.description,
                    "type": rec.type.value,
                    "priority": rec.priority,
                    "estimated_savings": rec.estimated_savings
                }
                payload["recommendations"].append(formatted_rec)
            
            # Person Y: Add budget summary
            if state.budget_usage_map:
                payload["budget_summary"] = {
                    "total_allocated": state.budget_usage_map.get("summary", {}).get("total_allocated", 0),
                    "total_used": state.budget_usage_map.get("summary", {}).get("total_used", 0),
                    "overall_usage_percentage": state.budget_usage_map.get("summary", {}).get("overall_usage_percentage", 0)
                }
            
            # Person Y: Generate next steps
            payload["next_steps"] = self._generate_next_steps(state, escalation_level)
            
            return payload
            
        except Exception as e:
            logger.error(f"❌ Error preparing notification payload: {e}")
            return {"error": str(e)}
    
    def _generate_breach_description(self, breach: Dict[str, Any]) -> str:
        """Generate human-readable breach description"""
        try:
            department = breach["department"]
            category = breach["category"]
            severity = breach["severity"]
            
            description = f"{severity.title()} budget breach in {department} department ({category}). "
            
            financial_impact = breach.get("financial_impact", {})
            if financial_impact.get("overage_amount"):
                overage = financial_impact["overage_amount"]
                percentage = financial_impact.get("overage_percentage", 0)
                description += f"Budget exceeded by ${overage:,.2f} ({percentage:.1f}% over limit). "
            
            breach_types = breach.get("breach_types", [])
            if "budget_limit_exceeded" in breach_types:
                description += "Immediate action required to prevent further overage."
            elif "warning_threshold_exceeded" in breach_types:
                description += "Warning threshold exceeded - monitor closely."
            
            return description
            
        except Exception as e:
            return f"Budget breach detected in {breach.get('department', 'Unknown')} department."
    
    def _generate_next_steps(self, state: AgentState, escalation_level: str) -> List[str]:
        """Generate recommended next steps based on situation"""
        next_steps = []
        
        try:
            if state.breach_detected:
                if escalation_level == "critical":
                    next_steps.extend([
                        "🚨 Implement immediate spending freeze on affected budgets",
                        "📞 Schedule emergency budget review meeting within 24 hours",
                        "📧 Notify senior management and finance team immediately",
                        "📊 Prepare detailed financial impact assessment"
                    ])
                elif escalation_level == "high":
                    next_steps.extend([
                        "⚠️ Review and approve any pending expenses in affected categories",
                        "📅 Schedule budget review meeting within 48 hours", 
                        "💡 Evaluate AI recommendations for immediate implementation",
                        "📈 Implement enhanced monitoring for affected budgets"
                    ])
                elif escalation_level == "medium":
                    next_steps.extend([
                        "📋 Review spending patterns in affected departments",
                        "🔍 Analyze AI recommendations for cost optimization",
                        "📊 Update budget forecasts and projections",
                        "👥 Communicate with department heads about spending controls"
                    ])
                else:  # low
                    next_steps.extend([
                        "📈 Monitor budget usage trends closely",
                        "💡 Consider implementing preventive recommendations",
                        "📅 Schedule routine budget review meeting",
                        "📚 Review budget policies and thresholds"
                    ])
            else:
                # Person Y: No breaches - preventive steps
                next_steps.extend([
                    "✅ All budgets are within limits - continue monitoring",
                    "📊 Review budget utilization for optimization opportunities",
                    "💡 Consider implementing preventive recommendations",
                    "📅 Schedule next routine budget review"
                ])
            
            # Person Y: Add recommendation-specific steps
            if state.recommendations:
                next_steps.append(f"🤖 Review {len(state.recommendations)} AI-generated recommendations")
                
                high_priority_recs = [r for r in state.recommendations if r.priority == 1]
                if high_priority_recs:
                    next_steps.append(f"⭐ Prioritize {len(high_priority_recs)} high-priority recommendations")
            
            return next_steps
            
        except Exception as e:
            logger.error(f"❌ Error generating next steps: {e}")
            return ["📧 Review budget status and take appropriate action"]
    
    def send_notification_to_backend(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Person Y: Send notification payload to Node.js backend for email processing
        """
        try:
            # Person Y: Send to Node.js backend notification endpoint
            response = requests.post(
                f"{self.node_backend_url}/api/internal/process-breach-notification",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                logger.info("✅ Notification sent to backend successfully")
                return {"success": True, "response": result}
            else:
                logger.error(f"❌ Backend notification failed: {response.status_code} - {response.text}")
                return {"success": False, "error": f"HTTP {response.status_code}: {response.text}"}
                
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Error sending notification to backend: {e}")
            return {"success": False, "error": str(e)}
        except Exception as e:
            logger.error(f"❌ Unexpected error in notification: {e}")
            return {"success": False, "error": str(e)}
    
    def log_escalation_activity(self, state: AgentState, notification_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Person Y: Log escalation activity for audit trail
        """
        try:
            activity_log = {
                "timestamp": datetime.now().isoformat(),
                "user_id": state.user_id,
                "escalation_level": self.determine_escalation_level(state.breach_context),
                "breaches_detected": state.breach_detected,
                "total_breaches": len(state.breach_context.get("breach_details", [])) if state.breach_detected else 0,
                "recommendations_generated": len(state.recommendations),
                "notification_success": notification_result.get("success", False),
                "channels_used": ["email"],  # Person Y: Currently only email implemented
                "processing_time": (datetime.now() - state.start_time).total_seconds(),
                "errors": state.errors
            }
            
            logger.info(f"📝 Escalation activity logged: {activity_log['escalation_level']} level")
            return activity_log
            
        except Exception as e:
            logger.error(f"❌ Error logging escalation activity: {e}")
            return {"error": str(e)}
    
    def generate_communication_summary(self, state: AgentState) -> str:
        """
        Person Y: Generate a summary of all communications sent
        """
        try:
            summary_parts = []
            
            # Person Y: Basic status
            if state.breach_detected:
                breach_count = len(state.breach_context.get("breach_details", []))
                summary_parts.append(f"🚨 {breach_count} budget breach(es) detected and reported")
            else:
                summary_parts.append("✅ Budget status normal - no breaches detected")
            
            # Person Y: Recommendations
            if state.recommendations:
                rec_count = len(state.recommendations)
                summary_parts.append(f"💡 {rec_count} AI recommendation(s) generated")
                
                high_priority = len([r for r in state.recommendations if r.priority == 1])
                if high_priority > 0:
                    summary_parts.append(f"⭐ {high_priority} high-priority recommendation(s)")
            
            # Person Y: Communication channels
            escalation_level = self.determine_escalation_level(state.breach_context)
            channels = self.escalation_levels.get(escalation_level, ["email"])
            summary_parts.append(f"📧 Notifications sent via: {', '.join(channels)}")
            
            # Person Y: Processing summary
            processing_time = (datetime.now() - state.start_time).total_seconds()
            summary_parts.append(f"⏱️ Total processing time: {processing_time:.2f} seconds")
            
            return " | ".join(summary_parts)
            
        except Exception as e:
            logger.error(f"❌ Error generating communication summary: {e}")
            return "Communication summary unavailable"
    
    def process_escalation_communication(self, state: AgentState) -> AgentState:
        """
        Person Y: Main processing function for LangGraph workflow
        Handles all escalation and communication tasks
        """
        try:
            logger.info("🤖 Escalation Communicator Agent starting...")
            state.processing_steps.append("Escalation Communicator Agent started")
            
            # Person Y: Prepare notification payload
            logger.info("📋 Preparing notification payload...")
            notification_payload = self.prepare_notification_payload(state)
            
            if "error" in notification_payload:
                raise Exception(f"Failed to prepare notification: {notification_payload['error']}")
            
            state.processing_steps.append("Notification payload prepared")
            
            # Person Y: Send notification to Node.js backend
            logger.info("📧 Sending notification to backend...")
            notification_result = self.send_notification_to_backend(notification_payload)
            
            if notification_result["success"]:
                state.processing_steps.append("Email notification sent successfully")
                state.notifications_sent.append("email")
                logger.info("✅ Email notification sent successfully")
            else:
                error_msg = f"Email notification failed: {notification_result.get('error', 'Unknown error')}"
                state.errors.append(error_msg)
                logger.error(f"❌ {error_msg}")
            
            # Person Y: Log escalation activity
            activity_log = self.log_escalation_activity(state, notification_result)
            state.processing_steps.append("Escalation activity logged")
            
            # Person Y: Generate communication summary
            communication_summary = self.generate_communication_summary(state)
            state.processing_steps.append("Communication summary generated")
            
            logger.info(f"📊 Communication Summary: {communication_summary}")
            logger.info("✅ Escalation Communicator Agent completed successfully")
            
            return state
            
        except Exception as e:
            error_msg = f"❌ Escalation Communicator Agent error: {e}"
            logger.error(error_msg)
            state.errors.append(error_msg)
            return state

# Person Y: Export agent instance
escalation_communicator_agent = None

def initialize_agent(node_backend_url: str) -> EscalationCommunicatorAgent:
    """Initialize the escalation communicator agent"""
    global escalation_communicator_agent
    escalation_communicator_agent = EscalationCommunicatorAgent(node_backend_url)
    return escalation_communicator_agent