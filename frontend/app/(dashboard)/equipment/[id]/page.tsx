"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Wrench, ClipboardList, Edit, MapPin, Building, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { equipmentApi, Equipment, MaintenanceRequest } from "@/lib/api"

export default function EquipmentDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [equipment, setEquipment] = useState<Equipment | null>(null)
    const [requests, setRequests] = useState<MaintenanceRequest[]>([])
    const [openCount, setOpenCount] = useState(0)
    const [loading, setLoading] = useState(true)

    const equipmentId = params.id as string

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [equipmentData, requestsData, countData] = await Promise.all([
                    equipmentApi.get(equipmentId),
                    equipmentApi.getRequests(equipmentId),
                    equipmentApi.getRequestCount(equipmentId),
                ])
                setEquipment(equipmentData)
                setRequests(requestsData)
                setOpenCount(countData.open_request_count)
            } catch (error) {
                console.error("Failed to fetch data:", error)
                router.push("/equipment")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [equipmentId, router])

    if (loading) {
        return <div className="flex items-center justify-center h-64">Loading...</div>
    }

    if (!equipment) {
        return <div className="flex items-center justify-center h-64">Equipment not found</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Wrench className="h-8 w-8" />
                        {equipment.name}
                    </h1>
                    <p className="text-muted-foreground">{equipment.serial_number}</p>
                </div>
                <Button variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Equipment Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Equipment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Category</p>
                                <p className="font-medium">{equipment.category}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                {equipment.is_scrapped ? (
                                    <Badge variant="destructive">Scrapped</Badge>
                                ) : (
                                    <Badge variant="secondary">Active</Badge>
                                )}
                            </div>
                            <div className="flex items-start gap-2">
                                <Building className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Department</p>
                                    <p className="font-medium">{equipment.department || "Not assigned"}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Location</p>
                                    <p className="font-medium">{equipment.location || "Not specified"}</p>
                                </div>
                            </div>
                            {equipment.purchase_date && (
                                <div className="flex items-start gap-2">
                                    <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Purchase Date</p>
                                        <p className="font-medium">{new Date(equipment.purchase_date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            )}
                            {equipment.warranty_expiry && (
                                <div className="flex items-start gap-2">
                                    <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Warranty Expiry</p>
                                        <p className="font-medium">{new Date(equipment.warranty_expiry).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Smart Button - Maintenance Requests */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <ClipboardList className="h-5 w-5" />
                                    Maintenance
                                </CardTitle>
                                <CardDescription>Related maintenance requests</CardDescription>
                            </div>
                            {/* SMART BUTTON with badge showing open request count */}
                            <Button asChild className="relative">
                                <Link href={`/requests?equipment=${equipmentId}`}>
                                    View All
                                    {openCount > 0 && (
                                        <Badge
                                            variant="destructive"
                                            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                                        >
                                            {openCount}
                                        </Badge>
                                    )}
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {requests.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">No maintenance requests</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.slice(0, 5).map((request) => (
                                        <TableRow key={request.id}>
                                            <TableCell className="font-medium">{request.subject}</TableCell>
                                            <TableCell>
                                                <Badge variant={request.request_type === "corrective" ? "destructive" : "secondary"}>
                                                    {request.request_type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{request.status}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        {requests.length > 5 && (
                            <p className="text-sm text-muted-foreground text-center mt-2">
                                +{requests.length - 5} more requests
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
