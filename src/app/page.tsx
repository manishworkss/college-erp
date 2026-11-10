import React from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  CreditCard, 
  UserCheck, 
  ShieldCheck, 
  FileText, 
  Bell, 
  ArrowRight,
  BookOpen,
  School,
  Database
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Banner */}
      <div className="bg-[#0f2744] text-white py-2 px-4 text-xs sm:text-sm font-medium border-b border-blue-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Affiliated with Babasaheb Bhimrao Ambedkar Bihar University (BRABU), Muzaffarpur</span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Hostinger + MySQL Ready
            </span>
            <span>Sitamarhi, Bihar – 843302</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 rounded-xl bg-[#0f2744] text-white flex items-center justify-center shadow-md">
              <School className="w-8 h-8 text-[#d4af37]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#0f2744] tracking-tight">
                M.K.R. Dr. G.R.D. College
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Matashri Kaushalya Ramdev Dr. Ganesh Ray Degree College, Punaura Dham
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href="#notices"
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Notices & Circulars
            </Link>
            <Link
              href="#portals"
              className="px-5 py-2 text-sm font-semibold text-white bg-[#0f2744] hover:bg-[#1a3d66] rounded-lg shadow-sm transition"
            >
              Portal Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="bg-gradient-to-b from-slate-100 to-white py-12 sm:py-16 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-[#0f2744] text-xs font-semibold mb-4">
                <BookOpen className="w-3.5 h-3.5" /> 4-Year CBCS Undergraduate Curriculum Portal
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Enterprise Academic & Resource Planning System
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-600">
                Official institutional gateway for Admissions, Major/Minor CBCS Subject Selections, Fee Receipts, Examinations, and Academic Governance.
              </p>
            </div>

            {/* Quick Status / Live Notice ticker */}
            <div id="notices" className="mt-10 bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 shrink-0">
                <Bell className="w-3.5 h-3.5" /> Latest Notice
              </div>
              <p className="text-xs sm:text-sm text-slate-700 truncate">
                UG Semester 1 (Session 2026–2030) Major, Minor & Multidisciplinary (MDC) subject verification portal is now active.
              </p>
            </div>
          </div>
        </section>

        {/* Portal Entry Modules Grid */}
        <section id="portals" className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h3 className="text-2xl font-bold text-slate-900">Choose Your Access Portal</h3>
            <p className="text-slate-600 text-sm mt-1">Select the appropriate gateway to access academic and administrative services.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Online Admission */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">CBCS Admissions</h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">B.A. / B.Com. (Hons)</p>
                <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                  Apply for undergraduate admissions, register choice-based credits (MJC, MIC, MDC, AEC, SEC, VAC), and check verification status.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-700">Open Admission Portal</span>
                <ArrowRight className="w-4 h-4 text-blue-700 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Fee Payment */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Fees & Receipts</h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Admission, Semester & Exam Dues</p>
                <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                  Pay college and university dues online via UPI/Gateway, verify bank challans, and download printable fee clearance receipts.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700">Pay or Download Receipt</span>
                <ArrowRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: Student Portal */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Student Dashboard</h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Roll No & BRABU Reg No</p>
                <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                  Access student profile, enrolled subject lists, semester admit cards, and internal assessment progress.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-700">Student Login</span>
                <ArrowRight className="w-4 h-4 text-purple-700 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4: Staff & Faculty */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Faculty & Staff</h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Attendance & Marks Entry</p>
                <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                  Department faculty portal for entering continuous internal assessment (CIA) marks, managing lecture rolls, and curriculum coverage.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-700">Faculty Access</span>
                <ArrowRight className="w-4 h-4 text-amber-700 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 5: Administration & Principal */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Admin Console</h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Principal, Accounts & Office</p>
                <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                  Comprehensive institutional administration with audit logs, verification workflows, financial ledgers, and BRABU reporting.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">Admin Sign-in</span>
                <ArrowRight className="w-4 h-4 text-slate-800 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 6: Database & Hostinger Diagnostics */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Database className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">System Architecture</h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Hostinger + MySQL Connection</p>
                <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                  Prisma ORM schema initialized with pooled MySQL connections, ACID transactions, and Next.js standalone containerization.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-sky-700">Database Ready</span>
                <ArrowRight className="w-4 h-4 text-sky-700 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© {new Date().getFullYear()} Matashri Kaushalya Ramdev Dr. Ganesh Ray Degree College (M.K.R. Dr. G.R.D. College). All rights reserved.</p>
          <p className="font-medium text-slate-700">Sitamarhi, Bihar | Affiliated with B.R.A. Bihar University</p>
        </div>
      </footer>
    </div>
  );
}

