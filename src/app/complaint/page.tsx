'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  ShieldAlert, 
  FileText, 
  Clock, 
  Send,
  Building,
  UserCheck
} from 'lucide-react';

export default function GrievanceComplaintPage() {
  const [activeTab, setActiveTab] = useState<'lodge' | 'track'>('lodge');
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    rollNoOrAppNo: '',
    phone: '',
    email: '',
    category: 'Academic',
    priority: 'Medium',
    subject: '',
    description: '',
  });

  // Track State
  const [ticketSearch, setTicketSearch] = useState('');
  const [trackResult, setTrackResult] = useState<any | null>(null);

  const handleLodgeComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    const ticketId = `MKR-GRV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setSubmittedTicket(ticketId);
  };

  const handleTrackComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSearch) return;
    setTrackResult({
      ticketId: ticketSearch,
      category: 'Academic & CBCS Subject Mapping',
      subject: 'Correction of Minor Subject in Enrollment Slip',
      status: 'UNDER_INVESTIGATION',
      lodgedOn: '10 Nov 2026',
      assignedTo: 'Academic Affairs & Grievance Committee',
      resolutionNote: 'Your grievance has been forwarded to the HOD of History and Office Superintendent for verification. Estimated resolution: 2 working days.',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Banner */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold mb-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-700" /> Statutory Grievance Redressal Cell (UGC & BRABU Mandate)
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Student & Staff Grievance Portal
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Matashri Kaushalya Ramdev Dr. Ganesh Ray Degree College, Sitamarhi
                </p>
              </div>

              {/* Tab Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab('lodge')}
                  className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition ${
                    activeTab === 'lodge'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Lodge New Grievance
                </button>
                <button
                  onClick={() => setActiveTab('track')}
                  className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition ${
                    activeTab === 'track'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Track Grievance Status
                </button>
              </div>
            </div>
          </div>

          {activeTab === 'lodge' ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              {submittedTicket ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Grievance Registered Successfully</h2>
                  <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                    Your grievance has been assigned to the College Redressal Committee. Preserve your grievance ticket reference.
                  </p>
                  <div className="mt-6 inline-block bg-slate-100 border border-slate-300 rounded-xl px-6 py-4 font-mono text-xl font-black text-amber-800 tracking-wider">
                    {submittedTicket}
                  </div>
                  <p className="text-xs text-slate-500 mt-3">
                    As per university norms, complaints are reviewed and addressed within 3 to 7 working days.
                  </p>

                  <div className="mt-8 flex justify-center gap-4">
                    <button
                      onClick={() => {
                        setSubmittedTicket(null);
                        setForm({
                          name: '',
                          rollNoOrAppNo: '',
                          phone: '',
                          email: '',
                          category: 'Academic',
                          priority: 'Medium',
                          subject: '',
                          description: '',
                        });
                      }}
                      className="px-5 py-2.5 text-xs font-bold text-white bg-[#800000] rounded-lg shadow-sm"
                    >
                      File Another Grievance
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleLodgeComplaint} className="space-y-6">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900">Grievance Particulars</h3>
                    <p className="text-xs text-slate-500">All submissions are confidential and handled directly by the Principal and Redressal Officers.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Complainant Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Your full name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">College Roll No / Application No *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 26/BA/0042 or MKR-2026-00102"
                        value={form.rollNoOrAppNo}
                        onChange={(e) => setForm({ ...form, rollNoOrAppNo: e.target.value })}
                        className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="Active mobile number"
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
                        placeholder="youremail@gmail.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Grievance Category *</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none bg-white font-medium"
                      >
                        <option value="Academic">Academic & CBCS Subject Selection</option>
                        <option value="Examination">Examinations, Admit Card & Results</option>
                        <option value="FeePayment">Fee Collection, Receipts & Refunds</option>
                        <option value="AntiRagging">Anti-Ragging / Student Safety</option>
                        <option value="Infrastructure">Classrooms, Library & Labs</option>
                        <option value="Administrative">Office, Certificates & TC</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Urgency Priority *</label>
                      <select
                        value={form.priority}
                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                        className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none bg-white"
                      >
                        <option value="Low">Normal (Standard Query)</option>
                        <option value="Medium">Medium (Affecting Semester/Class)</option>
                        <option value="High">Urgent (Exam form / Fee Deadline pending)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Grievance Subject / Headline *</label>
                      <input
                        type="text"
                        required
                        placeholder="Brief summary of the issue (e.g. Discrepancy in Minor Subject Allocation)"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Description of the Problem *</label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Provide full particulars, dates, receipts, or teacher/office interactions relevant to your grievance..."
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
                      ></textarea>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-8 py-3 text-sm font-bold text-white bg-[#800000] hover:bg-[#1b4374] rounded-xl shadow-md transition flex items-center gap-2"
                    >
                      <Send className="w-4 h-4 text-[#d4af37]" /> Submit Official Grievance
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Track Complaint Container */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="max-w-xl mx-auto">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Track Grievance Redressal Status</h2>
                  <p className="text-xs text-slate-600 mt-1">
                    Enter the Ticket Reference Number generated when you submitted your complaint.
                  </p>
                </div>

                <form onSubmit={handleTrackComplaint} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Grievance Ticket ID *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MKR-GRV-2026-4891"
                      value={ticketSearch}
                      onChange={(e) => setTicketSearch(e.target.value)}
                      className="w-full text-sm px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 text-xs font-bold text-white bg-[#800000] hover:bg-[#1b4374] rounded-lg shadow-sm transition"
                  >
                    Check Grievance Status
                  </button>
                </form>

                {trackResult && (
                  <div className="mt-8 p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <span className="text-xs font-bold text-slate-500 uppercase">Ticket Reference</span>
                      <span className="font-mono text-sm font-bold text-amber-800">{trackResult.ticketId}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Category</span>
                      <span className="font-semibold text-slate-800">{trackResult.category}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Status</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                        {trackResult.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Assigned Committee</span>
                      <span className="font-medium text-slate-700">{trackResult.assignedTo}</span>
                    </div>

                    <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 mt-2">
                      <strong>Action / Remarks:</strong> {trackResult.resolutionNote}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

