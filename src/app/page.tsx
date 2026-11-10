import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  GraduationCap, 
  AlertCircle, 
  PhoneCall, 
  ShieldCheck, 
  ArrowRight,
  Bell
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto w-full">
          {/* Notice Banner */}
          <div className="mb-8 bg-[#FFF8F0] border border-[#800000]/20 rounded-xl p-3.5 flex items-center gap-3 shadow-xs">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#800000] text-white text-[11px] font-bold shrink-0">
              <Bell className="w-3.5 h-3.5 text-[#D4af37]" /> Notice
            </span>
            <p className="text-xs sm:text-sm text-slate-700 font-medium truncate">
              UG Semester 1 (Batch 2026–2030) Online Admission & Subject Selection is currently active.
            </p>
          </div>

          {/* ERP Portal Title Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#800000] tracking-tight">
              M.K.R. Dr. G.R.D. College ERP
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              Academic & Student Lifecycle Management Portal • Sitamarhi, Bihar
            </p>
          </div>

          {/* Core ERP Action Grid - Clean & Direct */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            {/* 1. Online Admission Form */}
            <Link
              href="/admission"
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-[#800000] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#800000]/10 text-[#800000] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#800000] transition-colors">
                  Online Admission Form
                </h2>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Apply for 4-Year CBCS Undergraduate programs (B.A., B.Com. Honours). Submit student credentials and track verification status.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#800000]">
                <span>Apply / Track Form</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 2. Complain / Grievance */}
            <Link
              href="/complaint"
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-[#800000] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                  Complain / Grievance
                </h2>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Lodge academic, examination, or fee-related complaints. Receive a ticket ID and track resolution from the college committee.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-800">
                <span>File Grievance / Track</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 3. Contact Us */}
            <Link
              href="/contact"
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-[#002B5C] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#002B5C] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#002B5C] transition-colors">
                  Contact Us
                </h2>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Campus address, helpline phone numbers, official department email addresses, and campus office hours in Sitamarhi.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#002B5C]">
                <span>View Helpdesk Details</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 4. Staff & Admin Login */}
            <Link
              href="/admin/students"
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-[#002B5C] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-[#002B5C] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#002B5C] transition-colors">
                  Staff & Admin Console
                </h2>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Staff access for student record management (5,000+ intake capacity), verification, fee reconciliations, and auto-promotion.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#002B5C]">
                <span>Admin Login</span>
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
