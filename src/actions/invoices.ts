"use server"

import { createClient } from "@/lib/supabase/server"
import { ActionResult } from "@/types"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createInvoiceFromQuoteAction(quoteId: string): Promise<ActionResult<any>> {
  const supabase = await createClient()

  // 1. Fetch Quote and Items
  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("*, items:quote_items(*)")
    .eq("id", quoteId)
    .single()

  if (quoteError || !quote) return { success: false, error: "Quote not found" }

  // 2. Generate Invoice Number (Simple Count Strategy for MVP)
  // RACE CONDITION WARNING: This is not safe for high concurrency. 
  // Should use a DB sequence or serializable transaction in production.
  const { count } = await supabase
    .from("invoices")
    .select("*", { count: 'exact', head: true })
    .eq("team_id", quote.team_id)

  const nextNumber = `INV-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(4, '0')}`

  // 3. Create Invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      team_id: quote.team_id,
      quote_id: quote.id,
      project_id: quote.project_id,
      client_id: quote.client_id,
      number: nextNumber,
      status: 'draft',
      total_amount: quote.total_amount, // logic to calc total needed if not in quote
    })
    .select()
    .single()

  if (invoiceError) return { success: false, error: invoiceError.message }

  // 4. Copy Items
  if (quote.items && quote.items.length > 0) {
    const invoiceItems = quote.items.map((item: any) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      amount: item.amount,
      order_index: item.order_index
    }))

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(invoiceItems)

    if (itemsError) {
      // Cleanup? For now just return error
      return { success: false, error: "Failed to create invoice items: " + itemsError.message }
    }
  }

  // 5. Update Key Statuses
  await supabase.from("quotes").update({ status: 'accepted' }).eq("id", quoteId)

  revalidatePath("/invoices")
  redirect(`/invoices/${invoice.id}`)
}

export async function getInvoices() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("invoices")
    .select("*, client:clients(name), project:projects(name)")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function getInvoice(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("invoices")
    .select("*, client:clients(*), project:projects(*), items:invoice_items(*)")
    .eq("id", id)
    .single()

  if (error) return null
  return data
}
