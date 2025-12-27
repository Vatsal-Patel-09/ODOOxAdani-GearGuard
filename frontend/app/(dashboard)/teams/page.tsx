"use client"

import { useEffect, useState } from "react"
import { Plus, Users, Search, MoreHorizontal, Edit, Trash2, Eye, UserPlus, Mail, Phone } from "lucide-react"
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

interface TeamMember {
    id: string
    name: string
    email: string
    role: string
}

interface Team {
    id: string
    name: string
    description: string
    leader_id: string
    members: TeamMember[]
    created_at: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function TeamsPage() {
    const [teams, setTeams] = useState<Team[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [newTeam, setNewTeam] = useState({
        name: "",
        description: "",
    })

    useEffect(() => {
        fetchTeams()
    }, [])

    const fetchTeams = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/teams`)
            if (response.ok) {
                const data = await response.json()
                setTeams(data)
            }
        } catch (error) {
            console.error("Failed to fetch teams:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddTeam = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/teams`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTeam),
            })
            if (response.ok) {
                fetchTeams()
                setIsAddDialogOpen(false)
                setNewTeam({ name: "", description: "" })
            }
        } catch (error) {
            console.error("Failed to add team:", error)
        }
    }

    const handleDeleteTeam = async (id: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/teams/${id}`, {
                method: "DELETE",
            })
            if (response.ok) {
                fetchTeams()
            }
        } catch (error) {
            console.error("Failed to delete team:", error)
        }
    }

    const filteredTeams = teams.filter(
        (team) =>
            team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            team.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const totalMembers = teams.reduce((acc, team) => acc + (team.members?.length || 0), 0)

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-3.5rem)] bg-[#F9FAFB] dark:bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-[#714B67] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-[#6B7280] dark:text-muted-foreground">Loading teams...</p>
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
                        <h1 className="text-xl font-semibold text-[#111827] dark:text-foreground">Teams</h1>
                        <p className="text-sm text-[#6B7280] dark:text-muted-foreground mt-0.5">Manage your maintenance teams</p>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#714B67] hover:bg-[#5d3d56] text-white">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Team
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white dark:bg-card">
                            <DialogHeader>
                                <DialogTitle className="text-[#111827] dark:text-foreground">Create New Team</DialogTitle>
                                <DialogDescription className="text-[#6B7280] dark:text-muted-foreground">
                                    Create a new maintenance team to manage equipment.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-[#374151] dark:text-foreground">Team Name</Label>
                                    <Input
                                        id="name"
                                        value={newTeam.name}
                                        onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                                        className="border-[#E5E7EB] dark:border-border"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-[#374151] dark:text-foreground">Description</Label>
                                    <Input
                                        id="description"
                                        value={newTeam.description}
                                        onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                                        className="border-[#E5E7EB] dark:border-border"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleAddTeam} className="bg-[#714B67] hover:bg-[#5d3d56] text-white">
                                    Create Team
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search */}
                <div className="bg-white dark:bg-card rounded-lg border border-[#E5E7EB] dark:border-border p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] dark:text-muted-foreground" />
                        <Input
                            placeholder="Search teams..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 border-[#E5E7EB] dark:border-border"
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="bg-white dark:bg-card rounded-lg border border-[#E5E7EB] dark:border-border p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-[#714B67]/10 rounded-lg">
                                <Users className="h-5 w-5 text-[#714B67]" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[#111827] dark:text-foreground">{teams.length}</p>
                                <p className="text-sm text-[#6B7280] dark:text-muted-foreground">Total Teams</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-card rounded-lg border border-[#E5E7EB] dark:border-border p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-[#3B82F6]/10 rounded-lg">
                                <UserPlus className="h-5 w-5 text-[#3B82F6]" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[#111827] dark:text-foreground">{totalMembers}</p>
                                <p className="text-sm text-[#6B7280] dark:text-muted-foreground">Total Members</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-card rounded-lg border border-[#E5E7EB] dark:border-border p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-[#10B981]/10 rounded-lg">
                                <Users className="h-5 w-5 text-[#10B981]" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[#111827] dark:text-foreground">
                                    {teams.length > 0 ? Math.round(totalMembers / teams.length) : 0}
                                </p>
                                <p className="text-sm text-[#6B7280] dark:text-muted-foreground">Avg. Team Size</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Teams Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTeams.map((team) => (
                        <div key={team.id} className="bg-white dark:bg-card rounded-lg border border-[#E5E7EB] dark:border-border">
                            <div className="p-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-[#714B67]/10 rounded-lg">
                                            <Users className="h-5 w-5 text-[#714B67]" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-[#111827] dark:text-foreground">{team.name}</h3>
                                            <p className="text-sm text-[#6B7280] dark:text-muted-foreground">{team.members?.length || 0} members</p>
                                        </div>
                                    </div>
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
                                            <DropdownMenuItem>
                                                <UserPlus className="h-4 w-4 mr-2" />
                                                Add Member
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                className="text-[#EF4444]"
                                                onClick={() => handleDeleteTeam(team.id)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <p className="mt-3 text-sm text-[#6B7280] dark:text-muted-foreground line-clamp-2">
                                    {team.description || "No description provided"}
                                </p>
                            </div>
                            <div className="px-5 py-3 border-t border-[#E5E7EB] dark:border-border bg-[#F9FAFB] dark:bg-muted/50 rounded-b-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        {team.members?.slice(0, 4).map((member, index) => (
                                            <div
                                                key={member.id}
                                                className="w-8 h-8 rounded-full bg-[#714B67] border-2 border-white dark:border-card flex items-center justify-center text-white text-xs font-medium"
                                            >
                                                {member.name.charAt(0).toUpperCase()}
                                            </div>
                                        ))}
                                        {(team.members?.length || 0) > 4 && (
                                            <div className="w-8 h-8 rounded-full bg-[#E5E7EB] dark:bg-muted border-2 border-white dark:border-card flex items-center justify-center text-[#6B7280] text-xs font-medium">
                                                +{team.members.length - 4}
                                            </div>
                                        )}
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-[#714B67] hover:text-[#5d3d56]">
                                        View Team
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredTeams.length === 0 && (
                    <div className="bg-white dark:bg-card rounded-lg border border-[#E5E7EB] dark:border-border p-12 text-center">
                        <Users className="h-12 w-12 text-[#E5E7EB] dark:text-muted mx-auto mb-4" />
                        <p className="text-[#6B7280] dark:text-muted-foreground">No teams found</p>
                    </div>
                )}
            </div>
        </div>
    )
}
