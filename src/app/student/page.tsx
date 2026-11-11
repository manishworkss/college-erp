'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CollegeLogo from '@/components/CollegeLogo';
import Footer from '@/components/Footer';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Printer,
  LogOut,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';

export default function StudentParentPortal() {
  const [identifier, setIdentifier] = useState('');
  const [dob, setDob] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [student, setStudent] = useState<any | null>(null);
  const [academics, setAcademics] = useState<{
    attendanceSummary: { totalClasses: number; presentCount: number; percentage: number };
    ciaMarks: Array<{
      id: string;
      semester: number;
      subjectName: string;
      midTermExam: number;
      assignment: number;
      attendanceScore: number;
      totalCiaScore: number;
    }>;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState<any | null>(null);

  const loadAcademics = async (studentId: string) => {
    try {
      const res = await fetch(`/api/faculty/academics?studentId=${encodeURIComponent(studentId)}`);
      const json = await res.json();
      if (json?.success) setAcademics(json.data);
    } catch {
      // Ignore if DB not initialized
    }
  };

  useEffect(() => {
    // Auto-load authenticated student session if signed in via /login
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then(async (session) => {
        const lookupKey = session?.user?.phone || session?.user?.email;
        if (session?.authenticated && session.user?.role === 'STUDENT' && lookupKey) {
          const res = await fetch(`/api/admissions?action=lookup&code=${encodeURIComponent(lookupKey)}`);
          const json = await res.json();
          if (json?.success && json.data) {
            setStudent(json.data);
            loadAcademics(json.data.id);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !dob) return;

    setIsSearching(true);
    setErrorMessage(null);
    setReceiptData(null);

    try {
      const res = await fetch(
        `/api/admissions?action=lookup&code=${encodeURIComponent(identifier.trim())}`
      );
      const json = await res.json();

      if (!res.ok || !json.success || !json.data) {
        setErrorMessage(
          json.error ||
            `No student record found matching "${identifier}". Please register via Online Admission.`
        );
        setStudent(null);
        return;
      }

      if (json.data.dateOfBirth !== dob) {
        setErrorMessage('Date of Birth does not match our student record.');
        setStudent(null);
        return;
      }

      setStudent(json.data);
      loadAcademics(json.data.id);
    } catch {
      setErrorMessage('Failed to connect to student records database.');
      setStudent(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePayAndPromote = async () => {
    if (!student) return;
    setPaymentProcessing(true);
    setErrorMessage(null);

    try {
      const targetSemester = student.nextSemester || student.currentSemester + 1;
      const expectedFee = student.feeBreakdown?.totalAmount || (student.courseCode === 'BCOM' ? 3200 : 2800);

      const res = await fetch('/api/payments/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          targetSemester,
          amount: expectedFee,
          paymentMethod: 'ONLINE_GATEWAY',
          transactionRef: `UPI-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          notes: `Semester ${targetSemester} auto-promotion fee clearance via Student Portal`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReceiptData({
          receiptNo: data.receiptNo,
          studentName: student.fullName,
          rollNo: student.collegeRollNo || student.registrationCode || student.applicationNo,
          course: student.courseName,
          semester: data.newSemester,
          amount: `₹${Number(data.amountPaid || expectedFee).toLocaleString('en-IN')}.00`,
          paidAt: new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        });

        // Refresh student from DB
        const refreshRes = await fetch(
          `/api/admissions?action=lookup&code=${encodeURIComponent(
            student.registrationCode || student.applicationNo
          )}`
        );
        const refreshed = await refreshRes.json();
        if (refreshed?.success) setStudent(refreshed.data);
      } else {
        setErrorMessage(data.error || 'Payment could not be completed.');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error processing payment.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setStudent(null);
    setAcademics(null);
    setReceiptData(null);
    setErrorMessage(null);
  };

  const nextFeeAmount = student?.feeBreakdown?.totalAmount || (student?.courseCode === 'BCOM' ? 3200 : 2800);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="shrink-0">
              <CollegeLogo size={42} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-[#800000] leading-none">
                  Student & Parent Portal
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#800000] text-white uppercase">
                  Self-Service
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-none">
                M.K.R. Dr. G.R.D. College, Sitamarhi • BRABU 4-Year CBCS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {student && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition inline-flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            )}
            <Link
              href="/"
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Exit to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {!student ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 max-w-lg mx-auto">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                <CollegeLogo size={56} />
              </div>
              <h2 className="text-xl font-black text-[#800000]">Student & Parent Sign-in</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your Registration Code, College Roll No, Application No, or mobile number along with Date of Birth.
              </p>
            </div>

            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Roll No / Reg Code / App No / Mobile <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MKR-REG-2026-00001 or 26/BASS/0001"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Date of Birth <span className="text-rose-600">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSearching}
                className="w-full py-2.5 text-xs font-bold text-white bg-[#800000] hover:bg-[#5C0000] rounded-lg shadow-xs transition flex items-center justify-center gap-2"
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying...
                  </>
                ) : (
                  'Access Student Dashboard'
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              Not registered yet?{' '}
              <Link href="/admission" className="font-bold text-[#800000] hover:underline">
                Fill Online Admission Form
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {student.isOverdue && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block">Overdue Registration Warning (30-Day Retention Active)</strong>
                  <span>
                    You missed the semester deadline. {student.overdueInfo?.daysRemaining ?? 30} day(s) remaining before automatic archival/deletion. Register immediately or contact the Principal office.
                  </span>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Overview Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5 mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#800000] text-white">
                      {student.status}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">App No: {student.applicationNo}</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">{student.fullName}</h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {student.courseName} • Session {student.sessionName}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-slate-400 font-bold uppercase block">Current Standing</span>
                  <span className="inline-block px-3 py-1 rounded-lg text-sm font-extrabold bg-[#800000]/10 text-[#800000] mt-1">
                    Semester {student.currentSemester} (CBCS)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">College Roll No:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {student.collegeRollNo || 'Awaiting Approval'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Persistent Reg Code:</span>
                  <span className="font-mono font-bold text-[#800000]">
                    {student.registrationCode || student.applicationNo}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Category:</span>
                  <span className="font-bold text-slate-900">
                    {student.category} ({student.gender})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Phone:</span>
                  <span className="font-bold text-slate-900">{student.phone}</span>
                </div>
              </div>
            </div>

            {/* Next Semester Progression Box */}
            {!student.maxReached && (
              <div className="bg-[#FFF8F0] border-2 border-[#800000]/30 rounded-2xl p-6 sm:p-8 shadow-xs">
                {student.pendingApproval ? (
                  <div className="flex items-start gap-3 text-xs text-amber-900">
                    <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-amber-900">
                        Semester 1 Application Under Super Admin Scrutiny
                      </h3>
                      <p className="mt-1 text-amber-800">
                        Your Semester 1 fee is cleared. Once the Principal approves your admission and allocates your College Roll Number, Semester 2 auto-promotion unlocks automatically.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#800000] text-white text-[11px] font-bold mb-2">
                        <CreditCard className="w-3.5 h-3.5 text-[#D4AF37]" /> Semester Fee Gate
                      </div>
                      <h3 className="text-lg font-bold text-[#800000]">
                        Semester {student.nextSemester} Re-Registration & Auto-Promotion
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 max-w-md">
                        {student.windowStatus === 'OPEN'
                          ? `Registration window is open. Clear dues to instantly promote to Semester ${student.nextSemester} (no admin wait required).`
                          : student.windowMessage}
                      </p>
                      <Link
                        href="/admission"
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#800000] hover:underline mt-2"
                      >
                        <BookOpen className="w-3.5 h-3.5" /> Choose CBCS Subjects on Admission Portal →
                      </Link>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <div className="text-xs text-slate-500 font-medium">Semester Fee Payable</div>
                      <div className="text-2xl font-black text-slate-900">
                        ₹{Number(nextFeeAmount).toLocaleString('en-IN')}.00
                      </div>
                      <button
                        type="button"
                        onClick={handlePayAndPromote}
                        disabled={paymentProcessing || student.windowStatus !== 'OPEN'}
                        className="mt-3 px-5 py-2.5 text-xs font-bold text-white bg-[#800000] hover:bg-[#5C0000] rounded-xl shadow-xs transition flex items-center gap-2 disabled:bg-slate-300"
                      >
                        {paymentProcessing ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" /> Pay & Auto-Promote
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {receiptData && (
                  <div className="mt-6 p-6 bg-white border border-emerald-300 rounded-xl shadow-sm text-xs">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Payment Verified! Auto-Promoted to Semester {receiptData.semester}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div>
                        <span className="text-slate-400 block">Receipt No:</span>
                        <span className="font-mono font-bold text-slate-900">{receiptData.receiptNo}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Amount:</span>
                        <span className="font-bold text-slate-900">{receiptData.amount}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Paid At:</span>
                        <span className="font-bold text-slate-900">{receiptData.paidAt}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Status:</span>
                        <span className="font-bold text-emerald-700">COMPLETED</span>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-4 py-2 text-xs font-bold text-[#800000] border border-[#800000] rounded-lg hover:bg-slate-50 flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print Fee Receipt
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Attendance, Marks & Receipts Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                <h3 className="text-xs font-bold text-[#800000] uppercase tracking-wider mb-3">
                  Attendance & CIA Evaluation
                </h3>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs flex justify-between mb-3">
                  <span>Recorded Lectures Attended:</span>
                  <strong className="text-slate-900">
                    {academics?.attendanceSummary
                      ? `${academics.attendanceSummary.presentCount}/${academics.attendanceSummary.totalClasses} (${academics.attendanceSummary.percentage}%)`
                      : '0/0 (0%)'}
                  </strong>
                </div>
                {academics?.ciaMarks && academics.ciaMarks.length > 0 ? (
                  <div className="space-y-2 text-xs">
                    {academics.ciaMarks.map((m) => (
                      <div key={m.id} className="p-2.5 border border-slate-100 rounded-lg flex justify-between">
                        <span className="font-semibold text-slate-800">
                          Sem {m.semester}: {m.subjectName}
                        </span>
                        <span className="font-mono font-bold text-[#800000]">{m.totalCiaScore}/30</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No CIA assessment scores locked yet.</p>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                <h3 className="text-xs font-bold text-[#800000] uppercase tracking-wider mb-3">
                  Fee Payment Receipts
                </h3>
                {student.payments && student.payments.length > 0 ? (
                  <div className="space-y-2 text-xs">
                    {student.payments.map((p: any) => (
                      <div
                        key={p.receiptNo}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center"
                      >
                        <div>
                          <div className="font-mono font-bold text-slate-900">{p.receiptNo}</div>
                          <div className="text-[11px] text-slate-500">Semester {p.targetSemester}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-700">₹{p.amount}</div>
                          <div className="text-[10px] text-slate-400">{p.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No payment receipts found.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
