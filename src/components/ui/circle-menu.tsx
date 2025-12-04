'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingMenuProps {
    items: Array<{ label: string; icon: React.ReactNode; href: string }>;
}

export const CircleMenu = ({ items }: FloatingMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            drag
            dragMomentum={false}
            dragElastic={0.1}
            dragConstraints={{
                top: -window.innerHeight + 200,
                left: -window.innerWidth + 200,
                right: 100,
                bottom: 100
            }}
            className="fixed z-50 cursor-grab active:cursor-grabbing"
            whileTap={{ scale: 0.95 }}
        >
            {/* Menu Items */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-20 right-0 flex flex-col gap-3 pointer-events-none"
                    >
                        {items.map((item, index) => (
                            <motion.a
                                key={item.href}
                                href={item.href}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all group pointer-events-auto"
                                whileHover={{ scale: 1.05, x: -5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    {item.icon}
                                </div>
                                <span className="text-sm font-medium text-foreground whitespace-nowrap pr-2">
                                    {item.label}
                                </span>
                            </motion.a>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main FAB Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300",
                    "bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
                    "text-white hover:shadow-primary/50",
                    isOpen && "rotate-90"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <X size={24} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="menu"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Menu size={24} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Ripple Effect on Click */}
            {isOpen && (
                <motion.div
                    className="absolute inset-0 rounded-full bg-primary/20 -z-10"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                />
            )}
        </motion.div>
    );
};
