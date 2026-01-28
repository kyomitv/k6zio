import { getInvoice } from "@/actions/invoices"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { notFound } from "next/navigation"

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const invoice = await getInvoice(params.id)
  if (!invoice) notFound()

  return (
    <div className="space-y-8 max-w-4xl mx-auto bg-card p-10 rounded-lg border shadow-sm">
      <div className="flex justify-between items-start">
        <div>
           <h1 className="text-3xl font-bold text-primary">{invoice.number}</h1>
           <p className="text-muted-foreground mt-1">Issued: {invoice.issue_date}</p>
        </div>
        <div className="text-right">
           <Badge className="text-lg px-4 py-1 mb-2">{invoice.status}</Badge>
           <div className="text-sm font-medium">{invoice.client?.name}</div>
           <div className="text-xs text-muted-foreground">{invoice.client?.email}</div>
        </div>
      </div>

      <Separator />

      <table className="w-full text-sm">
        <thead className="border-b">
          <tr className="text-left text-muted-foreground">
             <th className="py-2">Description</th>
             <th className="py-2 text-right">Qty</th>
             <th className="py-2 text-right">Price</th>
             <th className="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items?.map((item: any) => (
             <tr key={item.id} className="border-b last:border-0">
               <td className="py-3">{item.description}</td>
               <td className="py-3 text-right">{item.quantity}</td>
               <td className="py-3 text-right">${item.unit_price}</td>
               <td className="py-3 text-right font-medium">${item.amount}</td>
             </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
         <div className="w-1/3 space-y-2">
            <div className="flex justify-between font-bold text-lg">
               <span>Total</span>
               <span>${invoice.total_amount}</span>
            </div>
         </div>
      </div>

      <div className="flex gap-4 justify-end mt-8">
        <Button variant="outline">Download PDF</Button>
        <Button>Send to Client</Button>
      </div>
    </div>
  )
}
