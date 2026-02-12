"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, Clock, GitCommit, Activity, Rocket, BrainCircuit, Network, Sparkles, Zap } from "lucide-react"
import { useState, useEffect } from "react"

interface TimelineEvent {
    id: string
    title: string
    description: string
    timestamp: string
    status: "completed" | "current" | "upcoming"
    type: "milestone" | "activity"
    icon?: React.ComponentType<{ className?: string }>
    duration?: string
}

export function ProjectTimeline() {
    const [progress, setProgress] = useState(0)

    const events: TimelineEvent[] = [
        {
            id: "1",
            title: "Project Created",
            description: "Repository URL configured and project initialized",
            timestamp: "2 hours ago",
            status: "completed",
            type: "milestone",
            icon: Rocket,
            duration: "2min"
        },
        {
            id: "2",
            title: "Git Clone Complete",
            description: "Successfully cloned repository with 234 files",
            timestamp: "1 hour ago",
            status: "completed",
            type: "milestone",
            icon: GitCommit,
            duration: "5min"
        },
        {
            id: "3",
            title: "AST Parsing Started",
            description: "Analyzing NestJS decorators and dependencies",
            timestamp: "45 minutes ago",
            status: "completed",
            type: "activity",
            icon: Activity,
            duration: "8min"
        },
        {
            id: "4",
            title: "Module Analysis",
            description: "Processing 12 NestJS modules and their imports",
            timestamp: "30 minutes ago",
            status: "current",
            type: "activity",
            icon: Sparkles,
            duration: "12min"
        },
        {
            id: "5",
            title: "Vector Embeddings",
            description: "Generate and store code embeddings in ChromaDB",
            timestamp: "Estimated: 15 min",
            status: "upcoming",
            type: "milestone",
            icon: BrainCircuit,
            duration: "~10min"
        },
        {
            id: "6",
            title: "Graph Relationships",
            description: "Build dependency graph in Neo4j",
            timestamp: "Estimated: 10 min",
            status: "upcoming",
            type: "milestone",
            icon: Network,
            duration: "~8min"
        },
        {
            id: "7",
            title: "Ready for LLM Chat",
            description: "Project available for AI-powered knowledge transfer",
            timestamp: "Estimated: 5 min",
            status: "upcoming",
            type: "milestone",
            icon: Zap,
            duration: "~2min"
        },
    ]

    useEffect(() => {
        const completed = events.filter(e => e.status === "completed").length
        const total = events.length
        const calculatedProgress = (completed / total) * 100

        const timer = setTimeout(() => setProgress(calculatedProgress), 100)
        return () => clearTimeout(timer)
    }, [])

    const milestones = events.filter(e => e.type === "milestone")
    const activities = events.filter(e => e.type === "activity")

    const renderTimelineItems = (items: TimelineEvent[]) => (
        <div className="space-y-6">
            {items.map((event, index) => {
                const Icon = event.icon || Activity
                const isLast = index === items.length - 1

                return (
                    <div key={event.id} className="relative flex gap-4 group">
                        {/* Vertical line */}
                        {!isLast && (
                            <div className="absolute left-5 top-12 w-0.5 h-full -ml-px">
                                <div className={`w-full h-full transition-all duration-500 ${event.status === "completed"
                                    ? "bg-linear-to-b from-emerald-500 to-emerald-500/50"
                                    : event.status === "current"
                                        ? "bg-linear-to-b from-blue-500 to-border"
                                        : "bg-border"
                                    }`} />
                            </div>
                        )}

                        {/* Timeline node */}
                        <div className="relative z-10">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${event.status === "completed"
                                            ? "bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/20"
                                            : event.status === "current"
                                                ? "bg-blue-500/10 border-blue-500 shadow-lg shadow-blue-500/30 animate-pulse"
                                                : "bg-muted border-border group-hover:border-primary/50"
                                            }`}>
                                            {event.status === "completed" ? (
                                                <CheckCircle className="h-5 w-5 text-emerald-500" />
                                            ) : event.status === "current" ? (
                                                <Icon className="h-5 w-5 text-blue-500 animate-pulse" />
                                            ) : (
                                                <Icon className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="left">
                                        <p className="text-xs">{event.duration}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        {/* Content */}
                        <div className={`flex-1 pb-0 transition-all duration-300 ${event.status === "upcoming" ? "opacity-60" : "opacity-100"
                            } group-hover:opacity-100`}>
                            <div className="bg-card/50 group-hover:bg-card border border-border rounded-lg p-4 transition-all duration-300 group-hover:shadow-md group-hover:border-primary/30">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <h3 className={`font-semibold text-sm ${event.status === "upcoming" ? "text-muted-foreground" : "text-foreground"}`}>
                                        {event.title}
                                    </h3>
                                    {event.status === "current" && (
                                        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">
                                            <Activity className="h-3 w-3 mr-1 animate-pulse" />
                                            Active
                                        </Badge>
                                    )}
                                    {event.status === "completed" && (
                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                                            Done
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mb-1">
                                    {event.description}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                                    <Clock className="h-3 w-3" />
                                    {event.timestamp}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )

    return (
        <Card className="bg-card/50 backdrop-blur border-border shadow-lg">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Processing Timeline
                    </CardTitle>
                    <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">
                        <Clock className="h-3 w-3 mr-1" />
                        In Progress
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="all" className="text-xs">
                            All ({events.length})
                        </TabsTrigger>
                        <TabsTrigger value="milestones" className="text-xs">
                            Milestones ({milestones.length})
                        </TabsTrigger>
                        <TabsTrigger value="activities" className="text-xs">
                            Activities ({activities.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-0">
                        <ScrollArea className="h-150 pr-4">
                            {renderTimelineItems(events)}
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="milestones" className="mt-0">
                        <ScrollArea className="h-150 pr-4">
                            {renderTimelineItems(milestones)}
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="activities" className="mt-0">
                        <ScrollArea className="h-150 pr-4">
                            {renderTimelineItems(activities)}
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
