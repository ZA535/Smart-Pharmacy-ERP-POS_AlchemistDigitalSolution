import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { ReceiptPrint } from "../components/ReceiptPrint";

export function PosPage() {
  const [categories, setCategories] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [q, setQ] = useState("");
  const [cart, setCart] = useState([]);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [sale, setSale] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/categories").then(setCategories);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (categoryId) params.set("categoryId", categoryId);
    if (q) params.set("q", q);
    api(`/api/medicines?${params}`).then(setMedicines);
  }, [categoryId, q]);

  const subtotal = useMemo(
    () => cart.reduce((a, l) => a + l.mrp * l.quantity, 0),
    [cart]
  );
  const total = subtotal + tax - discount;

  function addToCart(m) {
    const mrp = Number(m.batches[0]?.mrp ?? 0);
    setCart((prev) => {
      const existing = prev.find((p) => p.medicineId === m.id);
      if (existing) {
        return prev.map((p) =>
          p.medicineId === m.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { medicineId: m.id, name: m.name, quantity: 1, mrp }];
    });
  }

  async function checkout() {
    setError("");
    try {
      const res = await api("/api/pos/checkout", {
        method: "POST",
        body: JSON.stringify({
          lines: cart.map((c) => ({
            medicineId: c.medicineId,
            quantity: c.quantity,
          })),
          taxAmount: tax,
          discountAmount: discount,
        }),
      });
      setSale(res);
      setCart([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    }
  }

  function printReceipt() {
    window.print();
  }

  return (
    <div className="pos-layout">
      <div className="pos-main">
        <header className="page-head">
          <h1>POS Billing (FEFO)</h1>
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
            placeholder="Search medicine or generic…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="product-grid">
          {medicines
            .filter((m) => (m.totalStock ?? 0) > 0)
            .map((m) => (
              <button
                type="button"
                key={m.id}
                className="product-card"
                onClick={() => addToCart(m)}
              >
                <strong>{m.name}</strong>
                <span className="muted">{m.category.name}</span>
                <span>Stock: {m.totalStock}</span>
              </button>
            ))}
        </div>
      </div>

      <aside className="cart-panel card">
        <h2>Cart</h2>
        {error && <p className="error">{error}</p>}
        {cart.length === 0 && <p className="muted">Add medicines from the grid.</p>}
        <ul className="cart-list">
          {cart.map((c) => (
            <li key={c.medicineId}>
              <span>{c.name}</span>
              <input
                type="number"
                min={1}
                value={c.quantity}
                onChange={(e) =>
                  setCart((prev) =>
                    prev.map((p) =>
                      p.medicineId === c.medicineId
                        ? { ...p, quantity: Number(e.target.value) }
                        : p
                    )
                  )
                }
              />
              <button
                type="button"
                className="btn ghost small"
                onClick={() =>
                  setCart((prev) => prev.filter((p) => p.medicineId !== c.medicineId))
                }
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <label>
          Tax
          <input
            type="number"
            step="0.01"
            value={tax}
            onChange={(e) => setTax(Number(e.target.value))}
          />
        </label>
        <label>
          Discount
          <input
            type="number"
            step="0.01"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
          />
        </label>
        <p>
          <strong>Total: ${total.toFixed(2)}</strong>
        </p>
        <button className="btn primary" disabled={!cart.length} onClick={checkout}>
          Complete sale
        </button>
        {sale && (
          <>
            <button type="button" className="btn secondary" onClick={printReceipt}>
              Print receipt
            </button>
            <div className="receipt-host">
              <ReceiptPrint sale={sale} />
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
