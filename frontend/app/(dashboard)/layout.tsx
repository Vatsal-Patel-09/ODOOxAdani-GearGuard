"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { ThemeToggle } from "@/components/theme-toggle"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar />
                <main className="flex-1 flex flex-col">
                    {/* Top Header Bar */}
                    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
                        <SidebarTrigger />
                        <ThemeToggle />
                    </header>
                    {/* Main Content */}
                    <div className="flex-1">{children}</div>
                </main>
            </div>
        </SidebarProvider>
    )
}
