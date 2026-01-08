"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Paperclip, Bot, User, Sparkles, FileText, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
    role: 'user' | 'assistant';
    content: string;
    type?: 'text' | 'suggestion';
    suggestions?: string[];
    sources?: string[];
    timestamp?: string;
    isError?: boolean;
}

export default function AIAssistantPage() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "Hello! I'm your personal AI study assistant. How can I help you learn today?",
            timestamp: "Just now"
        }
    ]);
    const [loading, setLoading] = useState(false);
    const [materialId, setMaterialId] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setUploading(true);
        setFileName(file.name);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axios.post("http://localhost:5000/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true
            });

            setMaterialId(res.data.materialId);

            // Add system message and suggestions
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: `I've analyzed **${file.name}**. What would you like to do?`,
                    type: 'suggestion',
                    suggestions: [
                        "Summarize this PDF",
                        "Generate 5 quiz questions",
                        "Explain key concepts",
                        "Create a revision plan"
                    ],
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);

        } catch (error) {
            console.error("Upload failed", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Sorry, I couldn't process that file. Please try again.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } finally {
            setUploading(false);
        }
    };

    const sendMessage = async (text: string = input) => {
        if (!text.trim()) return;

        const userMsg = text;
        const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Don't add user message again if it's a retry (logic: if passed text is same as input, clear input)
        // Ideally we differentiate retry, but for now simple flow:
        if (text === input) setInput("");

        setMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: userTimestamp }]);
        setLoading(true);

        try {
            const res = await axios.post("http://localhost:5000/api/chat", {
                message: userMsg,
                materialId,
                history: messages.filter(m => !m.type && !m.isError).map(m => ({ role: m.role, content: m.content }))
            });

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: res.data.answer,
                sources: res.data.sources,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } catch (err: any) {
            console.error(err);
            let errorMsg = "Sorry, I encountered an unknown error.";

            if (err.response) {
                // Server responded with error code
                const status = err.response.status;
                const data = err.response.data;

                if (status === 503) errorMsg = "The AI service is currently unavailable. Please try again later.";
                else if (status === 429) errorMsg = "You've sent too many requests. Please wait a moment.";
                else if (status === 401) errorMsg = "Authentication failed. Please refresh the page.";
                else if (data && data.error) errorMsg = `Error: ${data.error}`;
            } else if (err.request) {
                // No response received (Network Error)
                errorMsg = "Network error. Please check your internet connection.";
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: errorMsg,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isError: true
            }]);
        } finally {
            setLoading(false);
        }
    };

    // Retry handler
    const handleRetry = () => {
        // Find last user message
        const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
        if (lastUserMsg) {
            // Remove the error message and the last user message to "replay" it visually? 
            // Or just send it new? SImpler: Just send it.
            // But we don't want to duplicate the user message in the list.
            // Let's just setInput(lastUserMsg.content) for manual retry.
            setInput(lastUserMsg.content);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-indigo-100 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden relative">

            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md absolute top-0 left-0 right-0 z-10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white">AI Personal Assistant</h3>
                        <p className="text-xs text-slate-500 font-medium">Always here to help you study.</p>
                    </div>
                </div>
                {fileName && (
                    <div className="flex items-center px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold border border-indigo-100 dark:border-indigo-800/50">
                        <FileText className="w-3 h-3 mr-2" />
                        {fileName}
                    </div>
                )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 pt-20 pb-4 space-y-6 scroll-smooth">
                <AnimatePresence initial={false}>
                    {messages.map((m, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn("flex w-full", m.role === 'user' ? 'justify-end' : 'justify-start')}
                        >
                            <div className={cn("flex max-w-[85%] md:max-w-[75%]", m.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                                {/* Avatar */}
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                                    m.role === 'user' ? "ml-3 bg-indigo-600 text-white" : "mr-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
                                    m.isError && "bg-red-100 text-red-500"
                                )}>
                                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>

                                {/* Message Bubble */}
                                <div>
                                    <div className={cn(
                                        "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                                        m.role === 'user'
                                            ? "bg-indigo-600 text-white rounded-tr-none"
                                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none",
                                        m.isError && "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-300"
                                    )}>
                                        <p className="whitespace-pre-wrap">{m.content}</p>

                                        {/* Error Retry Action */}
                                        {m.isError && (
                                            <div className="mt-3 pt-2 border-t border-red-200 dark:border-red-800/50">
                                                <button
                                                    onClick={() => handleRetry()}
                                                    className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center"
                                                >
                                                    Tap to Refresh Input & Retry
                                                </button>
                                            </div>
                                        )}

                                        {/* Suggestions Chips */}
                                        {m.type === 'suggestion' && m.suggestions && (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {m.suggestions.map((s, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => sendMessage(s)}
                                                        className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition border border-indigo-100 dark:border-indigo-800"
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Sources */}
                                        {m.sources && (
                                            <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 text-xs text-slate-500 dark:text-slate-400">
                                                <p className="font-bold mb-1 flex items-center"><FileText className="w-3 h-3 mr-1" /> Sources:</p>
                                                <ul className="list-disc pl-4 space-y-1">
                                                    {m.sources.map((s, idx) => (
                                                        <li key={idx} className="italic line-clamp-1 opacity-80">{s}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-slate-400 mt-1 block px-1">
                                        {m.timestamp}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mr-3 mt-1 text-slate-600">
                            <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm flex items-center space-x-2">
                            <span className="text-sm text-slate-500 font-medium">AI is typing</span>
                            <div className="flex space-x-1">
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-100" />
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-200" />
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={bottomRef} className="h-4" />
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900 transition-all shadow-sm">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg,.txt"
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition disabled:opacity-50"
                        title="Upload File"
                    >
                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                    </button>

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder={uploading ? "Uploading file..." : "Ask anything or upload a document/image..."}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-200 placeholder-slate-400 text-sm font-medium"
                        disabled={loading || uploading}
                    />

                    <button
                        onClick={() => sendMessage()}
                        disabled={loading || !input.trim()}
                        className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-200 dark:shadow-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-4 h-4 ml-0.5" />
                    </button>
                </div>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-slate-400">ClassMates+ AI can make mistakes. Please verify important information.</p>
                </div>
            </div>
        </div>
    );
}
