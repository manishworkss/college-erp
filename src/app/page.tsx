import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CollegeLogo from '@/components/CollegeLogo';
import { 
  ShieldCheck, 
  BookOpen, 
  UserCheck, 
  GraduationCap, 
  AlertCircle, 
  PhoneCall, 
  ArrowRight,
  Bell
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto w-full">
          {/* Notice Banner */}
          <div className="mb-8 bg-[#FFF8F0] border border-[#800000]/20 rounded-xl p-3 flex items-center gap-3 shadow-xs">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#800000] text-white text-[11px] font-bold shrink-0">
              <Bell className="w-3.5 h-3.5 text-[#D4AF37]" /> Notice
            </span>
            <p className="text-xs sm:text-sm text-slate-700 font-medium truncate">
              UG Semester 1 (Batch 2026–2030) Online Admission & CBCS Subject Selection is active.
            </p>
          </div>

          {/* ERP Portal Title Header with Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <CollegeLogo size={68} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#800000] tracking-tight">
              M.K.R. Dr. G.R.D. College ERP
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              Enterprise Resource Planning & Academic Management Portal • Sitamarhi, Bihar
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#002B5C] hover:bg-[#001836] text-white text-xs sm:text-sm font-bold shadow-md transition-all duration-150 hover:shadow-lg"
              >
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>Unified ERP Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/admission"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold transition"
              >
                <GraduationCap className="w-4 h-4 text-[#800000]" />
                <span>Online Admission 2026</span>
              </Link>
            </div>
          </div>

          {/* THE 3 CORE ERP MODULES */}
          <div className="mb-10">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center sm:text-left">
              Select Your Access Portal
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Module 1: Super Admin (Principal) */}
              <Link
                href="/admin/principal"
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-[#800000] transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#800000]/10 text-[#800000] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-6 h-6 text-[#800000]" />
                  </div>
                  <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#800000] text-white mb-2">
                    Institutional Head
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#800000] transition-colors">
                    Super Admin (Principal)
                  </h2>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Full institutional governance: student verification, roll number allocations, fee reconciliations, notices, and semester auto-promotion controls.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#800000]">
                  <span>Principal Console</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Module 2: Faculty Admin */}
              <Link
                href="/faculty"
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-[#002B5C] transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#002B5C] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#002B5C] text-white mb-2">
                    Academic Staff
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#002B5C] transition-colors">
                    Faculty Admin
                  </h2>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Department faculty portal for managing daily lecture attendance rolls and submitting BRABU Continuous Internal Assessment (CIA) marks.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#002B5C]">
                  <span>Faculty Console</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Module 3: Student / Parent Login */}
              <Link
                href="/student"
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-600 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white mb-2">
                    Self-Service
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Student / Parent Login
                  </h2>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Student self-service dashboard: view enrolled CBCS courses, pay semester promotion fees, download receipts, and check standing.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                  <span>Student Sign-in</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>

          {/* Quick Services Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-bold text-slate-700">Quick Institutional Services:</span>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/admission"
                className="px-3.5 py-1.5 rounded-lg bg-[#800000] text-white font-bold hover:bg-[#5C0000] transition flex items-center gap-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5" /> Online Admission Form
              </Link>
              <Link
                href="/complaint"
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-700" /> Grievance & Complain
              </Link>
              <Link
                href="/contact"
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5 text-blue-700" /> Contact Us
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
