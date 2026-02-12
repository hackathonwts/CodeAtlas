"use client"

import { Button } from "@/components/ui/button"
import { GitHubLogoIcon, Pencil2Icon } from "@radix-ui/react-icons"
import { Settings, ExternalLink } from "lucide-react"

interface ProjectHeaderProps {
    name?: string
    description?: string
    repoUrl?: string
    status?: string
}

const statusColors: Record<string, string> = {
    "Archived": "bg-yellow-500/20 text-yellow-500 border-yellow-500/30 cursor-pointer",
    "Active": "bg-green-500/20 text-green-500 border-green-500/30 cursor-pointer",
    "Inactive": "bg-red-500/20 text-red-500 border-red-500/30 cursor-pointer",
}

export function ProjectHeader({ name, description, repoUrl, status }: ProjectHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
                </div>
                <p className="text-muted-foreground max-w-2xl">{description}</p>
            </div>
            <div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className={statusColors[status || ""]}>
                            <Pencil2Icon className="h-4 w-4 mr-2" />
                            {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"}
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a href={repoUrl} target="_blank" rel="noopener noreferrer">
                                <GitHubLogoIcon className="h-4 w-4 mr-2" />
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
