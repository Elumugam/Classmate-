"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "@/lib/apiConfig";

import FloatingChat from "@/components/FloatingChat";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    interface User {
        preferences?: {
            theme: string;
            accentColor: string;
            sidebarCollapsed: boolean;
        };
    }

    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        axios.get(`${API_URL}/auth/current_user`, { withCredentials: true })
            .then(res => {
                const u = res.data;
                setUser(u);

                // Apply Theme
                if (u?.preferences?.theme) {
                    const theme = u.preferences.theme;
                    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                }

                // Apply Accent Color
                if (u?.preferences?.accentColor) {
                    document.documentElement.style.setProperty('--primary', u.preferences.accentColor);
                    // Also set a soft version
                    document.documentElement.style.setProperty('--primary-soft', u.preferences.accentColor + '20'); // 20 hex = approx 12% opacity
                }
            })
            .catch(() => { });
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans">
            <Sidebar defaultCollapsed={user?.preferences?.sidebarCollapsed} />
            <div className="flex-1 flex flex-col md:ml-20 relative transition-all duration-300 ease-in-out">
                <Header user={user} />
                <main className="flex-1 p-8 pt-24 overflow-y-auto">
                    <div className="max-w-6xl mx-auto space-y-8">
                        {children}
                    </div>
                </main>
                <FloatingChat />
            </div>
        </div>
    );
}
