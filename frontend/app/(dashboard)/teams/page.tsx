"use client"

import { useEffect, useState } from "react"
import { Plus, Users, Trash2, UserPlus, UserMinus } from "lucide-react"
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
import { getTeams, createTeam, deleteTeam, getTeamMembers, addTeamMember, removeTeamMember, getUsers, MaintenanceTeam, TeamMember, User } from "@/lib/api"

export default function TeamsPage() {
    const [teams, setTeams] = useState<MaintenanceTeam[]>([])
    const [teamMembers, setTeamMembers] = useState<Record<string, TeamMember[]>>({})
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
    const [selectedUser, setSelectedUser] = useState("")
    const [formData, setFormData] = useState({ name: "", description: "" })

    const fetchData = async () => {
        try {
            const [teamsData, usersData] = await Promise.all([
                getTeams(),
                getUsers(),
            ])
            setTeams(teamsData)
            setUsers(usersData)

            // Fetch members for each team
            const membersMap: Record<string, TeamMember[]> = {}
            for (const team of teamsData) {
                const members = await getTeamMembers(team.id)
                membersMap[team.id] = members
            }
            setTeamMembers(membersMap)
        } catch (error) {
            console.error("Failed to fetch data:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await createTeam({
                name: formData.name,
                description: formData.description || undefined,
            })
            setIsCreateOpen(false)
            setFormData({ name: "", description: "" })
            fetchData()
        } catch (error) {
            console.error("Failed to create team:", error)
        }
    }

    const handleDeleteTeam = async (id: string) => {
        if (confirm("Are you sure you want to delete this team?")) {
            try {
                await deleteTeam(id)
                fetchData()
            } catch (error) {
                console.error("Failed to delete team:", error)
            }
        }
    }

    const handleAddMember = async () => {
        if (!selectedTeam || !selectedUser) return
        try {
            await addTeamMember(selectedTeam, selectedUser)
            setIsAddMemberOpen(false)
            setSelectedUser("")
            fetchData()
        } catch (error) {
            console.error("Failed to add member:", error)
        }
    }

    const handleRemoveMember = async (teamId: string, userId: string) => {
        try {
            await removeTeamMember(teamId, userId)
            fetchData()
        } catch (error) {
            console.error("Failed to remove member:", error)
        }
    }

    const getUserName = (userId: string) => {
        const user = users.find(u => u.id === userId)
        return user?.name || "Unknown"
    }

    const getAvailableUsers = (teamId: string) => {
        const teamMemberIds = (teamMembers[teamId] || []).map(m => m.user_id)
        return users.filter(u => !teamMemberIds.includes(u.id))
    }

    if (loading) {
        return <div className="flex items-center justify-center h-64">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Maintenance Teams</h1>
                    <p className="text-muted-foreground">Manage your maintenance teams and members</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Team
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Team</DialogTitle>
                            <DialogDescription>Add a new maintenance team.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateTeam} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Team Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                            <DialogFooter>
                                <Button type="submit">Create Team</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {teams.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    No teams found. Create your first team to get started.
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {teams.map((team) => (
                        <Card key={team.id}>
                            <CardHeader className="flex flex-row items-start justify-between space-y-0">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        {team.name}
                                    </CardTitle>
                                    <CardDescription>{team.description || "No description"}</CardDescription>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteTeam(team.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Members</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedTeam(team.id)
                                            setIsAddMemberOpen(true)
                                        }}
                                    >
                                        <UserPlus className="mr-1 h-3 w-3" />
                                        Add
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {(teamMembers[team.id] || []).length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No members yet</p>
                                    ) : (
                                        (teamMembers[team.id] || []).map((member) => (
                                            <div key={member.id} className="flex items-center justify-between rounded-md border p-2">
                                                <span className="text-sm">{getUserName(member.user_id)}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => handleRemoveMember(team.id, member.user_id)}
                                                >
                                                    <UserMinus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <Badge variant="secondary">
                                    {(teamMembers[team.id] || []).length} member(s)
                                </Badge>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Team Member</DialogTitle>
                        <DialogDescription>Select a user to add to the team.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Select User</Label>
                            <Select value={selectedUser} onValueChange={setSelectedUser}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a user" />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedTeam && getAvailableUsers(selectedTeam).map((user) => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddMember} disabled={!selectedUser}>Add Member</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
