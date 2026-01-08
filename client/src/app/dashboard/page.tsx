"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
    Sparkles,
    Clock,
    Target,
    Flame,
    ArrowRight,
    Video,
    FileText,
    BookOpen,
    Calendar,
    MessageCircle,
    Upload,
    CheckCircle2,
    ListTodo,
    ChevronRight,
    TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { API_URL } from "@/lib/apiConfig";

interface Task {
    _id: string;
    title: string;
    subject: string;
    startTime?: string;
    completed: boolean;
    color: string;
}

export default function DashboardPage() {
    const [greeting, setGreeting] = useState("Good Morning");
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 18) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");

        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [tasksRes, userRes] = await Promise.all([
                axios.get(`${API_URL}/api/tasks`),
                axios.get(`${API_URL}/auth/current_user`, { withCredentials: true })
            ]);
            setTasks(tasksRes.data);
            setUser(userRes.data);
        } catch (err) {
            console.error("Dashboard fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    // Derived Data
    const today = new Date().toDateString();
    const todaysTasks = tasks.filter(t => t.startTime && new Date(t.startTime).toDateString() === today);
    const pendingTasks = tasks.filter(t => !t.completed);
    const completedTasksCount = tasks.filter(t => t.completed).length;

    const nextTask = todaysTasks.filter(t => !t.completed && new Date(t.startTime!) > new Date())[0];

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const tips = [
        "Great time to catch up on some reading or explore Resources!",
        "Why not challenge yourself with a practice quiz?",
        "Consistent spacing effect is key to long-term memory.",
        "Take a break, hydrate, and come back stronger!",
        "Review your goals to check your progress."
    ];

    // Use a stable value during hydration (empty or first tip)
    const [randomTip, setRandomTip] = useState(tips[0]);

    useEffect(() => {
        setRandomTip(tips[Math.floor(Math.random() * tips.length)]);
    }, []);

    const aiInsight = todaysTasks.length > 0
        ? `You have ${todaysTasks.length} tasks today. Focus on ${todaysTasks[0].subject || todaysTasks[0].title} first to stay ahead!`
        : `Your schedule is clear today. ${randomTip}`;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">

            {/* 1. WELCOME & AI INSIGHT */}
            <section className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
                            {greeting}, {user?.name?.split(' ')[0] || "Student"}! 👋
                        </h1>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-3 px-5 py-3 bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm shadow-indigo-100/50"
                        >
                            <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
                            <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                                {aiInsight}
                            </p>
                        </motion.div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Growth Points</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-white">1,240 XP</p>
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. PRODUCTIVITY STATS */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatBox
                    label="Today's Tasks"
                    value={todaysTasks.length.toString()}
                    sub={todaysTasks.filter(t => t.completed).length + " completed"}
                    icon={ListTodo}
                    color="text-blue-600 bg-blue-50"
                />
                <StatBox
                    label="Active Streak"
                    value="5 Days"
                    sub="Don't break it!"
                    icon={Flame}
                    color="text-orange-600 bg-orange-50"
                />
                <StatBox
                    label="Study Time"
                    value="2h 40m"
                    sub="80% of daily goal"
                    icon={Clock}
                    color="text-indigo-600 bg-indigo-50"
                />
                <StatBox
                    label="Next Session"
                    value={nextTask ? nextTask.title.substring(0, 12) + "..." : "None"}
                    sub={nextTask ? new Date(nextTask.startTime!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Free time"}
                    icon={Calendar}
                    color="text-emerald-600 bg-emerald-50"
                />
            </section>

            {/* 3. CORE INTERACTIVE SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* TIMETABLE PREVIEW (Derived from Tasks) */}
                <section className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-full">
                    <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Today's Schedule</h3>
                        </div>
                        <Link href="/dashboard/tasks" className="text-sm font-bold text-indigo-600 hover:gap-2 flex items-center transition-all">
                            Go to Schedule <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>

                    <div className="p-8">
                        {todaysTasks.length === 0 ? (
                            <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                                <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                <h4 className="font-bold text-slate-600 dark:text-slate-400">Nothing scheduled for today yet.</h4>
                                <p className="text-sm text-slate-400 mt-1 mb-6">Start your day by adding a few tasks.</p>
                                <Link href="/dashboard/tasks" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition">Add First Task</Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {todaysTasks.map((task) => (
                                    <div key={task._id} className="flex items-center gap-6 group">
                                        <div className="w-20 text-xs font-black text-slate-400 uppercase tracking-widest text-right">
                                            {new Date(task.startTime!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="relative flex-1 py-1">
                                            {/* Connector line */}
                                            <div className="absolute left-[-17px] top-6 bottom-[-24px] w-0.5 bg-slate-100 dark:bg-slate-800 group-last:hidden" />
                                            <div className="absolute left-[-22px] top-4 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-500 z-10" />

                                            <div
                                                className={cn(
                                                    "p-5 rounded-2xl border transition-all flex items-center justify-between",
                                                    task.completed ? "bg-slate-50 dark:bg-slate-800/50 border-slate-100 opacity-60" : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1"
                                                )}
                                                style={{ borderLeftColor: task.color, borderLeftWidth: '4px' }}
                                            >
                                                <div>
                                                    <h4 className={cn("font-bold text-slate-800 dark:text-white", task.completed && "line-through text-slate-500")}>
                                                        {task.title}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">{task.subject}</p>
                                                </div>
                                                {task.completed ? (
                                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* TASK SUMMARY & AI HELP */}
                <aside className="lg:col-span-4 space-y-8">
                    {/* TASK SUMMARY CARD */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-6">Task Summary</h3>
                            <div className="space-y-6">
                                <SummaryItem label="Remaining Tasks" value={pendingTasks.length.toString()} />
                                <SummaryItem label="Completion Rate" value={Math.round((completedTasksCount / (tasks.length || 1)) * 100) + "%"} />

                                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden mt-2">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(completedTasksCount / (tasks.length || 1)) * 100}%` }}
                                        className="h-full bg-white rounded-full"
                                    />
                                </div>
                            </div>

                            <Link href="/dashboard/study" className="mt-8 w-full flex items-center justify-center p-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl font-bold transition">
                                <Sparkles className="w-5 h-5 mr-2" /> Ask AI to Optimize
                            </Link>
                        </div>

                        {/* Blob */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                    </div>

                    {/* AI ASSISTANT QUICK BOX */}
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                        <h4 className="font-bold text-slate-800 dark:text-white text-lg">Talk to AI Tutor</h4>
                        <p className="text-sm text-slate-500 mt-2 mb-6 leading-relaxed">Need help with your homework or a summary of your notes?</p>
                        <Link href="/dashboard/study" className="block w-full py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl font-bold text-slate-700 dark:text-white transition">
                            Launch Assistant
                        </Link>
                    </div>
                </aside>
            </div>
        </div>
    );
}

function StatBox({ label, value, sub, icon: Icon, color }: any) {
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between">
                <div className={cn("p-3 rounded-2xl", color)}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <div className="mt-4">
                <h4 className="text-3xl font-black text-slate-800 dark:text-white">{value}</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</p>
                <p className="text-xs text-slate-400 mt-2 font-medium">{sub}</p>
            </div>
        </div>
    );
}

function SummaryItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-end">
            <span className="text-sm font-bold text-indigo-100 opacity-80">{label}</span>
            <span className="text-xl font-black text-white">{value}</span>
        </div>
    )
}
