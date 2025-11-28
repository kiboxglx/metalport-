import React from "react";
import { UserCog, Shield, Lock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsDemo({ className }: { className?: string }) {
    return (
        <div className={cn("flex flex-col gap-3 p-6 h-full justify-center", className)}>
            <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-100 shadow-sm">
                    <div className="p-2 bg-blue-50 rounded-md">
                        <Users className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex-1">
                        <div className="h-2 w-24 bg-gray-200 rounded mb-1"></div>
                        <div className="h-1.5 w-16 bg-gray-100 rounded"></div>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-100 shadow-sm opacity-80">
                    <div className="p-2 bg-purple-50 rounded-md">
                        <Shield className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="flex-1">
                        <div className="h-2 w-20 bg-gray-200 rounded mb-1"></div>
                        <div className="h-1.5 w-12 bg-gray-100 rounded"></div>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-100 shadow-sm opacity-60">
                    <div className="p-2 bg-orange-50 rounded-md">
                        <Lock className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="flex-1">
                        <div className="h-2 w-28 bg-gray-200 rounded mb-1"></div>
                        <div className="h-1.5 w-20 bg-gray-100 rounded"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
