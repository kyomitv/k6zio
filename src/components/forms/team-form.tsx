"use client"

import { updateTeamAction } from "@/actions/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function TeamForm({ team, role }: { team: any, role: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isOwner = role === 'owner'

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await updateTeamAction(team.id, formData)
    setLoading(false)

    if (result.success) {
      toast.success("Team updated")
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="space-y-2">
        <Label htmlFor="name">Team Name</Label>
        <Input 
          id="name" 
          name="name" 
          defaultValue={team.name} 
          disabled={!isOwner}
        />
      </div>
      <div className="space-y-2">
         <div className="flex justify-between text-sm">
           <span>Your Role:</span>
           <span className="font-bold capitalize">{role}</span>
         </div>
      </div>
      {isOwner ? (
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Update Team"}
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground">Only owners can edit team details.</p>
      )}
    </form>
  )
}
