"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Wrench, Trash2, Edit, Search, Eye, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
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
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { equipmentApi, teamsApi, usersApi, Equipment, MaintenanceTeam, User } from "@/lib/api"

const CATEGORIES = ["Machine", "Vehicle", "Computer", "Tool", "Other"]

export default function EquipmentPage() {
    const [equipment, setEquipment] = useState<Equipment[]>([])
    const [teams, setTeams] = useState<MaintenanceTeam[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [departmentFilter, setDepartmentFilter] = useState<string>("all")
    const [categoryFilter, setCategoryFilter] = useState<string>("all")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        serial_number: "",
        category: "",
        department: "",
        location: "",
        maintenance_team_id: "",
        assigned_employee_id: "",
    })

    const fetchData = async () => {
        try {
            const [equipmentData, teamsData, usersData] = await Promise.all([
                equipmentApi.list(),
                teamsApi.list(),
                usersApi.list(),
            ])
            setEquipment(equipmentData)
            setTeams(teamsData)
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await equipmentApi.create({
                name: formData.name,
                serial_number: formData.serial_number,
                category: formData.category,
                department: formData.department || null,
                location: formData.location || null,
                maintenance_team_id: formData.maintenance_team_id || null,
                assigned_employee_id: formData.assigned_employee_id || null,
                purchase_date: null,
                warranty_expiry: null,
            } as any)
            setIsDialogOpen(false)
            setFormData({ name: "", serial_number: "", category: "", department: "", location: "", maintenance_team_id: "", assigned_employee_id: "" })
            fetchData()
        } catch (error) {
            console.error("Failed to create equipment:", error)
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this equipment?")) {
            try {
                await equipmentApi.delete(id)
                fetchData()
            } catch (error) {
                console.error("Failed to delete equipment:", error)
            }
        }
    }

    // Get unique departments from equipment
    const departments = [...new Set(equipment.map(e => e.department).filter(Boolean))] as string[]

    const filteredEquipment = equipment.filter((item) => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.serial_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesDepartment = departmentFilter === "all" || item.department === departmentFilter
        const matchesCategory = categoryFilter === "all" || item.category === categoryFilter

        return matchesSearch && matchesDepartment && matchesCategory
    })

    const getTeamName = (teamId: string | null) => {
        if (!teamId) return "-"
        const team = teams.find(t => t.id === teamId)
        return team?.name || "-"
    }

    const getUserName = (userId: string | null) => {
        if (!userId) return "-"
        const user = users.find(u => u.id === userId)
        return user?.name || "-"
    }

    if (loading) {
        return <div className="flex items-center justify-center h-64">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Equipment</h1>
                    <p className="text-muted-foreground">Manage your company assets</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Equipment
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Add New Equipment</DialogTitle>
                            <DialogDescription>Add a new asset to your inventory.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="serial">Serial Number *</Label>
                                    <Input
                                        id="serial"
                                        value={formData.serial_number}
                                        onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map((cat) => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="department">Department</Label>
                                    <Input
                                        id="department"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        placeholder="e.g., Production"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="Where is this equipment located?"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="team">Maintenance Team</Label>
                                    <Select
                                        value={formData.maintenance_team_id}
                                        onValueChange={(value) => setFormData({ ...formData, maintenance_team_id: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select team" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teams.map((team) => (
                                                <SelectItem key={team.id} value={team.id}>
                                                    {team.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="employee">Assigned To</Label>
                                    <Select
                                        value={formData.assigned_employee_id}
                                        onValueChange={(value) => setFormData({ ...formData, assigned_employee_id: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select employee" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map((user) => (
                                                <SelectItem key={user.id} value={user.id}>
                                                    {user.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Create Equipment</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search equipment..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            {departments.map((dept) => (
                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Serial Number</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Assigned To</TableHead>
                            <TableHead>Team</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredEquipment.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    No equipment found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredEquipment.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/equipment/${item.id}`} className="flex items-center gap-2 hover:text-primary">
                                            <Wrench className="h-4 w-4 text-muted-foreground" />
                                            {item.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{item.serial_number}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{item.category}</Badge>
                                    </TableCell>
                                    <TableCell>{item.department || "-"}</TableCell>
                                    <TableCell>{getUserName(item.assigned_employee_id)}</TableCell>
                                    <TableCell>{getTeamName(item.maintenance_team_id)}</TableCell>
                                    <TableCell>
                                        {item.is_scrapped ? (
                                            <Badge variant="destructive">Scrapped</Badge>
                                        ) : (
                                            <Badge variant="secondary">Active</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={`/equipment/${item.id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Summary */}
            <div className="text-sm text-muted-foreground">
                Showing {filteredEquipment.length} of {equipment.length} equipment
            </div>
        </div>
    )
}
