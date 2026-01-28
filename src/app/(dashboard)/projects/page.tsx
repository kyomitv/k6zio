import { getProjects } from "@/actions/projects"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import EditProjectDialog from "@/components/forms/edit-project-dialog"

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Link href="/projects/new">
          <Button>New Project</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects?.map((project: any) => (
          <div key={project.id} className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                 <h3 className="font-semibold text-lg">{project.name}</h3>
                 <p className="text-sm text-muted-foreground">{project.client?.name}</p>
              </div>
              <div className="flex items-center gap-2"> {/* Added a wrapper div for status and dialog */}
                <span className="text-xs rounded-full bg-secondary px-2 py-1">{project.status}</span>
                <EditProjectDialog project={project} />
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{project.description}</p>
          </div>
        ))}
         {projects?.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground">No projects yet.</p>
        )}
      </div>
    </div>
  )
}
