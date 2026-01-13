import re
from datetime import datetime
from typing import Dict, Any, List

def evaluate(op: str, threshold: float, current: float) -> bool:
    if op == ">": return current > threshold
    if op == "<": return current < threshold
    if op == ">=": return current >= threshold
    if op == "<=": return current <= threshold
    if op == "==": return current == threshold
    return False

def evaluate_rules_logic(user_id: str, moment: Dict[str, Any], state: Dict[str, Any]) -> Dict[str, str]:
    """
    Evaluates rules and returns a dict of CSS variables.
    Intelligence added: streak, momentCount, battery
    """
    result_variables: Dict[str, str] = {}

    # --- DATA EXTRACTION ---
    now = datetime.now()
    hour = state.get("hour", now.hour)
    minute = state.get("minute", now.minute)
    current_total_minutes = hour * 60 + minute
    
    # Intelligence Data (Passed from Frontend)
    streak = state.get("streak", 0)
    moment_count = state.get("momentCount", 0)
    battery = state.get("battery", 100)
    
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
                if evaluate(op, float(r_hour * 60 + r_min), float(current_total_minutes)):
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
            if evaluate(op, float(hr), float(hour)):
                result_variables["--bg-main"] = val

        # --- SECTION 4: NUMERIC INTELLIGENCE (Streak, Battery, Count) ---
 # --- SECTION 4: NUMERIC INTELLIGENCE (Streak, Battery, Count, Level) ---
        # UPDATED: Added 'level' to the regex capture group
        num_block_regex = re.compile(
            r"when\s+(streak|battery|momentCount|level)\s*(>=|<=|==|>|<)\s*(\d+)\s*\{([\s\S]*?)\}", 
            re.IGNORECASE
        )
        
        for block_match in num_block_regex.finditer(content):
            var_name, op, threshold, block_inner = block_match.groups()
            
            # Map the string variable name to our actual data
            lookup = {
                "streak": streak,
                "battery": battery,
                "momentcount": moment_count,
                "level": state.get("level", 1) # Successfully added from your Node backend
            }
            
            current_val = lookup.get(var_name.lower(), 0)
            
            # Evaluate if (e.g., 5 >= 1)
            if evaluate(op, float(threshold), float(current_val)):
                set_matches = re.findall(r"set\s+ui\.([\w-]+)\s*=\s*([#\w\d]+)", block_inner, re.IGNORECASE)
                for prop, val in set_matches:
                    prop_lower = prop.lower()
                    if prop_lower == "bg":
                        result_variables["--bg-main"] = val
                    elif prop_lower == "text":
                        result_variables["--text-main"] = val
                    elif prop_lower == "momentbg":
                        result_variables["--moment-bg"] = val
                    else:
                        result_variables[f"--{prop_lower}"] = val

        # --- SECTION 5: STATIC SETTINGS (Highest Priority) ---
        static_set_regex = re.compile(r"set\s+ui\.([\w-]+)\s*=\s*['\"]?([#\w\d]+)['\"]?", re.IGNORECASE)
        static_matches = static_set_regex.findall(content)
        for prop, val in static_matches:
            prop_lower = prop.lower()
            if prop_lower == "bg":
                result_variables["--bg-main"] = val
            elif prop_lower == "text":
                result_variables["--text-main"] = val
            elif prop_lower == "momentbg":
                result_variables["--moment-bg"] = val
            else:
                result_variables[f"--{prop_lower}"] = val

    return result_variables