import React from "react";
import { cn } from "@/lib/utils";

export default function AnimatedBeamMultipleOutputDemo({
    className,
}: {
    className?: string;
}) {
    return (
        <div
            className={cn(
                "relative flex h-[500px] w-full items-center justify-center overflow-hidden rounded-lg border bg-background p-10 md:shadow-xl",
                className
            )}
        >
            <div className="flex flex-col items-center justify-center gap-4 text-center">
                <p className="text-muted-foreground">Integrações (Demo)</p>
                <div className="flex gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="w-12 h-12 bg-green-500 rounded-full animate-pulse delay-75"></div>
                    <div className="w-12 h-12 bg-yellow-500 rounded-full animate-pulse delay-150"></div>
                </div>
            </div>
        </div>
    );
}
