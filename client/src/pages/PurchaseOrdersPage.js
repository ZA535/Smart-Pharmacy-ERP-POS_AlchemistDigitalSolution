import { useEffect, useState } from "react";
import { api } from "../api";

export function PurchaseOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [supplierId, setSupplierId] = useState("");
  const [lines, setLines] = useState([{ medicineId: "", quantityOrdered: 50 }]);

  function reload() {
    api("/api/purchase-orders").then(setOrders);
  }

  useEffect(() => {
    reload();
    api("/api/suppliers").then((s) => {
      setSuppliers(s);
      if (s[0]) setSupplierId(s[0].id);
    });
    api("/api/medicines").then(setMedicines);
  }, []);

  async function createPO(e) {
    e.preventDefault();
    await api("/api/purchase-orders", {
      method: "POST",
      body: JSON.stringify({
        supplierId,
        items: lines.filter((l) => l.medicineId),
      }),
    });
    setLines([{ medicineId: "", quantityOrdered: 50 }]);
    reload();
  }

  function statusBadge(status) {
    return <span className={`badge status-${status.toLowerCase()}`}>{status}</span>;
  }

  return (
    <div>
      <header className="page-head">
        <h1>Purchase Orders</h1>
      </header>

      <section className="card">
        <h2>Create order (Ordered queue)</h2>
        <form onSubmit={createPO} className="grid-form">
          <select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            required
          >
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {lines.map((line, i) => (
            <div key={i} className="po-line">
              <select
                value={line.medicineId}
                onChange={(e) => {
                  const next = [...lines];
                  next[i].medicineId = e.target.value;
                  setLines(next);
                }}
              >
                <option value="">Medicine</option>
                {medicines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={line.quantityOrdered}
                onChange={(e) => {
                  const next = [...lines];
                  next[i].quantityOrdered = Number(e.target.value);
                  setLines(next);
                }}
              />
            </div>
          ))}
          <button
            type="button"
            className="btn ghost"
            onClick={() =>
              setLines([...lines, { medicineId: "", quantityOrdered: 50 }])
            }
          >
            + Line
          </button>
          <button className="btn primary">Mark as Ordered</button>
        </form>
      </section>

      {orders.map((o) => (
        <section key={o.id} className="card">
          <SessionHeader order={o} badge={statusBadge(o.status)} />
          <table className="table compact">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Ordered</th>
                <th>Received</th>
                <th>Status</th>
                <th>Last received</th>
              </tr>
            </thead>
            <tbody>
              {o.items.map((it) => (
                <tr key={it.id}>
                  <td>{it.medicine.name}</td>
                  <td>{it.quantityOrdered}</td>
                  <td>{it.quantityReceived}</td>
                  <td>{statusBadge(it.status)}</td>
                  <td>
                    {it.lastReceivedAt
                      ? new Date(it.lastReceivedAt).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}

function SessionHeader({ order, badge }) {
  return (
    <div className="po-head">
      <div>
        <strong>{order.orderNumber}</strong> · {order.supplier.name}
        <div className="muted">
          Ordered {new Date(order.orderedAt).toLocaleString()}
        </div>
      </div>
      {badge}
    </div>
  );
}
