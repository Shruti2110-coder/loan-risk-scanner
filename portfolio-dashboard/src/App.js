import { useEffect, useState } from "react";
import axios from "axios";

const riskColor = (score) => {
  if (score >= 7) return { bg: "#fff1f0", border: "#ff4d4f", badge: "#ff4d4f", text: "HIGH" };
  if (score >= 4) return { bg: "#fffbe6", border: "#faad14", badge: "#faad14", text: "MEDIUM" };
  return { bg: "#f6ffed", border: "#52c41a", badge: "#52c41a", text: "LOW" };
};

export default function App() {
  const [loans, setLoans]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:8000/api/loans/risk-report")
      .then(r => { setLoans(r.data.loans); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const high   = loans.filter(l => l.riskScore >= 7).length;
  const medium = loans.filter(l => l.riskScore >= 4 && l.riskScore < 7).length;
  const low    = loans.filter(l => l.riskScore < 4).length;

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#f0f2f5", minHeight: "100vh", padding: "24px" }}>
      
      {/* Header */}
      <div style={{ background: "#001529", borderRadius: 12, padding: "20px 28px", marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 32 }}>🏦</span>
        <div>
          <h1 style={{ color: "#fff", margin: 0, fontSize: 22 }}>Portfolio Health Agent</h1>
          <p style={{ color: "#8c9db5", margin: 0, fontSize: 13 }}>Agentic AI · Explainable Autonomy · Mifos X</p>
        </div>
        <span style={{ marginLeft: "auto", background: "#52c41a22", color: "#52c41a", border: "1px solid #52c41a", borderRadius: 20, padding: "4px 14px", fontSize: 12 }}>
          ● LIVE
        </span>
      </div>

      {/* Summary Cards */}
      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "🔴 High Risk", count: high,   color: "#ff4d4f", bg: "#fff1f0" },
            { label: "🟡 Medium Risk", count: medium, color: "#faad14", bg: "#fffbe6" },
            { label: "🟢 Low Risk",  count: low,    color: "#52c41a", bg: "#f6ffed" },
          ].map(c => (
            <div key={c.label} style={{ background: c.bg, border: `1.5px solid ${c.color}`, borderRadius: 10, padding: "18px 22px" }}>
              <div style={{ fontSize: 13, color: "#555" }}>{c.label}</div>
              <div style={{ fontSize: 36, fontWeight: 700, color: c.color }}>{c.count}</div>
              <div style={{ fontSize: 12, color: "#888" }}>loans detected</div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px #0001", overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #f0f0f0", fontWeight: 600, fontSize: 15 }}>
          📋 Loan Risk Report — {loans.length} accounts scanned
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#888" }}>⏳ Fetching data from Mifos X...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#fafafa", color: "#888", fontSize: 12 }}>
                {["LOAN ID", "CLIENT", "AMOUNT", "RISK SCORE", "LEVEL", "ACTION", "WHY?"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loans.map((loan, i) => {
                const c = riskColor(loan.riskScore);
                return (
                  <>
                    <tr key={loan.id} style={{ borderTop: "1px solid #f0f0f0", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                      <td style={{ padding: "12px 16px", color: "#1890ff", fontWeight: 600 }}>#{loan.id}</td>
                      <td style={{ padding: "12px 16px" }}>{loan.clientName}</td>
                      <td style={{ padding: "12px 16px" }}>{loan.currency} {loan.amount?.toLocaleString()}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 80, height: 8, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ width: `${loan.riskScore * 10}%`, height: "100%", background: c.badge, borderRadius: 4 }} />
                          </div>
                          <span style={{ fontWeight: 700, color: c.badge }}>{loan.riskScore}/10</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: c.bg, color: c.badge, border: `1px solid ${c.border}`, borderRadius: 20, padding: "2px 12px", fontSize: 12, fontWeight: 600 }}>
                          {c.text}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13 }}>{loan.action}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <button
                          onClick={() => setExpanded(expanded === loan.id ? null : loan.id)}
                          style={{ background: "#1890ff11", color: "#1890ff", border: "1px solid #1890ff", borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontSize: 12 }}>
                          {expanded === loan.id ? "Hide ▲" : "Explain ▼"}
                        </button>
                      </td>
                    </tr>
                    {expanded === loan.id && (
                      <tr key={`exp-${loan.id}`}>
                        <td colSpan={7} style={{ padding: "12px 24px", background: "#f6f9ff", borderTop: "1px dashed #d0e4ff" }}>
                          <strong>🤖 Agent Reasoning:</strong>
                          <ul style={{ margin: "6px 0 0 16px", color: "#555", fontSize: 13 }}>
                            {loan.reasons.map((r, j) => <li key={j}>{r}</li>)}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <p style={{ textAlign: "center", color: "#aaa", fontSize: 12, marginTop: 20 }}>
        Powered by LangChain · Mifos X · Explainable AI · Built for DMP 2026
      </p>
    </div>
  );
}