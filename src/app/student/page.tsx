'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import CollegeLogo from '@/components/CollegeLogo';
import { 
  GraduationCap, 
  CreditCard, 
  BookOpen, 
  CheckCircle2, 
  Receipt, 
  ArrowRight, 
  UserCheck, 
  Printer, 
  FileText,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export default function StudentParentPortal() {
  const [identifier, setIdentifier] = useState('');
  const [dob, setDob] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [student, setStudent] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState<any | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;

    setIsSearching(true);
    setErrorMessage(null);
    setReceiptData(null);

    try {
      const res = await fetch(`/api/students?search=${encodeURIComponent(identifier)}`);
      const json = await res.json();

      if (json && json.data && json.data.length > 0) {
        setStudent(json.data[0]);
      } else {
        setErrorMessage(`No student record found matching "${identifier}". Please verify your credentials or register via Online Admission.`);
        setStudent(null);
      }
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

    try {
      const targetSemester = student.currentSemester + 1;
      const res = await fetch('/api/payments/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          targetSemester,
          amount: 2500,
          paymentMethod: 'ONLINE_GATEWAY',
          transactionRef: `UPI-${Date.now()}`,
          notes: `Semester ${targetSemester} auto-promotion fee clearance by student/parent`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReceiptData({
          receiptNo: data.receiptNo,
          studentName: student.fullName,
          rollNo: student.collegeRollNo || student.applicationNo,
          course: student.courseName,
          semester: data.newSemester,
          amount: '₹2,500.00',
          paidAt: new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        });

        // Update student local currentSemester
        setStudent({
          ...student,
          currentSemester: data.newSemester,
        });
      } else {
        alert(data.error || 'Payment could not be completed.');
      }
    } catch (err: any) {
      alert(`Error processing payment: ${err.message}`);
    } finally {
      setPaymentProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Header */}
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
            <Link
              href="/"
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Exit to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {!student ? (
          /* Login / Lookup Card */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 max-w-lg mx-auto">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                <CollegeLogo size={56} />
              </div>
              <h2 className="text-xl font-black text-[#800000]">
                Student & Parent Sign-in
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your College Roll No, Application No, or registered mobile number to access academic records.
              </p>
            </div>

            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Roll No / Application No / Mobile <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MKR-2026-00001 or 10-digit mobile"
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
          /* Student Dashboard */
          <div className="space-y-6">
            {/* Top Student Overview Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5 mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#800000] text-white">
                      Active Student
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

              {/* Identity Particulars Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">College Roll No:</span>
                  <span className="font-bold text-slate-900">{student.collegeRollNo || 'Pending Verification'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">BRABU Reg No:</span>
                  <span className="font-bold text-slate-900">{student.universityRegNo || 'Pending Registration'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Category:</span>
                  <span className="font-bold text-slate-900">{student.category} ({student.gender})</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Phone:</span>
                  <span className="font-bold text-slate-900">{student.phone}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setStudent(null)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Log Out
                </button>
              </div>
            </div>

            {/* Next Semester Auto-Promotion & Fee Clearance Box */}
            <div className="bg-[#FFF8F0] border-2 border-[#800000]/30 rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#800000] text-white text-[11px] font-bold mb-2">
                    <CreditCard className="w-3.5 h-3.5 text-[#D4AF37]" /> Semester Fee Gate
                  </div>
                  <h3 className="text-lg font-bold text-[#800000]">
                    Semester {student.currentSemester + 1} Admission & Promotion
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-md">
                    Clear semester dues to instantly advance your academic standing to Semester {student.currentSemester + 1} and unlock CBCS subject selection.
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <div className="text-xs text-slate-500 font-medium">Standard Semester Fee</div>
                  <div className="text-2xl font-black text-slate-900">₹2,500.00</div>
                  <button
                    onClick={handlePayAndPromote}
                    disabled={paymentProcessing}
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

              {/* Receipt Modal on Successful Payment */}
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
                      onClick={() => window.print()}
                      className="px-4 py-2 text-xs font-bold text-[#800000] border border-[#800000] rounded-lg hover:bg-slate-50 flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Fee Receipt
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
