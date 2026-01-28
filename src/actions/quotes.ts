"use server"

import { createClient } from "@/lib/supabase/server"
import { ActionResult } from "@/types"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createQuoteAction(formData: FormData): Promise<ActionResult<unknown>> {
  const supabase = await createClient()
  const project_id = formData.get("project_id") as string
  const valid_until = formData.get("valid_until") as string

  // Fetch project to get client and team
  const { data: project } = await supabase
    .from("projects")
    .select("team_id, client_id")
    .eq("id", project_id)
    .single()

  if (!project) return { success: false, error: "Project not found" }

  const { data, error } = await supabase
    .from("quotes")
    .insert({
      team_id: project.team_id,
      project_id: project_id,
      client_id: project.client_id,
      status: 'draft',
      valid_until: valid_until || null,
    })
    .select("id")
    .single()

  if (error) return { success: false, error: error.message }

  redirect(`/quotes/${data.id}`)
}

export async function addQuoteItemAction(quoteId: string, formData: FormData): Promise<ActionResult<unknown>> {
  const supabase = await createClient()
  
  const description = formData.get("description")
  const quantity = Number(formData.get("quantity"))
  const unit_price = Number(formData.get("unit_price"))
  const amount = quantity * unit_price

  // Note: Validation omitted for brevity but strictly required in production
  
  const { error } = await supabase.from("quote_items").insert({
    quote_id: quoteId,
    description,
    quantity,
    unit_price,
    amount
  })

  if (error) return { success: false, error: error.message }

  revalidatePath(`/quotes/${quoteId}`)
  return { success: true, data: null }
}

export async function getQuote(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("quotes")
    .select(`
      *,
      project:projects(name),
      client:clients(name, email, address),
      items:quote_items(*)
    `)
    .eq("id", id)
    .single()

  if (error) return null
  return data
}

export async function getQuotes() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("quotes")
    .select(`
      *,
      project:projects(name),
      client:clients(name)
    `)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}
