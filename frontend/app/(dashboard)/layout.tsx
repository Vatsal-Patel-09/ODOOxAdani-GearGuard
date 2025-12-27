"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ProtectedRoute>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-14 items-center gap-4 border-b px-6">
                        <SidebarTrigger />
                    </header>
                    <main className="flex-1 p-6">
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </ProtectedRoute>
    )
}
