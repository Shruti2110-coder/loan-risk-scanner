from mifos_client import get_all_loans
from risk_scorer import calculate_risk, suggest_action
from rich.console import Console
from rich.table import Table
from rich import print as rprint

console = Console()

def run_scanner():
    console.print("\n[bold blue]🏦 Portfolio Health Agent — Loan Risk Scanner[/bold blue]")
    console.print("[dim]Connecting to Mifos X...[/dim]\n")

    loans = get_all_loans()

    if not loans:
        console.print("[red]No loans found or API error.[/red]")
        return

    console.print(f"[green]✓ Found {len(loans)} loans. Analyzing...[/green]\n")

   
    table = Table(title="Loan Risk Report", show_lines=True)
    table.add_column("Loan ID",    style="cyan",  width=10)
    table.add_column("Client",     style="white", width=20)
    table.add_column("Amount",     style="white", width=12)
    table.add_column("Risk Score", style="bold",  width=12)
    table.add_column("Risk Level", width=16)
    table.add_column("Action",     width=38)

    high_risk_count   = 0
    medium_risk_count = 0
    low_risk_count    = 0

    for loan in loans:
        loan_id     = loan.get("id", "N/A")
        client_name = loan.get("clientName", "Unknown")
        amount      = loan.get("principal", 0)
        currency    = loan.get("currency", {}).get("code", "")

        risk   = calculate_risk(loan)
        action = suggest_action(risk)

        # Count by level
        if risk["score"] >= 7:
            high_risk_count += 1
            score_color = "red"
        elif risk["score"] >= 4:
            medium_risk_count += 1
            score_color = "yellow"
        else:
            low_risk_count += 1
            score_color = "green"

        table.add_row(
            str(loan_id),
            client_name[:18],
            f"{currency} {amount:,.0f}",
            f"[{score_color}]{risk['score']}/10[/{score_color}]",
            risk["level"],
            action
        )

    console.print(table)

   
    console.print("\n[bold] Summary:[/bold]")
    console.print(f"   High Risk:   {high_risk_count} loans")
    console.print(f"   Medium Risk: {medium_risk_count} loans")
    console.print(f"   Low Risk:    {low_risk_count} loans")
    console.print("\n[dim]Agent explanation: Each score is based on overdue amount, loan status, and payment timeline.[/dim]\n")

if __name__ == "__main__":
    run_scanner()