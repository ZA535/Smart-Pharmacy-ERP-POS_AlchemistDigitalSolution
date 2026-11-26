export function ReceiptPrint({ sale }) {
  return (
    <div className="receipt print-area">
      <h2>Smart Pharmacy</h2>
      <p>
        Invoice: <strong>{sale.invoiceNumber}</strong>
      </p>
      <p className="muted">
        {new Date(sale.createdAt).toLocaleString()} · {sale.cashier?.name}
      </p>
      <table className="table compact">
        <thead>
          <tr>
            <th>Item</th>
            <th>Batch</th>
            <th>Qty</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((i) => (
            <tr key={i.id}>
              <td>{i.medicineName}</td>
              <td>{i.batchNumber}</td>
              <td>{i.quantity}</td>
              <td>{Number(i.lineTotal).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="totals">
        <div>Subtotal: {Number(sale.subtotal).toFixed(2)}</div>
        <div>Tax: {Number(sale.taxAmount).toFixed(2)}</div>
        <div>Discount: −{Number(sale.discountAmount).toFixed(2)}</div>
        <div className="grand">
          <strong>Total: {Number(sale.total).toFixed(2)}</strong>
        </div>
      </div>
      <p className="receipt-foot">Thank you — get well soon.</p>
    </div>
  );
}
