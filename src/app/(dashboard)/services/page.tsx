import { getServices, createServiceAction } from "@/actions/services"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default async function ServicesPage() {
  const services = await getServices()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Services</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Service</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
            </DialogHeader>
            <form action={createServiceAction} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default_price">Default Price</Label>
                <Input id="default_price" name="default_price" type="number" step="0.01" required />
              </div>
               <div className="space-y-2">
                <Label htmlFor="unit">Unit (e.g. hour, day)</Label>
                <Input id="unit" name="unit" defaultValue="hour" />
              </div>
              <Button type="submit" className="w-full">Create Service</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {services?.map((service: any) => (
          <div key={service.id} className="rounded-lg border bg-card p-4 shadow-sm">
            <h3 className="font-semibold">{service.name}</h3>
            <div className="flex justify-between items-center mt-2">
               <span className="font-bold text-lg">${service.default_price}</span>
               <span className="text-xs text-muted-foreground">/{service.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
