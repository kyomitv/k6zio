import { getQuote, addQuoteItemAction } from "@/actions/quotes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { notFound } from "next/navigation"

export default async function QuoteDetailPage({ params }: { params: { id: string } }) {
  const quote = await getQuote(params.id)
  
  if (!quote) notFound()

  const addItemWithId = addQuoteItemAction.bind(null, quote.id)

  return (
    <div className="space-y-6 max-w-4xl mx-auto bg-card p-8 rounded-lg border shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Quote for {quote.project?.name}</h1>
          <p className="text-muted-foreground">{quote.client?.name}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Status</div>
          <div className="font-semibold uppercase tracking-wider">{quote.status}</div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Line Items</h2>
        <div className="grid gap-4">
          {quote.items?.map((item: any) => (
            <div key={item.id} className="grid grid-cols-12 gap-4 items-center border-b pb-2">
              <div className="col-span-6">{item.description}</div>
              <div className="col-span-2 text-right">{item.quantity}</div>
              <div className="col-span-2 text-right">${item.unit_price}</div>
              <div className="col-span-2 text-right font-medium">${item.amount}</div>
            </div>
          ))}
           {quote.items?.length === 0 && <p className="text-muted-foreground italic">No items yet.</p>}
        </div>
      </div>

      <div className="bg-muted/30 p-4 rounded-lg border mt-8">
        <h3 className="font-semibold mb-4">Add Item</h3>
        <form action={addItemWithId} className="grid grid-cols-12 gap-4 items-end">
           <div className="col-span-5 space-y-1">
             <Label htmlFor="description">Description</Label>
             <Input name="description" required placeholder="Service details" />
           </div>
           <div className="col-span-2 space-y-1">
             <Label htmlFor="quantity">Qty</Label>
             <Input name="quantity" type="number" step="0.1" required defaultValue="1" />
           </div>
           <div className="col-span-3 space-y-1">
             <Label htmlFor="unit_price">Price</Label>
             <Input name="unit_price" type="number" step="0.01" required />
           </div>
           <div className="col-span-2">
             <Button type="submit" className="w-full">Add</Button>
           </div>
        </form>
      </div>
      
      <div className="flex justify-end pt-6">
        <Button variant="default" size="lg">Finalize & Send Quote</Button>
      </div>
    </div>
  )
}
