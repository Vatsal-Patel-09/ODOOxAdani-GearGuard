"use client"

import { useEffect, useState } from "react"
import { Wrench, ClipboardList, Users, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Stats {
    total_equipment: number
    active_requests: number
    total_teams: number
    scheduled_today: number
    requests_by_status: {
        new: number
        in_progress: number
        repaired: number
        scrap: number
    }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/stats`)
                if (response.ok) {
                    const data = await response.json()
                    setStats(data)
                }
            } catch (error) {
                console.error("Failed to fetch stats:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading) {
        return <div className="flex items-center justify-center h-64">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Welcome to GearGuard Maintenance Management</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total_equipment ?? 0}</div>
                        <p className="text-xs text-muted-foreground">Active assets</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.active_requests ?? 0}</div>
                        <p className="text-xs text-muted-foreground">New + In Progress</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Teams</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total_teams ?? 0}</div>
                        <p className="text-xs text-muted-foreground">Maintenance teams</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Scheduled Today</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.scheduled_today ?? 0}</div>
                        <p className="text-xs text-muted-foreground">Requests for today</p>
                    </CardContent>
                </Card>
            </div>

            {/* Request Status Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Request Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                            <div className="text-2xl font-bold text-blue-600">{stats?.requests_by_status?.new ?? 0}</div>
                            <p className="text-sm text-muted-foreground">New</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                            <div className="text-2xl font-bold text-yellow-600">{stats?.requests_by_status?.in_progress ?? 0}</div>
                            <p className="text-sm text-muted-foreground">In Progress</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                            <div className="text-2xl font-bold text-green-600">{stats?.requests_by_status?.repaired ?? 0}</div>
                            <p className="text-sm text-muted-foreground">Repaired</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950/20">
                            <div className="text-2xl font-bold text-red-600">{stats?.requests_by_status?.scrap ?? 0}</div>
                            <p className="text-sm text-muted-foreground">Scrap</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
