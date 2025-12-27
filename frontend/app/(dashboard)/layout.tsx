import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex items-center border-b px-4 py-3">
                    <SidebarTrigger />
                </header>
                <main className="flex-1 p-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
