import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CollegeLogo from '@/components/CollegeLogo';
import { 
  GraduationCap, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight,
  Bell
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex flex-col justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto w-full">
          
          {/* Top Notice Banner */}
          <div className="mb-8 bg-[#FFF8F0] border border-[#800000]/20 rounded-xl p-3 flex items-center gap-3 shadow-xs">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#800000] text-white text-[11px] font-bold shrink-0">
              <Bell className="w-3.5 h-3.5 text-[#D4AF37]" /> Notice
            </span>
            <p className="text-xs sm:text-sm text-slate-700 font-medium truncate">
              UG Semester 1 (Batch 2026–2030) Online Admission & CBCS Subject Selection is active.
            </p>
          </div>

          {/* College Identity & Emblem */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-3">
              <CollegeLogo size={80} />
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#800000] tracking-tight">
              M.K.R. Dr. G.R.D. College
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5">
              Punaura Dham, Sitamarhi • Affiliated with Babasaheb Bhimrao Ambedkar Bihar University (BRABU)
            </p>
          </div>

          {/* 3 Core Modules in Exact Requested Order */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* 1. Online Admission Form */}
            <Link
              href="/admission"
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#800000] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#800000]/10 text-[#800000] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6 text-[#800000]" />
                </div>
                <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#800000] text-white mb-2">
                  Session 2026–2030
                </div>
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#800000] transition-colors">
                  Online Admission Form
                </h2>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#800000]">
                <span>Apply / Check Status</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 2. Complain Form */}
            <Link
              href="/complaint"
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-600 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <AlertCircle className="w-6 h-6 text-amber-700" />
                </div>
                <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-white mb-2">
                  Grievance Redressal
                </div>
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                  Complain Form
                </h2>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
                <span>Submit Grievance</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 3. ERP Module */}
            <Link
              href="/login"
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#002B5C] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#002B5C]/10 text-[#002B5C] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6 text-[#002B5C]" />
                </div>
                <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#002B5C] text-white mb-2">
                  Principal • Faculty • Student
                </div>
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#002B5C] transition-colors">
                  ERP Module
                </h2>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#002B5C]">
                <span>ERP Login Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
