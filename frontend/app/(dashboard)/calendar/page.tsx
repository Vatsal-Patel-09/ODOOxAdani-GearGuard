"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { requestsApi, equipmentApi, MaintenanceRequest, Equipment } from "@/lib/api"

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [requests, setRequests] = useState<MaintenanceRequest[]>([])
    const [equipment, setEquipment] = useState<Equipment[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [formData, setFormData] = useState({
        subject: "",
        description: "",
        equipment_id: "",
    })

    const fetchData = async () => {
        try {
            const year = currentDate.getFullYear()
            const month = currentDate.getMonth()
            const startDate = new Date(year, month, 1).toISOString().split('T')[0]
            const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]

            const [requestsData, equipmentData] = await Promise.all([
                requestsApi.getCalendar(startDate, endDate),
                equipmentApi.list(),
            ])
            setRequests(requestsData)
            setEquipment(equipmentData)
        } catch (error) {
            console.error("Failed to fetch data:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [currentDate])

    const handleCreateRequest = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedDate) return

        try {
            await requestsApi.create({
                subject: formData.subject,
                description: formData.description || undefined,
                request_type: "preventive",
                equipment_id: formData.equipment_id || undefined,
                scheduled_date: selectedDate.toISOString().split('T')[0],
            })
            setIsDialogOpen(false)
            setFormData({ subject: "", description: "", equipment_id: "" })
            setSelectedDate(null)
            fetchData()
        } catch (error) {
            console.error("Failed to create request:", error)
        }
    }

    const handleDateClick = (date: Date) => {
        setSelectedDate(date)
        setIsDialogOpen(true)
    }

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDay = firstDay.getDay()

        const days: (Date | null)[] = []

        // Add empty slots for days before the first day of month
        for (let i = 0; i < startingDay; i++) {
            days.push(null)
        }

        // Add all days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i))
        }

        return days
    }

    const getRequestsForDate = (date: Date) => {
        return requests.filter(r => {
            if (!r.scheduled_date) return false
            const reqDate = new Date(r.scheduled_date)
            return reqDate.toDateString() === date.toDateString()
        })
    }

    const isToday = (date: Date) => {
        return date.toDateString() === new Date().toDateString()
    }

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    if (loading) {
        return <div className="flex items-center justify-center h-64">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Calendar</h1>
                <p className="text-muted-foreground">View and schedule preventive maintenance</p>
            </div>

            <div className="rounded-lg border bg-card">
                <div className="flex items-center justify-between p-4 border-b">
                    <Button variant="ghost" size="icon" onClick={prevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-lg font-semibold">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-7">
                    {dayNames.map((day) => (
                        <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground border-b">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7">
                    {getDaysInMonth(currentDate).map((date, index) => (
                        <div
                            key={index}
                            className={`min-h-[100px] p-2 border-b border-r ${date ? "cursor-pointer hover:bg-muted/50" : "bg-muted/20"
                                }`}
                            onClick={() => date && handleDateClick(date)}
                        >
                            {date && (
                                <>
                                    <div className={`text-sm font-medium mb-1 ${isToday(date) ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center" : ""
                                        }`}>
                                        {date.getDate()}
                                    </div>
                                    <div className="space-y-1">
                                        {getRequestsForDate(date).slice(0, 2).map((request) => (
                                            <div
                                                key={request.id}
                                                className="text-xs p-1 rounded bg-primary/10 text-primary truncate"
                                                title={request.subject}
                                            >
                                                {request.subject}
                                            </div>
                                        ))}
                                        {getRequestsForDate(date).length > 2 && (
                                            <div className="text-xs text-muted-foreground">
                                                +{getRequestsForDate(date).length - 2} more
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Schedule Preventive Maintenance</DialogTitle>
                        <DialogDescription>
                            Create a scheduled maintenance for {selectedDate?.toLocaleDateString()}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateRequest} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject *</Label>
                            <Input
                                id="subject"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                placeholder="e.g., Monthly Inspection"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Equipment</Label>
                            <Select
                                value={formData.equipment_id}
                                onValueChange={(value) => setFormData({ ...formData, equipment_id: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select equipment" />
                                </SelectTrigger>
                                <SelectContent>
                                    {equipment.filter(e => !e.is_scrapped).map((eq) => (
                                        <SelectItem key={eq.id} value={eq.id}>
                                            {eq.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Schedule</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
