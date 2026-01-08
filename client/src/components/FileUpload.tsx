"use client";

import { useState } from "react";
import axios from "axios";
import { Upload, FileText, Check, Loader2 } from "lucide-react";
import { API_URL } from "@/lib/apiConfig";

export default function FileUpload({ onUploadComplete }: { onUploadComplete: (id: string, name: string) => void }) {
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const file = files[0];
        setUploading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axios.post(`${API_URL}/api/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true
            });
            onUploadComplete(res.data.materialId, file.name);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div
            className={`
                border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
                ${dragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/20 hover:border-indigo-400 hover:bg-white/5'}
            `}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                handleUpload(e.dataTransfer.files);
            }}
        >
            <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                onChange={(e) => handleUpload(e.target.files)}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
                {uploading ? (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-3" />
                        <p className="text-gray-400">Processing file with AI...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
                            <Upload className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Drop your study material here</h3>
                        <p className="text-sm text-gray-400 mb-4">PDF, Images, or Text files</p>
                        <span className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">Select File</span>
                    </div>
                )}
            </label>
        </div>
    );
}
