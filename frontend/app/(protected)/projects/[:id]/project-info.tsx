"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    GitBranch,
    GitCommit,
    Calendar,
    Link as LinkIcon,
    Copy,
    Check,
    Terminal,
    MessageSquare,
} from "lucide-react"
import { useState } from "react"

interface ProjectInfoProps {
    repoUrl?: string
    branch?: string
    lastCommit?: string
    createdAt?: string
    framework?: string
    nodeVersion?: string
}

export function ProjectInfo({ repoUrl, branch, lastCommit, createdAt, framework, nodeVersion }: ProjectInfoProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        await navigator.clipboard.writeText(repoUrl ?? "")
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const infoItems = [
        {
            label: "Repository",
            value: repoUrl?.replace("https://github.com/", "") ?? "",
            icon: <LinkIcon className="h-4 w-4" />,
            action: (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleCopy}
                >
                    {copied ? (
                        <Check className="h-3 w-3 text-success" />
                    ) : (
                        <Copy className="h-3 w-3" />
                    )}
                </Button>
            ),
        },
        {
            label: "Branch",
            value: branch,
            icon: <GitBranch className="h-4 w-4" />,
        },
        {
            label: "Last Commit",
            value: lastCommit,
            icon: <GitCommit className="h-4 w-4" />,
        },
        {
            label: "Created",
            value: createdAt,
            icon: <Calendar className="h-4 w-4" />,
        },
        {
            label: "Framework",
            value: framework,
            icon: <Terminal className="h-4 w-4" />,
        },
    ]

    return (
        <Card className="bg-card border-border">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground">Project Information</CardTitle>
                    <Badge className="bg-accent/20 text-accent">
                        Node {nodeVersion}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-1">
                {infoItems.map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-md bg-secondary text-muted-foreground">
                                {item.icon}
                            </div>
                            <span className="text-sm text-muted-foreground">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-foreground font-medium truncate max-w-[200px]">
                                {item.value}
                            </span>
                            {item.action}
                        </div>
                    </div>
                ))}

                <div className="pt-4">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Start AI Knowledge Transfer Chat
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
