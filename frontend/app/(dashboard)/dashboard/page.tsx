"use client"

import { useEffect, useState } from "react"
import { Wrench, ClipboardList, Users, Calendar, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react"

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
        return (
            <div className="flex items-center justify-center h-[calc(100vh-3.5rem)] bg-[#F9FAFB] dark:bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-[#714B67] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-[#6B7280] dark:text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    const totalRequests = (stats?.requests_by_status?.new ?? 0) + 
                          (stats?.requests_by_status?.in_progress ?? 0) + 
                          (stats?.requests_by_status?.repaired ?? 0) + 
                          (stats?.requests_by_status?.scrap ?? 0)
    const completionRate = totalRequests > 0 
        ? Math.round(((stats?.requests_by_status?.repaired ?? 0) / totalRequests) * 100) 
        : 0

    return (
        <div className="p-6 bg-[#F9FAFB] dark:bg-background min-h-[calc(100vh-3.5rem)]">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-[#111827] dark:text-foreground">Dashboard</h1>
                        <p className="text-sm text-[#6B7280] dark:text-muted-foreground mt-0.5">Welcome to GearGuard Maintenance Management</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-card rounded border border-[#E5E7EB] dark:border-border">
                        <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                        <span className="text-xs text-[#6B7280] dark:text-muted-foreground">System Online</span>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Total Equipment */}
                    <div className="bg-white dark:bg-card rounded-lg border border-[#E5E7EB] dark:border-border p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-[#714B67]/10 rounded-lg">
                                    <Wrench className="h-5 w-5 text-[#714B67]" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-[#111827] dark:text-foreground">{stats?.total_equipment ?? 0}</p>
                                    <p className="text-sm text-[#6B7280] dark:text-muted-foreground">Total Equipment</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-[#10B981]">
                                <TrendingUp className="h-4 w-4" />
                            </div>
                        </div>
                    </div>

                    {/* Active Requests */}
                    <div className="bg-white dark:bg-card rounded-lg border border-[#E5E7EB] dark:border-border p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-[#3B82F6]/10 rounded-lg">
                                    <ClipboardList className="h-5 w-5 text-[#3B82F6]" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-[#111827] dark:text-foreground">{stats?.active_requests ?? 0}</p>
                                    <p className="text-sm text-[#6B7280] dark:text-muted-foreground">Active Requests</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-[#F59E0B]">
                                <AlertCircle className="h-4 w-4" />
                            </div>
                        </div>
                    </div>

                    {/* Teams */}
                    <div className="bg-white dark:bg-card rounded-lg border border-[#E5E7EB] dark:border-border p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-[#10B981]/10 rounded-lg">
                                    <Users className="h-5 w-5 text-[#10B981]" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-[#111827] dark:text-foreground">{stats?.total_teams ?? 0}</p>
                                    <p className="text-sm text-[#6B7280] dark:text-muted-foreground">Maintenance Teams</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-[#10B981]">
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                        </div>
                    </div>

                    {/* Scheduled Today */}
                    <div className="bg-white dark:bg-card rounded-lg border border-[#E5E7EB] dark:border-border p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-[#F59E0B]/10 rounded-lg">
                                    <Calendar className="h-5 w-5 text-[#F59E0B]" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-[#111827] dark:text-foreground">{stats?.scheduled_today ?? 0}</p>
                                    <p className="text-sm text-[#6B7280] dark:text-muted-foreground">Scheduled Today</p>
                                </div>
                            </div>
                            <span className="text-xs text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded font-medium">Today</span>
                        </div>
                    </div>
                </div>

                {/* Request Status Section */}
                <div className="bg-white dark:bg-card rounded-lg border border-[#E5E7EB] dark:border-border">
                    <div className="px-5 py-4 border-b border-[#E5E7EB] dark:border-border">
                        <h2 className="text-base font-semibold text-[#111827] dark:text-foreground">Request Status</h2>
                        <p className="text-sm text-[#6B7280] dark:text-muted-foreground mt-0.5">Current maintenance request breakdown</p>
                    </div>
                    
                    <div className="p-5">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* New */}
                            <div className="bg-[#EFF6FF] dark:bg-[#3B82F6]/10 border border-[#BFDBFE] dark:border-[#3B82F6]/30 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 bg-[#3B82F6] rounded-lg flex items-center justify-center">
                                        <span className="text-lg font-bold text-white">{stats?.requests_by_status?.new ?? 0}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[#111827] dark:text-foreground">New</p>
                                        <p className="text-xs text-[#6B7280] dark:text-muted-foreground">Pending</p>
                                    </div>
                                </div>
                            </div>

                            {/* In Progress */}
                            <div className="bg-[#FFFBEB] dark:bg-[#F59E0B]/10 border border-[#FDE68A] dark:border-[#F59E0B]/30 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 bg-[#F59E0B] rounded-lg flex items-center justify-center">
                                        <span className="text-lg font-bold text-white">{stats?.requests_by_status?.in_progress ?? 0}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[#111827] dark:text-foreground">In Progress</p>
                                        <p className="text-xs text-[#6B7280] dark:text-muted-foreground">Working</p>
                                    </div>
                                </div>
                            </div>

                            {/* Repaired */}
                            <div className="bg-[#ECFDF5] dark:bg-[#10B981]/10 border border-[#A7F3D0] dark:border-[#10B981]/30 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 bg-[#10B981] rounded-lg flex items-center justify-center">
                                        <span className="text-lg font-bold text-white">{stats?.requests_by_status?.repaired ?? 0}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[#111827] dark:text-foreground">Repaired</p>
                                        <p className="text-xs text-[#6B7280] dark:text-muted-foreground">Done</p>
                                    </div>
                                </div>
                            </div>

                            {/* Scrap */}
                            <div className="bg-[#FEF2F2] dark:bg-[#EF4444]/10 border border-[#FECACA] dark:border-[#EF4444]/30 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 bg-[#EF4444] rounded-lg flex items-center justify-center">
                                        <span className="text-lg font-bold text-white">{stats?.requests_by_status?.scrap ?? 0}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[#111827] dark:text-foreground">Scrapped</p>
                                        <p className="text-xs text-[#6B7280] dark:text-muted-foreground">Disposed</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-5 pt-5 border-t border-[#E5E7EB] dark:border-border">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-[#374151] dark:text-foreground">Completion Rate</span>
                                <span className="text-sm font-semibold text-[#714B67]">{completionRate}%</span>
                            </div>
                            <div className="w-full h-2.5 bg-[#E5E7EB] dark:bg-muted rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-[#714B67] rounded-full transition-all duration-500"
                                    style={{ width: `${completionRate}%` }}
                                ></div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-[#9CA3AF] dark:text-muted-foreground">{stats?.requests_by_status?.repaired ?? 0} completed</span>
                                <span className="text-xs text-[#9CA3AF] dark:text-muted-foreground">{totalRequests} total</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
