"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, Clock, GitCommit } from "lucide-react"

interface TimelineEvent {
    id: string
    title: string
    description: string
    timestamp: string
    status: "completed" | "current" | "upcoming"
    type: "milestone" | "activity"
}

export function ProjectTimeline() {
    const events: TimelineEvent[] = [
        {
            id: "1",
            title: "Project Created",
            description: "Repository URL configured and project initialized",
            timestamp: "2 hours ago",
            status: "completed",
            type: "milestone",
        },
        {
            id: "2",
            title: "Git Clone Complete",
            description: "Successfully cloned repository with 234 files",
            timestamp: "1 hour ago",
            status: "completed",
            type: "milestone",
        },
        {
            id: "3",
            title: "AST Parsing Started",
            description: "Analyzing NestJS decorators and dependencies",
            timestamp: "45 minutes ago",
            status: "completed",
            type: "activity",
        },
        {
            id: "4",
            title: "Module Analysis",
            description: "Processing 12 NestJS modules and their imports",
            timestamp: "30 minutes ago",
            status: "current",
            type: "activity",
        },
        {
            id: "5",
            title: "Vector Embeddings",
            description: "Generate and store code embeddings",
            timestamp: "Estimated: 15 min",
            status: "upcoming",
            type: "milestone",
        },
        {
            id: "6",
            title: "Graph Relationships",
            description: "Build dependency graph in Neo4j",
            timestamp: "Estimated: 10 min",
            status: "upcoming",
            type: "milestone",
        },
        {
            id: "7",
            title: "Ready for LLM Chat",
            description: "Project available for AI knowledge transfer",
            timestamp: "Estimated: 5 min",
            status: "upcoming",
            type: "milestone",
        },
    ]

    return (
        <Card className="bg-card border-border">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground">Processing Timeline</CardTitle>
                    <Badge className="bg-primary/20 text-primary">
                        <Clock className="h-3 w-3 mr-1" />
                        In Progress
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />
                    <div className="space-y-4">
                        {events.map((event, index) => (
                            <div key={event.id} className="relative flex gap-4 pl-8">
                                <div className="absolute left-0 p-1 bg-card">
                                    {event.status === "completed" ? (
                                        <CheckCircle className="h-5 w-5 text-success" />
                                    ) : event.status === "current" ? (
                                        <div className="relative">
                                            <Circle className="h-5 w-5 text-primary" />
                                            <div className="absolute inset-1 rounded-full bg-primary animate-pulse" />
                                        </div>
                                    ) : (
                                        <Circle className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span
                                            className={`text-sm font-medium ${event.status === "upcoming" ? "text-muted-foreground" : "text-foreground"
                                                }`}
                                        >
                                            {event.title}
                                        </span>
                                        {event.type === "milestone" && (
                                            <GitCommit className="h-3 w-3 text-muted-foreground" />
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-1">{event.description}</p>
                                    <span className="text-xs text-muted-foreground/70">{event.timestamp}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
