"use client"

import { updateClientAction } from "@/actions/clients"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pencil } from "lucide-react"

export default function EditClientDialog({ client }: { client: any }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    const result = await updateClientAction(client.id, formData)
    
    if (result.success) {
      toast.success("Client updated")
      setOpen(false)
      router.refresh()
    } else {
      toast.error(result.error || "Failed to update client")
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
          <DialogTitle>Edit Client</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={client.name} required />
          </div>
          <div className="space-y-2">
             <Label htmlFor="email">Email</Label>
             <Input id="email" name="email" type="email" defaultValue={client.email} />
          </div>
          <div className="space-y-2">
             <Label htmlFor="address">Address</Label>
             <Input id="address" name="address" defaultValue={client.address} />
          </div>
          <Button type="submit" className="w-full">Save Changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
