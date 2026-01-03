# backend-python/test_rule_engine.py

from controllers.rule_controller import evaluate_rules_logic

# Sample input similar to your frontend JSON
sample_request = {
    "userId": "user123",
    "moment": {
        "type": "learning",
        "content": "AST parsing",
        "rules": [
            "when state == 'stressed' { set ui.momentBg = #2E186A }",
            "if hour > 20 set background = '#06040b'"
        ]
    },
    "state": {
        "hour": 21,
        "minute": 30,
        "lastMoment": {"type": "learning"}
    }
}

if __name__ == "__main__":
    result = evaluate_rules_logic(
        sample_request["userId"],
        sample_request["moment"],
        sample_request["state"]
    )
    
    print("=== CSS Variables Output ===")
    for key, value in result.items():
        print(f"{key}: {value}")
