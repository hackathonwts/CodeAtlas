"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { GitBranch, Code2, Database, Sparkles, CheckCircle2, Circle } from "lucide-react"

const STAGES: { label: string; color: string; icon: any }[] = [
    { label: "Git Clone", color: "#28747e", icon: GitBranch },
    { label: "AST Parsing", color: "#25617c", icon: Code2 },
    { label: "Graph DB Storage", color: "#855121", icon: Database },
    { label: "Vector Embedding", color: "#631a83", icon: Sparkles },
    { label: "LLM Ready", color: "#1e7e23", icon: CheckCircle2 },
]

export function ProjectStatus() {
    const [activeStage, setActiveStage] = useState(0)

    return (
        <div className="flex flex-col items-center gap-8 w-full">
            <div
                className="w-full flex overflow-hidden rounded-xl shadow-lg ring-1 ring-black/5"
                role="progressbar"
                aria-valuenow={activeStage + 1}
                aria-valuemin={1}
                aria-valuemax={STAGES.length}
                style={{ backgroundColor: "#1e293b" }}
            >
                {STAGES.map((stage, i) => {
                    const isCompleted = i < activeStage
                    const isActive = i === activeStage
                    const isPassed = i <= activeStage
                    const Icon = stage.icon

                    return (
                        <button
                            key={stage.label}
                            onClick={() => setActiveStage(i)}
                            className={cn(
                                "group relative flex-1 h-10 flex items-center justify-center cursor-pointer transition-all duration-500",
                                "border-r border-r-[rgba(0,0,0,0.2)] last:border-r-0",
                            )}
                            style={{
                                backgroundColor: isPassed ? stage.color : "#2c3e50",
                                transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                            aria-label={`Stage ${i + 1}: ${stage.label}`}
                        >

                            {/* Active stage pulse */}
                            {isActive && (
                                <div
                                    className="absolute inset-0 pointer-events-none animate-pulse"
                                    style={{
                                        background: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.46) 50%, transparent 100%)",
                                    }}
                                />
                            )}

                            {/* Hover glow */}
                            <div
                                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{
                                    background: "radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)",
                                }}
                            />

                            {/* Content */}
                            <span
                                className={cn(
                                    "relative z-10 text-sm font-semibold flex items-center gap-2 select-none transition-all duration-300",
                                    isPassed ? "text-white" : "text-[#607d8b]",
                                    isActive && "scale-105"
                                )}
                            >
                                {isCompleted ? (
                                    <CheckCircle2 className="w-4 h-4 animate-in fade-in zoom-in duration-300" strokeWidth={2.5} />
                                ) : isActive ? (
                                    <Icon className="w-4 h-4 animate-in fade-in zoom-in duration-300" strokeWidth={2.5} />
                                ) : (
                                    <Circle className="w-4 h-4 opacity-50" strokeWidth={2} />
                                )}
                                <span className="hidden sm:inline">{stage.label}</span>
                                <span className="sm:hidden">{i + 1}</span>
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
