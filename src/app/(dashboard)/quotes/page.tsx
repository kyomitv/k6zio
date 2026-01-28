import { getQuotes } from "@/actions/quotes"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function QuotesPage() {
  const quotes = await getQuotes()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quotes</h1>
        <Link href="/projects">
          <Button variant="outline">New Quote (via Project)</Button>
        </Link>
      </div>
      
      <div className="rounded-md border bg-card">
        <div className="grid grid-cols-5 p-4 font-medium border-b text-sm text-muted-foreground">
          <div>Client</div>
          <div>Project</div>
          <div>Valid Until</div>
          <div>Amount</div>
          <div>Status</div>
        </div>
        <div>
          {quotes?.map((quote: any) => (
            <Link key={quote.id} href={`/quotes/${quote.id}`} className="grid grid-cols-5 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors items-center text-sm">
              <div className="font-medium">{quote.client?.name}</div>
              <div>{quote.project?.name}</div>
              <div className="text-muted-foreground">{quote.valid_until || '-'}</div>
              <div className="font-mono">{quote.total_amount ? `$${quote.total_amount}` : '-'}</div>
              <div><Badge variant={quote.status === 'accepted' ? 'default' : 'secondary'}>{quote.status}</Badge></div>
            </Link>
          ))}
          {quotes?.length === 0 && <div className="p-8 text-center text-muted-foreground">No quotes found.</div>}
        </div>
      </div>
    </div>
  )
}
