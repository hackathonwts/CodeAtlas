"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings, ExternalLink, Github } from "lucide-react"
import Link from "next/link"

interface ProjectHeaderProps {
    name: string
    description: string
    repoUrl: string
    status: "active" | "paused" | "completed"
}

export function ProjectHeader({ name, description, repoUrl, status }: ProjectHeaderProps) {
    const statusConfig = {
        active: { label: "Active", className: "bg-success text-success-foreground" },
        paused: { label: "Paused", className: "bg-warning text-warning-foreground" },
        completed: { label: "Completed", className: "bg-primary text-primary-foreground" },
    }

    return (
        <div className="border-b border-border bg-card">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4 mb-4">
                    <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-muted-foreground">Projects</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-foreground font-medium">{name}</span>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold text-foreground">{name}</h1>
                            <Badge className={statusConfig[status].className}>
                                {statusConfig[status].label}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground max-w-2xl">{description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a href={repoUrl} target="_blank" rel="noopener noreferrer">
                                <Github className="h-4 w-4 mr-2" />
                                Repository
                                <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
