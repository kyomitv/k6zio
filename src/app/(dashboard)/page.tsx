export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to your workspace.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {["Total Revenue", "Active Projects", "Pending Invoices", "Clients"].map((title) => (
          <div key={title} className="rounded-xl border bg-card text-card-foreground shadow p-6">
             <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">{title}</h3>
            </div>
            <div className="text-2xl font-bold">--</div>
             <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </div>
        ))}
      </div>
    </div>
  )
}
