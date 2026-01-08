"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
    CheckCircle,
    Circle,
    Calendar,
    Flag,
    Plus,
    Trash2,
    Clock,
    ChevronDown,
    ChevronUp,
    Layout,
    ListChecks,
    PieChart,
    BarChart3,
    Check,
    X,
    Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Task {
    _id: string;
    title: string;
    subject: string;
    description: string;
    startTime?: string;
    endTime?: string;
    priority: 'low' | 'medium' | 'high';
    color: string;
    reminders: boolean;
    completed: boolean;
}

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');

    // Form state
    const [newTask, setNewTask] = useState({
        title: "",
        subject: "",
        description: "",
        startTime: "",
        endTime: "",
        priority: "medium" as 'low' | 'medium' | 'high',
        color: "#6366f1",
        reminders: false,
        isTodo: false // Logic separation
    });

    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/tasks");
            setTasks(res.data);
        } catch (err) {
            console.error("Failed to fetch tasks", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.title.trim()) return;

        // If it's a To-Do, ensure startTime is explicitly undefined or empty string sent
        const payload = {
            ...newTask,
            startTime: newTask.isTodo ? "" : newTask.startTime
        };

        try {
            const res = await axios.post("http://localhost:5000/api/tasks", payload);
            setTasks([res.data, ...tasks]);
            setShowModal(false);
            setNewTask({
                title: "",
                subject: "",
                description: "",
                startTime: "",
                endTime: "",
                priority: "medium",
                color: "#6366f1",
                reminders: false,
                isTodo: false
            });
        } catch (err) {
            alert("Failed to create task");
        }
    };

    const toggleComplete = async (id: string, current: boolean) => {
        try {
            const res = await axios.put(`http://localhost:5000/api/tasks/${id}`, { completed: !current });
            setTasks(tasks.map(t => t._id === id ? res.data : t));
        } catch (err) {
            console.error(err);
        }
    };

    const deleteTask = async (id: string) => {
        try {
            await axios.delete(`http://localhost:5000/api/tasks/${id}`);
            setTasks(tasks.filter(t => t._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    // Derived Logic
    const scheduledTasks = tasks.filter(t => t.startTime && t.startTime.length > 0)
        .sort((a, b) => new Date(a.startTime!).getTime() - new Date(b.startTime!).getTime());

    const todoTasks = tasks.filter(t => !t.startTime || t.startTime.length === 0);

    // Filter implementation
    const getVisibleScheduled = () => {
        if (filter === 'completed') return scheduledTasks.filter(t => t.completed);
        if (filter === 'today') {
            const today = new Date().toDateString();
            return scheduledTasks.filter(t => new Date(t.startTime!).toDateString() === today);
        }
        if (filter === 'upcoming') return scheduledTasks.filter(t => new Date(t.startTime!).getTime() > Date.now());
        return scheduledTasks;
    };

    const visibleScheduled = getVisibleScheduled();

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Layout className="w-8 h-8 text-indigo-600" />
                        My Workload
                    </h1>
                    <p className="text-slate-500 font-medium">Manage your time and focus efficiently.</p>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="group flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-105"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    <span>New Task</span>
                </button>
            </div>

            {/* VISUALIZATIONS SECTION */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* 1. To-Do Progress */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-6">
                    <div className="relative w-20 h-20 flex-shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-100 dark:text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                            <path
                                className="text-emerald-500 transition-all duration-1000 ease-out"
                                strokeDasharray={`${Math.round((tasks.filter(t => t.completed).length / (tasks.length || 1)) * 100)}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-emerald-600 text-sm">
                            {Math.round((tasks.filter(t => t.completed).length / (tasks.length || 1)) * 100)}%
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Completion</h4>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">
                            {tasks.filter(t => t.completed).length} <span className="text-base text-slate-400 font-medium">/ {tasks.length} Done</span>
                        </p>
                    </div>
                </div>

                {/* 2. Task Distribution */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <PieChart className="w-4 h-4" /> Priority Breakdown
                    </h4>
                    <div className="flex w-full h-4 rounded-full overflow-hidden mb-2">
                        <div style={{ width: `${(tasks.filter(t => t.priority === 'high').length / tasks.length) * 100}%` }} className="bg-red-500 h-full" />
                        <div style={{ width: `${(tasks.filter(t => t.priority === 'medium').length / tasks.length) * 100}%` }} className="bg-orange-400 h-full" />
                        <div style={{ width: `${(tasks.filter(t => t.priority === 'low').length / tasks.length) * 100}%` }} className="bg-blue-400 h-full" />
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-slate-400">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> High</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-400" /> Med</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400" /> Low</span>
                    </div>
                </div>

                {/* 3. Upcoming Focus */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-[24px] shadow-lg shadow-indigo-200 dark:shadow-none text-white flex flex-col justify-between">
                    <div>
                        <h4 className="text-sm font-bold opacity-80 uppercase tracking-wider mb-1">Up Next</h4>
                        <p className="text-xl font-bold truncate">
                            {scheduledTasks.find(t => !t.completed && new Date(t.startTime!) > new Date())?.title || "No upcoming scheduled tasks"}
                        </p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                        <span className="text-xs font-medium bg-white/20 px-3 py-1 rounded-full">
                            {scheduledTasks.find(t => !t.completed && new Date(t.startTime!) > new Date())
                                ? new Date(scheduledTasks.find(t => !t.completed && new Date(t.startTime!) > new Date())!.startTime!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : "Relax"
                            }
                        </span>
                        <BarChart3 className="w-6 h-6 opacity-50" />
                    </div>
                </div>
            </section>

            {/* MAIN CONTENT SPLIT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT: SCHEDULED TIMELINE */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-500" /> Scheduled Tasks
                        </h3>
                        {/* Filter Tabs */}
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                            {['all', 'today'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f as any)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-md text-xs font-bold uppercase transition",
                                        filter === f ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 relative pl-4 border-l-2 border-slate-100 dark:border-slate-800">
                        {visibleScheduled.length === 0 && (
                            <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 ml-4">
                                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                <p>No scheduled tasks found.</p>
                            </div>
                        )}
                        {visibleScheduled.map((task) => (
                            <div key={task._id} className="relative ml-4">
                                {/* Timeline Node */}
                                <div
                                    className="absolute -left-[27px] top-6 w-5 h-5 rounded-full border-4 border-white dark:border-slate-950 flex items-center justify-center"
                                    style={{ backgroundColor: task.color }}
                                />

                                <motion.div
                                    layout
                                    className={cn(
                                        "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all group",
                                        task.completed && "opacity-50 grayscale"
                                    )}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                                    {task.subject || "General"}
                                                </span>
                                                <span className="text-xs font-bold text-slate-400">
                                                    {new Date(task.startTime!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <h4 className={cn("text-lg font-bold text-slate-800 dark:text-white", task.completed && "line-through")}>
                                                {task.title}
                                            </h4>
                                        </div>
                                        <button
                                            onClick={() => toggleComplete(task._id, task.completed)}
                                            className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center transition-colors border-2",
                                                task.completed ? "bg-green-500 border-green-500 text-white" : "border-slate-200 hover:border-indigo-500 text-transparent hover:text-indigo-500"
                                            )}
                                        >
                                            <Check className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: TO-DO POOL */}
                <div className="lg:col-span-5 space-y-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <ListChecks className="w-5 h-5 text-indigo-500" /> To-Do List
                    </h3>

                    <div className="bg-slate-50 dark:bg-slate-900 rounded-[32px] p-6 min-h-[500px]">
                        <div className="space-y-3">
                            {todoTasks.length === 0 && (
                                <div className="text-center py-10 opacity-40">
                                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                    <p className="font-bold text-slate-500">Pool is empty!</p>
                                </div>
                            )}
                            {todoTasks.map(task => (
                                <motion.div
                                    key={task._id}
                                    layout
                                    className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-3 group"
                                >
                                    <button
                                        onClick={() => toggleComplete(task._id, task.completed)}
                                        className={cn(
                                            "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0",
                                            task.completed ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 hover:border-indigo-400"
                                        )}
                                    >
                                        {task.completed && <Check className="w-3.5 h-3.5" />}
                                    </button>
                                    <span className={cn("flex-1 text-sm font-medium text-slate-700 dark:text-slate-200", task.completed && "line-through opacity-50")}>
                                        {task.title}
                                    </span>
                                    <button
                                        onClick={() => deleteTask(task._id)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>

                        {/* Quick Add Button inside container */}
                        <button
                            onClick={() => {
                                setNewTask({ ...newTask, isTodo: true });
                                setShowModal(true);
                            }}
                            className="w-full mt-6 py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 font-bold hover:border-indigo-500 hover:text-indigo-600 transition flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" /> Add Quick To-Do
                        </button>
                    </div>
                </div>
            </div>

            {/* CREATE MODAL */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-900/10">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                    {newTask.isTodo ? "Add To-Do Item" : "Schedule New Task"}
                                </h3>
                                <button onClick={() => setShowModal(false)} className="p-2 bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-900 transition">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateTask} className="p-8 space-y-6">
                                {/* Type Toggle */}
                                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setNewTask({ ...newTask, isTodo: false })}
                                        className={cn("flex-1 py-2 rounded-lg text-sm font-bold transition", !newTask.isTodo ? "bg-white shadow text-indigo-600" : "text-slate-500")}
                                    >
                                        Scheduled Task
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewTask({ ...newTask, isTodo: true })}
                                        className={cn("flex-1 py-2 rounded-lg text-sm font-bold transition", newTask.isTodo ? "bg-white shadow text-indigo-600" : "text-slate-500")}
                                    >
                                        To-Do Item
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Title</label>
                                        <input
                                            autoFocus
                                            className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Ex: Complete Chapter 4"
                                            value={newTask.title}
                                            onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                        />
                                    </div>

                                    {!newTask.isTodo && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Start Time</label>
                                                <input
                                                    type="datetime-local"
                                                    className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                                                    value={newTask.startTime}
                                                    onChange={e => setNewTask({ ...newTask, startTime: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Priority</label>
                                                <select
                                                    className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                                                    value={newTask.priority}
                                                    onChange={e => setNewTask({ ...newTask, priority: e.target.value as any })}
                                                >
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Subject / Tag</label>
                                        <input
                                            className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Ex: Mathematics"
                                            value={newTask.subject}
                                            onChange={e => setNewTask({ ...newTask, subject: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none transition transform hover:scale-[1.02]">
                                    {newTask.isTodo ? "Add to List" : "Schedule It"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatBar({ label, percentage, color }: { label: string, percentage: number, color: string }) {
    return (
        <div>
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                <span className="text-slate-400">{label}</span>
                <span className="text-slate-800 dark:text-white">{percentage}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    className={cn("h-full rounded-full", color)}
                />
            </div>
        </div>
    );
}
