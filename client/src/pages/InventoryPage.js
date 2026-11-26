import { useEffect, useState } from "react";
import { api } from "../api";

export function InventoryPage() {
  const [categories, setCategories] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [q, setQ] = useState("");

  const [medForm, setMedForm] = useState({
    name: "",
    genericFormula: "",
    categoryId: "",
  });

  const [stockForm, setStockForm] = useState({
    medicineId: "",
    batchNumber: "",
    expiryDate: "",
    quantity: 10,
    purchasePrice: 0,
    mrp: 0,
  });

  function load() {
    const params = new URLSearchParams();
    if (categoryFilter) params.set("categoryId", categoryFilter);
    if (q) params.set("q", q);
    api(`/api/medicines?${params}`).then(setMedicines);
  }

  useEffect(() => {
    api("/api/categories").then((c) => {
      setCategories(c);
      if (!medForm.categoryId && c[0]) {
        setMedForm((f) => ({ ...f, categoryId: c[0].id }));
      }
    });
  }, []);

  useEffect(() => {
    load();
  }, [categoryFilter, q]);

  async function addMedicine(e) {
    e.preventDefault();
    await api("/api/medicines", { method: "POST", body: JSON.stringify(medForm) });
    setMedForm({ name: "", genericFormula: "", categoryId: medForm.categoryId });
    load();
  }

  async function addStock(e) {
    e.preventDefault();
    await api("/api/inventory/manual", {
      method: "POST",
      body: JSON.stringify(stockForm),
    });
    load();
  }

  return (
    <div>
      <header className="page-head">
        <h1>Inventory</h1>
      </header>

      <section className="card">
        <h2>Add medicine</h2>
        <form className="grid-form" onSubmit={addMedicine}>
          <input
            placeholder="Medicine name"
            value={medForm.name}
            onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
            required
          />
          <input
            placeholder="Generic formula"
            value={medForm.genericFormula}
            onChange={(e) => setMedForm({ ...medForm, genericFormula: e.target.value })}
          />
          <select
            value={medForm.categoryId}
            onChange={(e) => setMedForm({ ...medForm, categoryId: e.target.value })}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button className="btn primary">Create medicine</button>
        </form>
      </section>

      <section className="card">
        <h2>Manual stock entry</h2>
        <form className="grid-form" onSubmit={addStock}>
          <select
            value={stockForm.medicineId}
            onChange={(e) => setStockForm({ ...stockForm, medicineId: e.target.value })}
            required
          >
            <option value="">Select medicine</option>
            {medicines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.category.name})
              </option>
            ))}
          </select>
          <input
            placeholder="Batch #"
            value={stockForm.batchNumber}
            onChange={(e) =>
              setStockForm({ ...stockForm, batchNumber: e.target.value })
            }
            required
          />
          <input
            type="date"
            value={stockForm.expiryDate}
            onChange={(e) => setStockForm({ ...stockForm, expiryDate: e.target.value })}
            required
          />
          <input
            type="number"
            min={1}
            value={stockForm.quantity}
            onChange={(e) =>
              setStockForm({ ...stockForm, quantity: Number(e.target.value) })
            }
          />
          <input
            type="number"
            step="0.01"
            placeholder="Purchase price"
            value={stockForm.purchasePrice || ""}
            onChange={(e) =>
              setStockForm({
                ...stockForm,
                purchasePrice: Number(e.target.value),
              })
            }
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="MRP"
            value={stockForm.mrp || ""}
            onChange={(e) =>
              setStockForm({ ...stockForm, mrp: Number(e.target.value) })
            }
            required
          />
          <button className="btn primary">Add batch & reconcile PO</button>
        </form>
      </section>

      <div className="filters">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          className="search"
          placeholder="Search name or generic…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Medicine</th>
            <th>Category</th>
            <th>Stock</th>
            <th>Batches</th>
          </tr>
        </thead>
        <tbody>
          {medicines.map((m) => (
            <tr key={m.id}>
              <td>
                <strong>{m.name}</strong>
                {m.genericFormula && <div className="muted">{m.genericFormula}</div>}
              </td>
              <td>{m.category.name}</td>
              <td>{m.totalStock ?? 0}</td>
              <td>
                {m.batches.map((b) => (
                  <div key={b.id} className="batch-pill">
                    {b.batchNumber} · {b.quantity} · exp{" "}
                    {new Date(b.expiryDate).toLocaleDateString()}
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
