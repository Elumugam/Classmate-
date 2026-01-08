"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    BookOpen,
    CheckSquare,
    MessageCircle,
    Target,
    Video,
    Clock,
    Settings,
    LogOut,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const items = [
    { label: "Dashboard", icon: Home, href: "/dashboard" },
    { label: "Tasks", icon: CheckSquare, href: "/dashboard/tasks" },
    { label: "AI Assistant", icon: MessageCircle, href: "/dashboard/study" },
    { label: "Resources", icon: Video, href: "/dashboard/resources" },
    { label: "Goals", icon: Target, href: "/dashboard/goals" },
    { label: "History", icon: Clock, href: "/dashboard/history" },
    { label: "Notes Export", icon: BookOpen, href: "/dashboard/notes" },
];

import { API_URL } from "@/lib/apiConfig";

export default function Sidebar({ defaultCollapsed = false }: { defaultCollapsed?: boolean }) {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(false);
    // Locked = Sidebar is STAYING open.
    // Collapsed = Sidebar is closed by default.
    // If user prefers "Condensed Sidebar" (sidebarCollapsed: true), then isLocked should be FALSE.
    // If user prefers "Expanded Sidebar" (sidebarCollapsed: false), then isLocked should be TRUE.
    const [isLocked, setIsLocked] = useState(!defaultCollapsed);
    const [isMobile, setIsMobile] = useState(false);

    // Initial sync
    useEffect(() => {
        setIsLocked(!defaultCollapsed);
    }, [defaultCollapsed]);

    // Width Calculation
    // Collapsed: w-20 (80px)
    // Expanded: w-64 (256px)

    const sidebarWidth = isExpanded || isLocked ? "w-64" : "w-20";

    return (
        <motion.aside
            initial={false}
            animate={{ width: isExpanded || isLocked ? 256 : 80 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onMouseEnter={() => !isLocked && setIsExpanded(true)}
            onMouseLeave={() => !isLocked && setIsExpanded(false)}
            className={cn(
                "fixed left-0 top-0 h-screen bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 z-[100] flex flex-col transition-shadow duration-300 hidden md:flex",
                (isExpanded || isLocked) ? "shadow-2xl shadow-indigo-500/10" : "shadow-sm"
            )}
        >
            <div className="h-20 flex items-center px-5 relative">
                <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
                    <img
                        src="/logo.png"
                        alt="ClassMates+"
                        style={{ height: '40px', width: 'auto' }}
                        className="flex-shrink-0"
                    />
                </Link>

                {/* Lock Toggle Button (Only visible on hover/expand) */}
                <AnimatePresence>
                    {(isExpanded || isLocked) && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => {
                                setIsLocked(!isLocked);
                                if (isLocked) setIsExpanded(false); // Auto collapse logic
                            }}
                            className="absolute right-4 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition"
                        >
                            {isLocked ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* 2. Navigation Items */}
            <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group flex items-center h-12 rounded-xl transition-all duration-200 relative",
                                isActive
                                    ? "bg-primary-soft text-primary"
                                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                            )}
                        >
                            {/* Active Indicator Bar */}
                            {isActive && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute left-0 w-1 h-8 bg-primary rounded-r-full my-auto top-0 bottom-0"
                                />
                            )}

                            {/* Icon Wrapper */}
                            <div className="w-14 flex-shrink-0 flex items-center justify-center">
                                <item.icon className={cn(
                                    "w-5 h-5 transition-colors",
                                    isActive ? "text-primary dark:text-primary" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"
                                )} />
                            </div>

                            {/* Text Label (Animated) */}
                            <motion.span
                                animate={{ opacity: isExpanded || isLocked ? 1 : 0, x: isExpanded || isLocked ? 0 : 10 }}
                                className={cn(
                                    "font-semibold text-sm whitespace-nowrap overflow-hidden transition-all",
                                    !isExpanded && !isLocked && "hidden w-0" // Hard hide to prevent layout shift
                                )}
                            >
                                {item.label}
                            </motion.span>

                            {/* Tooltip for Collapsed State */}
                            {(!isExpanded && !isLocked) && (
                                <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                                    {item.label}
                                    <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                                </div>
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* 3. Footer Options */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
                <Link
                    href="/dashboard/settings"
                    className="group flex items-center h-12 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative"
                >
                    <div className="w-14 flex-shrink-0 flex items-center justify-center">
                        <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                    </div>
                    <motion.span
                        animate={{ opacity: isExpanded || isLocked ? 1 : 0, width: isExpanded || isLocked ? "auto" : 0 }}
                        className={cn("font-medium text-sm whitespace-nowrap overflow-hidden", !isExpanded && !isLocked && "hidden")}
                    >
                        Settings
                    </motion.span>
                    {(!isExpanded && !isLocked) && (
                        <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            Settings
                        </div>
                    )}
                </Link>

                <a
                    href={`${API_URL}/auth/logout`}
                    className="group flex items-center h-12 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors relative"
                >
                    <div className="w-14 flex-shrink-0 flex items-center justify-center">
                        <LogOut className="w-5 h-5" />
                    </div>
                    <motion.span
                        animate={{ opacity: isExpanded || isLocked ? 1 : 0, width: isExpanded || isLocked ? "auto" : 0 }}
                        className={cn("font-medium text-sm whitespace-nowrap overflow-hidden", !isExpanded && !isLocked && "hidden")}
                    >
                        Logout
                    </motion.span>
                </a>
            </div>
        </motion.aside>
    );
}
