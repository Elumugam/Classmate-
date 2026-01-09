import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Search, Youtube, SlidersHorizontal, ArrowRight, Loader2, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "@/lib/apiConfig";
import DashboardLayout from "@/components/DashboardLayout";

function ResourcesContent() {
    const [query, setQuery] = useState("Core Mathematics for Students");
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const search = async (q: string, isLoadMore = false) => {
        if (!isLoadMore) setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/videos?topic=${q}`, { withCredentials: true });
            if (isLoadMore) {
                setVideos(prev => [...prev, ...res.data]);
            } else {
                setVideos(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        search(query);
    }, []);

    const handleSearchClick = () => {
        setVideos([]);
        search(query);
    };

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="relative rounded-[40px] bg-slate-900 overflow-hidden mb-12 p-8 md:p-16 text-center shadow-2xl">
                <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="px-4 py-1.5 bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-white/10 backdrop-blur-md">
                            Knowledge Base
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black text-white mt-4 mb-2 tracking-tight">
                            Find anything <span className="text-indigo-400">visual.</span>
                        </h1>
                        <p className="text-slate-400 font-medium">Get curated high-quality study materials for any subject.</p>
                    </motion.div>

                    <div className="relative group max-w-xl mx-auto mt-8">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[24px] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative flex items-center bg-white dark:bg-slate-900 p-2 rounded-[22px] shadow-sm">
                            <div className="pl-4 pr-2">
                                <Search className="w-5 h-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                                className="w-full bg-transparent border-none focus:ring-0 outline-none text-slate-700 dark:text-white font-bold py-3"
                                placeholder="Search for physics, coding, biology..."
                            />
                            <button
                                onClick={handleSearchClick}
                                className="px-8 py-3 bg-indigo-600 text-white rounded-[16px] font-black hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 flex items-center"
                            >
                                Search
                            </button>
                        </div>
                    </div>
                </div>

                <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
            </div>

            <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <SlidersHorizontal className="w-5 h-5 text-indigo-500" />
                        Explore Video Library
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        LIVE RESULTS
                    </div>
                </div>

                <div className="space-y-6">
                    {loading ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white dark:bg-slate-900 rounded-[32px] p-4 flex flex-col md:flex-row gap-6 animate-pulse">
                                    <div className="w-full md:w-72 h-44 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
                                    <div className="flex-1 space-y-4 py-2">
                                        <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-full w-3/4" />
                                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-1/2" />
                                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-1/4 pt-8" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <AnimatePresence>
                            {videos.map((video, index) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    key={video.id}
                                    className="group bg-white dark:bg-slate-900 rounded-[32px] p-4 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all flex flex-col md:flex-row gap-6 lg:gap-8"
                                >
                                    <div className="relative w-full md:w-80 lg:w-96 flex-shrink-0 h-52 md:h-auto rounded-[24px] overflow-hidden group/thumb">
                                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition duration-700 group-hover/thumb:scale-110" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover/thumb:scale-100 transition duration-300">
                                                <Play className="w-6 h-6 text-indigo-600 fill-indigo-600 ml-1" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-md border border-white/20">
                                            {video.duration || "12:45"}
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between py-2">
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Youtube className="w-4 h-4 text-red-500" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{video.channel}</span>
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                                {video.title}
                                            </h3>
                                            <p className="text-sm text-slate-500 mt-3 line-clamp-2 font-medium">
                                                In this session, explore the fundamentals of {query.split(' ')[0]} and gain a deeper understanding of key concepts presented by {video.channel}.
                                            </p>
                                        </div>

                                        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex -space-x-2">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-950 bg-slate-100 overflow-hidden">
                                                            <img src={`https://i.pravatar.cc/100?u=${video.channel}${i}`} alt="user" />
                                                        </div>
                                                    ))}
                                                </div>
                                                <span className="text-xs font-bold text-slate-400">1.2k students watching</span>
                                            </div>

                                            <a
                                                href={`https://youtube.com/watch?v=${video.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-6 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition shadow-lg shadow-slate-200 dark:shadow-none flex items-center gap-2"
                                            >
                                                Watch on YouTube <ArrowRight className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {!loading && videos.length > 0 && (
                    <div className="py-10 text-center">
                        <button
                            onClick={() => search(query, true)}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-3xl font-black text-slate-700 dark:text-white hover:border-indigo-400 hover:text-indigo-600 transition group"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Load More"}
                        </button>
                    </div>
                )}

                {!loading && videos.length === 0 && (
                    <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-slate-200" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-800 dark:text-white">Start your discovery.</h4>
                        <p className="text-slate-500 mt-2 font-medium">Type a topic above to begin searching our educational library.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ResourcesPage() {
    return (
        <DashboardLayout>
            <ResourcesContent />
        </DashboardLayout>
    );
}
