"use client"

import { useEffect, useState } from "react"
import { Plus, GripVertical, Clock, User } from "lucide-react"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { getRequests, createRequest, updateRequestStatus, getEquipments, MaintenanceRequest, Equipment } from "@/lib/api"

const STATUS_COLUMNS = [
    { id: "new", label: "New", color: "bg-blue-500" },
    { id: "in_progress", label: "In Progress", color: "bg-yellow-500" },
    { id: "repaired", label: "Repaired", color: "bg-green-500" },
    { id: "scrap", label: "Scrap", color: "bg-red-500" },
]

export default function RequestsPage() {
    const [requests, setRequests] = useState<MaintenanceRequest[]>([])
    const [equipment, setEquipment] = useState<Equipment[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [draggedRequest, setDraggedRequest] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        subject: "",
        description: "",
        request_type: "corrective",
        equipment_id: "",
    })

    const fetchData = async () => {
        try {
            const [requestsData, equipmentData] = await Promise.all([
                getRequests(),
                getEquipments(),
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
            setIsDialogOpen(false)
            setFormData({ subject: "", description: "", request_type: "corrective", equipment_id: "" })
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

        try {
            await updateRequestStatus(draggedRequest, status)
            fetchData()
        } catch (error) {
            console.error("Failed to update status:", error)
        }
        setDraggedRequest(null)
    }

    const getRequestsByStatus = (status: string) => {
        return requests.filter(r => r.status === status)
    }

    const getEquipmentName = (equipmentId: string | null) => {
        if (!equipmentId) return null
        const eq = equipment.find(e => e.id === equipmentId)
        return eq?.name
    }

    const isOverdue = (request: MaintenanceRequest) => {
        if (!request.scheduled_date) return false
        return new Date(request.scheduled_date) < new Date()
    }

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
                            {getRequestsByStatus(column.id).map((request) => (
                                <Card
                                    key={request.id}
                                    draggable
                                    onDragStart={() => handleDragStart(request.id)}
                                    className={`cursor-grab active:cursor-grabbing ${isOverdue(request) ? "border-red-500 border-2" : ""
                                        }`}
                                >
                                    <CardHeader className="p-3 pb-2">
                                        <div className="flex items-start gap-2">
                                            <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div className="flex-1">
                                                <CardTitle className="text-sm font-medium">{request.subject}</CardTitle>
                                                {getEquipmentName(request.equipment_id) && (
                                                    <CardDescription className="text-xs">
                                                        {getEquipmentName(request.equipment_id)}
                                                    </CardDescription>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-3 pt-0">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Badge variant={request.request_type === "corrective" ? "destructive" : "secondary"} className="text-xs">
                                                {request.request_type}
                                            </Badge>
                                            {request.scheduled_date && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(request.scheduled_date).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                        {isOverdue(request) && (
                                            <p className="text-xs text-red-500 mt-1 font-medium">Overdue</p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
