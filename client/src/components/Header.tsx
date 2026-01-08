"use client";

import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Header({ user }: { user?: any }) {
    const pathname = usePathname();
    const isResourcesPage = pathname === "/dashboard/resources";

    return (
        <header className="fixed top-0 right-0 left-0 md:left-20 group-hover/sidebar:md:left-64 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 z-40 px-8 flex items-center justify-between transition-all duration-300">
            <div className="flex items-center w-96">
                {!isResourcesPage && (
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search for notes, tasks, or videos..."
                            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-200 transition-all"
                        />
                    </div>
                )}
            </div>

            <div className="flex items-center space-x-6">
                <button className="relative text-slate-500 hover:text-indigo-600 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="flex items-center space-x-3 border-l border-slate-200 dark:border-slate-700 pl-6">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user?.name || "Student"}</p>
                        <p className="text-xs text-slate-500">Free Plan</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 overflow-hidden">
                        {user?.picture ? (
                            <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold">
                                {user?.name?.[0] || "S"}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
