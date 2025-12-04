"use client";

import * as React from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface BottomSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
    title?: string;
    description?: string;
    snapPoints?: number[]; // Percentages of screen height
    defaultSnap?: number; // Index of default snap point
    className?: string;
}

export function BottomSheet({
    open,
    onOpenChange,
    children,
    title,
    description,
    snapPoints = [90, 50],
    defaultSnap = 0,
    className,
}: BottomSheetProps) {
    const [currentSnap, setCurrentSnap] = React.useState(defaultSnap);
    const sheetRef = React.useRef<HTMLDivElement>(null);

    const handleDragEnd = (_: any, info: PanInfo) => {
        const velocity = info.velocity.y;
        const offset = info.offset.y;

        // Close if dragged down significantly
        if (offset > 100 || velocity > 500) {
            onOpenChange(false);
            return;
        }

        // Snap to nearest point
        if (snapPoints.length > 1) {
            if (offset < -50) {
                setCurrentSnap(Math.max(0, currentSnap - 1));
            } else if (offset > 50) {
                setCurrentSnap(Math.min(snapPoints.length - 1, currentSnap + 1));
            }
        }
    };

    const snapHeight = snapPoints[currentSnap];

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => onOpenChange(false)}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Sheet */}
                    <motion.div
                        ref={sheetRef}
                        initial={{ y: "100%" }}
                        animate={{ y: `${100 - snapHeight}%` }}
                        exit={{ y: "100%" }}
                        transition={{
                            type: "spring",
                            damping: 30,
                            stiffness: 300,
                        }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.2 }}
                        onDragEnd={handleDragEnd}
                        className={cn(
                            "fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-3xl bg-background shadow-2xl",
                            "max-h-[95vh] overflow-hidden",
                            className
                        )}
                    >
                        {/* Drag Handle */}
                        <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
                            <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
                        </div>

                        {/* Header */}
                        {(title || description) && (
                            <div className="px-6 pb-4 border-b border-border">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        {title && (
                                            <h2 className="text-xl font-semibold text-foreground">
                                                {title}
                                            </h2>
                                        )}
                                        {description && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {description}
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onOpenChange(false)}
                                        className="ml-2 -mt-1"
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

interface BottomSheetFooterProps {
    children: React.ReactNode;
    className?: string;
}

export function BottomSheetFooter({
    children,
    className,
}: BottomSheetFooterProps) {
    return (
        <div
            className={cn(
                "sticky bottom-0 px-6 py-4 bg-background border-t border-border",
                "flex gap-2 flex-col sm:flex-row",
                className
            )}
        >
            {children}
        </div>
    );
}
