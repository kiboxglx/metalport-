import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { CircleMenu } from '../ui/circle-menu';
import { NavBar } from '../ui/tubelight-navbar';
import { NAV_ITEMS } from '../../config/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { userRole } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter nav items based on user role
  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (item.allowedRoles.length === 0) return true;
    return userRole && item.allowedRoles.includes(userRole);
  });

  // Transform for CircleMenu (mobile)
  const menuItems = filteredNavItems.map(item => ({
    label: item.label,
    icon: <item.icon size={16} />,
    href: item.path
  }));

  // Transform for NavBar (desktop)
  const navItems = filteredNavItems.map(item => ({
    name: item.label,
    url: item.path,
    icon: item.icon
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 relative flex flex-col">
      {/* Circle Menu - Mobile only (bottom right) */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <CircleMenu items={menuItems} />
      </div>

      {/* Navigation Bar - Desktop only */}
      <div className="hidden md:block">
        <NavBar items={navItems} />
      </div>

      {/* Main Content Area */}
      <motion.main
        className="flex-1 w-full px-4 md:px-8 lg:px-12 pt-6 pb-28 md:pt-32 md:pb-12 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.main>
    </div>
  );
};
