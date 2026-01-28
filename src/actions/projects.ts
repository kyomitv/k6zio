"use server"

import { createClient } from "@/lib/supabase/server"
import { ActionResult } from "@/types"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  client_id: z.string().uuid("Invalid client"),
})

export async function createProjectAction(
  formData: FormData
): Promise<ActionResult<any>> {
  const supabase = await createClient()

  const data = {
    name: formData.get("name"),
    description: formData.get("description"),
    client_id: formData.get("client_id"),
  }

  const validated = projectSchema.safeParse(data)

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0].message,
    }
  }

  // Fetch current user team (handling single team for now)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  const { data: membership } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", user.id)
    .limit(1)
    .single()

  if (!membership) {
    return { success: false, error: "No team found" }
  }

  const { error } = await supabase.from("projects").insert({
    ...validated.data,
    team_id: membership.team_id,
    status: 'active'
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/projects")
  return { success: true, data: null }
}

export async function updateProjectAction(id: string, formData: FormData): Promise<ActionResult<unknown>> {
  const supabase = await createClient()
  
  const data = {
    name: formData.get("name"),
    description: formData.get("description"),
    status: formData.get("status"),
  }

  // Basic validation (can be enhanced with Zod)
  if (!data.name) return { success: false, error: "Name is required" }

  const { error } = await supabase
    .from("projects")
    .update(data)
    .eq("id", id)

  if (error) return { success: false, error: error.message }

  revalidatePath("/projects")
  return { success: true, data: null }
}

export async function getProjects() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      clients(name)
    `)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}
