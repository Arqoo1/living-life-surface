from fastapi import APIRouter
from models.rule_model import RuleRequestModel
from controllers.rule_controller import evaluate_rules_logic

router = APIRouter()

@router.post("/evaluate-rules")
def evaluate_rules(request: RuleRequestModel):
    """
    Accepts:
    {
        "userId": "user123",
        "moment": {...},
        "state": {...}
    }
    Returns:
    {
        "--bg-main": "#06040b",
        "--moment-color-stressed": "#2E186A",
        ...
    }
    """
    return evaluate_rules_logic(request.userId, request.moment, request.state)
