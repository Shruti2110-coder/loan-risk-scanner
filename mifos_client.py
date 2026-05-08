import requests
import base64
import os
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("MIFOS_BASE_URL")
USERNAME = os.getenv("MIFOS_USERNAME")
PASSWORD = os.getenv("MIFOS_PASSWORD")
TENANT   = os.getenv("MIFOS_TENANT")


credentials = f"{USERNAME}:{PASSWORD}"
encoded = base64.b64encode(credentials.encode()).decode()

HEADERS = {
    "Authorization": f"Basic {encoded}",
    "Fineract-Platform-TenantId": TENANT,
    "Content-Type": "application/json"
}

def get_all_loans():
    """Fetch all loans from Mifos X"""
    url = f"{BASE_URL}/loans?limit=50&associations=repaymentSchedule"
    response = requests.get(url, headers=HEADERS)

    if response.status_code == 200:
        data = response.json()
        return data.get("pageItems", [])
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return []

def get_loan_details(loan_id):
    """Fetch details of a single loan"""
    url = f"{BASE_URL}/loans/{loan_id}?associations=repaymentSchedule"
    response = requests.get(url, headers=HEADERS)
    return response.json() if response.status_code == 200 else {}