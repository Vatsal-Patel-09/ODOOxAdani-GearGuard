"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
    Settings,
    Wrench,
    Users,
    ClipboardList,
    Calendar,
    LogOut,
    Home
} from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"

const navItems = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "Equipment",
        url: "/equipment",
        icon: Wrench,
    },
    {
        title: "Teams",
        url: "/teams",
        icon: Users,
    },
    {
        title: "Requests",
        url: "/requests",
        icon: ClipboardList,
    },
    {
        title: "Calendar",
        url: "/calendar",
        icon: Calendar,
    },
]

export function AppSidebar() {
    const pathname = usePathname()

    const handleLogout = () => {
        localStorage.removeItem("user")
        window.location.href = "/sign-in"
    }

    return (
        <Sidebar>
            <SidebarHeader className="border-b px-4 py-3">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <Settings className="h-6 w-6 text-primary" />
                    <span className="text-lg font-bold text-primary">GearGuard</span>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                                        <Link href={item.url}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t p-4">
                <div className="flex items-center justify-between">
                    <ThemeToggle />
                    <Button variant="ghost" size="icon" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
