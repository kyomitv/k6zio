"use client"

import { updateProfileAction } from "@/actions/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ProfileForm({ user }: { user: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await updateProfileAction(formData)
    setLoading(false)

    if (result.success) {
      toast.success("Profile updated")
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name</Label>
        <Input 
          id="full_name" 
          name="full_name" 
          defaultValue={user.user_metadata?.full_name || ""} 
          placeholder="John Doe" 
        />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input disabled value={user.email} />
        <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  )
}
