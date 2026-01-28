"use server"

import { createClient } from "@/lib/supabase/server"
import { ActionResult } from "@/types"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
})

export async function createClientAction(
  formData: FormData
): Promise<ActionResult<any>> {
  const supabase = await createClient()

  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    address: formData.get("address"),
  }

  const validated = clientSchema.safeParse(data)

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0].message,
    }
  }

  // Get current user's team. For MVP we assume user is in at least one team
  // and we pick the first one or we need a Team Selector in UI.
  // For simplicity: fetch first team.
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  const { data: membership } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", user.id)
    .limit(1)
    .single()

  if (!membership) {
    return { success: false, error: "You do not belong to any team" }
  }

  const { error } = await supabase.from("clients").insert({
    ...validated.data,
    team_id: membership.team_id,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/clients")
  return { success: true, data: null }
}

export async function updateClientAction(id: string, formData: FormData): Promise<ActionResult<unknown>> {
  const supabase = await createClient()
  
  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    address: formData.get("address"),
  }

  const validated = clientSchema.safeParse(data)

  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message }
  }

  // RLS checks permissions via policy
  const { error } = await supabase
    .from("clients")
    .update(validated.data)
    .eq("id", id)

  if (error) return { success: false, error: error.message }

  revalidatePath("/clients")
  return { success: true, data: null }
}

export async function getClients() {
  const supabase = await createClient()
  
  // RLS handles team filtering naturally if we set it up correctly, 
  // but we should select based on team_id usually or just select *.
  // The policy "Team members can view clients" checks is_team_member(team_id).
  // But purely selecting * from clients might return all if we are member of ALL teams.
  // Ideally, we filter by team_id context if the App supports multiple teams.
  // For now, let's just select * and let RLS filter what we can see.
  
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}
