import { useEffect, useState } from "react";
import { api } from "../api";

export function SupplierReturnsPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [supplierId, setSupplierId] = useState("");
  const [reason, setReason] = useState("");
  const [selected, setSelected] = useState({});
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api("/api/suppliers").then((s) => {
      setSuppliers(s);
      if (s[0]) setSupplierId(s[0].id);
    });
    api("/api/inventory/batches").then(setBatches);
  }, []);

  async function submit(e) {
    e.preventDefault();
    const items = Object.entries(selected)
      .filter(([, q]) => q > 0)
      .map(([batchId, quantity]) => ({ batchId, quantity }));
    if (!items.length) {
      setMsg("Select quantities to return.");
      return;
    }
    try {
      const ret = await api("/api/returns/supplier", {
        method: "POST",
        body: JSON.stringify({ supplierId, reason, items }),
      });
      setMsg(`Debit note ${ret.returnNumber} created.`);
      setSelected({});
      api("/api/inventory/batches").then(setBatches);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <div>
      <header className="page-head">
        <h1>Supplier / Distributor Returns</h1>
      </header>
      <form className="card" onSubmit={submit}>
        <div className="grid-form">
          <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <input
            placeholder="Reason (expired, damaged…)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <table className="table compact">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Batch</th>
              <th>Expiry</th>
              <th>On hand</th>
              <th>Return qty</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((b) => (
              <tr key={b.id}>
                <td>{b.medicine.name}</td>
                <td>{b.batchNumber}</td>
                <td>{new Date(b.expiryDate).toLocaleDateString()}</td>
                <td>{b.quantity}</td>
                <td>
                  <input
                    type="number"
                    min={0}
                    max={b.quantity}
                    value={selected[b.id] ?? 0}
                    onChange={(e) =>
                      setSelected({
                        ...selected,
                        [b.id]: Number(e.target.value),
                      })
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn primary">Create supplier return</button>
        {msg && <p className="info">{msg}</p>}
      </form>
    </div>
  );
}
