import { useEffect, useState } from "react";
import { api } from "../api";

export function AlertsPage() {
  const [data, setData] = useState(null);
  const [leadDays, setLeadDays] = useState(30);
  const [suppliers, setSuppliers] = useState([]);
  const [supplierId, setSupplierId] = useState("");

  function load() {
    api("/api/alerts").then((d) => {
      setData(d);
      setLeadDays(d.globalExpiryLeadDays);
    });
  }

  useEffect(() => {
    load();
    api("/api/suppliers").then((s) => {
      setSuppliers(s);
      if (s[0]) setSupplierId(s[0].id);
    });
  }, []);

  async function saveSettings(e) {
    e.preventDefault();
    await api("/api/alerts/settings", {
      method: "PATCH",
      body: JSON.stringify({ globalExpiryLeadDays: leadDays }),
    });
    load();
  }

  async function addToPO(medicineIds) {
    if (!supplierId) return;
    await api("/api/purchase-orders/from-alert", {
      method: "POST",
      body: JSON.stringify({ supplierId, medicineIds }),
    });
    alert("Added to purchase order queue.");
  }

  if (!data) return <p>Loading alerts…</p>;

  return (
    <div>
      <header className="page-head">
        <h1>Alerts Center</h1>
      </header>

      <form className="card row-form" onSubmit={saveSettings}>
        <label>
          Expiry alert lead time (days)
          <input
            type="number"
            min={1}
            value={leadDays}
            onChange={(e) => setLeadDays(Number(e.target.value))}
          />
        </label>
        <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <button className="btn secondary">Save settings</button>
      </form>

      <AlertSection
        title="Expired — blocked from sale"
        tone="danger"
        rows={data.expired}
        render={(r) => (
          <tr key={`${r.medicineId}-${r.batchNumber}`}>
            <td>{r.medicineName}</td>
            <td>{r.category}</td>
            <td>{r.batchNumber}</td>
            <td>{r.remainingStock}</td>
            <td>{new Date(r.expiryDate).toLocaleDateString()}</td>
          </tr>
        )}
      />

      <AlertSection
        title="Expiring soon"
        tone="warn"
        rows={data.expiringSoon}
        render={(r) => (
          <tr key={`${r.medicineId}-${r.batchNumber}`}>
            <td>{r.medicineName}</td>
            <td>{r.category}</td>
            <td>{r.batchNumber}</td>
            <td>{r.remainingStock}</td>
            <td>
              {r.daysRemaining}d ({new Date(r.expiryDate).toLocaleDateString()})
            </td>
            <td>
              <button
                type="button"
                className="btn small"
                onClick={() => addToPO([r.medicineId])}
              >
                Add to PO
              </button>
            </td>
          </tr>
        )}
        extraHeader={<th>Action</th>}
      />

      <AlertSection
        title="Low stock"
        tone="info"
        rows={data.lowStock}
        render={(r) => (
          <tr key={r.medicineId}>
            <td>{r.medicineName}</td>
            <td>{r.category}</td>
            <td>{r.remainingStock}</td>
            <td>{r.threshold}</td>
            <td>
              <button
                type="button"
                className="btn small"
                onClick={() => addToPO([r.medicineId])}
              >
                Add to PO
              </button>
            </td>
          </tr>
        )}
        extraHeader={<th>Action</th>}
      />
    </div>
  );
}

function AlertSection({ title, tone, rows, render, extraHeader }) {
  return (
    <section className={`card alert-${tone}`}>
      <h2>
        {title} <span className="badge">{rows.length}</span>
      </h2>
      {rows.length === 0 ? (
        <p className="muted">None</p>
      ) : (
        <table className="table compact">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Category</th>
              {title.includes("Low") ? (
                <>
                  <th>Stock</th>
                  <th>Threshold</th>
                </>
              ) : (
                <>
                  <th>Batch</th>
                  <th>Stock</th>
                  <th>Expiry</th>
                </>
              )}
              {extraHeader}
            </tr>
          </thead>
          <tbody>{rows.map(render)}</tbody>
        </table>
      )}
    </section>
  );
}
