'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle2, 
  Building, 
  GraduationCap, 
  CreditCard,
  FileText
} from 'lucide-react';

export default function ContactPage() {
  const [formSent, setFormSent] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    department: 'Admission',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#800000] text-xs font-bold mb-3">
              <Building className="w-3.5 h-3.5" /> Institutional Helpdesk & Administrative Offices
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Contact M.K.R. Dr. G.R.D. College
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Have questions regarding admissions, CBCS curriculum, examination forms, or fees? Reach out to our campus office directly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Department Details & Interactive Message */}
            <div className="lg:col-span-2 space-y-6">
              {/* Department Directory Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Admission & CBCS Desk</h3>
                  <p className="text-xs text-slate-500 mt-1">UG Admission Session 2026–2030, Subject Allocations & Document Verification</p>
                  <p className="text-xs font-bold text-[#800000] mt-3">+91-7597052444</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Accounts & Fee Counter</h3>
                  <p className="text-xs text-slate-500 mt-1">Semester Fee Clearance, Receipt Re-issuance & Concession Verification</p>
                  <p className="text-xs font-bold text-[#800000] mt-3">+91-7544052444</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Examination Section</h3>
                  <p className="text-xs text-slate-500 mt-1">BRABU University Exam Forms, Internal Assessment (CIA) & Admit Cards</p>
                  <p className="text-xs font-bold text-[#800000] mt-3">principal@mkrcollege.com</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                    <Building className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Principal Office</h3>
                  <p className="text-xs text-slate-500 mt-1">Administrative matters, institutional endorsements & university communications</p>
                  <p className="text-xs font-bold text-[#800000] mt-3">mkrdr.grdcollege@gmail.com</p>
                </div>
              </div>

              {/* Contact Message Form */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-1">Send an Instant Message to Campus Office</h2>
                <p className="text-xs text-slate-500 mb-6">Our admission and administrative desk will respond to your registered email or phone.</p>

                {formSent ? (
                  <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                    <h3 className="text-base font-bold text-emerald-900">Message Received</h3>
                    <p className="text-xs text-emerald-700 mt-1">Thank you. The relevant department desk has been notified.</p>
                    <button
                      onClick={() => setFormSent(false)}
                      className="mt-4 px-4 py-2 text-xs font-bold text-emerald-800 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-50"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="Your name"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
                        <input
                          type="tel"
                          required
                          placeholder="10-digit mobile"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="your.email@gmail.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Department Desk *</label>
                        <select
                          value={form.department}
                          onChange={(e) => setForm({ ...form, department: e.target.value })}
                          className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none bg-white"
                        >
                          <option value="Admission">Admission & CBCS Enrollment</option>
                          <option value="Accounts">Accounts & Fee Payment</option>
                          <option value="Examination">Examination & Admit Card</option>
                          <option value="General">General Administrative Query</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Message / Query *</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="State your question or clarification in detail..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
                      ></textarea>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-6 py-2.5 text-xs font-bold text-white bg-[#800000] hover:bg-[#1b4374] rounded-lg shadow-sm flex items-center gap-2 transition"
                      >
                        <Send className="w-3.5 h-3.5 text-[#d4af37]" /> Send Message
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Right Column: Campus Details & Timings */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                  Campus Address & Landmark
                </h3>

                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-800">Campus Location:</div>
                      <p className="text-slate-600 mt-1 leading-relaxed">
                        Near Punaura Police Station & Fulmat Petrol Pump, Punaura Dham, Sitamarhi, Bihar – 843302
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-800">Helpline Telephones:</div>
                      <p className="text-slate-600 mt-1 font-mono">
                        +91-7597052444<br />
                        +91-7544052444
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-800">Official Correspondences:</div>
                      <p className="text-slate-600 mt-1">
                        principal@mkrcollege.com<br />
                        mkrdr.grdcollege@gmail.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-800">Campus Counters:</div>
                      <p className="text-slate-600 mt-1">
                        Monday to Saturday: 10:00 AM – 4:30 PM<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sitamarhi Location Badge */}
              <div className="bg-[#800000] text-white rounded-2xl p-6 shadow-sm">
                <div className="text-xs uppercase font-bold text-[#d4af37] tracking-wider mb-2">
                  Historic Punaura Dham
                </div>
                <h4 className="text-base font-bold">Sacred Heritage of Sitamarhi</h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Located near the historic birthplace of Mata Sita at Punaura Dham, providing inclusive higher education under B.R.A. Bihar University.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

