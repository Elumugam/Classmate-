import { useState, useEffect } from "react";
import axios from "axios";
import {
    Palette,
    Moon,
    Sun,
    Monitor,
    Check,
    User,
    Bell,
    Shield,
    Save,
    Layout
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { API_URL } from "@/lib/apiConfig";
import DashboardLayout from "@/components/DashboardLayout";

function SettingsContent() {
    const [preferences, setPreferences] = useState({
        theme: 'system',
        accentColor: '#6366f1',
        sidebarCollapsed: false
    });
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            const res = await axios.get(`${API_URL}/auth/current_user`, { withCredentials: true });
            if (res.data?.preferences) {
                setPreferences(res.data.preferences);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (preferences.theme) {
                if (preferences.theme === 'dark' || (preferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
            if (preferences.accentColor) {
                document.documentElement.style.setProperty('--primary', preferences.accentColor);
                document.documentElement.style.setProperty('--primary-soft', preferences.accentColor + '20');
            }

            await axios.put(`${API_URL}/api/user/preferences`, preferences, { withCredentials: true });
            setStatus("Preferences saved successfully!");
            setTimeout(() => setStatus(null), 3000);
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.response?.data?.details || "Failed to save preferences.";
            setStatus(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const colors = [
        { name: 'Indigo', value: '#6366f1' },
        { name: 'Emerald', value: '#10b981' },
        { name: 'Rose', value: '#f43f5e' },
        { name: 'Amber', value: '#f59e0b' },
        { name: 'Violet', value: '#8b5cf6' },
        { name: 'Sky', value: '#0ea5e9' },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Personalization</h1>
                <p className="text-slate-500 font-medium">Customize ClassMates+ to match your study style.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl font-bold transition">
                        <Palette className="w-5 h-5" /> Appearance
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl font-bold transition">
                        <User className="w-5 h-5" /> Profile
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl font-bold transition">
                        <Bell className="w-5 h-5" /> Notifications
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl font-bold transition">
                        <Shield className="w-5 h-5" /> Security
                    </button>
                </div>

                <div className="md:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <User className="w-5 h-5 text-indigo-600" />
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Profile</h3>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-indigo-100 border-4 border-white dark:border-slate-800 shadow-lg flex items-center justify-center text-2xl font-bold text-indigo-600">
                                S
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Student User</h4>
                                <p className="text-slate-500 font-medium">student@classmates.plus</p>
                                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wide mt-2">
                                    Free Plan
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Moon className="w-5 h-5 text-indigo-600" />
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Interface Theme</h3>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { id: 'light', icon: Sun, label: 'Light' },
                                { id: 'dark', icon: Moon, label: 'Dark' },
                                { id: 'system', icon: Monitor, label: 'System' },
                            ].map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setPreferences({ ...preferences, theme: t.id })}
                                    className={cn(
                                        "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                                        preferences.theme === t.id
                                            ? "bg-indigo-50/50 border-indigo-600 border-2"
                                            : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-200"
                                    )}
                                >
                                    <t.icon className={cn("w-6 h-6", preferences.theme === t.id ? "text-indigo-600" : "text-slate-400")} />
                                    <span className={cn("text-xs font-black uppercase tracking-widest", preferences.theme === t.id ? "text-indigo-600" : "text-slate-500")}>
                                        {t.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Palette className="w-5 h-5 text-indigo-600" />
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Accent Theme</h3>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            {colors.map((c) => (
                                <button
                                    key={c.value}
                                    onClick={() => setPreferences({ ...preferences, accentColor: c.value })}
                                    className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-lg",
                                        preferences.accentColor === c.value ? "ring-4 ring-offset-4 ring-slate-200 dark:ring-slate-700" : ""
                                    )}
                                    style={{ backgroundColor: c.value }}
                                >
                                    {preferences.accentColor === c.value && <Check className="w-6 h-6 text-white" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Layout className="w-5 h-5 text-indigo-600" />
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Layout Preferences</h3>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                            <div>
                                <p className="text-sm font-bold text-slate-800 dark:text-white">Condensed Sidebar</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Expand only on hover</p>
                            </div>
                            <button
                                onClick={() => setPreferences({ ...preferences, sidebarCollapsed: !preferences.sidebarCollapsed })}
                                className={cn("w-12 h-6 rounded-full relative transition", preferences.sidebarCollapsed ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600")}
                            >
                                <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", preferences.sidebarCollapsed ? "left-7" : "left-1")} />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <div className="text-sm font-bold text-emerald-600 animate-pulse">
                            {status}
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[20px] font-black uppercase tracking-[0.1em] text-sm hover:scale-105 transition shadow-2xl flex items-center gap-3"
                        >
                            {saving ? "Saving..." : <><Save className="w-5 h-5" /> Save Changes</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SettingsPage() {
    return (
        <DashboardLayout>
            <SettingsContent />
        </DashboardLayout>
    );
}
