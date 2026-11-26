import { useState } from "react";
import { api } from "../api";

export function CustomerReturnsPage() {
  const [invoice, setInvoice] = useState("");
  const [sale, setSale] = useState(null);
  const [qty, setQty] = useState({});
  const [msg, setMsg] = useState("");

  async function lookup(e) {
    e.preventDefault();
    try {
      const s = await api(`/api/pos/sales/${encodeURIComponent(invoice)}`);
      setSale(s);
      setQty({});
    } catch {
      setMsg("Invoice not found");
      setSale(null);
    }
  }

  async function submitReturn(e) {
    e.preventDefault();
    if (!sale) return;
    const items = sale.items
      .map((i) => ({ saleItemId: i.id, quantity: qty[i.id] ?? 0 }))
      .filter((i) => i.quantity > 0);
    if (!items.length) {
      setMsg("Enter return quantities.");
      return;
    }
    try {
      const ret = await api("/api/returns/customer", {
        method: "POST",
        body: JSON.stringify({ invoiceNumber: sale.invoiceNumber, items }),
      });
      setMsg(
        `Credit note ${ret.returnNumber} — $${Number(ret.creditAmount).toFixed(2)}`
      );
      const s = await api(`/api/pos/sales/${encodeURIComponent(sale.invoiceNumber)}`);
      setSale(s);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Return failed");
    }
  }

  return (
    <div>
      <header className="page-head">
        <h1>Customer Returns</h1>
      </header>
      <form className="card row-form" onSubmit={lookup}>
        <input
          placeholder="POS invoice number"
          value={invoice}
          onChange={(e) => setInvoice(e.target.value)}
          required
        />
        <button className="btn secondary">Look up</button>
      </form>

      {sale && (
        <form className="card" onSubmit={submitReturn}>
          <p>
            Invoice <strong>{sale.invoiceNumber}</strong> ·{" "}
            {new Date(sale.createdAt).toLocaleString()}
          </p>
          <table className="table compact">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Batch</th>
                <th>Sold</th>
                <th>Already returned</th>
                <th>Return now</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((i) => {
                const max = i.quantity - i.returnedQty;
                return (
                  <tr key={i.id}>
                    <td>{i.medicineName}</td>
                    <td>{i.batchNumber}</td>
                    <td>{i.quantity}</td>
                    <td>{i.returnedQty}</td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        max={max}
                        value={qty[i.id] ?? 0}
                        onChange={(e) =>
                          setQty({ ...qty, [i.id]: Number(e.target.value) })
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button className="btn primary">Issue credit &amp; restock</button>
        </form>
      )}
      {msg && <p className="info">{msg}</p>}
    </div>
  );
}
