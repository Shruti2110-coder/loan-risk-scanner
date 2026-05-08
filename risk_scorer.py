def calculate_risk(loan):
    """
    Score a loan from 0-10.
    Higher = more risky.
    """
    score = 0
    reasons = []

    # Check how many days overdue
    days_overdue = loan.get("numberOfRepaymentsDone", 0)
    arrears = loan.get("summary", {}).get("totalOverdue", 0)

    if arrears > 0:
        score += 3
        reasons.append(f"Has overdue amount: {arrears}")

    if arrears > 5000:
        score += 2
        reasons.append("Overdue amount is HIGH (>5000)")

    # Check loan status
    status = loan.get("status", {}).get("value", "")
    if status == "Active":
        score += 1

    # Check if any payments were missed
    timeline = loan.get("timeline", {})
    expected = timeline.get("expectedDisbursementDate", None)
    actual   = timeline.get("actualDisbursementDate", None)

    if expected and not actual:
        score += 2
        reasons.append("Loan not yet disbursed despite schedule")

    # Cap score at 10
    final_score = min(score, 10)

    # Assign risk level
    if final_score >= 7:
        level = "HIGH RISK"
    elif final_score >= 4:
        level =  "MEDIUM RISK"
    else:
        level = " LOW RISK"

    return {
        "score": final_score,
        "level": level,
        "reasons": reasons if reasons else ["No major risk factors found"]
    }


def suggest_action(risk):
    """Suggest what the agent should do"""
    score = risk["score"]

    if score >= 7:
        return " ESCALATE to loan officer immediately"
    elif score >= 4:
        return " Schedule a follow-up call with client"
    else:
        return " Send a friendly payment reminder"