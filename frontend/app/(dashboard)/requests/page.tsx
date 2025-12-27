"use client"

import { useEffect, useState } from "react"
import { Plus, GripVertical, Clock, Play, CheckCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { getRequests, createRequest, updateRequestStatus, updateRequest, getEquipments, getUsers, MaintenanceRequest, Equipment, User } from "@/lib/api"

const STATUS_COLUMNS = [
    { id: "new", label: "New", color: "bg-blue-500" },
    { id: "in_progress", label: "In Progress", color: "bg-yellow-500" },
    { id: "repaired", label: "Repaired", color: "bg-green-500" },
    { id: "scrap", label: "Scrap", color: "bg-red-500" },
]

export default function RequestsPage() {
    const [requests, setRequests] = useState<MaintenanceRequest[]>([])
    const [equipment, setEquipment] = useState<Equipment[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false)
    const [completingRequest, setCompletingRequest] = useState<MaintenanceRequest | null>(null)
    const [durationHours, setDurationHours] = useState("")
    const [draggedRequest, setDraggedRequest] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        subject: "",
        description: "",
        request_type: "corrective",
        equipment_id: "",
        assigned_to: "",
    })

    const fetchData = async () => {
        try {
            const [requestsData, equipmentData, usersData] = await Promise.all([
                getRequests(),
                getEquipments(),
                getUsers(),
            ])
            setRequests(requestsData)
            setEquipment(equipmentData)
            setUsers(usersData)
        } catch (error) {
            console.error("Failed to fetch data:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleCreateRequest = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await createRequest({
                subject: formData.subject,
                description: formData.description || undefined,
                request_type: formData.request_type,
                equipment_id: formData.equipment_id || undefined,
            })
            // If assigned_to is set, update the request
            setIsDialogOpen(false)
            setFormData({ subject: "", description: "", request_type: "corrective", equipment_id: "", assigned_to: "" })
            fetchData()
        } catch (error) {
            console.error("Failed to create request:", error)
        }
    }

    const handleDragStart = (requestId: string) => {
        setDraggedRequest(requestId)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleDrop = async (status: string) => {
        if (!draggedRequest) return

        const request = requests.find(r => r.id === draggedRequest)

        // If moving to "repaired", show duration dialog
        if (status === "repaired" && request) {
            setCompletingRequest(request)
            setIsCompleteDialogOpen(true)
            setDraggedRequest(null)
            return
        }

        try {
            await updateRequestStatus(draggedRequest, status)
            fetchData()
        } catch (error) {
            console.error("Failed to update status:", error)
        }
        setDraggedRequest(null)
    }

    const handleStartWork = async (requestId: string) => {
        try {
            // Set started_at and move to in_progress
            await updateRequest(requestId, {
                status: "in_progress",
                started_at: new Date().toISOString(),
            })
            fetchData()
        } catch (error) {
            console.error("Failed to start work:", error)
        }
    }

    const handleCompleteWork = async () => {
        if (!completingRequest) return

        try {
            await updateRequest(completingRequest.id, {
                status: "repaired",
                completed_at: new Date().toISOString(),
                duration_hours: durationHours ? parseFloat(durationHours) : undefined,
            })
            setIsCompleteDialogOpen(false)
            setCompletingRequest(null)
            setDurationHours("")
            fetchData()
        } catch (error) {
            console.error("Failed to complete work:", error)
        }
    }

    const handleAssignTechnician = async (requestId: string, userId: string) => {
        try {
            await updateRequest(requestId, { assigned_to: userId })
            fetchData()
        } catch (error) {
            console.error("Failed to assign technician:", error)
        }
    }

    const getRequestsByStatus = (status: string) => {
        return requests.filter(r => r.status === status)
    }

    const getEquipmentName = (equipmentId: string | null) => {
        if (!equipmentId) return null
        const eq = equipment.find(e => e.id === equipmentId)
        return eq?.name
    }

    const getUser = (userId: string | null) => {
        if (!userId) return null
        return users.find(u => u.id === userId)
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    const isOverdue = (request: MaintenanceRequest) => {
        if (!request.scheduled_date) return false
        if (request.status === "repaired" || request.status === "scrap") return false
        return new Date(request.scheduled_date) < new Date()
    }

    // Get technicians (users with role technician or any user for now)
    const technicians = users.filter(u => u.role === "technician" || u.role === "user")

    if (loading) {
        return <div className="flex items-center justify-center h-64">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Maintenance Requests</h1>
                    <p className="text-muted-foreground">Manage and track maintenance requests</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Request
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Maintenance Request</DialogTitle>
                            <DialogDescription>Submit a new maintenance request.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateRequest} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject *</Label>
                                <Input
                                    id="subject"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    placeholder="e.g., Leaking Oil"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the issue..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Request Type *</Label>
                                <Select
                                    value={formData.request_type}
                                    onValueChange={(value) => setFormData({ ...formData, request_type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="corrective">Corrective (Breakdown)</SelectItem>
                                        <SelectItem value="preventive">Preventive (Routine)</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                                {eq.name} ({eq.serial_number})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Assign Technician</Label>
                                <Select
                                    value={formData.assigned_to}
                                    onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select technician" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {technicians.map((user) => (
                                            <SelectItem key={user.id} value={user.id}>
                                                {user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Create Request</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {STATUS_COLUMNS.map((column) => (
                    <div
                        key={column.id}
                        className="rounded-lg border bg-card"
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(column.id)}
                    >
                        <div className="p-4 border-b">
                            <div className="flex items-center gap-2">
                                <div className={`h-3 w-3 rounded-full ${column.color}`} />
                                <h3 className="font-semibold">{column.label}</h3>
                                <Badge variant="secondary" className="ml-auto">
                                    {getRequestsByStatus(column.id).length}
                                </Badge>
                            </div>
                        </div>
                        <div className="p-2 space-y-2 min-h-[200px]">
                            {getRequestsByStatus(column.id).map((request) => {
                                const assignedUser = getUser(request.assigned_to)
                                const overdue = isOverdue(request)

                                return (
                                    <Card
                                        key={request.id}
                                        draggable
                                        onDragStart={() => handleDragStart(request.id)}
                                        className={`cursor-grab active:cursor-grabbing transition-all ${overdue ? "border-red-500 border-2 bg-red-50 dark:bg-red-950/20" : ""
                                            }`}
                                    >
                                        <CardHeader className="p-3 pb-2">
                                            <div className="flex items-start gap-2">
                                                <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <CardTitle className="text-sm font-medium truncate">{request.subject}</CardTitle>
                                                    {getEquipmentName(request.equipment_id) && (
                                                        <CardDescription className="text-xs truncate">
                                                            {getEquipmentName(request.equipment_id)}
                                                        </CardDescription>
                                                    )}
                                                </div>
                                                {/* Assigned Technician Avatar */}
                                                {assignedUser ? (
                                                    <Avatar className="h-6 w-6 flex-shrink-0">
                                                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                                            {getInitials(assignedUser.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                ) : (
                                                    <Select onValueChange={(value) => handleAssignTechnician(request.id, value)}>
                                                        <SelectTrigger className="h-6 w-6 p-0 border-dashed">
                                                            <span className="text-xs">+</span>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {technicians.map((user) => (
                                                                <SelectItem key={user.id} value={user.id}>
                                                                    {user.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-3 pt-0 space-y-2">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                                                <Badge variant={request.request_type === "corrective" ? "destructive" : "secondary"} className="text-xs">
                                                    {request.request_type}
                                                </Badge>
                                                {request.scheduled_date && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(request.scheduled_date).toLocaleDateString()}
                                                    </span>
                                                )}
                                                {request.duration_hours && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {request.duration_hours}h
                                                    </span>
                                                )}
                                            </div>

                                            {/* Overdue indicator */}
                                            {overdue && (
                                                <div className="flex items-center gap-1 text-xs text-red-600 font-medium">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    Overdue
                                                </div>
                                            )}

                                            {/* Action buttons */}
                                            {request.status === "new" && assignedUser && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full h-7 text-xs"
                                                    onClick={() => handleStartWork(request.id)}
                                                >
                                                    <Play className="h-3 w-3 mr-1" />
                                                    Start Work
                                                </Button>
                                            )}
                                            {request.status === "in_progress" && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full h-7 text-xs"
                                                    onClick={() => {
                                                        setCompletingRequest(request)
                                                        setIsCompleteDialogOpen(true)
                                                    }}
                                                >
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Mark Complete
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Complete Work Dialog */}
            <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Complete Maintenance</DialogTitle>
                        <DialogDescription>
                            Record the time spent on this repair: {completingRequest?.subject}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration (hours)</Label>
                            <Input
                                id="duration"
                                type="number"
                                step="0.5"
                                min="0"
                                value={durationHours}
                                onChange={(e) => setDurationHours(e.target.value)}
                                placeholder="e.g., 2.5"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCompleteWork}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Complete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
