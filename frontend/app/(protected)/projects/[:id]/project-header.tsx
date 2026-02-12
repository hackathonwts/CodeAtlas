"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings, ExternalLink, Github } from "lucide-react"

interface ProjectHeaderProps {
    name?: string
    description?: string
    repoUrl?: string
    status?: string
}

export function ProjectHeader({ name, description, repoUrl, status }: ProjectHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <div className="flex items-center gap-1">
                    <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
                    {/* <h1 className="text-2xl font-semibold text-foreground">{name}</h1> */}
                    <Badge variant="outline">
                        {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"}
                    </Badge>
                </div>
                <p className="text-muted-foreground max-w-2xl">{description}</p>
            </div>
            <div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
