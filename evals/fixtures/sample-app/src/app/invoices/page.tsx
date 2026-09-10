type Invoice = { id: string; number: string; total: number; issuedAt: string };

async function loadInvoices(): Promise<Invoice[]> {
  const res = await fetch('/api/invoices?limit=20');
  return res.json();
}

export default async function InvoicesPage() {
  const invoices = await loadInvoices();
  return (
    <main>
      <h1>Invoices</h1>
      <table>
        <thead>
          <tr><th>Number</th><th>Total</th><th>Issued</th></tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id}><td>{inv.number}</td><td>{inv.total}</td><td>{inv.issuedAt}</td></tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
