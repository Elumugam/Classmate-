import { useState } from "react";
import { Download, FileText, ChevronRight, Eye, RefreshCw } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";

function NotesExportContent() {
    const [history, setHistory] = useState<any[]>([
        {
            id: 1, title: "Calculus Ch 3 Discussion", date: "2024-01-08", messages: [
                { role: "user", content: "Explain derivatives of trigonometric functions." },
                { role: "assistant", content: "The derivative of sin(x) is cos(x), and the derivative of cos(x) is -sin(x). For tan(x), it's sec^2(x)..." }
            ]
        },
        {
            id: 2, title: "History: WW2 Timeline", date: "2024-01-07", messages: [
                { role: "user", content: "What were the main causes of WW2?" },
                { role: "assistant", content: "The main causes included the Treaty of Versailles, the rise of totalitarian regimes, and the failure of the League of Nations..." }
            ]
        }
    ]);

    const [selectedHistory, setSelectedHistory] = useState<any>(null);
    const [generating, setGenerating] = useState(false);

    const exportToPDF = () => {
        if (!selectedHistory) return;
        setGenerating(true);

        const doc = new jsPDF();

        doc.setFontSize(22);
        doc.text("ClassMates+ Study Notes", 20, 20);
        doc.setFontSize(16);
        doc.text(selectedHistory.title, 20, 30);
        doc.setFontSize(12);
        doc.text(`Date: ${selectedHistory.date}`, 20, 40);

        doc.setLineWidth(0.5);
        doc.line(20, 45, 190, 45);

        let y = 55;
        selectedHistory.messages.forEach((msg: any) => {
            doc.setFont("helvetica", "bold");
            doc.text(msg.role === "user" ? "Student:" : "AI Assistant:", 20, y);
            y += 7;
            doc.setFont("helvetica", "normal");
            const textLines = doc.splitTextToSize(msg.content, 160);
            doc.text(textLines, 25, y);
            y += (textLines.length * 7) + 10;

            if (y > 270) {
                doc.addPage();
                y = 20;
            }
        });

        doc.save(`${selectedHistory.title.replace(/\s+/g, '_')}_Notes.pdf`);
        setGenerating(false);
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Notes to PDF Export</h1>
                <p className="text-slate-500">Convert your chat history into high-quality study documents.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
                <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-2">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-300 px-1">Recent Sessions</h3>
                    {history.map((session) => (
                        <button
                            key={session.id}
                            onClick={() => setSelectedHistory(session)}
                            className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group
                                ${selectedHistory?.id === session.id
                                    ? "bg-indigo-50 border-indigo-200 border-2"
                                    : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 shadow-sm"}`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-white text-sm truncate max-w-[150px]">{session.title}</p>
                                    <p className="text-xs text-slate-400">{session.date}</p>
                                </div>
                            </div>
                            <ChevronRight className={`w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors ${selectedHistory?.id === session.id ? 'translate-x-1 text-indigo-500' : ''}`} />
                        </button>
                    ))}

                    <button className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-indigo-500 hover:border-indigo-200 transition-all flex items-center justify-center text-sm font-medium">
                        <RefreshCw className="w-4 h-4 mr-2" /> Sync Recent Chats
                    </button>
                </div>

                <div className="lg:col-span-2 flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl shadow-indigo-100/20">
                    {selectedHistory ? (
                        <>
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                                <div className="flex items-center space-x-2">
                                    <Eye className="w-4 h-4 text-indigo-600" />
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Preview Layout</span>
                                </div>
                                <button
                                    onClick={exportToPDF}
                                    disabled={generating}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 flex items-center transition-all active:scale-95"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    {generating ? "Exporting..." : "Download PDF"}
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50 dark:bg-slate-950 font-serif">
                                <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-10 shadow-sm border border-slate-100 dark:border-slate-800">
                                    <div className="mb-8 pb-4 border-b-2 border-slate-100">
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{selectedHistory.title}</h2>
                                        <p className="text-sm text-slate-400">ClassMates+ Captured Notes | {selectedHistory.date}</p>
                                    </div>

                                    <div className="space-y-6">
                                        {selectedHistory.messages.map((msg: any, i: number) => (
                                            <div key={i} className="space-y-2">
                                                <p className="text-xs uppercase font-bold tracking-widest text-indigo-600">
                                                    {msg.role === "user" ? "Student" : "ClassMates+ AI"}
                                                </p>
                                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                                                    {msg.content}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-4">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300">
                                <FileText className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">No Selection</h3>
                                <p className="text-slate-500 max-w-xs mx-auto">Select a study session from the left to preview and export as a PDF.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function NotesExportPage() {
    return (
        <DashboardLayout>
            <NotesExportContent />
        </DashboardLayout>
    );
}
