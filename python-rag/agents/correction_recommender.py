"""
Agent 4: Correction Recommender Agent - COMPLETE VERSION WITH WORKFLOW METHOD
Person Y Guide: This agent generates AI-powered recommendations for budget corrections
Person X: Think of this as a smart financial advisor that suggests solutions
"""

from typing import List, Dict, Any, Optional
import logging
import json
import re
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate

from models import AgentState, RecommendationData, RecommendationType
from vector_store import vector_store_manager

logger = logging.getLogger(__name__)

class CorrectionRecommenderAgent:
    """
    Person Y: Agent 4 - Generates intelligent budget correction recommendations
    Uses Gemini AI with RAG context for personalized suggestions
    """
    
    def __init__(self, api_key: str):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=api_key,
            temperature=0.3  # Person Y: Slightly higher temperature for creative solutions
        )
        
        # Person Y: System prompt for generating recommendations
        self.system_prompt = """You are an expert financial advisor specializing in budget management and cost optimization.

Your task is to analyze budget breaches and generate 2-3 specific, actionable recommendations for correction.

ANALYSIS CONTEXT:
- Budget breach details with severity levels
- Department and category spending patterns
- Available budget in other categories
- Historical spending data from company documents
- Priority levels and business impact

RECOMMENDATION TYPES:
1. budget_reallocation - Move funds between categories/departments
2. vendor_alternative - Suggest cheaper vendors or alternatives  
3. spending_pause - Temporary halt on specific spending
4. approval_request - Escalate for budget increase approval

REQUIREMENTS:
- Provide 2-3 specific recommendations per breach
- Include estimated savings/impact for each recommendation
- Prioritize recommendations (1=highest, 3=lowest priority)
- Consider business continuity and operational impact
- Reference historical data when available

OUTPUT FORMAT:
Return recommendations as a JSON array:
[
  {
    "title": "Clear, actionable recommendation title",
    "description": "Detailed explanation with specific steps and rationale",
    "type": "budget_reallocation|vendor_alternative|spending_pause|approval_request",
    "priority": 1,
    "estimated_savings": 5000.0
  }
]

Be specific, practical, and consider real business constraints."""

    def get_historical_context(self, department: str, category: str, user_id: str) -> str:
        """
        Person Y: Retrieve historical budget context using RAG
        This provides context for better recommendations
        """
        try:
            # Person Y: Search for relevant historical data
            context_docs = vector_store_manager.search_budget_context(
                department=department,
                category=category,
                user_id=user_id
            )
            
            context_text = ""
            if context_docs:
                context_text = "\n\nHistorical Context:\n"
                for doc in context_docs[:2]:  # Person Y: Use top 2 most relevant
                    context_text += f"- {doc['content'][:200]}...\n"
            
            return context_text
            
        except Exception as e:
            logger.warning(f"⚠️ Could not retrieve historical context: {e}")
            return ""
    
    def find_reallocation_opportunities(self, usage_map: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Person Y: Find budgets with unused funds for potential reallocation
        """
        opportunities = []
        
        try:
            for budget in usage_map.get("individual_budgets", []):
                # Person Y: Look for budgets with low usage that could be reallocated
                if (budget["usage_percentage"] < 50 and 
                    budget["remaining_amount"] > 1000 and
                    budget["status"] == "Safe"):
                    
                    opportunities.append({
                        "department": budget["department"],
                        "category": budget["category"],
                        "available_amount": budget["remaining_amount"],
                        "usage_percentage": budget["usage_percentage"],
                        "priority": budget["priority"]
                    })
            
            # Person Y: Sort by available amount (largest first)
            opportunities.sort(key=lambda x: x["available_amount"], reverse=True)
            return opportunities
            
        except Exception as e:
            logger.error(f"❌ Error finding reallocation opportunities: {e}")
            return []
    
    def analyze_vendor_alternatives(self, breach_details: List[Dict[str, Any]]) -> Dict[str, List[str]]:
        """
        Person Y: Analyze vendor alternatives based on breach categories
        """
        vendor_suggestions = {}
        
        try:
            category_vendors = {
                "Advertising": ["Google Ads", "Facebook Ads", "LinkedIn Ads", "Twitter Ads"],
                "Software": ["Microsoft 365", "Google Workspace", "Slack", "Zoom"],
                "Travel": ["Expedia Business", "Booking.com", "Corporate Travel", "Airbnb Business"],
                "Office Supplies": ["Amazon Business", "Staples", "Office Depot", "Costco Business"],
                "Professional Services": ["Freelancer", "Upwork", "Fiverr Business", "Local Contractors"],
                "Marketing": ["Mailchimp", "HubSpot", "Hootsuite", "Buffer"],
                "IT Services": ["AWS", "Google Cloud", "Microsoft Azure", "DigitalOcean"],
                "Training": ["Coursera Business", "LinkedIn Learning", "Udemy Business", "Skillshare"]
            }
            
            for breach in breach_details:
                category = breach.get("category", "")
                if category in category_vendors:
                    vendor_suggestions[category] = category_vendors[category]
                else:
                    vendor_suggestions[category] = ["Research alternative vendors", "Request quotes from competitors"]
            
            return vendor_suggestions
            
        except Exception as e:
            logger.error(f"❌ Error analyzing vendor alternatives: {e}")
            return {}
    
    def calculate_spending_impact(self, breach: Dict[str, Any], usage_map: Dict[str, Any]) -> Dict[str, float]:
        """
        Person Y: Calculate the financial impact of different corrective actions
        """
        try:
            financial_impact = breach.get("financial_impact", {})
            overage_amount = financial_impact.get("overage_amount", 0)
            
            # Person Y: Calculate potential savings from different strategies
            impact = {
                "immediate_pause_savings": overage_amount * 0.8,  # 80% of overage could be saved
                "vendor_switch_savings": overage_amount * 0.3,    # 30% savings from vendor switch
                "reallocation_amount": overage_amount,            # Full amount could be reallocated
                "approval_cost": overage_amount * 1.1             # 10% administrative overhead
            }
            
            return impact
            
        except Exception as e:
            logger.error(f"❌ Error calculating spending impact: {e}")
            return {}
    
    def generate_recommendations(self, breach_details: List[Dict[str, Any]], 
                               usage_map: Dict[str, Any], user_id: str) -> List[RecommendationData]:
        """
        Person Y: Generate AI-powered recommendations for each breach
        """
        recommendations = []
        
        try:
            # Person Y: Find available budget for reallocation
            reallocation_opportunities = self.find_reallocation_opportunities(usage_map)
            vendor_alternatives = self.analyze_vendor_alternatives(breach_details)
            
            for breach in breach_details:
                logger.info(f"🧠 Generating recommendations for {breach['department']} - {breach['category']} breach")
                
                # Person Y: Get historical context using RAG
                historical_context = self.get_historical_context(
                    breach["department"], 
                    breach["category"], 
                    user_id
                )
                
                # Person Y: Calculate financial impact
                spending_impact = self.calculate_spending_impact(breach, usage_map)
                
                # Person Y: Prepare context for AI
                breach_context = f"""
BREACH DETAILS:
- Department: {breach['department']}
- Category: {breach['category']}
- Severity: {breach['severity']}
- Priority: {breach['priority']}
- Financial Impact: {breach.get('financial_impact', {})}
- Breach Types: {', '.join(breach['breach_types'])}

AVAILABLE REALLOCATION OPTIONS:
{self._format_reallocation_options(reallocation_opportunities)}

VENDOR ALTERNATIVES:
{self._format_vendor_alternatives(breach['category'], vendor_alternatives)}

SPENDING IMPACT ANALYSIS:
- Immediate pause could save: ${spending_impact.get('immediate_pause_savings', 0):,.2f}
- Vendor switch could save: ${spending_impact.get('vendor_switch_savings', 0):,.2f}
- Reallocation needed: ${spending_impact.get('reallocation_amount', 0):,.2f}
- Approval request cost: ${spending_impact.get('approval_cost', 0):,.2f}

{historical_context}

COMPANY BUDGET SUMMARY:
- Total Allocated: ${usage_map['summary']['total_allocated']:,.2f}
- Total Used: ${usage_map['summary']['total_used']:,.2f}
- Overall Usage: {usage_map['summary']['overall_usage_percentage']:.1f}%
"""
                
                # Person Y: Generate recommendations using Gemini
                prompt = ChatPromptTemplate.from_messages([
                    ("system", self.system_prompt),
                    ("human", f"Analyze this budget breach and provide 2-3 specific recommendations:\n\n{breach_context}")
                ])
                
                try:
                    messages = prompt.format_messages()
                    response = self.llm.invoke(messages)
                    
                    # Person Y: Parse AI response
                    parsed_recommendations = self._parse_ai_recommendations(response.content)
                    
                    # Person Y: Convert to RecommendationData objects
                    for rec_data in parsed_recommendations:
                        try:
                            recommendation = RecommendationData(
                                title=rec_data.get("title", "Budget Correction Needed"),
                                description=rec_data.get("description", "No description provided"),
                                type=RecommendationType(rec_data.get("type", "budget_reallocation")),
                                priority=rec_data.get("priority", 2),
                                estimated_savings=float(rec_data.get("estimated_savings", 0))
                            )
                            recommendations.append(recommendation)
                            
                        except Exception as e:
                            logger.warning(f"⚠️ Skipping invalid recommendation: {e}")
                            continue
                
                except Exception as ai_error:
                    logger.error(f"❌ AI recommendation generation failed: {ai_error}")
                    # Person Y: Generate fallback recommendations for this breach
                    fallback_recs = self._generate_fallback_recommendations_for_breach(breach, spending_impact, reallocation_opportunities)
                    recommendations.extend(fallback_recs)
            
            logger.info(f"✅ Generated {len(recommendations)} AI recommendations")
            return recommendations
            
        except Exception as e:
            logger.error(f"❌ Error generating recommendations: {e}")
            # Person Y: Fallback to basic recommendations
            return self._generate_fallback_recommendations(breach_details, usage_map)
    
    def _format_reallocation_options(self, opportunities: List[Dict[str, Any]]) -> str:
        """Format reallocation opportunities for AI context"""
        if not opportunities:
            return "No significant reallocation opportunities available."
        
        formatted = "Available for reallocation:\n"
        for i, opp in enumerate(opportunities[:3]):  # Person Y: Show top 3
            formatted += f"{i+1}. {opp['department']} - {opp['category']}: ${opp['available_amount']:,.2f} ({opp['usage_percentage']:.1f}% used)\n"
        
        return formatted
    
    def _format_vendor_alternatives(self, category: str, vendor_alternatives: Dict[str, List[str]]) -> str:
        """Format vendor alternatives for AI context"""
        if category not in vendor_alternatives:
            return f"Research alternative vendors for {category} category."
        
        alternatives = vendor_alternatives[category]
        return f"Suggested vendors for {category}: {', '.join(alternatives[:3])}"
    
    def _parse_ai_recommendations(self, ai_response: str) -> List[Dict[str, Any]]:
        """
        Person Y: Parse JSON recommendations from AI response
        Handles various response formats gracefully
        """
        try:
            # Person Y: Try to extract JSON from response
            json_match = re.search(r'```json\s*(.*?)\s*```', ai_response, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
            else:
                # Person Y: Look for JSON array directly
                json_start = ai_response.find('[')
                json_end = ai_response.rfind(']') + 1
                if json_start != -1 and json_end > json_start:
                    json_str = ai_response[json_start:json_end]
                else:
                    # Person Y: Try to find individual JSON objects
                    json_objects = re.findall(r'\{[^{}]*\}', ai_response)
                    if json_objects:
                        json_str = '[' + ','.join(json_objects) + ']'
                    else:
                        raise ValueError("No JSON found in AI response")
            
            recommendations = json.loads(json_str)
            return recommendations if isinstance(recommendations, list) else [recommendations]
            
        except Exception as e:
            logger.warning(f"⚠️ Could not parse AI recommendations: {e}")
            logger.debug(f"AI Response: {ai_response[:500]}...")
            return []
    
    def _generate_fallback_recommendations_for_breach(self, breach: Dict[str, Any], 
                                                    spending_impact: Dict[str, Any],
                                                    reallocation_opportunities: List[Dict[str, Any]]) -> List[RecommendationData]:
        """
        Person Y: Generate specific fallback recommendations for a single breach
        """
        fallback_recommendations = []
        
        try:
            severity = breach["severity"]
            department = breach["department"]
            category = breach["category"]
            overage = spending_impact.get("reallocation_amount", 1000)
            
            if severity in ["high", "critical"]:
                # Person Y: Critical breach - immediate action
                fallback_recommendations.append(RecommendationData(
                    title=f"Emergency Spending Freeze - {department}",
                    description=f"Implement immediate spending freeze for {category} in {department} department. "
                              f"This will prevent further overage and allow time for budget review. "
                              f"Estimate: Could prevent additional ${overage * 0.5:,.0f} in overspending.",
                    type=RecommendationType.SPENDING_PAUSE,
                    priority=1,
                    estimated_savings=overage * 0.5
                ))
                
                # Person Y: Reallocation if opportunities exist
                if reallocation_opportunities:
                    best_opportunity = reallocation_opportunities[0]
                    available = min(best_opportunity["available_amount"], overage)
                    fallback_recommendations.append(RecommendationData(
                        title=f"Emergency Budget Reallocation from {best_opportunity['department']}",
                        description=f"Reallocate ${available:,.0f} from {best_opportunity['department']} - "
                                  f"{best_opportunity['category']} (currently {best_opportunity['usage_percentage']:.1f}% used) "
                                  f"to cover the {department} - {category} overage. This is a low-risk transfer from an "
                                  f"underutilized budget.",
                        type=RecommendationType.BUDGET_REALLOCATION,
                        priority=1,
                        estimated_savings=available
                    ))
                
                # Person Y: Escalation for critical issues
                fallback_recommendations.append(RecommendationData(
                    title=f"Executive Approval Request - {department}",
                    description=f"Submit urgent budget increase request to executive team for {department} - {category}. "
                              f"Include business justification, impact analysis, and proposed funding source. "
                              f"Request additional ${overage * 1.2:,.0f} to cover overage plus 20% buffer.",
                    type=RecommendationType.APPROVAL_REQUEST,
                    priority=1,
                    estimated_savings=0.0
                ))
                
            else:
                # Person Y: Medium/low severity - preventive measures
                fallback_recommendations.append(RecommendationData(
                    title=f"Enhanced Monitoring - {department}",
                    description=f"Implement enhanced approval process for {category} spending in {department}. "
                              f"Require manager approval for expenses over $500. Set up weekly budget review meetings. "
                              f"This will help prevent future overages.",
                    type=RecommendationType.SPENDING_PAUSE,
                    priority=2,
                    estimated_savings=overage * 0.3
                ))
                
                fallback_recommendations.append(RecommendationData(
                    title=f"Vendor Cost Review - {category}",
                    description=f"Conduct comprehensive vendor review for {category} spending. Research 3-5 alternative "
                              f"suppliers and negotiate better rates with current vendors. Target 15-20% cost reduction. "
                              f"Consider bundling services or longer-term contracts for discounts.",
                    type=RecommendationType.VENDOR_ALTERNATIVE,
                    priority=2,
                    estimated_savings=overage * 0.2
                ))
            
            return fallback_recommendations
            
        except Exception as e:
            logger.error(f"❌ Error generating breach-specific fallback recommendations: {e}")
            return []
    
    def _generate_fallback_recommendations(self, breach_details: List[Dict[str, Any]], 
                                         usage_map: Dict[str, Any]) -> List[RecommendationData]:
        """
        Person Y: Generate basic fallback recommendations when AI fails
        Ensures users always get actionable suggestions
        """
        fallback_recommendations = []
        
        try:
            for breach in breach_details:
                severity = breach["severity"]
                department = breach["department"]
                category = breach["category"]
                
                if severity in ["high", "critical"]:
                    # Person Y: Critical breach - immediate action
                    fallback_recommendations.append(RecommendationData(
                        title=f"Immediate Spending Freeze - {department}",
                        description=f"Implement immediate spending freeze for {category} in {department} department until budget review is completed.",
                        type=RecommendationType.SPENDING_PAUSE,
                        priority=1,
                        estimated_savings=5000.0
                    ))
                    
                    fallback_recommendations.append(RecommendationData(
                        title=f"Emergency Budget Review - {department}",
                        description=f"Schedule emergency budget review meeting with {department} leadership to assess options and approve additional funding if necessary.",
                        type=RecommendationType.APPROVAL_REQUEST,
                        priority=1,
                        estimated_savings=0.0
                    ))
                    
                else:
                    # Person Y: Medium/low severity - preventive measures
                    fallback_recommendations.append(RecommendationData(
                        title=f"Budget Monitoring - {department}",
                        description=f"Implement enhanced monitoring for {category} spending in {department}. Require approval for expenses over $500.",
                        type=RecommendationType.SPENDING_PAUSE,
                        priority=2,
                        estimated_savings=2000.0
                    ))
                    
                    fallback_recommendations.append(RecommendationData(
                        title=f"Vendor Review - {category}",
                        description=f"Review current vendors for {category} spending. Research alternative suppliers to reduce costs by 10-15%.",
                        type=RecommendationType.VENDOR_ALTERNATIVE,
                        priority=2,
                        estimated_savings=3000.0
                    ))
            
            return fallback_recommendations
            
        except Exception as e:
            logger.error(f"❌ Error generating fallback recommendations: {e}")
            return []
    
    def enhance_recommendations_with_context(self, recommendations: List[RecommendationData], 
                                           usage_map: Dict[str, Any], user_id: str) -> List[RecommendationData]:
        """
        Person Y: Enhance recommendations with additional context and validation
        """
        try:
            enhanced_recommendations = []
            
            for rec in recommendations:
                # Person Y: Add implementation timeline
                if rec.type == RecommendationType.SPENDING_PAUSE:
                    rec.description += " Implementation timeline: Immediate (within 24 hours)."
                elif rec.type == RecommendationType.BUDGET_REALLOCATION:
                    rec.description += " Implementation timeline: 2-3 business days for approval and transfer."
                elif rec.type == RecommendationType.VENDOR_ALTERNATIVE:
                    rec.description += " Implementation timeline: 1-2 weeks for vendor evaluation and switching."
                elif rec.type == RecommendationType.APPROVAL_REQUEST:
                    rec.description += " Implementation timeline: 3-5 business days for approval process."
                
                # Person Y: Validate estimated savings against available budgets
                if rec.type == RecommendationType.BUDGET_REALLOCATION:
                    available_total = sum(b["remaining_amount"] for b in usage_map.get("individual_budgets", []) 
                                        if b["usage_percentage"] < 50)
                    if rec.estimated_savings > available_total * 0.8:
                        rec.estimated_savings = available_total * 0.5  # Person Y: More conservative estimate
                
                # Person Y: Add risk assessment
                risk_level = "Low"
                if rec.type == RecommendationType.SPENDING_PAUSE and rec.priority == 1:
                    risk_level = "Medium"
                elif rec.type == RecommendationType.APPROVAL_REQUEST:
                    risk_level = "High"
                
                rec.description += f" Risk level: {risk_level}."
                
                enhanced_recommendations.append(rec)
            
            return enhanced_recommendations
            
        except Exception as e:
            logger.error(f"❌ Error enhancing recommendations: {e}")
            return recommendations
    
    def _generate_preventive_recommendations(self, usage_map: Dict[str, Any]) -> List[RecommendationData]:
        """
        Person Y: Generate preventive recommendations when no breaches are detected
        Helps optimize budget usage proactively
        """
        preventive_recommendations = []
        
        try:
            overall_usage = usage_map.get("summary", {}).get("overall_usage_percentage", 0)
            
            if overall_usage < 30:
                preventive_recommendations.append(RecommendationData(
                    title="Budget Utilization Optimization",
                    description="Current budget utilization is low (under 30%). Consider reallocating unused funds to high-impact initiatives or accelerating planned projects. This could improve ROI and business growth.",
                    type=RecommendationType.BUDGET_REALLOCATION,
                    priority=3,
                    estimated_savings=0.0
                ))
            
            elif overall_usage > 75:
                preventive_recommendations.append(RecommendationData(
                    title="Proactive Spending Controls",
                    description="Budget usage is approaching 75%. Implement enhanced approval processes for non-essential expenses to prevent future breaches. Consider quarterly budget reviews.",
                    type=RecommendationType.SPENDING_PAUSE,
                    priority=2,
                    estimated_savings=2000.0
                ))
            
            # Person Y: Look for optimization opportunities
            if usage_map.get("individual_budgets"):
                high_usage_budgets = [b for b in usage_map["individual_budgets"] 
                                    if b["usage_percentage"] > 80 and b["status"] != "Exceeded"]
                
                if high_usage_budgets:
                    preventive_recommendations.append(RecommendationData(
                        title="Early Warning Monitoring",
                        description=f"Set up enhanced monitoring for {len(high_usage_budgets)} budget(s) approaching limits. Implement weekly review meetings and automated alerts at 85% usage.",
                        type=RecommendationType.SPENDING_PAUSE,
                        priority=2,
                        estimated_savings=1000.0
                    ))
                
                # Person Y: Identify underutilized budgets
                low_usage_budgets = [b for b in usage_map["individual_budgets"] 
                                   if b["usage_percentage"] < 25 and b["remaining_amount"] > 5000]
                
                if low_usage_budgets:
                    total_underutilized = sum(b["remaining_amount"] for b in low_usage_budgets)
                    preventive_recommendations.append(RecommendationData(
                        title="Underutilized Budget Reallocation",
                        description=f"${total_underutilized:,.0f} is available from {len(low_usage_budgets)} underutilized budget(s). Consider reallocating to growth initiatives, training, or emergency reserves.",
                        type=RecommendationType.BUDGET_REALLOCATION,
                        priority=3,
                        estimated_savings=total_underutilized * 0.1
                    ))
            
            return preventive_recommendations
            
        except Exception as e:
            logger.error(f"❌ Error generating preventive recommendations: {e}")
            return []

    # ✅ FIXED: Added the missing workflow method
    def process_correction_recommendations(self, state: AgentState) -> AgentState:
        """
        ✅ FIXED: Main processing function for LangGraph workflow
        This method was missing and causing the workflow error
        """
        try:
            logger.info("🤖 Correction Recommender Agent starting...")
            state.processing_steps.append("Correction Recommender Agent started")
            
            # Check if we have breach data to work with
            if not state.breach_detected:
                logger.info("✅ No breaches detected - generating preventive recommendations")
                # Generate preventive recommendations
                if state.budget_usage_map:
                    preventive_recs = self._generate_preventive_recommendations(state.budget_usage_map)
                    state.recommendations.extend(preventive_recs)
                    state.processing_steps.append(f"Generated {len(preventive_recs)} preventive recommendations")
            else:
                # Process breach-specific recommendations
                breach_details = state.breach_context.get("breach_details", [])
                if breach_details and state.budget_usage_map:
                    logger.info(f"🧠 Generating recommendations for {len(breach_details)} breaches")
                    
                    recommendations = self.generate_recommendations(
                        breach_details=breach_details,
                        usage_map=state.budget_usage_map,
                        user_id=state.user_id or "unknown"
                    )
                    
                    # Enhance recommendations with context
                    if recommendations:
                        enhanced_recommendations = self.enhance_recommendations_with_context(
                            recommendations=recommendations,
                            usage_map=state.budget_usage_map,
                            user_id=state.user_id or "unknown"
                        )
                        state.recommendations.extend(enhanced_recommendations)
                        state.processing_steps.append(f"Generated {len(enhanced_recommendations)} breach-specific recommendations")
                    else:
                        logger.warning("⚠️ No recommendations generated, using fallback")
                        fallback_recs = self._generate_fallback_recommendations(breach_details, state.budget_usage_map)
                        state.recommendations.extend(fallback_recs)
                        state.processing_steps.append(f"Generated {len(fallback_recs)} fallback recommendations")
                else:
                    logger.warning("⚠️ Missing breach details or budget usage map")
            
            logger.info(f"✅ Correction Recommender Agent completed - {len(state.recommendations)} total recommendations")
            return state
            
        except Exception as e:
            error_msg = f"❌ Correction Recommender Agent error: {e}"
            logger.error(error_msg)
            state.errors.append(error_msg)
            return state

# Person Y: Export agent instance
correction_recommender_agent = None

def initialize_agent(api_key: str) -> CorrectionRecommenderAgent:
    """Initialize the correction recommender agent"""
    global correction_recommender_agent
    correction_recommender_agent = CorrectionRecommenderAgent(api_key)
    return correction_recommender_agent