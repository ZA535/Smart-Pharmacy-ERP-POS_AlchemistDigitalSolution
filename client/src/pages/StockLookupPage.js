import { useEffect, useState } from "react";
import { api } from "../api";

export function StockLookupPage() {
  const [categories, setCategories] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    api("/api/categories").then(setCategories);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (categoryId) params.set("categoryId", categoryId);
    if (q) params.set("q", q);
    api(`/api/medicines?${params}`).then(setMedicines);
  }, [categoryId, q]);

  const now = Date.now();

  return (
    <div>
      <header className="page-head">
        <h1>Stock Lookup</h1>
        <p className="muted">Read-only batch view for counter staff.</p>
      </header>
      <div className="filters">
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          className="search"
          placeholder="Search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Medicine</th>
            <th>Category</th>
            <th>Batch</th>
            <th>Qty</th>
            <th>Expiry</th>
            <th>MRP</th>
          </tr>
        </thead>
        <tbody>
          {medicines.flatMap((m) =>
            m.batches.map((b) => {
              const expired = new Date(b.expiryDate).getTime() <= now;
              return (
                <tr key={b.id} className={expired ? "row-expired" : ""}>
                  <td>{m.name}</td>
                  <td>{m.category.name}</td>
                  <td>{b.batchNumber}</td>
                  <td>{b.quantity}</td>
                  <td>
                    {new Date(b.expiryDate).toLocaleDateString()}
                    {expired && <span className="badge danger">Expired</span>}
                  </td>
                  <td>{Number(b.mrp).toFixed(2)}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
