"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  GraduationCap,
  ListTodo,
  FileSearch,
  Sparkles,
  Library,
  BarChart3,
  CheckCircle2,
  ChevronRight
} from "lucide-react";

import { API_URL, getBackendUrl } from "@/lib/apiConfig";

const GoogleButton = ({ className = "" }: { className?: string }) => {
  // Compute URL at click time/render time to avoid static bake-in
  const loginUrl = `${getBackendUrl()}/auth/google`;

  return (
    <a
      href={loginUrl}
      className={`inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg overflow-hidden shadow-md transition-all group ${className}`}
    >
      <div className="bg-white p-2.5 mr-0.5">
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
      </div>
      <span className="px-5 py-2.5 font-semibold text-sm">Continue with Google</span>
    </a>
  );
};

export default function LoginPage() {
  const features = [
    {
      title: "AI-Powered Study Assistant",
      description: "Get instant answers to your study questions.",
      icon: <GraduationCap className="w-8 h-8 text-blue-600" />
    },
    {
      title: "Smart Task Management",
      description: "Organize tasks and to-dos efficiently.",
      icon: <ListTodo className="w-8 h-8 text-blue-600" />
    },
    {
      title: "PDF Upload & Explain",
      description: "Upload PDFs to get clear, AI-generated summaries.",
      icon: <FileSearch className="w-8 h-8 text-blue-600" />
    },
    {
      title: "Personalized Learning",
      description: "Receive insights tailored to your study needs.",
      icon: <Sparkles className="w-8 h-8 text-blue-600" />
    },
    {
      title: "Curated Resources",
      description: "Access safe and reliable study materials.",
      icon: <Library className="w-8 h-8 text-blue-600" />
    },
    {
      title: "Track Your Progress",
      description: "Monitor your study history and performance.",
      icon: <BarChart3 className="w-8 h-8 text-blue-600" />
    }
  ];

  const steps = [
    { text: "Login with Google", icon: <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" /> },
    { text: "Add tasks or upload study material", icon: <ListTodo className="w-5 h-5 text-blue-600" /> },
    { text: "Learn with AI assistance", icon: <GraduationCap className="w-5 h-5 text-blue-600" /> },
    { text: "Track progress and improve", icon: <BarChart3 className="w-5 h-5 text-blue-600" /> }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-blue-100 relative overflow-x-hidden">
      {/* Dynamic Background Waves */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <svg className="absolute top-0 w-full" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0H1440V719.664C1440 719.664 1221.5 848.5 720 719.664C218.5 590.828 0 719.664 0 719.664V0Z" fill="url(#paint0_linear)" fillOpacity="0.05" />
          <path d="M0 0H1440V619.664C1440 619.664 1221.5 748.5 720 619.664C218.5 490.828 0 619.664 0 619.664V0Z" fill="url(#paint1_linear)" fillOpacity="0.05" />
          <defs>
            <linearGradient id="paint0_linear" x1="720" y1="0" x2="720" y2="800" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3B82F6" />
              <stop offset="1" stopColor="#3B82F6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="paint1_linear" x1="720" y1="0" x2="720" y2="700" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3B82F6" />
              <stop offset="1" stopColor="#3B82F6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-8 flex items-center">
        <Link href="/">
          <img src="/logo.png" alt="ClassMates+" style={{ height: '40px', width: 'auto' }} />
        </Link>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-16 lg:pt-24 pb-32">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1]"
            >
              Smart, easy-to-use tools <br /> to help you study better
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Boost your learning with an AI-powered study assistant. <br className="hidden md:block" />
              Get help with notes, tasks, and more, all in one place.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <GoogleButton />
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 relative"
          >
            <img
              src="/hero_illustration.png"
              alt="Study Illustration"
              className="w-full max-w-2xl mx-auto drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="bg-slate-50/50 py-32 relative">
        {/* Middle Wave */}
        <div className="absolute top-0 left-0 w-full -translate-y-full hover:pointer-events-none">
          <svg className="w-full h-32" preserveAspectRatio="none" viewBox="0 0 1440 120">
            <path d="M0 120V0C480 120 960 120 1440 0V120H0Z" fill="#F8FAFC" fillOpacity="0.5" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-slate-800 mb-20 tracking-tight">
            Smart, easy-to-use tools to help you study better
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-8 transition-all"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{f.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium">{f.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works & Why */}
      <section className="max-w-7xl mx-auto px-6 py-40">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <div>
            <h2 className="text-4xl font-bold text-slate-800 mb-16">How It Works</h2>
            <div className="space-y-10">
              {steps.map((s, i) => (
                <div key={i} className="flex items-center gap-6 group">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    {s.icon}
                  </div>
                  <span className="text-lg font-semibold text-slate-700">{s.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#f0f7ff] rounded-[3rem] p-12 lg:p-20 relative overflow-hidden">
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl font-bold text-slate-800">Why ClassMates+</h2>
              <div className="flex gap-6 items-start">
                <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Get the help you need, when you need it. Join thousands of students using ClassMates+ to boost their learning.
                </p>
              </div>
              <GoogleButton />
            </div>
            {/* Decoration */}
            <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
              <GraduationCap className="w-64 h-64 text-blue-900" />
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-slate-100 py-32 text-center bg-slate-50/30">
        <div className="max-w-4xl mx-auto px-6 space-y-10">
          <h2 className="text-4xl font-bold text-slate-900 leading-tight">
            Study smarter with ClassMates+
          </h2>
          <p className="text-lg text-slate-500">
            Get the help you need, when you need it. Join the thousands of <br className="hidden md:block" />
            students using ClassMates+ to boost their learning. Leard enging.
          </p>
          <div className="pt-4 scale-110 origin-center inline-block">
            <GoogleButton />
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <img src="/logo.png" alt="ClassMates+" style={{ height: '32px', width: 'auto' }} className="opacity-40 grayscale" />
          <p className="text-slate-400 font-medium text-sm">© 2026 ClassMates+. All rights reserved.</p>
          <div className="flex gap-8 text-sm font-semibold text-slate-400">
            <a href="#" className="hover:text-blue-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-500 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
