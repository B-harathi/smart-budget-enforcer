"""
LangChain Escalation Communicator Agent
Agent 5: AI-powered notification and escalation handling using LangChain tools and LLM
"""

import json
import logging
import requests
from typing import Dict, Any, List, Optional
from langchain.schema import AgentAction, AgentFinish
from langchain.tools import BaseTool
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain_core.callbacks import CallbackManagerForToolRun
from models import AgentState

logger = logging.getLogger(__name__)

class NotificationGeneratorTool(BaseTool):
    """LangChain tool for generating intelligent notifications and alerts"""
    
    name: str = "notification_generator"
    description: str = "Generate context-aware notifications and escalation messages"
    
    def _run(
        self,
        breach_analysis: str,
        recommendations: str,
        budget_context: str,
        user_info: str,
        llm = None,
        run_manager: Optional[CallbackManagerForToolRun] = None,
    ) -> str:
        """Generate intelligent notifications"""
        try:
            notification_prompt = """You are an expert in business communication and escalation management.

TASK: Generate appropriate notifications and escalation messages based on budget analysis.

CONTEXT:
Breach Analysis: {breach_analysis}
Recommendations: {recommendations}
Budget Context: {budget_context}
User Information: {user_info}

NOTIFICATION TYPES:
1. Budget Alert: When spending approaches or exceeds limits
2. Recommendation Alert: When actionable recommendations are available
3. Escalation Alert: When immediate attention is required
4. Summary Report: Periodic budget status updates

MESSAGE REQUIREMENTS:
- Clear and concise communication
- Actionable next steps
- Appropriate urgency level
- Professional tone
- Specific details about the issue

ESCALATION LEVELS:
- LOW: Informational updates, no immediate action required
- MEDIUM: Attention needed, review recommended
- HIGH: Immediate action required, potential budget impact
- CRITICAL: Urgent escalation, immediate intervention needed

RETURN FORMAT (JSON only):
{
  "notifications": [
    {
      "type": "budget_alert/recommendation_alert/escalation_alert/summary_report",
      "priority": "low/medium/high/critical",
      "recipient": "email@company.com",
      "subject": "Clear subject line",
      "message": "Detailed message with context and actions",
      "actions_required": ["action1", "action2"],
      "escalation_level": "low/medium/high/critical"
    }
  ],
  "escalation_plan": {
    "immediate_actions": ["action1", "action2"],
    "follow_up_required": true/false,
    "escalation_chain": ["manager", "director", "finance"],
    "timeline": "description of timeline"
  }
}

Generate notifications that are informative, actionable, and appropriately urgent.
"""
            
            prompt = notification_prompt.format(
                breach_analysis=breach_analysis,
                recommendations=recommendations,
                budget_context=budget_context,
                user_info=user_info
            )
            
            if llm:
                response = llm.invoke(prompt)
                
                # Extract JSON from response
                json_str = self._extract_json_from_response(response.content)
                if json_str:
                    # Validate JSON
                    try:
                        notifications = json.loads(json_str)
                        if isinstance(notifications, dict):
                            return json_str
                    except json.JSONDecodeError:
                        pass
            
            # Fallback to rule-based notifications
            return self._rule_based_notifications(breach_analysis, recommendations)
            
        except Exception as e:
            logger.error(f"❌ Notification generation error: {e}")
            return self._rule_based_notifications(breach_analysis, recommendations)
    
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
    
    def _rule_based_notifications(self, breach_analysis: str, recommendations: str) -> str:
        """Fallback rule-based notification generation"""
        try:
            breach_data = json.loads(breach_analysis) if breach_analysis else {}
            rec_data = json.loads(recommendations) if recommendations else []
            
            notifications = []
            escalation_level = "low"
            
            # Check breach severity
            if breach_data.get('breach_detected', False):
                severity = breach_data.get('breach_severity', 'low')
                
                if severity == 'critical':
                    escalation_level = 'critical'
                    notifications.append({
                        "type": "escalation_alert",
                        "priority": "critical",
                        "recipient": "gbharathitrs@gmail.com",
                        "subject": "CRITICAL: Budget Limit Exceeded",
                        "message": "Immediate attention required: Budget limits have been exceeded. Please review and take immediate action.",
                        "actions_required": ["Review budget allocations", "Implement spending controls"],
                        "escalation_level": "critical"
                    })
                elif severity == 'high':
                    escalation_level = 'high'
                    notifications.append({
                        "type": "budget_alert",
                        "priority": "high",
                        "recipient": "gbharathitrs@gmail.com",
                        "subject": "HIGH PRIORITY: Budget Alert",
                        "message": "Budget usage is approaching critical levels. Review recommended actions.",
                        "actions_required": ["Review spending", "Consider recommendations"],
                        "escalation_level": "high"
                    })
            
            # Add recommendation notifications
            if rec_data:
                notifications.append({
                    "type": "recommendation_alert",
                    "priority": "medium",
                    "recipient": "gbharathitrs@gmail.com",
                    "subject": "Budget Recommendations Available",
                    "message": f"Generated {len(rec_data)} budget optimization recommendations. Review for potential savings.",
                    "actions_required": ["Review recommendations", "Implement approved actions"],
                    "escalation_level": "medium"
                })
            
            return json.dumps({
                "notifications": notifications,
                "escalation_plan": {
                    "immediate_actions": ["Review budget status", "Implement recommendations"],
                    "follow_up_required": len(notifications) > 0,
                    "escalation_chain": ["manager", "finance"],
                    "timeline": "Immediate review required"
                }
            })
            
        except Exception as e:
            logger.error(f"❌ Rule-based notification error: {e}")
            return json.dumps({
                "notifications": [],
                "escalation_plan": {
                    "immediate_actions": [],
                    "follow_up_required": False,
                    "escalation_chain": [],
                    "timeline": "No immediate action required"
                }
            })

class LangChainEscalationCommunicatorAgent:
    """LangChain agent for AI-powered notification and escalation handling"""
    
    def __init__(self, google_api_key: str, node_backend_url: str):
        self.google_api_key = google_api_key
        self.node_backend_url = node_backend_url
        self.is_mock_mode = google_api_key.startswith("mock_")
        
        if not self.is_mock_mode:
            # Initialize LLM
            self.llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                google_api_key=google_api_key,
                temperature=0.4,
                max_output_tokens=2048
            )
            
            # Initialize tools
            self.notification_generator = NotificationGeneratorTool()
        
        logger.info("🤖 LangChain Escalation Communicator Agent initialized")
    
    def execute(self, state: AgentState) -> AgentFinish:
        """Execute AI-powered notification and escalation handling"""
        try:
            logger.info("📧 Performing AI-powered notification handling...")
            
            if self.is_mock_mode:
                logger.info("🔧 Using mock mode for development")
                return self._mock_notification_handling()
            
            # Prepare data for notification generation
            breach_analysis = self._format_breach_analysis(state)
            recommendations = self._format_recommendations(state)
            budget_context = self._format_budget_context(state)
            user_info = self._format_user_info(state)
            
            # Generate intelligent notifications
            logger.info("📝 Generating intelligent notifications...")
            notifications_json = self.notification_generator._run(
                breach_analysis=breach_analysis,
                recommendations=recommendations,
                budget_context=budget_context,
                user_info=user_info,
                llm=self.llm
            )
            
            # Parse results
            try:
                notifications_data = json.loads(notifications_json)
                notifications_list = notifications_data.get('notifications', [])
                
                # Simulate sending notifications
                sent_notifications = []
                for notification in notifications_list:
                    sent_notifications.append({
                        'notification': notification,
                        'status': 'sent',
                        'timestamp': '2024-01-15T10:30:00Z'
                    })
                
                logger.info(f"✅ Notifications processed: {len(sent_notifications)} sent")
                
                return AgentFinish(
                    return_values={
                        'notifications_sent': sent_notifications,
                        'notifications_failed': [],
                        'escalation_plan': notifications_data.get('escalation_plan', {}),
                        'total_sent': len(sent_notifications),
                        'total_failed': 0
                    },
                    log=f"AI notification handling completed: {len(sent_notifications)} sent"
                )
            except json.JSONDecodeError as e:
                logger.error(f"❌ JSON parsing error: {e}")
                return self._fallback_notification_handling()
            
        except Exception as e:
            logger.error(f"❌ Escalation communicator agent error: {e}")
            return self._fallback_notification_handling()
    
    def _format_breach_analysis(self, state: AgentState) -> str:
        """Format breach analysis for notification generation"""
        try:
            breach_context = getattr(state, 'breach_context', {})
            breach_detected = getattr(state, 'breach_detected', False)
            breach_severity = getattr(state, 'breach_severity', 'low')
            
            analysis = {
                'breach_detected': breach_detected,
                'breach_severity': breach_severity,
                'breach_context': breach_context
            }
            
            return json.dumps(analysis)
        except Exception as e:
            logger.error(f"❌ Breach analysis formatting error: {e}")
            return "{}"
    
    def _format_recommendations(self, state: AgentState) -> str:
        """Format recommendations for notification generation"""
        try:
            recommendations = getattr(state, 'recommendations', [])
            return json.dumps(recommendations)
        except Exception as e:
            logger.error(f"❌ Recommendations formatting error: {e}")
            return "[]"
    
    def _format_budget_context(self, state: AgentState) -> str:
        """Format budget context for notification generation"""
        try:
            budget_data = getattr(state, 'structured_budget_data', [])
            usage_map = getattr(state, 'budget_usage_map', {})
            
            context = {
                'budget_items': len(budget_data),
                'usage_summary': usage_map,
                'total_budget': sum(b.get('amount', 0) for b in budget_data if hasattr(b, 'amount'))
            }
            
            return json.dumps(context)
        except Exception as e:
            logger.error(f"❌ Budget context formatting error: {e}")
            return "{}"
    
    def _format_user_info(self, state: AgentState) -> str:
        """Format user information for notification generation"""
        try:
            # Extract user info from state or use defaults
            user_info = {
                'email': 'gbharathitrs@gmail.com',
                'role': 'budget_manager',
                'department': 'finance'
            }
            
            return json.dumps(user_info)
        except Exception as e:
            logger.error(f"❌ User info formatting error: {e}")
            return "{}"
    
    def _mock_notification_handling(self) -> AgentFinish:
        """Mock notification handling for development"""
        mock_notifications = [
            {
                'notification': {
                    'type': 'budget_alert',
                    'priority': 'medium',
                    'recipient': 'gbharathitrs@gmail.com',
                    'subject': 'Budget Usage Alert',
                    'message': 'Mock budget alert for development',
                    'actions_required': ['Review budget', 'Monitor spending'],
                    'escalation_level': 'medium'
                },
                'status': 'sent',
                'timestamp': '2024-01-15T10:30:00Z'
            }
        ]
        
        return AgentFinish(
            return_values={
                'notifications_sent': mock_notifications,
                'notifications_failed': [],
                'escalation_plan': {
                    'immediate_actions': ['Review budget status'],
                    'follow_up_required': True,
                    'escalation_chain': ['manager'],
                    'timeline': 'Within 24 hours'
                },
                'total_sent': 1,
                'total_failed': 0
            },
            log="Mock notification handling completed"
        )
    
    def _fallback_notification_handling(self) -> AgentFinish:
        """Fallback notification handling"""
        return AgentFinish(
            return_values={
                'notifications_sent': [],
                'notifications_failed': [],
                'escalation_plan': {},
                'total_sent': 0,
                'total_failed': 0
            },
            log="Fallback notification handling completed"
        )