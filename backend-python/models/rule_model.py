from pydantic import BaseModel
from typing import Dict, Optional

class RuleRequestModel(BaseModel):
    userId: str
    moment: Dict
    state: Dict  # { mood, focus, ... }
