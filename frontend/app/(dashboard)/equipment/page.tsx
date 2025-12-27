"use client"

import { useEffect, useState } from "react"
import { Plus, Wrench, Search, Filter, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
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
import { getEquipment, createEquipment, deleteEquipment, Equipment } from "@/lib/api"

export default function EquipmentPage() {
    const [equipment, setEquipment] = useState<Equipment[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [newEquipment, setNewEquipment] = useState({
        name: "",
        category: "",
        status: "operational",
        location: "",
        serial_number: "",
    })

    useEffect(() => {
        fetchEquipment()
    }, [])

    const fetchEquipment = async () => {
        try {
            const data = await getEquipment()
            setEquipment(data)
        } catch (error) {
            console.error("Failed to fetch equipment:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddEquipment = async () => {
        try {
            await createEquipment(newEquipment)
            fetchEquipment()
            setIsAddDialogOpen(false)
            setNewEquipment({
                name: "",
                category: "",
                status: "operational",
                location: "",
                serial_number: "",
            })
        } catch (error) {
            console.error("Failed to add equipment:", error)
        }
    }

    const handleDeleteEquipment = async (id: string) => {
        try {
            await deleteEquipment(id)
            fetchEquipment()
        } catch (error) {
            console.error("Failed to delete equipment:", error)
        }
    }

    const filteredEquipment = equipment.filter(
        (item) =>
            item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.location?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "operational":
                return "bg-[#10B981] text-white"
            case "maintenance":
                return "bg-[#F59E0B] text-white"
            case "out_of_service":
                return "bg-[#EF4444] text-white"
            default:
                return "bg-[#6B7280] text-white"
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-3.5rem)] bg-[#F9FAFB] dark:bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-[#714B67] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-[#6B7280] dark:text-muted-foreground">Loading equipment...</p>
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
                        <h1 className="text-xl font-semibold text-[#111827] dark:text-foreground">Equipment</h1>
                        <p className="text-sm text-[#6B7280] dark:text-muted-foreground mt-0.5">Manage your equipment inventory</p>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#714B67] hover:bg-[#5d3d56] text-white">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Equipment
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white dark:bg-card">
                            <DialogHeader>
                                <DialogTitle className="text-[#111827] dark:text-foreground">Add New Equipment</DialogTitle>
                                <DialogDescription className="text-[#6B7280] dark:text-muted-foreground">
                                    Fill in the details to add new equipment to your inventory.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-[#374151] dark:text-foreground">Name</Label>
                                    <Input
                                        id="name"
                                        value={newEquipment.name}
                                        onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                                        className="border-[#E5E7EB] dark:border-border"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-[#374151] dark:text-foreground">Category</Label>
                                    <Input
                                        id="category"
                                        value={newEquipment.category}
                                        onChange={(e) => setNewEquipment({ ...newEquipment, category: e.target.value })}
                                        className="border-[#E5E7EB] dark:border-border"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status" className="text-[#374151] dark:text-foreground">Status</Label>
                                    <Select
                                        value={newEquipment.status}
                                        onValueChange={(value) => setNewEquipment({ ...newEquipment, status: value })}
                                    >
                                        <SelectTrigger className="border-[#E5E7EB] dark:border-border">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="operational">Operational</SelectItem>
                                            <SelectItem value="maintenance">Maintenance</SelectItem>
                                            <SelectItem value="out_of_service">Out of Service</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location" className="text-[#374151] dark:text-foreground">Location</Label>
                                    <Input
                                        id="location"
                                        value={newEquipment.location}
                                        onChange={(e) => setNewEquipment({ ...newEquipment, location: e.target.value })}
                                        className="border-[#E5E7EB] dark:border-border"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="serial_number" className="text-[#374151] dark:text-foreground">Serial Number</Label>
                                    <Input
                                        id="serial_number"
                                        value={newEquipment.serial_number}
                                        onChange={(e) => setNewEquipment({ ...newEquipment, serial_number: e.target.value })}
                                        className="border-[#E5E7EB] dark:border-border"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleAddEquipment} className="bg-[#714B67] hover:bg-[#5d3d56] text-white">
                                    Add Equipment
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search and Filter */}
                <div className="bg-white dark:bg-card rounded-lg border border-[#E5E7EB] dark:border-border p-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] dark:text-muted-foreground" />
                            <Input
                                placeholder="Search equipment..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 border-[#E5E7EB] dark:border-border"
                            />
                        </div>
                        <Button variant="outline" className="border-[#E5E7EB] dark:border-border">
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                        </Button>
                    </div>
                </div>

                {/* Equipment Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="bg-white dark:bg-card rounded-lg border border-[#E5E7EB] dark:border-border p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-[#10B981]/10 rounded-lg">
                                <Wrench className="h-5 w-5 text-[#10B981]" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[#111827] dark:text-foreground">
                                    {equipment.filter(e => e.status === "operational").length}
                                </p>
                                <p className="text-sm text-[#6B7280] dark:text-muted-foreground">Operational</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-card rounded-lg border border-[#E5E7EB] dark:border-border p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-[#F59E0B]/10 rounded-lg">
                                <Wrench className="h-5 w-5 text-[#F59E0B]" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[#111827] dark:text-foreground">
                                    {equipment.filter(e => e.status === "maintenance").length}
                                </p>
                                <p className="text-sm text-[#6B7280] dark:text-muted-foreground">In Maintenance</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-card rounded-lg border border-[#E5E7EB] dark:border-border p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-[#EF4444]/10 rounded-lg">
                                <Wrench className="h-5 w-5 text-[#EF4444]" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[#111827] dark:text-foreground">
                                    {equipment.filter(e => e.status === "out_of_service").length}
                                </p>
                                <p className="text-sm text-[#6B7280] dark:text-muted-foreground">Out of Service</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Equipment Table */}
                <div className="bg-white dark:bg-card rounded-lg border border-[#E5E7EB] dark:border-border">
                    <div className="px-5 py-4 border-b border-[#E5E7EB] dark:border-border">
                        <h2 className="text-base font-semibold text-[#111827] dark:text-foreground">Equipment List</h2>
                        <p className="text-sm text-[#6B7280] dark:text-muted-foreground mt-0.5">
                            {filteredEquipment.length} items found
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#E5E7EB] dark:border-border bg-[#F9FAFB] dark:bg-muted/50">
                                    <th className="text-left py-3 px-5 text-xs font-medium text-[#6B7280] dark:text-muted-foreground uppercase tracking-wider">Name</th>
                                    <th className="text-left py-3 px-5 text-xs font-medium text-[#6B7280] dark:text-muted-foreground uppercase tracking-wider">Category</th>
                                    <th className="text-left py-3 px-5 text-xs font-medium text-[#6B7280] dark:text-muted-foreground uppercase tracking-wider">Status</th>
                                    <th className="text-left py-3 px-5 text-xs font-medium text-[#6B7280] dark:text-muted-foreground uppercase tracking-wider">Location</th>
                                    <th className="text-left py-3 px-5 text-xs font-medium text-[#6B7280] dark:text-muted-foreground uppercase tracking-wider">Serial Number</th>
                                    <th className="text-right py-3 px-5 text-xs font-medium text-[#6B7280] dark:text-muted-foreground uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEquipment.map((item) => (
                                    <tr key={item.id} className="border-b border-[#E5E7EB] dark:border-border hover:bg-[#F9FAFB] dark:hover:bg-muted/50 transition-colors">
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-[#714B67]/10 rounded-lg">
                                                    <Wrench className="h-4 w-4 text-[#714B67]" />
                                                </div>
                                                <span className="font-medium text-[#111827] dark:text-foreground">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-5 text-[#6B7280] dark:text-muted-foreground">{item.category}</td>
                                        <td className="py-4 px-5">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status ?? "")}`}>
                                                {item.status?.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="py-4 px-5 text-[#6B7280] dark:text-muted-foreground">{item.location}</td>
                                        <td className="py-4 px-5 text-[#6B7280] dark:text-muted-foreground font-mono text-sm">{item.serial_number}</td>
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
                                                        onClick={() => handleDeleteEquipment(item.id)}
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
                        {filteredEquipment.length === 0 && (
                            <div className="text-center py-12">
                                <Wrench className="h-12 w-12 text-[#E5E7EB] dark:text-muted mx-auto mb-4" />
                                <p className="text-[#6B7280] dark:text-muted-foreground">No equipment found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
