import { getClients } from "@/actions/clients"
import NewClientForm from "@/components/forms/new-client-form"
import EditClientDialog from "@/components/forms/edit-client-dialog"

export default async function ClientsPage() {
  const clients = await getClients()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Clients</h1>
        <NewClientForm />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients?.map((client: any) => (
          <div key={client.id} className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <h3 className="font-semibold leading-none tracking-tight">{client.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{client.email}</p>
               </div>
               <EditClientDialog client={client} />
            </div>
            <p className="text-sm text-muted-foreground">{client.address}</p>
          </div>
        ))}
        {clients?.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground">No clients found. Add one to get started.</p>
        )}
      </div>
    </div>
  )
}
