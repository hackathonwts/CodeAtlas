"use client"

import { useState } from "react"
import { ProjectsGrid } from "@/components/projects-grid"
import { ChatInterface } from "@/components/chat-interface"

export default function Home() {
    const [selectedProject, setSelectedProject] = useState<string | null>(null)

    return (
        <div className="flex h-screen w-full bg-background">
            {!selectedProject ? (
                <ProjectsGrid onSelectProject={setSelectedProject} />
            ) : (
                <ChatInterface projectId={selectedProject} onBack={() => setSelectedProject(null)} />
            )}
        </div>
    )
}
