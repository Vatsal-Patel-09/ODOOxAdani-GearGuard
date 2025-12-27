"use client"

import { useEffect, useState } from "react"
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, Wrench, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface ScheduledMaintenance {
    id: string
    title: string
    equipment_id: string
    equipment_name: string
    team_id: string
    team_name: string
    scheduled_date: string
    status: string
    priority: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [scheduledItems, setScheduledItems] = useState<ScheduledMaintenance[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

    useEffect(() => {
        fetchScheduledMaintenance()
    }, [currentDate])

    const fetchScheduledMaintenance = async () => {
        try {
            const year = currentDate.getFullYear()
            const month = currentDate.getMonth() + 1
            const response = await fetch(`${API_BASE_URL}/requests?scheduled=true`)
            if (response.ok) {
                const data = await response.json()
                setScheduledItems(data.filter((item: ScheduledMaintenance) => item.scheduled_date))
            }
        } catch (error) {
            console.error("Failed to fetch scheduled maintenance:", error)
        } finally {
            setLoading(false)
        }
    }

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDay = firstDay.getDay()
        return { daysInMonth, startingDay }
    }

    const { daysInMonth, startingDay } = getDaysInMonth(currentDate)

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    const goToToday = () => {
        setCurrentDate(new Date())
    }

    const getEventsForDate = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        return scheduledItems.filter(item => item.scheduled_date?.startsWith(dateStr))
    }

    const isToday = (day: number) => {
        const today = new Date()
        return (
            day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear()
        )
    }

    const getPriorityColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return 'bg-[#EF4444]'
            case 'medium':
                return 'bg-[#F59E0B]'
            case 'low':
                return 'bg-[#10B981]'
            default:
                return 'bg-[#6B7280]'
        }
    }

    const todayEvents = scheduledItems.filter(item => {
        const today = new Date()
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
        return item.scheduled_date?.startsWith(dateStr)
    })

    const upcomingEvents = scheduledItems.filter(item => {
        const eventDate = new Date(item.scheduled_date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return eventDate > today
    }).slice(0, 5)

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-3.5rem)] bg-[#F9FAFB] dark:bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-[#714B67] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-[#6B7280] dark:text-muted-foreground">Loading calendar...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 bg-[#F9FAFB] dark:bg-background min-h-[calc(100vh-3.5rem)]">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-[#111827] dark:text-foreground">Calendar</h1>
                        <p className="text-sm text-[#6B7280] dark:text-muted-foreground mt-0.5">Schedule and track maintenance activities</p>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#714B67] hover:bg-[#5d3d56] text-white">
                                <Plus className="h-4 w-4 mr-2" />
                                Schedule Maintenance
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white dark:bg-card">
                            <DialogHeader>
                                <DialogTitle className="text-[#111827] dark:text-foreground">Schedule Maintenance</DialogTitle>
                                <DialogDescription className="text-[#6B7280] dark:text-muted-foreground">
                                    Schedule a new maintenance activity.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label className="text-[#374151] dark:text-foreground">Title</Label>
                                    <Input className="border-[#E5E7EB] dark:border-border" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[#374151] dark:text-foreground">Date</Label>
                                    <Input type="date" className="border-[#E5E7EB] dark:border-border" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[#374151] dark:text-foreground">Priority</Label>
                                    <Select>
                                        <SelectTrigger className="border-[#E5E7EB] dark:border-border">
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button className="bg-[#714B67] hover:bg-[#5d3d56] text-white">
                                    Schedule
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="bg-white dark:bg-card rounded-lg border border-[#E5E7EB] dark:border-border p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-[#714B67]/10 rounded-lg">
                                <Calendar className="h-5 w-5 text-[#714B67]" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[#111827] dark:text-foreground">{todayEvents.length}</p>
                                <p className="text-sm text-[#6B7280] dark:text-muted-foreground">Scheduled Today</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-card rounded-lg border border-[#E5E7EB] dark:border-border p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-[#3B82F6]/10 rounded-lg">
                                <Clock className="h-5 w-5 text-[#3B82F6]" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[#111827] dark:text-foreground">{upcomingEvents.length}</p>
                                <p className="text-sm text-[#6B7280] dark:text-muted-foreground">Upcoming</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-card rounded-lg border border-[#E5E7EB] dark:border-border p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-[#10B981]/10 rounded-lg">
                                <Wrench className="h-5 w-5 text-[#10B981]" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[#111827] dark:text-foreground">{scheduledItems.length}</p>
                                <p className="text-sm text-[#6B7280] dark:text-muted-foreground">Total Scheduled</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Calendar */}
                    <div className="lg:col-span-2 bg-white dark:bg-card rounded-lg border border-[#E5E7EB] dark:border-border">
                        {/* Calendar Header */}
                        <div className="px-5 py-4 border-b border-[#E5E7EB] dark:border-border flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <h2 className="text-base font-semibold text-[#111827] dark:text-foreground">
                                    {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                                </h2>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={goToToday}
                                    className="text-xs"
                                >
                                    Today
                                </Button>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8">
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8">
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="p-4">
                            {/* Days Header */}
                            <div className="grid grid-cols-7 mb-2">
                                {DAYS.map(day => (
                                    <div key={day} className="text-center text-xs font-medium text-[#6B7280] dark:text-muted-foreground py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Days */}
                            <div className="grid grid-cols-7 gap-1">
                                {/* Empty cells for days before the first of the month */}
                                {Array.from({ length: startingDay }).map((_, index) => (
                                    <div key={`empty-${index}`} className="aspect-square p-1"></div>
                                ))}

                                {/* Days of the month */}
                                {Array.from({ length: daysInMonth }).map((_, index) => {
                                    const day = index + 1
                                    const events = getEventsForDate(day)
                                    const isCurrentDay = isToday(day)

                                    return (
                                        <div
                                            key={day}
                                            className={`aspect-square p-1 rounded-lg cursor-pointer transition-colors hover:bg-[#F3F4F6] dark:hover:bg-muted/50 ${
                                                isCurrentDay ? 'bg-[#714B67]/10 ring-2 ring-[#714B67]' : ''
                                            }`}
                                            onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                                        >
                                            <div className="h-full flex flex-col">
                                                <span className={`text-sm font-medium ${
                                                    isCurrentDay ? 'text-[#714B67]' : 'text-[#111827] dark:text-foreground'
                                                }`}>
                                                    {day}
                                                </span>
                                                <div className="flex-1 flex flex-col gap-0.5 mt-1 overflow-hidden">
                                                    {events.slice(0, 2).map((event, idx) => (
                                                        <div
                                                            key={event.id}
                                                            className={`${getPriorityColor(event.priority)} text-white text-[10px] px-1 py-0.5 rounded truncate`}
                                                        >
                                                            {event.title}
                                                        </div>
                                                    ))}
                                                    {events.length > 2 && (
                                                        <span className="text-[10px] text-[#6B7280] dark:text-muted-foreground">
                                                            +{events.length - 2} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Events Sidebar */}
                    <div className="bg-white dark:bg-card rounded-lg border border-[#E5E7EB] dark:border-border">
                        <div className="px-5 py-4 border-b border-[#E5E7EB] dark:border-border">
                            <h2 className="text-base font-semibold text-[#111827] dark:text-foreground">Upcoming Maintenance</h2>
                            <p className="text-sm text-[#6B7280] dark:text-muted-foreground mt-0.5">Next scheduled activities</p>
                        </div>
                        <div className="p-4 space-y-3">
                            {upcomingEvents.length > 0 ? (
                                upcomingEvents.map(event => (
                                    <div
                                        key={event.id}
                                        className="p-3 rounded-lg border border-[#E5E7EB] dark:border-border hover:bg-[#F9FAFB] dark:hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-2 h-2 rounded-full mt-2 ${getPriorityColor(event.priority)}`}></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm text-[#111827] dark:text-foreground truncate">
                                                    {event.title}
                                                </p>
                                                <p className="text-xs text-[#6B7280] dark:text-muted-foreground mt-1">
                                                    {new Date(event.scheduled_date).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                                {event.equipment_name && (
                                                    <div className="flex items-center gap-1 mt-2">
                                                        <Wrench className="h-3 w-3 text-[#9CA3AF]" />
                                                        <span className="text-xs text-[#6B7280] dark:text-muted-foreground">
                                                            {event.equipment_name}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <Calendar className="h-10 w-10 text-[#E5E7EB] dark:text-muted mx-auto mb-3" />
                                    <p className="text-sm text-[#6B7280] dark:text-muted-foreground">No upcoming maintenance</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
