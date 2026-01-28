"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Box,
    Workflow,
    ShieldCheck,
    Database,
    FileCode,
    Braces,
    ArrowRight,
} from "lucide-react"

interface ParsedItem {
    name: string
    type: string
    dependencies?: string[]
    methods?: string[]
}

export function ParsingStats() {
    const modules: ParsedItem[] = [
        { name: "AppModule", type: "Root", dependencies: ["UsersModule", "AuthModule", "ProductsModule"] },
        { name: "UsersModule", type: "Feature", dependencies: ["TypeOrmModule"] },
        { name: "AuthModule", type: "Feature", dependencies: ["JwtModule", "PassportModule"] },
        { name: "ProductsModule", type: "Feature", dependencies: ["TypeOrmModule", "CacheModule"] },
        { name: "OrdersModule", type: "Feature", dependencies: ["TypeOrmModule", "UsersModule"] },
    ]

    const controllers: ParsedItem[] = [
        { name: "UsersController", type: "REST", methods: ["findAll", "findOne", "create", "update", "delete"] },
        { name: "AuthController", type: "REST", methods: ["login", "register", "refresh", "logout"] },
        { name: "ProductsController", type: "REST", methods: ["findAll", "findOne", "create", "update"] },
    ]

    const services: ParsedItem[] = [
        { name: "UsersService", type: "Provider", methods: ["findAll", "findById", "create", "update", "delete"] },
        { name: "AuthService", type: "Provider", methods: ["validateUser", "login", "createTokens"] },
        { name: "ProductsService", type: "Provider", methods: ["findAll", "findById", "create", "update"] },
    ]

    const stats = [
        { label: "Modules", value: 12, icon: <Box className="h-4 w-4" /> },
        { label: "Controllers", value: 8, icon: <Workflow className="h-4 w-4" /> },
        { label: "Services", value: 15, icon: <ShieldCheck className="h-4 w-4" /> },
        { label: "Entities", value: 10, icon: <Database className="h-4 w-4" /> },
        { label: "DTOs", value: 24, icon: <Braces className="h-4 w-4" /> },
        { label: "Total Files", value: 67, icon: <FileCode className="h-4 w-4" /> },
    ]

    return (
        <Card className="bg-card border-border">
            <CardHeader className="pb-4">
                <CardTitle className="text-foreground">AST Parsing Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="flex flex-col items-center justify-center p-3 rounded-lg bg-secondary/50"
                        >
                            <div className="p-2 rounded-md bg-primary/20 text-primary mb-2">{stat.icon}</div>
                            <span className="text-xl font-semibold text-foreground">{stat.value}</span>
                            <span className="text-xs text-muted-foreground">{stat.label}</span>
                        </div>
                    ))}
                </div>

                {/* Tabs for detailed view */}
                <Tabs defaultValue="modules" className="w-full">
                    <TabsList className="w-full justify-start bg-secondary">
                        <TabsTrigger value="modules" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            Modules
                        </TabsTrigger>
                        <TabsTrigger value="controllers" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            Controllers
                        </TabsTrigger>
                        <TabsTrigger value="services" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            Services
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="modules" className="mt-4">
                        <ScrollArea className="h-[200px]">
                            <div className="space-y-2">
                                {modules.map((module) => (
                                    <div
                                        key={module.name}
                                        className="p-3 rounded-lg bg-secondary/30 border border-border"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-foreground font-mono">
                                                {module.name}
                                            </span>
                                            <Badge variant="outline" className="text-xs">
                                                {module.type}
                                            </Badge>
                                        </div>
                                        {module.dependencies && (
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs text-muted-foreground">Imports:</span>
                                                {module.dependencies.map((dep) => (
                                                    <Badge
                                                        key={dep}
                                                        variant="secondary"
                                                        className="text-xs bg-secondary text-secondary-foreground"
                                                    >
                                                        {dep}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="controllers" className="mt-4">
                        <ScrollArea className="h-[200px]">
                            <div className="space-y-2">
                                {controllers.map((controller) => (
                                    <div
                                        key={controller.name}
                                        className="p-3 rounded-lg bg-secondary/30 border border-border"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-foreground font-mono">
                                                {controller.name}
                                            </span>
                                            <Badge variant="outline" className="text-xs">
                                                {controller.type}
                                            </Badge>
                                        </div>
                                        {controller.methods && (
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs text-muted-foreground">Methods:</span>
                                                {controller.methods.map((method) => (
                                                    <Badge
                                                        key={method}
                                                        variant="secondary"
                                                        className="text-xs bg-accent/20 text-accent font-mono"
                                                    >
                                                        {method}()
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="services" className="mt-4">
                        <ScrollArea className="h-[200px]">
                            <div className="space-y-2">
                                {services.map((service) => (
                                    <div
                                        key={service.name}
                                        className="p-3 rounded-lg bg-secondary/30 border border-border"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-foreground font-mono">
                                                {service.name}
                                            </span>
                                            <Badge variant="outline" className="text-xs">
                                                {service.type}
                                            </Badge>
                                        </div>
                                        {service.methods && (
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs text-muted-foreground">Methods:</span>
                                                {service.methods.map((method) => (
                                                    <Badge
                                                        key={method}
                                                        variant="secondary"
                                                        className="text-xs bg-accent/20 text-accent font-mono"
                                                    >
                                                        {method}()
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
