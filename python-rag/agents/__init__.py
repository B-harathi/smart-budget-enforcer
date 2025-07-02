# """
# LangChain Agents Package for Smart Budget Enforcer
# All 5 agents implemented using LangChain tools and reasoning
# """

# from .langchain_budget_loader import LangChainBudgetLoaderAgent
# from .langchain_expense_tracker import LangChainExpenseTrackerAgent
# from .langchain_breach_detector import LangChainBreachDetectorAgent
# from .langchain_correction_recommender import LangChainCorrectionRecommenderAgent
# from .langchain_escalation_communicator import LangChainEscalationCommunicatorAgent

# __all__ = [
#     'LangChainBudgetLoaderAgent',
#     'LangChainExpenseTrackerAgent',
#     'LangChainBreachDetectorAgent',
#     'LangChainCorrectionRecommenderAgent',
#     'LangChainEscalationCommunicatorAgent'
# ]


"""
CORRECTED Agents Module Initialization
Fixed imports to prevent circular dependency issues
"""

# Import agents with error handling to prevent initialization failures
try:
    from .langchain_budget_loader import LangChainBudgetLoaderAgent
except ImportError as e:
    print(f"Warning: Could not import LangChainBudgetLoaderAgent: {e}")
    LangChainBudgetLoaderAgent = None

try:
    from .langchain_expense_tracker import LangChainExpenseTrackerAgent
except ImportError as e:
    print(f"Warning: Could not import LangChainExpenseTrackerAgent: {e}")
    LangChainExpenseTrackerAgent = None

try:
    from .langchain_breach_detector import LangChainBreachDetectorAgent
except ImportError as e:
    print(f"Warning: Could not import LangChainBreachDetectorAgent: {e}")
    LangChainBreachDetectorAgent = None

try:
    from .langchain_correction_recommender import LangChainCorrectionRecommenderAgent
except ImportError as e:
    print(f"Warning: Could not import LangChainCorrectionRecommenderAgent: {e}")
    LangChainCorrectionRecommenderAgent = None

try:
    from .langchain_escalation_communicator import LangChainEscalationCommunicatorAgent
except ImportError as e:
    print(f"Warning: Could not import LangChainEscalationCommunicatorAgent: {e}")
    LangChainEscalationCommunicatorAgent = None

# Export available agents
__all__ = [
    'LangChainBudgetLoaderAgent',
    'LangChainExpenseTrackerAgent', 
    'LangChainBreachDetectorAgent',
    'LangChainCorrectionRecommenderAgent',
    'LangChainEscalationCommunicatorAgent'
]

# Filter out None values
__all__ = [name for name in __all__ if globals().get(name) is not None]