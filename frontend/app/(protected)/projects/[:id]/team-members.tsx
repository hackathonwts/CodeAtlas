"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Pencil, Trash2, UserPlus } from "lucide-react"

interface TeamMember {
    id: string
    name: string
    email: string
    avatar?: string
    role: "owner" | "admin" | "member" | "viewer"
}

export function TeamMembers() {
    const [members, setMembers] = useState<TeamMember[]>([
        {
            id: "1",
            name: "Sarah Chen",
            email: "sarah@example.com",
            avatar: "/avatars/sarah.jpg",
            role: "owner",
        },
        {
            id: "2",
            name: "Alex Kumar",
            email: "alex@example.com",
            role: "admin",
        },
        {
            id: "3",
            name: "Jordan Lee",
            email: "jordan@example.com",
            role: "member",
        },
        {
            id: "4",
            name: "Morgan Davis",
            email: "morgan@example.com",
            role: "viewer",
        },
    ])

    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
    const [newMember, setNewMember] = useState({ name: "", email: "", role: "member" as const })

    const roleConfig = {
        owner: { label: "Owner", className: "bg-primary text-primary-foreground" },
        admin: { label: "Admin", className: "bg-accent text-accent-foreground" },
        member: { label: "Member", className: "bg-secondary text-secondary-foreground" },
        viewer: { label: "Viewer", className: "bg-muted text-muted-foreground" },
    }

    const handleAddMember = () => {
        if (newMember.name && newMember.email) {
            setMembers([
                ...members,
                {
                    id: Date.now().toString(),
                    ...newMember,
                },
            ])
            setNewMember({ name: "", email: "", role: "member" })
            setIsAddOpen(false)
        }
    }

    const handleEditMember = () => {
        if (editingMember) {
            setMembers(members.map((m) => (m.id === editingMember.id ? editingMember : m)))
            setEditingMember(null)
            setIsEditOpen(false)
        }
    }

    const handleDeleteMember = (id: string) => {
        setMembers(members.filter((m) => m.id !== id))
    }

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
    }

    return (
        <Card className="bg-card border-border">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground">Team Members</CardTitle>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add Member
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border-border">
                            <DialogHeader>
                                <DialogTitle className="text-foreground">Add Team Member</DialogTitle>
                                <DialogDescription className="text-muted-foreground">
                                    Invite a new member to collaborate on this project.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-foreground">
                                        Name
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder="Enter name"
                                        value={newMember.name}
                                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                        className="bg-input border-border text-foreground"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-foreground">
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter email"
                                        value={newMember.email}
                                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                                        className="bg-input border-border text-foreground"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role" className="text-foreground">
                                        Role
                                    </Label>
                                    <Select
                                        value={newMember.role}
                                        onValueChange={(value: "admin" | "member" | "viewer") =>
                                            setNewMember({ ...newMember, role: 'member' })
                                        }
                                    >
                                        <SelectTrigger className="bg-input border-border text-foreground">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border">
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="member">Member</SelectItem>
                                            <SelectItem value="viewer">Viewer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAddMember}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    Add Member
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                        {getInitials(member.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium text-foreground">{member.name}</p>
                                    <p className="text-xs text-muted-foreground">{member.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className={roleConfig[member.role].className}>
                                    {roleConfig[member.role].label}
                                </Badge>
                                {member.role !== "owner" && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-popover border-border">
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setEditingMember(member)
                                                    setIsEditOpen(true)
                                                }}
                                                className="text-foreground"
                                            >
                                                <Pencil className="h-4 w-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDeleteMember(member.id)}
                                                className="text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Remove
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>

            {/* Edit Member Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-card border-border">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">Edit Team Member</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Update member details and permissions.
                        </DialogDescription>
                    </DialogHeader>
                    {editingMember && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name" className="text-foreground">
                                    Name
                                </Label>
                                <Input
                                    id="edit-name"
                                    value={editingMember.name}
                                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                                    className="bg-input border-border text-foreground"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-email" className="text-foreground">
                                    Email
                                </Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={editingMember.email}
                                    onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                                    className="bg-input border-border text-foreground"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-role" className="text-foreground">
                                    Role
                                </Label>
                                <Select
                                    value={editingMember.role}
                                    onValueChange={(value: "admin" | "member" | "viewer") =>
                                        setEditingMember({ ...editingMember, role: value })
                                    }
                                >
                                    <SelectTrigger className="bg-input border-border text-foreground">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover border-border">
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="member">Member</SelectItem>
                                        <SelectItem value="viewer">Viewer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEditMember}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    )
}
