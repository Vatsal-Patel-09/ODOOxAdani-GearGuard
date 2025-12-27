"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
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
    LayoutDashboard
} from "lucide-react"

const navItems = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
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
            <SidebarHeader className="border-b border-sidebar-border">
               
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        {navItems.map((item) => (
                            <SidebarMenuItem key={item.url}>
                                <SidebarMenuButton asChild isActive={pathname === item.url}>
                                    <Link href={item.url}>
                                        <item.icon className="h-4 w-4" />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={handleLogout}>
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
