"use client"

import React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
    GitBranch,
    FileCode,
    Database,
    Network,
    MessageSquare,
    CheckCircle,
    AlertCircle,
    Clock,
    Loader2,
} from "lucide-react"

type StatusType = "pending" | "in_progress" | "completed" | "error"

interface StatusCardProps {
    title: string
    description: string
    status: StatusType
    progress?: number
    icon: React.ReactNode
    details?: string
}

function StatusCard({ title, description, status, progress, icon, details }: StatusCardProps) {
    const statusConfig = {
        pending: {
            label: "Pending",
            icon: <Clock className="h-4 w-4" />,
            className: "bg-muted text-muted-foreground",
        },
        in_progress: {
            label: "In Progress",
            icon: <Loader2 className="h-4 w-4 animate-spin" />,
            className: "bg-primary/20 text-primary",
        },
        completed: {
            label: "Completed",
            icon: <CheckCircle className="h-4 w-4" />,
            className: "bg-success/20 text-success",
        },
        error: {
            label: "Error",
            icon: <AlertCircle className="h-4 w-4" />,
            className: "bg-destructive/20 text-destructive",
        },
    }

    return (
        <Card className="bg-card border-border">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-secondary text-foreground">{icon}</div>
                        <CardTitle className="text-sm font-medium text-foreground">{title}</CardTitle>
                    </div>
                    <Badge className={statusConfig[status].className}>
                        {statusConfig[status].icon}
                        <span className="ml-1">{statusConfig[status].label}</span>
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{description}</p>
                {typeof progress !== "undefined" && (
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="text-foreground font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                    </div>
                )}
                {details && <p className="text-xs text-muted-foreground font-mono">{details}</p>}
            </CardContent>
        </Card>
    )
}

export function StatusCards() {
    const statuses = [
        {
            title: "Git Clone",
            description: "Repository cloning and local setup",
            status: "completed" as StatusType,
            progress: 100,
            icon: <GitBranch className="h-4 w-4" />,
            details: "Cloned at: /tmp/repos/nestjs-app",
        },
        {
            title: "AST Parsing",
            description: "Parsing NestJS modules, controllers, services",
            status: "in_progress" as StatusType,
            progress: 67,
            icon: <FileCode className="h-4 w-4" />,
            details: "Parsed: 45/67 files",
        },
        {
            title: "Vector DB Storage",
            description: "Storing embeddings in vector database",
            status: "in_progress" as StatusType,
            progress: 34,
            icon: <Database className="h-4 w-4" />,
            details: "Stored: 1,234 embeddings",
        },
        {
            title: "Graph DB Storage",
            description: "Building relationship graph in Neo4j",
            status: "pending" as StatusType,
            icon: <Network className="h-4 w-4" />,
            details: "Waiting for AST parsing",
        },
        {
            title: "LLM Ready",
            description: "Ready for AI knowledge transfer chat",
            status: "pending" as StatusType,
            icon: <MessageSquare className="h-4 w-4" />,
            details: "Requires all previous steps",
        },
    ]

    return (
        <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {statuses.map((status) => (
                <StatusCard key={status.title} {...status} />
            ))}
        </div>
    )
}
