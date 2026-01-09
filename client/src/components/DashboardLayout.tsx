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
        const isDev = process.env.NODE_ENV === "development";

        axios.get(`${API_URL}/auth/current_user`, { withCredentials: true })
            .then(res => {
                const u = res.data;
                if (!u || Object.keys(u).length === 0) {
                    if (isDev) {
                        console.log("Dev Mode: Mocking user for localhost.");
                        setUser({ preferences: { theme: 'light', accentColor: '#6366f1', sidebarCollapsed: false } });
                        return;
                    }
                    console.warn("User not authenticated, redirecting to login.");
                    window.location.href = "/";
                    return;
                }

                setUser(u);

                if (u?.preferences?.theme) {
                    const theme = u.preferences.theme;
                    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                }

                if (u?.preferences?.accentColor) {
                    document.documentElement.style.setProperty('--primary', u.preferences.accentColor);
                    document.documentElement.style.setProperty('--primary-soft', u.preferences.accentColor + '20');
                }
            })
            .catch((err) => {
                console.error("Auth check failed:", err);
                if (isDev) {
                    console.log("Dev Mode: Auth failed, but bypassing redirect and providing mock user.");
                    setUser({ preferences: { theme: 'light', accentColor: '#6366f1', sidebarCollapsed: false } });
                } else {
                    window.location.href = "/";
                }
            });
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
