import re
from datetime import datetime
from typing import Dict, Any, List

def evaluate(op: str, threshold: int, current: int) -> bool:
    if op == ">": return current > threshold
    if op == "<": return current < threshold
    if op == ">=": return current >= threshold
    if op == "<=": return current <= threshold
    if op == "==": return current == threshold
    return False

def evaluate_rules_logic(user_id: str, moment: Dict[str, Any], state: Dict[str, Any]) -> Dict[str, str]:
    """
    Evaluates rules and returns a dict of CSS variables.
    Args:
        user_id: string ID of the user
        moment: A dictionary containing the rules list
        state: A dictionary containing hour, minute, and lastMoment
    """
    result_variables: Dict[str, str] = {}

    now = datetime.now()
    hour = state.get("hour", now.hour)
    minute = state.get("minute", now.minute)
    current_total_minutes = hour * 60 + minute
    
    last_moment = state.get("lastMoment") or {}
    last_moment_type = str(last_moment.get("type", "")).lower()

    rules = moment.get("rules", [])

    for rule_item in rules:
        content = rule_item.get("content", "") if isinstance(rule_item, dict) else str(rule_item)
        if not content:
            continue

        # --- SECTION 1: TIME BLOCKS ---
        time_block_regex = re.compile(
            r"when\s+time\s*(>=|<=|==|>|<)\s*(\d{2}:\d{2})\s*\{([\s\S]*?)\}",
            re.IGNORECASE
        )
        
        for block_match in time_block_regex.finditer(content):
            op, time_str, block_inner = block_match.groups()
            try:
                r_hour, r_min = map(int, time_str.split(":"))
                if evaluate(op, r_hour * 60 + r_min, current_total_minutes):
                    set_matches = re.findall(r"set\s+ui\.([\w-]+)\s*=\s*([#\w\d]+)", block_inner, re.IGNORECASE)
                    for prop, val in set_matches:
                        prop_lower = prop.lower()
                        if prop_lower == "bg":
                            result_variables["--bg-main"] = val
                        elif prop_lower == "momentbg":
                            result_variables["--moment-bg"] = val
                        elif prop_lower == "text":
                            result_variables["--text-main"] = val
                        else:
                            result_variables[f"--{prop_lower}"] = val
            except ValueError:
                continue

        # --- SECTION 2: MOOD / STATE BLOCKS ---
        state_block_regex = re.compile(
            r"when\s+(?:state|lastMoment\.type)\s*==\s*['\"]?([\w-]+)['\"]?\s*\{([\s\S]*?)\}",
            re.IGNORECASE
        )
        
        for block_match in state_block_regex.finditer(content):
            state_value, block_inner = block_match.groups()
            state_value_lower = state_value.lower()
            
            set_matches = re.findall(r"set\s+ui\.([\w-]+)\s*=\s*([#\w\d]+)", block_inner, re.IGNORECASE)
            for prop, val in set_matches:
                result_variables[f"--moment-color-{state_value_lower}"] = val
                if state_value_lower == last_moment_type:
                    prop_lower = prop.lower()
                    if prop_lower == "momentbg":
                        result_variables["--moment-bg"] = val
                    elif prop_lower == "bg":
                        result_variables["--bg-main"] = val

        # --- SECTION 3: FALLBACK OLD RULES ---
        old_regex = re.compile(
            r"if\s+hour\s*(>|<|>=|<=)\s*(\d+)\s+set\s+background\s*=\s*['\"]?([#\w\d]+)['\"]?",
            re.IGNORECASE
        )
        for match in old_regex.finditer(content):
            op, hr, val = match.groups()
            if evaluate(op, int(hr), hour):
                result_variables["--bg-main"] = val

    return result_variables