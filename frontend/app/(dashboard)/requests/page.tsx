"use client"

import { useEffect, useState } from "react"
import { Plus, ClipboardList, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, Clock, CheckCircle2, AlertCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface MaintenanceRequest {
    id: string
    title: string
    description: string
    status: string
    priority: string
    equipment_id: string
    equipment_name: string
    team_id: string
    team_name: string
    created_at: string
    scheduled_date: string | null
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function RequestsPage() {
    const [requests, setRequests] = useState<MaintenanceRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [newRequest, setNewRequest] = useState({
        title: "",
        description: "",
        priority: "medium",
        equipment_id: "",
    })

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/requests`)
            if (response.ok) {
                const data = await response.json()
                setRequests(data)
            }
        } catch (error) {
            console.error("Failed to fetch requests:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddRequest = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/requests`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newRequest),
            })
            if (response.ok) {
                fetchRequests()
                setIsAddDialogOpen(false)
                setNewRequest({
                    title: "",
                    description: "",
                    priority: "medium",
                    equipment_id: "",
                })
            }
        } catch (error) {
            console.error("Failed to add request:", error)
        }
    }

    const handleDeleteRequest = async (id: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/requests/${id}`, {
                method: "DELETE",
            })
            if (response.ok) {
                fetchRequests()
            }
        } catch (error) {
            console.error("Failed to delete request:", error)
        }
    }

    const filteredRequests = requests.filter((request) => {
        const matchesSearch =
            request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === "all" || request.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "new":
                return <AlertCircle className="h-4 w-4" />
            case "in_progress":
                return <Clock className="h-4 w-4" />
            case "repaired":
                return <CheckCircle2 className="h-4 w-4" />
            case "scrap":
                return <XCircle className="h-4 w-4" />
            default:
                return <ClipboardList className="h-4 w-4" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "new":
                return "bg-[#3B82F6] text-white"
            case "in_progress":
                return "bg-[#F59E0B] text-white"
            case "repaired":
                return "bg-[#10B981] text-white"
            case "scrap":
                return "bg-[#EF4444] text-white"
            default:
                return "bg-[#6B7280] text-white"
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case "high":
                return "text-[#EF4444] bg-[#EF4444]/10"
            case "medium":
                return "text-[#F59E0B] bg-[#F59E0B]/10"
            case "low":
                return "text-[#10B981] bg-[#10B981]/10"
            default:
                return "text-[#6B7280] bg-[#6B7280]/10"
        }
    }

    const requestsByStatus = {
        new: requests.filter((r) => r.status === "new").length,
        in_progress: requests.filter((r) => r.status === "in_progress").length,
        repaired: requests.filter((r) => r.status === "repaired").length,
        scrap: requests.filter((r) => r.status === "scrap").length,
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-3.5rem)] bg-[#F9FAFB] dark:bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-[#714B67] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-[#6B7280] dark:text-muted-foreground">Loading requests...</p>
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
                        <h1 className="text-xl font-semibold text-[#111827] dark:text-foreground">Maintenance Requests</h1>
                        <p className="text-sm text-[#6B7280] dark:text-muted-foreground mt-0.5">Track and manage maintenance requests</p>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#714B67] hover:bg-[#5d3d56] text-white">
                                <Plus className="h-4 w-4 mr-2" />
                                New Request
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white dark:bg-card">
                            <DialogHeader>
                                <DialogTitle className="text-[#111827] dark:text-foreground">Create Maintenance Request</DialogTitle>
                                <DialogDescription className="text-[#6B7280] dark:text-muted-foreground">
                                    Submit a new maintenance request for equipment.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-[#374151] dark:text-foreground">Title</Label>
                                    <Input
                                        id="title"
                                        value={newRequest.title}
                                        onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                                        className="border-[#E5E7EB] dark:border-border"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-[#374151] dark:text-foreground">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={newRequest.description}
                                        onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                                        className="border-[#E5E7EB] dark:border-border"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="priority" className="text-[#374151] dark:text-foreground">Priority</Label>
                                    <Select
                                        value={newRequest.priority}
                                        onValueChange={(value) => setNewRequest({ ...newRequest, priority: value })}
                                    >
                                        <SelectTrigger className="border-[#E5E7EB] dark:border-border">
                                            <SelectValue />
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
                                <Button onClick={handleAddRequest} className="bg-[#714B67] hover:bg-[#5d3d56] text-white">
                                    Submit Request
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Status Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="bg-[#EFF6FF] dark:bg-[#3B82F6]/10 border border-[#BFDBFE] dark:border-[#3B82F6]/30 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-[#3B82F6] rounded-lg flex items-center justify-center">
                                <span className="text-lg font-bold text-white">{requestsByStatus.new}</span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[#111827] dark:text-foreground">New</p>
                                <p className="text-xs text-[#6B7280] dark:text-muted-foreground">Pending review</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#FFFBEB] dark:bg-[#F59E0B]/10 border border-[#FDE68A] dark:border-[#F59E0B]/30 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-[#F59E0B] rounded-lg flex items-center justify-center">
                                <span className="text-lg font-bold text-white">{requestsByStatus.in_progress}</span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[#111827] dark:text-foreground">In Progress</p>
                                <p className="text-xs text-[#6B7280] dark:text-muted-foreground">Being worked on</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#ECFDF5] dark:bg-[#10B981]/10 border border-[#A7F3D0] dark:border-[#10B981]/30 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-[#10B981] rounded-lg flex items-center justify-center">
                                <span className="text-lg font-bold text-white">{requestsByStatus.repaired}</span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[#111827] dark:text-foreground">Repaired</p>
                                <p className="text-xs text-[#6B7280] dark:text-muted-foreground">Completed</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#FEF2F2] dark:bg-[#EF4444]/10 border border-[#FECACA] dark:border-[#EF4444]/30 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-[#EF4444] rounded-lg flex items-center justify-center">
                                <span className="text-lg font-bold text-white">{requestsByStatus.scrap}</span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[#111827] dark:text-foreground">Scrapped</p>
                                <p className="text-xs text-[#6B7280] dark:text-muted-foreground">Disposed</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white dark:bg-card rounded-lg border border-[#E5E7EB] dark:border-border p-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] dark:text-muted-foreground" />
                            <Input
                                placeholder="Search requests..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 border-[#E5E7EB] dark:border-border"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px] border-[#E5E7EB] dark:border-border">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="repaired">Repaired</SelectItem>
                                <SelectItem value="scrap">Scrapped</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Requests Table */}
                <div className="bg-white dark:bg-card rounded-lg border border-[#E5E7EB] dark:border-border">
                    <div className="px-5 py-4 border-b border-[#E5E7EB] dark:border-border">
                        <h2 className="text-base font-semibold text-[#111827] dark:text-foreground">All Requests</h2>
                        <p className="text-sm text-[#6B7280] dark:text-muted-foreground mt-0.5">
                            {filteredRequests.length} requests found
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#E5E7EB] dark:border-border bg-[#F9FAFB] dark:bg-muted/50">
                                    <th className="text-left py-3 px-5 text-xs font-medium text-[#6B7280] dark:text-muted-foreground uppercase tracking-wider">Request</th>
                                    <th className="text-left py-3 px-5 text-xs font-medium text-[#6B7280] dark:text-muted-foreground uppercase tracking-wider">Status</th>
                                    <th className="text-left py-3 px-5 text-xs font-medium text-[#6B7280] dark:text-muted-foreground uppercase tracking-wider">Priority</th>
                                    <th className="text-left py-3 px-5 text-xs font-medium text-[#6B7280] dark:text-muted-foreground uppercase tracking-wider">Equipment</th>
                                    <th className="text-left py-3 px-5 text-xs font-medium text-[#6B7280] dark:text-muted-foreground uppercase tracking-wider">Date</th>
                                    <th className="text-right py-3 px-5 text-xs font-medium text-[#6B7280] dark:text-muted-foreground uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequests.map((request) => (
                                    <tr key={request.id} className="border-b border-[#E5E7EB] dark:border-border hover:bg-[#F9FAFB] dark:hover:bg-muted/50 transition-colors">
                                        <td className="py-4 px-5">
                                            <div>
                                                <p className="font-medium text-[#111827] dark:text-foreground">{request.title}</p>
                                                <p className="text-sm text-[#6B7280] dark:text-muted-foreground line-clamp-1">{request.description}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-5">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                                {getStatusIcon(request.status)}
                                                {request.status.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="py-4 px-5">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                                                {request.priority}
                                            </span>
                                        </td>
                                        <td className="py-4 px-5 text-[#6B7280] dark:text-muted-foreground">
                                            {request.equipment_name || "N/A"}
                                        </td>
                                        <td className="py-4 px-5 text-[#6B7280] dark:text-muted-foreground text-sm">
                                            {new Date(request.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-5 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-[#EF4444]"
                                                        onClick={() => handleDeleteRequest(request.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredRequests.length === 0 && (
                            <div className="text-center py-12">
                                <ClipboardList className="h-12 w-12 text-[#E5E7EB] dark:text-muted mx-auto mb-4" />
                                <p className="text-[#6B7280] dark:text-muted-foreground">No requests found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
