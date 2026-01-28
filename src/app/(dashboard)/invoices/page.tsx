import { getInvoices } from "@/actions/invoices"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function InvoicesPage() {
  const invoices = await getInvoices()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Invoices</h1>
      
      <div className="rounded-md border bg-card">
        <div className="grid grid-cols-5 p-4 font-medium border-b text-sm text-muted-foreground">
          <div>Number</div>
          <div>Client</div>
          <div>Project</div>
          <div>Amount</div>
          <div>Status</div>
        </div>
        <div>
          {invoices?.map((invoice: any) => (
            <Link key={invoice.id} href={`/invoices/${invoice.id}`} className="grid grid-cols-5 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors items-center text-sm">
              <div className="font-medium">{invoice.number}</div>
              <div>{invoice.client?.name}</div>
              <div className="text-muted-foreground">{invoice.project?.name}</div>
              <div className="font-mono">{invoice.total_amount ? `$${invoice.total_amount}` : '-'}</div>
              <div><Badge variant="outline">{invoice.status}</Badge></div>
            </Link>
          ))}
          {invoices?.length === 0 && <div className="p-8 text-center text-muted-foreground">No invoices yet.</div>}
        </div>
      </div>
    </div>
  )
}
