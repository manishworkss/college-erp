import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  GraduationCap, 
  CreditCard, 
  UserCheck, 
  ShieldCheck, 
  FileText, 
  Bell, 
  ArrowRight,
  BookOpen,
  AlertCircle,
  PhoneCall,
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#0f2744]/5 via-white to-slate-50 py-12 sm:py-16 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-[#0f2744] text-xs font-bold mb-4 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#0f2744]" /> 
                Institutional ERP & Academic Management Portal
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Matashri Kaushalya Ramdev <br />
                <span className="text-[#0f2744]">Dr. Ganesh Ray Degree College</span>
              </h1>
              <p className="mt-3 text-sm sm:text-base font-semibold text-slate-700">
                Punaura Dham, Sitamarhi, Bihar (Affiliated with B.R.A. Bihar University, Muzaffarpur)
              </p>
              <p className="mt-4 text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
                Official unified portal for Online Admissions, Choice-Based Credit System (CBCS) Subject Selection, Automated Semester Fee Promotion, and Student Grievance Redressal.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/admission"
                  className="px-6 py-3 text-sm font-bold text-white bg-[#0f2744] hover:bg-[#1b4374] rounded-xl shadow-md transition flex items-center gap-2"
                >
                  <GraduationCap className="w-4 h-4 text-[#d4af37]" />
                  Online Admission Form
                </Link>
                <Link
                  href="/complaint"
                  className="px-6 py-3 text-sm font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl shadow-sm transition flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Grievance & Complain
                </Link>
                <Link
                  href="/contact"
                  className="px-6 py-3 text-sm font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl shadow-sm transition flex items-center gap-2"
                >
                  <PhoneCall className="w-4 h-4 text-blue-600" />
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Live Notice Ticker */}
            <div className="mt-12 bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 shrink-0">
                <Bell className="w-3.5 h-3.5" /> Latest Notice
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-medium">
                UG Semester 1 (Batch 2026–2030) Admission & CBCS Major (MJC), Minor (MIC), Multidisciplinary (MDC) subject verification is currently active.
              </p>
            </div>
          </div>
        </section>

        {/* Primary 4 Modules Grid */}
        <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Core College ERP Modules
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Select any of the primary gateways below to interact with institutional services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Module 1: Online Admission Form */}
            <Link
              href="/admission"
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#0f2744]/40 transition flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 mb-2">
                  Session 2026–2030
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0f2744] transition-colors">
                  Online Admission Form
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                  Apply for Undergraduate programs (B.A., B.Com. Honours). Fill in personal details, qualifications, and choose BRABU CBCS subjects.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0f2744]">
                <span>Open Application</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Module 2: Grievance & Complain */}
            <Link
              href="/complaint"
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-500/40 transition flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 mb-2">
                  Redressal Cell
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                  Complain / Grievance
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                  Submit grievances regarding Academic, Examination, Fees, or Campus facilities. Get an instant tracking ticket and monitor resolution.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
                <span>File Grievance</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Module 3: Contact Us */}
            <Link
              href="/contact"
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 mb-2">
                  Campus Helpdesk
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Contact Us
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                  Principal office, admission cell, and account counter contact numbers, official emails, campus map, and working hours in Sitamarhi.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                <span>View Contact Details</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Module 4: Admin & Auto-Promotion Engine */}
            <Link
              href="/admin/students"
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-500/40 transition flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 mb-2">
                  Staff & Admin
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                  ERP Administration
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                  Access the high-concurrency directory (5,000+ students), audit logs, fee reconciliations, and the payment-triggered auto-promotion engine.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700">
                <span>Open Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        {/* Feature Highlights: Enterprise Reliability */}
        <section className="bg-white py-12 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Hostinger + MySQL Optimized</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Configured for high concurrency with connection pooling and standalone Node.js build footprint.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <CreditCard className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Automated Semester Promotion</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Atomic transaction automatically clears fees, generates unique receipts, and promotes students to the next semester.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <BookOpen className="w-6 h-6 text-purple-600 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">4-Year BRABU CBCS Curriculum</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Strict tracking for Major (MJC), Minor (MIC), Multidisciplinary (MDC), AEC, SEC, and VAC courses.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
