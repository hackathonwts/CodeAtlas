"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Search,
    Plus,
    Clock,
    Briefcase,
    Bot,
    BarChart3,
    FileText,
    Code,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState } from "react"

const projects = [
    {
        id: "1",
        name: "AI Marketing Assistant",
        description: "Automated content generation and social media scheduling",
        lastModified: "2 hours ago",
        status: "active",
        messageCount: 245,
        icon: Briefcase,
    },
    {
        id: "2",
        name: "Customer Support Bot",
        description: "Intelligent customer service automation with ticket management",
        lastModified: "5 hours ago",
        status: "active",
        messageCount: 892,
        icon: Bot,
    },
    {
        id: "3",
        name: "Data Analysis Helper",
        description: "Natural language queries for business intelligence",
        lastModified: "1 day ago",
        status: "paused",
        messageCount: 156,
        icon: BarChart3,
    },
    {
        id: "4",
        name: "Legal Document Review",
        description: "Contract analysis and compliance checking assistant",
        lastModified: "2 days ago",
        status: "active",
        messageCount: 421,
        icon: FileText,
    },
    {
        id: "5",
        name: "Code Review Assistant",
        description: "Automated code quality and security analysis",
        lastModified: "3 days ago",
        status: "active",
        messageCount: 678,
        icon: Code,
    },
    {
        id: "6",
        name: "Financial Advisor Bot",
        description: "Investment insights and portfolio recommendations",
        lastModified: "1 week ago",
        status: "paused",
        messageCount: 234,
        icon: TrendingUp,
    },
]

interface ProjectsGridProps {
    onSelectProject: (projectId: string) => void
}

export function ProjectsGrid({ onSelectProject }: ProjectsGridProps) {
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 12
    const totalPages = Math.ceil(projects.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const currentProjects = projects.slice(startIndex, startIndex + itemsPerPage)

    return (
        <div className="flex h-full w-full flex-col">
            {/* Header */}
            <header className="border-b border-border bg-card px-8 py-6">
                <div className="mx-auto max-w-7xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-balance text-3xl font-bold tracking-tight">Your Projects</h1>
                            <p className="mt-1 text-pretty text-sm text-muted-foreground">
                                Select a project to continue your conversation
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <Button size="lg" className="gap-2">
                                <Plus className="h-4 w-4" />
                                New Project
                            </Button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative mt-6">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Search projects..." className="h-11 pl-10 bg-background" />
                    </div>
                </div>
            </header>

            {/* Projects Grid */}
            <div className="flex-1 overflow-auto p-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {currentProjects.map((project) => {
                            const IconComponent = project.icon
                            return (
                                <Card
                                    key={project.id}
                                    className="group relative cursor-pointer overflow-hidden border-2 border-border bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6 transition-all duration-300 hover:scale-[1.02] hover:border-primary hover:shadow-2xl hover:shadow-primary/20 hover:from-primary/20 hover:via-accent/10 hover:to-primary/30"
                                    onClick={() => onSelectProject(project.id)}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-accent/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-primary/40">
                                                <IconComponent className="h-7 w-7 text-primary transition-transform duration-300 group-hover:scale-110" />
                                            </div>
                                            <Badge
                                                variant={project.status === "active" ? "default" : "secondary"}
                                                className="text-xs transition-transform duration-300 group-hover:-translate-y-0.5"
                                            >
                                                {project.status}
                                            </Badge>
                                        </div>

                                        <h3 className="mt-4 text-balance text-lg font-semibold transition-all duration-300 group-hover:-translate-y-0.5 group-hover:text-primary">
                                            {project.name}
                                        </h3>
                                        <p className="mt-2 text-pretty text-sm text-muted-foreground leading-relaxed transition-colors duration-300 group-hover:text-foreground/80">
                                            {project.description}
                                        </p>

                                        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1 transition-colors duration-300 group-hover:text-foreground/70">
                                                <Clock className="h-3 w-3" />
                                                {project.lastModified}
                                            </div>
                                            <div className="transition-all duration-300 group-hover:scale-105 group-hover:font-semibold group-hover:text-primary">
                                                {project.messageCount} messages
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-8 flex items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="gap-1"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(page)}
                                        className="h-8 w-8 p-0"
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="gap-1"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
