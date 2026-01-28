"use server"

import { createClient } from "@/lib/supabase/server"
import { ActionResult } from "@/types"
import { revalidatePath } from "next/cache"

export async function updateProfileAction(formData: FormData): Promise<ActionResult<unknown>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { success: false, error: "Unauthorized" }

  const fullName = formData.get("full_name") as string
  
  // Update auth metadata
  const { error: authError } = await supabase.auth.updateUser({
    data: { full_name: fullName }
  })
  
  if (authError) return { success: false, error: authError.message }

  // Update public profile
  const { error: profileError } = await supabase
    .from("users")
    .update({ full_name: fullName })
    .eq("id", user.id)

  if (profileError) return { success: false, error: profileError.message }

  revalidatePath("/settings")
  return { success: true, data: null }
}

export async function updateTeamAction(teamId: string, formData: FormData): Promise<ActionResult<unknown>> {
  const supabase = await createClient()
  
  // Verify ownership? RLS will handle "manage" policy which is usually for owners/members
  // But strict "Owner Only" might need extra check or RLS refinement. 
  // Current RLS allows all members to manage team. User asked for "Owner Only".
  // We should check role.

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  const { data: member } = await supabase
    .from("team_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("team_id", teamId)
    .single()

  if (!member || member.role !== 'owner') {
    return { success: false, error: "Only team owners can update team settings" }
  }

  const name = formData.get("name") as string

  const { error } = await supabase
    .from("teams")
    .update({ name })
    .eq("id", teamId)

  if (error) return { success: false, error: error.message }

  revalidatePath("/settings")
  return { success: true, data: null }
}
