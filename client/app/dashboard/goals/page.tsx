"use client";

import { useState } from "react";
import { CheckCircle2, Trophy, TrendingUp, Plus, X } from "lucide-react";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { cn } from "@/lib/utils";

export default function GoalsPage() {
    const [goals, setGoals] = useState<{ id: number; title: string; subtitle: string; progress: number; color: string; daysLeft: number }[]>([]);

    const [showModal, setShowModal] = useState(false);
    const [newGoal, setNewGoal] = useState({ title: "", subtitle: "", progress: 0, color: "#6366f1", daysLeft: 30 });

    const addGoal = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGoal.title.trim()) return;
        setGoals([{ id: Date.now(), ...newGoal }, ...goals]);
        setNewGoal({ title: "", subtitle: "", progress: 0, color: "#6366f1", daysLeft: 30 });
        setShowModal(false);
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Goals & Progress</h1>
                    <p className="text-slate-500">Track your milestones and stay motivated.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md shadow-indigo-200 font-medium flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2" /> Set New Goal
                </button>
            </header>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">Set New Goal</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={addGoal} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Goal Title</label>
                                <input
                                    autoFocus
                                    type="text"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                    placeholder="e.g. Master React.js"
                                    value={newGoal.title}
                                    onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Subtitle / Description</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="e.g. Build 5 Projects"
                                    value={newGoal.subtitle}
                                    onChange={e => setNewGoal({ ...newGoal, subtitle: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Days Left</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newGoal.daysLeft}
                                        onChange={e => setNewGoal({ ...newGoal, daysLeft: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Color</label>
                                    <div className="flex space-x-2 py-2">
                                        {['#6366f1', '#10b981', '#f59e0b', '#ef4444'].map(c => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setNewGoal({ ...newGoal, color: c })}
                                                className={cn(
                                                    "w-6 h-6 rounded-full border-2",
                                                    newGoal.color === c ? "border-slate-800 scale-110" : "border-transparent"
                                                )}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 mt-2">
                                Create Goal
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {goals.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                    <Trophy className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <h4 className="font-bold text-slate-600 dark:text-slate-400">No goals set yet.</h4>
                    <p className="text-sm text-slate-400 mt-1 mb-6">Start by setting a clear target for your studies.</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition"
                    >
                        Create First Goal
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map(goal => (
                        <GoalCard
                            key={goal.id}
                            title={goal.title}
                            subtitle={goal.subtitle}
                            progress={goal.progress}
                            color={goal.color}
                            daysLeft={goal.daysLeft}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function GoalCard({ title, subtitle, progress, color, daysLeft }: any) {
    return (
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-64 bg-white relative overflow-hidden group hover:shadow-lg transition-all">
            <div className={`absolute top-0 left-0 w-1 h-full`} style={{ backgroundColor: color }}></div>

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{title}</h3>
                    <p className="text-slate-500 text-sm">{subtitle}</p>
                </div>
                <div className="w-12 h-12">
                    <CircularProgressbar
                        value={progress}
                        text={`${progress}%`}
                        styles={buildStyles({
                            pathColor: color,
                            textColor: color,
                            trailColor: '#f1f5f9',
                            textSize: '24px'
                        })}
                    />
                </div>
            </div>

            <div className="mt-auto">
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-2">
                    <span>Progress</span>
                    <span>{daysLeft} days left</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                        className="h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${progress}%`, backgroundColor: color }}
                    ></div>
                </div>
            </div>
        </div>
    );
}
