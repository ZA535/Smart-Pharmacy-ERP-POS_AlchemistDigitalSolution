import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export function DashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api("/api/dashboard").then(setStats).catch(console.error);
  }, []);

  if (!stats) {
    return (
      <div className="page-loading">
        <div className="loader" />
        <p className="muted">Loading dashboard…</p>
      </div>
    );
  }

  const cards = [
    { label: "Today revenue", value: stats.todayRevenue, accent: "teal" },
    { label: "Today profit", value: stats.todayProfit, accent: "mint" },
    { label: "Month revenue", value: stats.monthRevenue, accent: "sky" },
    { label: "Month net profit", value: stats.monthProfit, accent: "gold" },
    {
      label: "Stock valuation",
      value: stats.stockValuation,
      accent: "violet",
    },
    {
      label: "Pending POs",
      value: stats.pendingPOCount,
      int: true,
      accent: "rose",
    },
  ];

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Executive Dashboard</h1>
        </div>
        <Link to="/alerts" className="btn secondary">
          View alerts →
        </Link>
      </header>

      <div className="grid stats">
        {cards.map((c) => (
          <div key={c.label} className={`stat-card accent-${c.accent}`}>
            <span className="stat-label">{c.label}</span>
            <strong className="stat-value">
              {c.int ? c.value : `$${Number(c.value).toFixed(2)}`}
            </strong>
          </div>
        ))}
      </div>

      <section className="card card-elevated">
        <h2>Alert summary</h2>
        <div className="alert-chips">
          <span className="chip chip-danger">
            Expired · {stats.alertSummary.expired}
          </span>
          <span className="chip chip-warn">
            Expiring soon · {stats.alertSummary.expiringSoon}
          </span>
          <span className="chip chip-info">
            Low stock · {stats.alertSummary.lowStock}
          </span>
        </div>
      </section>
    </div>
  );
}
