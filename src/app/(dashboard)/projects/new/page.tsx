import { getClients } from "@/actions/clients"
import NewProjectForm from "@/components/forms/new-project-form"

export default async function NewProjectPage() {
  const clients = await getClients()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Create New Project</h1>
      <NewProjectForm clients={clients || []} />
    </div>
  )
}
