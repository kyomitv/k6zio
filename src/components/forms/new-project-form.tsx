"use client"

import { createProjectAction } from "@/actions/projects"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function NewProjectForm({ clients }: { clients: { id: string; name: string }[] }) {
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    const result = await createProjectAction(formData)
    
    if (result.success) {
      toast.success("Project created successfully")
      router.push("/projects")
      router.refresh()
    } else {
      toast.error(result.error || "Failed to create project")
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 rounded-lg border p-6 bg-card">
        <div className="space-y-2">
          <Label htmlFor="name">Project Name</Label>
          <Input id="name" name="name" required placeholder="e.g. Website Redesign" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="client_id">Client</Label>
          <Select name="client_id" required>
            <SelectTrigger>
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clients?.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" placeholder="Project details..." />
        </div>

        <Button type="submit" className="w-full">Create Project</Button>
      </form>
  )
}
