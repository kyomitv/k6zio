"use client"

import { createClientAction } from "@/actions/clients"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function NewClientForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    const result = await createClientAction(formData)
    
    if (result.success) {
      toast.success("Client created successfully")
      setOpen(false)
      router.refresh()
    } else {
      toast.error(result.error || "Failed to create client")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Client</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required placeholder="Acme Corp" />
          </div>
          <div className="space-y-2">
             <Label htmlFor="email">Email</Label>
             <Input id="email" name="email" type="email" placeholder="contact@acme.com" />
          </div>
          <div className="space-y-2">
             <Label htmlFor="address">Address</Label>
             <Input id="address" name="address" placeholder="123 Business Rd" />
          </div>
          <Button type="submit" className="w-full">Create Client</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
