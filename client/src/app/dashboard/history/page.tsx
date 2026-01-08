"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "@/lib/apiConfig";
import {
    Clock,
    BookOpen,
    Video,
    MessageSquare,
    Calendar,
    ChevronRight,
    Sparkles,
    TrendingUp,
    Filter
} from "lucide-react";
import { motion } from "framer-motion";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

export default function StudyHistoryPage() {
    const [history, setHistory] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/history`, { withCredentials: true });
                setHistory(res.data);
            } catch (err) {
                console.error("Failed to load history");
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const chartData = [
        { name: 'Mon', time: 45 },
        { name: 'Tue', time: 80 },
        { name: 'Wed', time: 65 },
        { name: 'Thu', time: 120 },
        { name: 'Fri', time: 90 },
        { name: 'Sat', time: 30 },
        { name: 'Sun', time: 50 },
    ];

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Study History</h1>
                    <p className="text-slate-500 font-medium">Clear insights into your learning journey.</p>
                </div>
                <div className="flex space-x-3">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition shadow-sm">
                        <Filter className="w-4 h-4" />
                        <span>Filter</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition shadow-sm">
                        <Calendar className="w-4 h-4" />
                        <span>This Week</span>
                    </button>
                </div>
            </header>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    label="Total Time"
                    value={`${Math.floor((history?.stats?.totalMinutes || 0) / 60)}h ${history?.stats?.totalMinutes % 60}m`}
                    icon={Clock}
                    color="text-indigo-600"
                    bg="bg-indigo-50"
                />
                <StatCard
                    label="Videos Watched"
                    value={history?.activities?.filter((a: any) => a.type === 'VIDEO').length || 0}
                    icon={Video}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                />
                <StatCard
                    label="PDFs Analyzed"
                    value={history?.activities?.filter((a: any) => a.type.startsWith('PDF')).length || 0}
                    icon={BookOpen}
                    color="text-blue-600"
                    bg="bg-blue-50"
                />
                <StatCard
                    label="AI Conversations"
                    value={history?.activities?.filter((a: any) => a.type === 'CHAT').length || 0}
                    icon={MessageSquare}
                    color="text-purple-600"
                    bg="bg-purple-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Timeline Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-6 rounded-2xl bg-white">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
                            Learning Consistency
                        </h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="time" radius={[6, 6, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 3 ? '#6366f1' : '#e0e7ff'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-800 px-1">Activity Feed</h3>
                        <div className="space-y-4">
                            {history?.activities?.length > 0 ? history.activities.map((item: any, i: number) => (
                                <ActivityCard key={item._id || i} item={item} />
                            )) : (
                                <div className="text-center p-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                                    No activity history yet. Start studying!
                                </div>
                            )}
                        </div>
                    </div>

                    {/* NEW SECTION: Viewed Videos */}
                    <div className="space-y-4 pt-4">
                        <h3 className="text-lg font-bold text-slate-800 px-1 flex items-center gap-2">
                            <Video className="w-5 h-5 text-emerald-600" /> Viewed Videos
                        </h3>
                        <div className="space-y-3">
                            {history?.activities?.filter((a: any) => a.type === 'VIDEO').length > 0 ? (
                                history.activities
                                    .filter((a: any) => a.type === 'VIDEO')
                                    .slice(0, 5)
                                    .map((item: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                                    <Video className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{item.title}</p>
                                                    <p className="text-xs text-slate-500">{item.topic || "General"}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-slate-400">{item.duration}m</p>
                                                <p className="text-[10px] text-slate-400">{new Date(item.timestamp).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-sm">
                                    No videos watched yet.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* NEW SECTION: Search History */}
                    <div className="space-y-4 pt-4">
                        <h3 className="text-lg font-bold text-slate-800 px-1 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-blue-600" /> Recent Searches
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {history?.activities?.filter((a: any) => a.type === 'SEARCH').length > 0 ? (
                                history.activities
                                    .filter((a: any) => a.type === 'SEARCH')
                                    .slice(0, 10)
                                    .map((item: any, i: number) => (
                                        <div key={i} className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-100 flex items-center gap-2">
                                            {item.topic}
                                            <span className="text-[10px] opacity-60 font-normal">{new Date(item.timestamp).toLocaleDateString()}</span>
                                        </div>
                                    ))
                            ) : (
                                <div className="w-full p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-sm">
                                    No search history yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* AI Insights Sidebar */}
                <div className="space-y-6">
                    <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none shadow-xl shadow-indigo-100">
                        <div className="flex items-center space-x-2 mb-6 text-indigo-100">
                            <Sparkles className="w-5 h-5 fill-indigo-100/20" />
                            <h3 className="font-bold">AI Progress Insights</h3>
                        </div>

                        {history?.insights ? (
                            <div className="space-y-6 divide-y divide-white/10">
                                <section className="pt-0">
                                    <p className="text-xs uppercase tracking-widest font-bold text-indigo-200 mb-2">Reflection</p>
                                    <p className="text-sm leading-relaxed">{history.insights.reflections}</p>
                                </section>
                                <section className="pt-4">
                                    <p className="text-xs uppercase tracking-widest font-bold text-indigo-200 mb-2">Focus Area</p>
                                    <p className="text-sm">{history.insights.focusArea}</p>
                                </section>
                                <section className="pt-4">
                                    <p className="text-xs uppercase tracking-widest font-bold text-indigo-200 mb-2">Suggestion</p>
                                    <p className="text-sm bg-white/10 p-3 rounded-lg border border-white/10 italic">
                                        "{history.insights.suggestion}"
                                    </p>
                                </section>
                            </div>
                        ) : (
                            <p className="text-indigo-100 text-sm italic">Generate more activity to unlock personalized AI insights.</p>
                        )}
                    </div>

                    <div className="glass-card p-6 rounded-2xl bg-white">
                        <h3 className="font-bold text-slate-800 mb-4">Subject Breakdown</h3>
                        <div className="space-y-3">
                            {[
                                { name: 'Mathematics', color: 'bg-blue-500', percent: 45 },
                                { name: 'Physics', color: 'bg-purple-500', percent: 30 },
                                { name: 'History', color: 'bg-orange-500', percent: 25 },
                            ].map(s => (
                                <div key={s.name} className="space-y-1">
                                    <div className="flex justify-between text-xs font-semibold mb-1">
                                        <span className="text-slate-600">{s.name}</span>
                                        <span className="text-slate-400">{s.percent}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                        <div className={`h-full ${s.color}`} style={{ width: `${s.percent}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color, bg }: any) {
    return (
        <div className="glass-card p-5 rounded-2xl bg-white border border-slate-100 flex items-center space-x-4 transition hover:shadow-md">
            <div className={`p-3 rounded-xl ${bg} ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</p>
                <h3 className="text-xl font-bold text-slate-800">{value}</h3>
            </div>
        </div>
    );
}

function ActivityCard({ item }: { item: any }) {
    const getIcon = () => {
        switch (item.type) {
            case 'VIDEO': return <Video className="w-5 h-5 text-emerald-600" />;
            case 'CHAT': return <MessageSquare className="w-5 h-5 text-indigo-600" />;
            case 'PDF_READ': return <BookOpen className="w-5 h-5 text-blue-600" />;
            default: return <Clock className="w-5 h-5 text-slate-400" />;
        }
    };

    const getBg = () => {
        switch (item.type) {
            case 'VIDEO': return 'bg-emerald-50';
            case 'CHAT': return 'bg-indigo-50';
            case 'PDF_READ': return 'bg-blue-50';
            default: return 'bg-slate-50';
        }
    };

    return (
        <motion.div
            whileHover={{ x: 3 }}
            className="glass-card p-4 rounded-xl bg-white flex items-center justify-between group cursor-pointer"
        >
            <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${getBg()} transition group-hover:scale-110`}>
                    {getIcon()}
                </div>
                <div>
                    <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                        {item.title || item.topic || 'Unnamed Activity'}
                    </h4>
                    <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-semibold">{item.subject}</span>
                        <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {item.duration}m spent
                        </span>
                        <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100" />
        </motion.div>
    );
}
