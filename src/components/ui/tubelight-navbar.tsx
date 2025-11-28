import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link, useLocation } from "react-router-dom"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
    name: string
    url: string
    icon: LucideIcon
}

interface NavBarProps {
    items: NavItem[]
    className?: string
}

export function NavBar({ items, className }: NavBarProps) {
    const location = useLocation()
    const [activeTab, setActiveTab] = useState(items[0].name)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768)
        }

        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    useEffect(() => {
        // Update active tab based on current path
        const currentItem = items.find(item =>
            location.pathname === item.url ||
            (item.url !== '/' && location.pathname.startsWith(item.url))
        )
        if (currentItem) {
            setActiveTab(currentItem.name)
        }
    }, [location, items])

    return (
        <div
            className={cn(
                "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:top-0 md:bottom-auto md:pt-6 w-full max-w-md md:max-w-none px-4 md:px-0",
                className,
            )}
        >
            <div className="flex items-center justify-between md:justify-center gap-1 md:gap-2 bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl py-1.5 px-2 rounded-2xl shadow-lg shadow-black/5 w-full md:w-auto">
                {items.map((item) => {
                    const Icon = item.icon
                    const isActive = activeTab === item.name

                    return (
                        <Link
                            key={item.name}
                            to={item.url}
                            onClick={() => setActiveTab(item.name)}
                            className={cn(
                                "relative cursor-pointer text-sm font-medium px-2 md:px-5 py-2 md:py-2.5 rounded-xl transition-all duration-200 flex-1 md:flex-none flex justify-center",
                                isActive
                                    ? "text-white"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            )}
                        >
                            <span className="hidden md:inline relative z-10">{item.name}</span>
                            <span className="md:hidden relative z-10">
                                <Icon size={22} strokeWidth={2.5} />
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-gradient-to-br from-brand-green to-emerald-600 rounded-xl shadow-md"
                                    initial={false}
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 30,
                                    }}
                                />
                            )}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
