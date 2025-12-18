"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Send, Sparkles, FileText, Code, Bot, GitBranchIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

interface ChatInterfaceProps {
    projectId: string
    onBack: () => void
}

export function ChatInterface({ projectId, onBack }: ChatInterfaceProps) {
    const [selectedPrefix, setSelectedPrefix] = useState<string>("all")
    const [inputValue, setInputValue] = useState("")

    const handlePrefixSelect = (prefixId: string) => {
        setSelectedPrefix(prefixId)
        if (prefixId !== "all") {
            setInputValue(`/${prefixId} `)
        } else {
            setInputValue("")
        }
    }

    return (
        <div className="flex h-full w-full flex-col bg-background">
            {/* Header */}
            <header className="border-b border-border/50 bg-gradient-to-r from-card via-card to-secondary/30 px-6 py-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onBack}
                            className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
                                <Bot className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-foreground">AI Marketing Assistant</h2>
                                <p className="text-xs text-muted-foreground">Project #{projectId}</p>
                            </div>
                        </div>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-6 bg-gradient-to-b from-background to-secondary/10">
                <div className="mx-auto max-w-4xl space-y-6">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={cn(
                                "flex gap-4 animate-in fade-in-50 slide-in-from-bottom-5 duration-500",
                                message.role === "user" ? "justify-end" : "justify-start",
                            )}
                        >
                            {message.role === "assistant" && (
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
                                    <Sparkles className="h-5 w-5 text-primary-foreground" />
                                </div>
                            )}
                            <Card
                                className={cn(
                                    "max-w-[75%] p-5 shadow-md transition-all hover:shadow-xl",
                                    message.role === "user"
                                        ? "bg-gradient-to-br from-primary to-accent text-primary-foreground border-primary/20"
                                        : "bg-card border-border/50 backdrop-blur-sm",
                                )}
                            >
                                <p className="whitespace-pre-wrap text-pretty leading-relaxed">{message.content}</p>
                                <p
                                    className={cn(
                                        "mt-3 text-xs font-medium",
                                        message.role === "user" ? "text-primary-foreground/80" : "text-muted-foreground",
                                    )}
                                >
                                    {message.timestamp}
                                </p>
                            </Card>
                            {message.role === "user" && (
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted shadow-md">
                                    <span className="text-sm font-semibold text-foreground">You</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-border/50 bg-card/95 backdrop-blur-xl p-6 shadow-2xl">
                <div className="mx-auto max-w-4xl">
                    {/* Prefix Badges */}
                    <div className="mb-4 flex flex-wrap gap-2.5">
                        {prefixes.map((prefix) => {
                            const Icon = prefix.icon
                            const isSelected = selectedPrefix === prefix.id
                            return (
                                <Badge
                                    key={prefix.id}
                                    variant={isSelected ? "default" : "outline"}
                                    className={cn(
                                        "cursor-pointer gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-full",
                                        isSelected
                                            ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30"
                                            : "hover:bg-primary/10 hover:border-primary/50 hover:text-primary",
                                    )}
                                    onClick={() => handlePrefixSelect(prefix.id)}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {prefix.label}
                                </Badge>
                            )
                        })}
                    </div>

                    {/* Input */}
                    <div className="relative">
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={selectedPrefix === "all" ? "Type your message..." : `Search ${selectedPrefix}...`}
                            className="h-14 pr-14 bg-background/80 backdrop-blur-sm text-base border-border/50 shadow-lg focus:shadow-xl focus:border-primary/50 transition-all rounded-2xl"
                        />
                        <Button
                            size="icon"
                            className="absolute right-1.5 top-1.5 h-11 w-11 rounded-xl bg-gradient-to-r from-primary to-accent shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>

                    <p className="mt-3 text-center text-xs text-muted-foreground font-medium">
                        Select a prefix to filter your search or type freely
                    </p>
                </div>
            </div>
        </div>
    )
}

const prefixes = [
    { id: "all", label: "All", icon: Sparkles },
    { id: "docs", label: "Docs", icon: FileText },
    { id: "commits", label: "Git Commits", icon: GitBranchIcon },
    { id: "code", label: "Code", icon: Code },
]

const messages = [
    {
        id: "1",
        role: "user",
        content: "Can you help me analyze the latest sales data?",
        timestamp: "10:30 AM",
    },
    {
        id: "2",
        role: "assistant",
        content:
            "I'd be happy to help you analyze the sales data. I can see you have access to Q4 sales figures. What specific insights are you looking for? Would you like me to focus on revenue trends, customer segments, or product performance?",
        timestamp: "10:31 AM",
    },
    {
        id: "3",
        role: "user",
        content: "Show me the top performing products",
        timestamp: "10:32 AM",
    },
    {
        id: "4",
        role: "assistant",
        content:
            "Based on the Q4 data, here are your top 5 performing products:\n\n1. Premium Widget Pro - $284,500 revenue\n2. Smart Device X - $221,300 revenue\n3. Enterprise Suite - $198,700 revenue\n4. Mobile Companion - $156,400 revenue\n5. Cloud Storage Plus - $142,800 revenue\n\nThe Premium Widget Pro showed a 34% increase compared to Q3. Would you like me to break down any specific product's performance?",
        timestamp: "10:32 AM",
    },
]
