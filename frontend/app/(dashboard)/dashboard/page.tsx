export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Welcome to GearGuard Maintenance Management</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border bg-card p-6">
                    <h3 className="text-sm font-medium text-muted-foreground">Total Equipment</h3>
                    <p className="text-2xl font-bold">-</p>
                </div>
                <div className="rounded-lg border bg-card p-6">
                    <h3 className="text-sm font-medium text-muted-foreground">Active Requests</h3>
                    <p className="text-2xl font-bold">-</p>
                </div>
                <div className="rounded-lg border bg-card p-6">
                    <h3 className="text-sm font-medium text-muted-foreground">Teams</h3>
                    <p className="text-2xl font-bold">-</p>
                </div>
                <div className="rounded-lg border bg-card p-6">
                    <h3 className="text-sm font-medium text-muted-foreground">Scheduled Today</h3>
                    <p className="text-2xl font-bold">-</p>
                </div>
            </div>
        </div>
    )
}
