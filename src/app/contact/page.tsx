'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CollegeLogo from '@/components/CollegeLogo';
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
  FileText,
  AlertCircle,
} from 'lucide-react';

export default function ContactPage() {
  const [formSent, setFormSent] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    department: 'Admission',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/grievances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submittedBy: 'PUBLIC',
          name: form.name,
          phone: form.phone,
          email: form.email,
          category: form.department,
          subject: `Campus Helpdesk Inquiry: ${form.department}`,
          description: form.message,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.error || 'Unable to submit message. Please verify details.');
        return;
      }
      setFormSent(json.ticketNo);
      setForm({ name: '', phone: '', email: '', department: 'Admission', message: '' });
    } catch {
      setErrorMsg('Unable to connect to campus helpdesk server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#800000] text-xs font-bold mb-3">
              <Building className="w-3.5 h-3.5" /> Institutional Helpdesk & Administrative Offices
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">Contact M.K.R. Dr. G.R.D. College</h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Have questions regarding admissions, CBCS curriculum, examination forms, or fees? Reach out to our campus office directly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Admission & CBCS Desk</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    UG Admission Session 2026–2030, Subject Allocations & Document Verification
                  </p>
                  <p className="text-xs font-bold text-[#800000] mt-3">+91-7597052444</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Accounts & Fee Counter</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Semester Fee Clearance, Receipt Re-issuance & Concession Verification
                  </p>
                  <p className="text-xs font-bold text-[#800000] mt-3">+91-7544052444</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Examination Section</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    BRABU University Exam Forms, Internal Assessment (CIA) & Admit Cards
                  </p>
                  <p className="text-xs font-bold text-[#800000] mt-3">principal@mkrcollege.com</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                    <Building className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Principal Office</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Administrative matters, institutional endorsements & university communications
                  </p>
                  <p className="text-xs font-bold text-[#800000] mt-3">mkrdr.grdcollege@gmail.com</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-1">Send an Instant Message to Campus Office</h2>
                <p className="text-xs text-slate-500 mb-6">
                  Our admission and administrative desk will log and respond to your inquiry.
                </p>

                {formSent ? (
                  <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                    <h3 className="text-base font-bold text-emerald-900">Inquiry Logged in Campus Helpdesk</h3>
                    <p className="text-xs text-emerald-700 mt-1">
                      Reference Ticket: <span className="font-mono font-bold">{formSent}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => setFormSent(null)}
                      className="mt-4 px-4 py-2 text-xs font-bold text-emerald-800 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-50"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {errorMsg && (
                      <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

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
                          <option value="Fees">Accounts & Fee Payment</option>
                          <option value="Examination">Examination & Admit Card</option>
                          <option value="Administrative">General Administrative Query</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Message / Query *</label>
                      <textarea
                        rows={3}
                        required
                        minLength={10}
                        placeholder="State your question or clarification in detail..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
                      ></textarea>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2.5 text-xs font-bold text-white bg-[#800000] hover:bg-[#5C0000] rounded-lg shadow-sm flex items-center gap-2 transition disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5 text-[#d4af37]" />
                        {submitting ? 'Sending...' : 'Send Message'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

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
                        +91-7597052444
                        <br />
                        +91-7544052444
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-800">Official Correspondences:</div>
                      <p className="text-slate-600 mt-1">
                        principal@mkrcollege.com
                        <br />
                        mkrdr.grdcollege@gmail.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-800">Campus Counters:</div>
                      <p className="text-slate-600 mt-1">
                        Monday to Saturday: 10:00 AM – 4:30 PM
                        <br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#800000] text-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-white/95 p-1 rounded-xl">
                    <CollegeLogo size={42} />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase font-bold text-[#D4AF37] tracking-wider">
                      Historic Punaura Dham
                    </div>
                    <h4 className="text-sm font-bold">M.K.R. Dr. G.R.D. College</h4>
                  </div>
                </div>
                <p className="text-xs text-white/90 leading-relaxed">
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
