import React, { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExpandableTabs } from "./expandable-tabs"

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
    const navigate = useNavigate()
    const [activeIndex, setActiveIndex] = useState<number | null>(null)

    useEffect(() => {
        // Update active tab based on current path
        const currentIndex = items.findIndex(item =>
            location.pathname === item.url ||
            (item.url !== '/' && location.pathname.startsWith(item.url))
        )
        if (currentIndex !== -1) {
            setActiveIndex(currentIndex)
        }
    }, [location, items])

    // Transform items for ExpandableTabs
    const tabs = items.map(item => ({
        title: item.name,
        icon: item.icon
    }))

    const handleTabChange = (index: number | null) => {
        if (index !== null && items[index]) {
            setActiveIndex(index)
            navigate(items[index].url)
        }
    }

    return (
        <div
            className={cn(
                "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:top-0 md:bottom-auto md:pt-6 w-full max-w-md md:max-w-none px-4 md:px-0 flex justify-center",
                className,
            )}
        >
            <ExpandableTabs
                tabs={tabs}
                activeIndex={activeIndex}
                onChange={handleTabChange}
                activeColor="text-white"
                className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl border-gray-200/50 dark:border-gray-700/50"
            />
        </div>
    )
}
