"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ServerDownPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted px-4">
            <Card className="max-w-md w-full border-muted/40 shadow-xl">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                    </div>

                    <CardTitle className="text-2xl font-semibold">
                        Service Temporarily Unavailable
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        We’re unable to reach our servers right now.
                        <br />
                        This is on our side — your data is safe.
                    </p>

                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={() => window.location.reload()}
                            className="w-full"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry Connection
                        </Button>

                        <Button
                            variant="secondary"
                            onClick={() => router.push("/")}
                            className="w-full"
                        >
                            <Home className="mr-2 h-4 w-4" />
                            Go to Home
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        If the problem persists, please try again later.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
