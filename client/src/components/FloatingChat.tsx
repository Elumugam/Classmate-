"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Paperclip, Loader2, Maximize2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";

export default function FloatingChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<{ role: string, content: string }[]>([
        { role: 'assistant', content: "Hi there! I'm your quick helper. Need to ask something fast?" }
    ]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { pathname } = useRouter();

    useEffect(() => {
        if (isOpen) {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    // HIDE ON AI ASSISTANT PAGE and LANDING PAGE
    if (pathname === '/dashboard/study' || pathname === '/') return null;

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            // Using the same chat endpoint but without materialID context initially
            // Ideally we'd have a 'general chat' endpoint or pass null
            // For now, we reuse the endpoint. If it fails without materialId, we handle it.
            // Assuming the basic LLM chat works or we mock it for 'quick help' if no global chat exists.

            // SIMULATED RESPONSE for "Floating" ease since backend might need pdf context
            // In a real app, this would hit a /api/chat/general endpoint
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: "I can help with that! For a deep dive, please switch to the full AI Assistant page."
                }]);
                setLoading(false);
            }, 1000);

        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Oops, something went wrong." }]);
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="pointer-events-auto mb-4 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[500px]"
                    >
                        {/* Header */}
                        <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <span className="font-bold text-sm">ClassMates+ Quick AI</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <a href="/dashboard/study" className="p-1.5 hover:bg-white/20 rounded-lg transition" title="Open Full Assistant">
                                    <Maximize2 className="w-4 h-4" />
                                </a>
                                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50 min-h-[300px]">
                            {messages.map((m, i) => (
                                <div key={i} className={cn("flex", m.role === 'user' ? 'justify-end' : 'justify-start')}>
                                    <div className={cn(
                                        "max-w-[85%] px-3 py-2 rounded-2xl text-sm shadow-sm",
                                        m.role === 'user'
                                            ? "bg-indigo-600 text-white rounded-br-sm"
                                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-sm"
                                    )}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded-2xl rounded-bl-sm border border-slate-100 dark:border-slate-700">
                                        <div className="flex space-x-1">
                                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-100" />
                                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-200" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2">
                            <input
                                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
                                placeholder="Ask quickly..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || loading}
                                className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="pointer-events-auto group relative flex items-center justify-center w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-500/30 hover:scale-110 hover:shadow-2xl hover:bg-indigo-700 transition-all duration-300"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}

                {/* Tooltip */}
                {!isOpen && (
                    <span className="absolute right-full mr-4 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Ask ClassMates+ AI
                    </span>
                )}
            </button>
        </div>
    );
}
