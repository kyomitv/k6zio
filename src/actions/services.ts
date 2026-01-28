"use server"

import { createClient } from "@/lib/supabase/server"
import { ActionResult } from "@/types"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const serviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  default_price: z.coerce.number().min(0),
  unit: z.string().default("hour"),
})

export async function createServiceAction(
  formData: FormData
): Promise<ActionResult<any>> {
  const supabase = await createClient()

  const data = {
    name: formData.get("name"),
    description: formData.get("description"),
    default_price: formData.get("default_price"),
    unit: formData.get("unit"),
  }

  const validated = serviceSchema.safeParse(data)

  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  const { data: membership } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", user.id)
    .limit(1)
    .single()

  if (!membership) return { success: false, error: "No team found" }

  const { error } = await supabase.from("services").insert({
    ...validated.data,
    team_id: membership.team_id,
  })

  if (error) return { success: false, error: error.message }

  revalidatePath("/services")
  return { success: true, data: null }
}

export async function getServices() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("name", { ascending: true })
  
  if (error) throw error
  return data
}
