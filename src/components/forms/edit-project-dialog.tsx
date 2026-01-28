"use client"

import { updateProjectAction } from "@/actions/projects"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pencil } from "lucide-react"

export default function EditProjectDialog({ project }: { project: any }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    const result = await updateProjectAction(project.id, formData)
    
    if (result.success) {
      toast.success("Project updated")
      setOpen(false)
      router.refresh()
    } else {
      toast.error(result.error || "Failed to update project")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={project.name} required />
          </div>
          <div className="space-y-2">
             <Label htmlFor="status">Status</Label>
             <Select name="status" defaultValue={project.status}>
               <SelectTrigger>
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="active">Active</SelectItem>
                 <SelectItem value="completed">Completed</SelectItem>
                 <SelectItem value="archived">Archived</SelectItem>
               </SelectContent>
             </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={project.description} />
          </div>
          <Button type="submit" className="w-full">Save Changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
