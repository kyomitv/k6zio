import { createClient } from "@/lib/supabase/server"
import { Separator } from "@/components/ui/separator"
import ProfileForm from "@/components/forms/profile-form"
import TeamForm from "@/components/forms/team-form"

export default async function SettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div>Please login</div>

  // Fetch Member Info & Team
  const { data: member } = await supabase
      .from("team_members")
      .select("role, teams(id, name, slug)")
      .eq("user_id", user.id)
      .limit(1)
      .single()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and team.</p>
      </div>
      
      <Separator />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Profile</h2>
        <ProfileForm user={user} />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Team</h2>
        {member && member.teams ? (
          <TeamForm team={member.teams} role={member.role} />
        ) : (
          <div className="p-4 border border-destructive/50 text-destructive rounded-lg bg-destructive/10">
            No team found.
          </div>
        )}
      </div>
    </div>
  )
}
