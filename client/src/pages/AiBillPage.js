import { useEffect, useState } from "react";
import { api } from "../api";

export function AiBillPage() {
  const [categories, setCategories] = useState([]);
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api("/api/categories").then(setCategories);
  }, []);

  async function onUpload(file) {
    setBusy(true);
    setMsg("");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/bills/extract", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("pharmacy_token")}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRows(
        data.items.map((i) => ({
          medicineName: i.medicineName,
          categoryId: i.categoryId,
          categoryName: i.categoryName,
          batchNumber: i.batchNumber,
          expiryDate: i.expiryDate?.slice(0, 10) ?? "",
          quantity: i.quantity,
          tradePrice: i.tradePrice,
          mrp: i.mrp,
        }))
      );
      setMsg("Review extracted lines, edit if needed, then confirm.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    setBusy(true);
    try {
      await api("/api/inventory/confirm-bill", {
        method: "POST",
        body: JSON.stringify({
          items: rows.map((r) => ({
            medicineName: r.medicineName,
            categoryId: r.categoryId,
            batchNumber: r.batchNumber,
            expiryDate: r.expiryDate,
            quantity: r.quantity,
            purchasePrice: r.tradePrice,
            mrp: r.mrp,
          })),
        }),
      });
      setMsg("Stock added and purchase orders reconciled.");
      setRows([]);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Confirm failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <header className="page-head">
        <h1>AI Supplier Bill Upload</h1>
      </header>
      <section className="card">
        <p className="muted">
          Upload JPG, PNG, or PDF. Without <code>GEMINI_API_KEY</code>, demo lines are
          returned for testing.
        </p>
        <input
          type="file"
          accept="image/*,application/pdf"
          disabled={busy}
          onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
        />
        {msg && <p className="info">{msg}</p>}
      </section>

      {rows.length > 0 && (
        <section className="card">
          <h2>Verification table</h2>
          <table className="table editable">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Category</th>
                <th>Batch</th>
                <th>Expiry</th>
                <th>Qty</th>
                <th>Trade</th>
                <th>MRP</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx}>
                  <td>
                    <input
                      value={r.medicineName}
                      onChange={(e) => {
                        const next = [...rows];
                        next[idx].medicineName = e.target.value;
                        setRows(next);
                      }}
                    />
                  </td>
                  <td>
                    <select
                      value={r.categoryId}
                      onChange={(e) => {
                        const next = [...rows];
                        next[idx].categoryId = e.target.value;
                        setRows(next);
                      }}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      value={r.batchNumber}
                      onChange={(e) => {
                        const next = [...rows];
                        next[idx].batchNumber = e.target.value;
                        setRows(next);
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={r.expiryDate}
                      onChange={(e) => {
                        const next = [...rows];
                        next[idx].expiryDate = e.target.value;
                        setRows(next);
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={r.quantity}
                      onChange={(e) => {
                        const next = [...rows];
                        next[idx].quantity = Number(e.target.value);
                        setRows(next);
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      value={r.tradePrice}
                      onChange={(e) => {
                        const next = [...rows];
                        next[idx].tradePrice = Number(e.target.value);
                        setRows(next);
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      value={r.mrp}
                      onChange={(e) => {
                        const next = [...rows];
                        next[idx].mrp = Number(e.target.value);
                        setRows(next);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn primary" disabled={busy} onClick={confirm}>
            Confirm &amp; add to stock
          </button>
        </section>
      )}
    </div>
  );
}
