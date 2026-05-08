from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mifos_client import get_all_loans
from risk_scorer import calculate_risk, suggest_action

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/loans/risk-report")
def risk_report():
    loans = get_all_loans()
    results = []

    for loan in loans:
        risk   = calculate_risk(loan)
        action = suggest_action(risk)
        results.append({
            "id":         loan.get("id"),
            "clientName": loan.get("clientName", "Unknown"),
            "amount":     loan.get("principal", 0),
            "currency":   loan.get("currency", {}).get("code", ""),
            "status":     loan.get("status", {}).get("value", ""),
            "riskScore":  risk["score"],
            "riskLevel":  risk["level"],
            "reasons":    risk["reasons"],
            "action":     action,
        })

    return {
        "total": len(results),
        "loans": results
    }