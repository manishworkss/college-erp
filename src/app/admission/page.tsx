'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CollegeLogo from '@/components/CollegeLogo';
import { 
  FileText, 
  CheckCircle2, 
  Search, 
  Printer, 
  X,
  AlertCircle,
  CreditCard,
  UserCheck,
  Calendar,
  Lock,
  ArrowRight,
  ShieldCheck,
  Clock
} from 'lucide-react';

export default function OnlineAdmissionPage() {
  // Mode: FRESH (Semester 1) vs PROGRESSION (Semester 2 to 8)
  const [admissionMode, setAdmissionMode] = useState<'FRESH' | 'PROGRESSION'>('FRESH');
  const [progressionCode, setProgressionCode] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupMessage, setLookupMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  // Status Modal Inputs
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusRefNo, setStatusRefNo] = useState('');
  const [statusDob, setStatusDob] = useState('');
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusResult, setStatusResult] = useState<any | null>(null);

  // Fee Structure Review Modal
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE_GATEWAY' | 'BANK_CHALLAN'>('ONLINE_GATEWAY');

  // Submitted Application Outcome
  const [submittedData, setSubmittedData] = useState<any | null>(null);

  // Form State
  const [form, setForm] = useState({
    // Basic Details
    session: '2026-2030',
    firstName: '',
    middleName: '',
    lastName: '',
    gender: 'Male',
    dob: '',
    phone: '',
    email: '',
    category: 'General',
    religion: 'Hinduism',
    maritalStatus: 'Unmarried',

    // CBCS Program & Subjects
    faculty: 'Social Science',
    mjcSubject: 'HISTORY',
    micSubject: 'POLITICAL SCIENCE',
    mdcSubject: 'ECONOMICS',
    aecSubject: 'Hindi',
    secSubject: 'Creative Writing',
    vacSubject: 'Development of Personality',

    // Academic Tracking
    targetSemester: 1,

    // University Registration
    universityAppNo: '',

    // Parent Details
    fatherName: '',
    fatherPhone: '',
    motherName: '',

    // Academic Table
    matricBoard: 'BSEB, Patna',
    matricPassingYear: '2024',
    matricRollNum: '',
    matricMarks: '',
    matricPercent: '',
    matricSchool: '',

    interBoard: 'BSEB, Patna',
    interPassingYear: '2026',
    interRollNum: '',
    interMarks: '',
    interPercent: '',
    interSchool: '',

    // Miscellaneous
    aadhaarNo: '',
    apaarNo: '',

    // Address
    currentAddress: '',
    permanentAddress: '',
    sameAsCurrentAddress: false,
  });

  // Dynamic CBCS Subjects mapping by Faculty
  const facultySubjects: Record<string, { mjc: string[]; mic: string[]; mdc: string[] }> = {
    'Social Science': {
      mjc: ['HISTORY', 'POLITICAL SCIENCE', 'ECONOMICS', 'SOCIOLOGY', 'PSYCHOLOGY', 'GEOGRAPHY', 'HOME SCIENCE', 'ANCIENT HISTORY & CULTURE', 'PUBLIC ADMINISTRATION'],
      mic: ['POLITICAL SCIENCE', 'HISTORY', 'ECONOMICS', 'SOCIOLOGY', 'PSYCHOLOGY', 'GEOGRAPHY', 'HOME SCIENCE', 'ENGLISH', 'HINDI'],
      mdc: ['ECONOMICS', 'HISTORY', 'POLITICAL SCIENCE', 'PHILOSOPHY', 'SOCIOLOGY', 'ENGLISH', 'HINDI'],
    },
    'Humanities': {
      mjc: ['HINDI', 'ENGLISH', 'URDU', 'PHILOSOPHY', 'MUSIC', 'SANSKRIT', 'MAITHILI', 'BHOJPURI'],
      mic: ['ENGLISH', 'HINDI', 'URDU', 'HISTORY', 'POLITICAL SCIENCE', 'PHILOSOPHY', 'MUSIC'],
      mdc: ['HISTORY', 'POLITICAL SCIENCE', 'SOCIOLOGY', 'PHILOSOPHY', 'ECONOMICS'],
    },
    'Commerce': {
      mjc: ['ACCOUNTING & FINANCE', 'MARKETING', 'HUMAN RESOURCE MANAGEMENT'],
      mic: ['BUSINESS MANAGEMENT', 'ECONOMICS', 'MARKETING', 'ACCOUNTING & FINANCE'],
      mdc: ['ECONOMICS', 'COMMUNICATION STUDIES', 'POLITICAL SCIENCE', 'SOCIOLOGY'],
    },
  };

  const handleFacultyChange = (selectedFaculty: string) => {
    const defaultMjc = facultySubjects[selectedFaculty]?.mjc[0] || '';
    const defaultMic = facultySubjects[selectedFaculty]?.mic[0] || '';
    const defaultMdc = facultySubjects[selectedFaculty]?.mdc[0] || '';
    setForm({
      ...form,
      faculty: selectedFaculty,
      mjcSubject: defaultMjc,
      micSubject: defaultMic,
      mdcSubject: defaultMdc,
    });
  };

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 12) val = val.substring(0, 12);
    const formatted = val.match(/.{1,4}/g)?.join('-') || val;
    setForm({ ...form, aadhaarNo: formatted });
  };

  const handleApaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 12) val = val.substring(0, 12);
    const formatted = val.match(/.{1,4}/g)?.join('-') || val;
    setForm({ ...form, apaarNo: formatted });
  };

  const handleSameAddressToggle = (checked: boolean) => {
    setForm({
      ...form,
      sameAsCurrentAddress: checked,
      permanentAddress: checked ? form.currentAddress : form.permanentAddress,
    });
  };

  // Lookup existing student for Semester 2..8 progression
  const handleProgressionLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressionCode.trim()) return;

    setIsLookingUp(true);
    setLookupMessage(null);

    try {
      const res = await fetch(`/api/admissions?action=lookup&code=${encodeURIComponent(progressionCode.trim())}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        setLookupMessage({
          type: 'error',
          text: json.error || 'Student code not found. Please verify your Registration Code from Semester 1.',
        });
        return;
      }

      const st = json.data;

      // Check registration window status
      if (st.windowStatus === 'CLOSED') {
        setLookupMessage({
          type: 'warning',
          text: st.windowMessage || `Registration for Semester ${st.nextSemester} is closed. Please visit college counter.`,
        });
        return;
      }

      if (st.windowStatus === 'NOT_STARTED') {
        setLookupMessage({
          type: 'warning',
          text: st.windowMessage || `Registration for Semester ${st.nextSemester} has not commenced yet.`,
        });
        return;
      }

      // Auto-populate previous data from database
      setForm((prev) => ({
        ...prev,
        firstName: st.firstName || st.fullName.split(' ')[0] || '',
        middleName: st.middleName || '',
        lastName: st.lastName || st.fullName.split(' ').slice(1).join(' ') || '',
        gender: st.gender,
        dob: st.dateOfBirth,
        phone: st.phone,
        email: st.email,
        category: st.category,
        religion: st.religion || 'Hinduism',
        maritalStatus: st.maritalStatus || 'Unmarried',
        fatherName: st.fatherName,
        fatherPhone: st.fatherPhone || '',
        motherName: st.motherName,
        currentAddress: st.currentAddress || st.address,
        permanentAddress: st.address,
        targetSemester: st.nextSemester,
        faculty: st.courseCode === 'BCOM' ? 'Commerce' : st.courseCode === 'BA-HUM' ? 'Humanities' : 'Social Science',
      }));

      setLookupMessage({
        type: 'success',
        text: `Welcome back, ${st.fullName}! Your records from Semester ${st.currentSemester} are verified. Basic details auto-filled. Please select your Semester ${st.nextSemester} subjects and proceed to fee payment.`,
      });
    } catch {
      setLookupMessage({
        type: 'error',
        text: 'Failed to connect to records server. Please check internet connection.',
      });
    } finally {
      setIsLookingUp(false);
    }
  };

  // Step 1: Pre-Submit (Opens Fee Structure Review Modal)
  const handleOpenFeeModal = (e: React.FormEvent) => {
    e.preventDefault();
    setShowFeeModal(true);
  };

  // Step 2: Final Payment & Submission
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);

    try {
      const payload = {
        action: admissionMode === 'FRESH' ? 'FRESH_ADMISSION' : 'PROGRESSION_REGISTER',
        formData: form,
        registrationCode: progressionCode.trim(),
        targetSemester: form.targetSemester,
        transactionRef: `UTR-${Date.now()}`,
      };

      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        alert(json.error || 'Submission failed. Please check form details.');
        setIsSubmitting(false);
        return;
      }

      setShowFeeModal(false);

      if (admissionMode === 'FRESH') {
        setSubmittedData({
          ...form,
          refNo: json.applicationNo,
          registrationCode: json.registrationCode,
          status: 'PENDING_SUPER_ADMIN_APPROVAL',
          statusTitle: 'Application Submitted • Awaiting Principal Final Approval',
          statusBadgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
          submittedAt: new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          receiptNo: json.data?.payments?.[0]?.receiptNo || `REC-2026-S1-${Math.floor(100000 + Math.random() * 900000)}`,
          amountPaid: form.faculty === 'Commerce' ? '₹3,200.00' : '₹2,800.00',
        });
      } else {
        setSubmittedData({
          ...form,
          refNo: progressionCode,
          registrationCode: progressionCode,
          status: 'PROMOTED',
          statusTitle: `Successfully Registered & Promoted to Semester ${json.newSemester}`,
          statusBadgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          submittedAt: new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          receiptNo: json.receiptNo,
          amountPaid: form.faculty === 'Commerce' ? '₹3,200.00' : '₹2,800.00',
        });
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      alert(`Network error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Real Status Lookup Modal Submit
  const handleCheckStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusRefNo.trim() || !statusDob) return;

    setIsCheckingStatus(true);
    setStatusResult(null);

    try {
      const res = await fetch(`/api/admissions?action=lookup&code=${encodeURIComponent(statusRefNo.trim())}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        setStatusResult({
          refNo: statusRefNo,
          candidateName: 'Record Not Found',
          status: 'RECORD_NOT_FOUND',
          message: `No application or student record found matching "${statusRefNo}". Please verify your Registration Code or Reference Number.`,
        });
        return;
      }

      const st = json.data;
      if (st.dateOfBirth !== statusDob) {
        setStatusResult({
          refNo: statusRefNo,
          candidateName: st.fullName,
          status: 'DOB_MISMATCH',
          message: 'Date of Birth does not match institutional records for this student identifier.',
        });
        return;
      }

      setStatusResult({
        refNo: st.registrationCode || st.applicationNo,
        candidateName: st.fullName,
        fatherName: st.fatherName,
        course: st.courseName,
        semester: `Semester ${st.currentSemester}`,
        collegeRollNo: st.collegeRollNo || 'Awaiting Super Admin Allocation',
        status: st.collegeRollNo ? 'ADMITTED' : 'APPLIED_PENDING_APPROVAL',
        message: st.collegeRollNo
          ? `Congratulations! Your admission is fully approved by the Principal. Your College Roll Number is ${st.collegeRollNo}. You can login to the ERP portal.`
          : 'Your application & fee clearance have been received. It is currently under scrutiny for final approval and Roll Number allotment by the Principal.',
      });
    } catch {
      setStatusResult({
        refNo: statusRefNo,
        candidateName: 'Server Error',
        status: 'SERVER_ERROR',
        message: 'Could not connect to database. Please retry in a few moments.',
      });
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Fee Calculation
  const isCommerce = form.faculty === 'Commerce';
  const tuitionFee = isCommerce ? 2200 : 1800;
  const admissionFee = 500;
  const examFee = isCommerce ? 500 : 500;
  const totalFee = tuitionFee + admissionFee + examFee;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Top Instruction Banner */}
          <div className="bg-[#FFF8F0] border-l-4 border-[#800000] p-4 rounded-r-xl shadow-xs mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#800000] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Important Notice
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-medium mt-0.5">
                Semester 1 Fresh Admission & Semester 2..8 Progression Registration are live.
              </p>
            </div>
            <button
              onClick={() => {
                setStatusResult(null);
                setShowStatusModal(true);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-[#800000] hover:bg-[#5C0000] rounded-lg shadow-sm whitespace-nowrap transition"
            >
              Check Your Form Status
            </button>
          </div>

          {/* Submitted Form Printable View */}
          {submittedData ? (
            <div className="bg-white rounded-2xl border border-slate-300 shadow-md p-6 sm:p-10 mb-8 print:shadow-none print:border-none">
              <div className="text-center border-b-2 border-[#800000] pb-6 mb-6">
                <div className="flex justify-center mb-2">
                  <CollegeLogo size={64} />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#800000] uppercase tracking-tight">
                  Matashri Kaushalya Ramdev Dr. Ganesh Ray Degree College
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  Punaura Dham, Sitamarhi, Bihar – 843302 (Affiliated with B.R.A. Bihar University, Muzaffarpur)
                </p>
                <div className="mt-3 inline-block px-4 py-1 rounded-full bg-[#800000] text-white text-xs font-bold uppercase tracking-wider">
                  Academic Registration Confirmation (Session 2026–2030)
                </div>
              </div>

              {/* Status Banner */}
              <div className={`p-4 rounded-xl border mb-6 ${submittedData.statusBadgeColor} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="font-bold text-xs uppercase block">{submittedData.statusTitle}</span>
                    <span className="text-[11px] opacity-90">
                      {submittedData.status === 'PROMOTED'
                        ? 'Fee cleared. Your academic standing is automatically updated for this semester.'
                        : 'Application and Fee receipt recorded in MySQL database. Retain your Registration Code.'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Application Summary Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Application Ref No:</span>
                  <span className="font-mono text-base font-bold text-[#800000]">{submittedData.refNo}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Persistent Registration Code:</span>
                  <span className="font-mono text-sm font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {submittedData.registrationCode}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Fee Receipt No:</span>
                  <span className="font-mono text-xs font-bold text-emerald-800">{submittedData.receiptNo}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Amount Paid:</span>
                  <span className="font-bold text-slate-900 text-sm">{submittedData.amountPaid}</span>
                </div>
              </div>

              {/* Particulars Grid */}
              <div className="space-y-4 text-xs">
                <h3 className="font-bold text-sm text-[#800000] border-b border-slate-200 pb-1 uppercase tracking-wider">
                  1. Candidate Personal Particulars
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-slate-100">
                  <div><strong>Full Name:</strong> {submittedData.firstName} {submittedData.middleName} {submittedData.lastName}</div>
                  <div><strong>Gender:</strong> {submittedData.gender}</div>
                  <div><strong>Date of Birth:</strong> {submittedData.dob}</div>
                  <div><strong>Category:</strong> {submittedData.category}</div>
                  <div><strong>Mobile:</strong> {submittedData.phone}</div>
                  <div><strong>Email:</strong> {submittedData.email || 'N/A'}</div>
                  <div><strong>Current Standing:</strong> Semester {submittedData.targetSemester}</div>
                  <div><strong>Submission Date:</strong> {submittedData.submittedAt}</div>
                </div>

                <h3 className="font-bold text-sm text-[#800000] border-b border-slate-200 pb-1 uppercase tracking-wider pt-2">
                  2. BRABU 4-Year CBCS Subject Allocations
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-slate-100">
                  <div><strong>Program:</strong> {submittedData.faculty}</div>
                  <div><strong>Major Course (MJC):</strong> <span className="font-bold text-[#800000]">{submittedData.mjcSubject}</span></div>
                  <div><strong>Minor Course (MIC):</strong> {submittedData.micSubject}</div>
                  <div><strong>Multidisciplinary (MDC):</strong> {submittedData.mdcSubject}</div>
                  <div><strong>Ability Enhancement (AEC):</strong> {submittedData.aecSubject}</div>
                  <div><strong>Skill Enhancement (SEC):</strong> {submittedData.secSubject}</div>
                  <div className="sm:col-span-3"><strong>Value Added Course (VAC):</strong> {submittedData.vacSubject}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap justify-center gap-4 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-[#800000] hover:bg-[#5C0000] rounded-xl shadow-sm flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Print Registration Slip
                </button>
                <button
                  onClick={() => setSubmittedData(null)}
                  className="px-6 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Submit Another Form
                </button>
                <Link
                  href="/"
                  className="px-6 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl"
                >
                  Back to ERP Home
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              
              {/* MODE SWITCHER: Fresh vs Progression */}
              <div className="border-b border-slate-200 bg-slate-50/70 p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Select Registration Mode</h2>
                    <p className="text-xs text-slate-500">Choose fresh admission or re-register for higher semesters using your code.</p>
                  </div>

                  <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setAdmissionMode('FRESH');
                        setForm((prev) => ({ ...prev, targetSemester: 1 }));
                        setLookupMessage(null);
                      }}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                        admissionMode === 'FRESH'
                          ? 'bg-[#800000] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Fresh Admission (Sem 1)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAdmissionMode('PROGRESSION');
                        setLookupMessage(null);
                      }}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                        admissionMode === 'PROGRESSION'
                          ? 'bg-[#800000] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Semester Progression (Sem 2..8)
                    </button>
                  </div>
                </div>

                {/* PROGRESSION CODE LOOKUP BOX */}
                {admissionMode === 'PROGRESSION' && (
                  <form onSubmit={handleProgressionLookup} className="mt-4 pt-4 border-t border-slate-200/80">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Enter Your Registration Code or College Roll No (Generated in Sem 1)
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          required
                          placeholder="e.g. MKR-REG-2026-00042 or 26/BASS/0001"
                          value={progressionCode}
                          onChange={(e) => setProgressionCode(e.target.value)}
                          className="flex-1 text-xs px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none font-mono"
                        />
                        <button
                          type="submit"
                          disabled={isLookingUp}
                          className="px-5 py-2 text-xs font-bold text-white bg-[#800000] hover:bg-[#5C0000] rounded-lg shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          <Search className="w-3.5 h-3.5" />
                          {isLookingUp ? 'Searching...' : 'Fetch My Details'}
                        </button>
                      </div>

                      {lookupMessage && (
                        <div
                          className={`mt-3 p-3 rounded-lg text-xs font-medium border ${
                            lookupMessage.type === 'success'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : lookupMessage.type === 'warning'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-red-50 text-red-800 border-red-200'
                          }`}
                        >
                          {lookupMessage.text}
                        </div>
                      )}
                    </div>
                  </form>
                )}
              </div>

              {/* THE FORM */}
              <form onSubmit={handleOpenFeeModal} className="p-6 sm:p-8 space-y-6">
                
                {/* PROGRAM & CBCS SUBJECTS */}
                <div>
                  <h3 className="text-sm font-bold text-[#800000] uppercase tracking-wider mb-4 pb-1 border-b border-slate-100 flex items-center justify-between">
                    <span>1. Academic Program & BRABU CBCS Choices</span>
                    <span className="text-xs bg-[#800000]/10 text-[#800000] px-2.5 py-0.5 rounded-full font-bold">
                      Semester {form.targetSemester}
                    </span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Academic Program <span className="text-rose-600">*</span>
                      </label>
                      <select
                        value={form.faculty}
                        disabled={admissionMode === 'PROGRESSION'}
                        onChange={(e) => handleFacultyChange(e.target.value)}
                        className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none bg-white font-bold text-[#800000] disabled:bg-slate-100"
                      >
                        <option value="Social Science">Bachelor&apos;s of Arts (BA) – Social Science</option>
                        <option value="Humanities">Bachelor&apos;s of Arts (B.A) – Humanities</option>
                        <option value="Commerce">Bachelor&apos;s of Commerce (B.COM)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Honours Subject (MJC - Major) <span className="text-rose-600">*</span>
                      </label>
                      <select
                        value={form.mjcSubject}
                        onChange={(e) => setForm({ ...form, mjcSubject: e.target.value })}
                        className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none bg-white font-bold text-[#800000]"
                      >
                        {facultySubjects[form.faculty]?.mjc.map((sub) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Minor Subject (MIC)
                      </label>
                      <select
                        value={form.micSubject}
                        onChange={(e) => setForm({ ...form, micSubject: e.target.value })}
                        className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none bg-white font-medium"
                      >
                        {facultySubjects[form.faculty]?.mic.map((sub) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Multidisciplinary Subject (MDC)
                      </label>
                      <select
                        value={form.mdcSubject}
                        onChange={(e) => setForm({ ...form, mdcSubject: e.target.value })}
                        className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none bg-white"
                      >
                        {facultySubjects[form.faculty]?.mdc.map((sub) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Ability Enhancement (AEC)
                      </label>
                      <select
                        value={form.aecSubject}
                        onChange={(e) => setForm({ ...form, aecSubject: e.target.value })}
                        className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none bg-white"
                      >
                        <option value="Hindi">Hindi (MIL)</option>
                        <option value="English">English (Communication)</option>
                        <option value="Urdu">Urdu (MIL)</option>
                        <option value="Sanskrit">Sanskrit (MIL)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Skill Enhancement (SEC)
                      </label>
                      <select
                        value={form.secSubject}
                        onChange={(e) => setForm({ ...form, secSubject: e.target.value })}
                        className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none bg-white"
                      >
                        <option value="Creative Writing">Creative Writing</option>
                        <option value="Digital Marketing">Digital Marketing</option>
                        <option value="Basic IT Tools">Basic IT Tools & Computing</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* BASIC CANDIDATE PARTICULARS */}
                <div>
                  <h3 className="text-sm font-bold text-[#800000] uppercase tracking-wider mb-4 pb-1 border-b border-slate-100">
                    2. Candidate Personal Information {admissionMode === 'PROGRESSION' && '(Restored from Sem 1)'}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        First Name <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        disabled={admissionMode === 'PROGRESSION'}
                        placeholder="First Name"
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none disabled:bg-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Middle Name</label>
                      <input
                        type="text"
                        disabled={admissionMode === 'PROGRESSION'}
                        placeholder="Middle Name"
                        value={form.middleName}
                        onChange={(e) => setForm({ ...form, middleName: e.target.value })}
                        className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none disabled:bg-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Last Name <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        disabled={admissionMode === 'PROGRESSION'}
                        placeholder="Last Name"
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none disabled:bg-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Gender <span className="text-rose-600">*</span>
                      </label>
                      <select
                        value={form.gender}
                        disabled={admissionMode === 'PROGRESSION'}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                        className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none bg-white disabled:bg-slate-100"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Transgender">Transgender</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Date of Birth <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        disabled={admissionMode === 'PROGRESSION'}
                        value={form.dob}
                        onChange={(e) => setForm({ ...form, dob: e.target.value })}
                        className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none disabled:bg-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mobile Number <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        disabled={admissionMode === 'PROGRESSION'}
                        placeholder="10-digit mobile"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none disabled:bg-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Father&apos;s Name <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        disabled={admissionMode === 'PROGRESSION'}
                        placeholder="Father's Name"
                        value={form.fatherName}
                        onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                        className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none disabled:bg-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mother&apos;s Name <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        disabled={admissionMode === 'PROGRESSION'}
                        placeholder="Mother's Name"
                        value={form.motherName}
                        onChange={(e) => setForm({ ...form, motherName: e.target.value })}
                        className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none disabled:bg-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Social Category <span className="text-rose-600">*</span>
                      </label>
                      <select
                        value={form.category}
                        disabled={admissionMode === 'PROGRESSION'}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none bg-white disabled:bg-slate-100"
                      >
                        <option value="General">General</option>
                        <option value="BC">BC (Backward Class)</option>
                        <option value="EBC">EBC (Extremely Backward Class)</option>
                        <option value="SC">SC (Scheduled Caste)</option>
                        <option value="ST">ST (Scheduled Tribe)</option>
                        <option value="EWS">EWS (Economically Weaker Section)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Address <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        disabled={admissionMode === 'PROGRESSION'}
                        placeholder="Village / Mohalla, Post, PS, District, State, Pin Code"
                        value={form.currentAddress}
                        onChange={(e) => setForm({ ...form, currentAddress: e.target.value })}
                        className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none disabled:bg-slate-100"
                      />
                    </div>
                  </div>
                </div>

                {/* SUBMIT BUTTON -> OPENS FEE MODAL */}
                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button
                    type="submit"
                    className="px-8 py-3 text-xs sm:text-sm font-bold text-white bg-[#800000] hover:bg-[#5C0000] rounded-xl shadow-md transition flex items-center gap-2"
                  >
                    <span>Proceed to Fee Structure & Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* FEE STRUCTURE PREVIEW & PAYMENT MODAL */}
        {showFeeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
              <div className="bg-[#800000] text-white p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wide">
                    Course Fee Structure & Payment
                  </h3>
                  <span className="text-[11px] opacity-80">
                    Semester {form.targetSemester} • {form.faculty}
                  </span>
                </div>
                <button
                  onClick={() => setShowFeeModal(false)}
                  className="text-white/80 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                {/* Candidate Overview */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-900">{form.firstName} {form.lastName}</div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Program: Bachelor&apos;s ({form.faculty}) • MJC: {form.mjcSubject}
                  </div>
                </div>

                {/* Detailed Fee Breakdown Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 font-bold text-[11px] text-slate-600 border-b">
                      <tr>
                        <th className="p-2.5">Fee Head</th>
                        <th className="p-2.5 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2.5 font-medium text-slate-700">Admission & Institutional Registration Fee</td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-800">₹{admissionFee}.00</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium text-slate-700">BRABU CBCS Tuition Fee (Semester {form.targetSemester})</td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-800">₹{tuitionFee}.00</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium text-slate-700">Laboratory & University Examination Fee</td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-800">₹{examFee}.00</td>
                      </tr>
                      <tr className="bg-[#800000]/5 font-black text-slate-900">
                        <td className="p-3 text-sm text-[#800000]">Total Payable Amount</td>
                        <td className="p-3 text-right font-mono text-base text-[#800000]">₹{totalFee}.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Payment Option */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">Select Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 p-2.5 border rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                      <input
                        type="radio"
                        name="payMethod"
                        value="ONLINE_GATEWAY"
                        checked={paymentMethod === 'ONLINE_GATEWAY'}
                        onChange={() => setPaymentMethod('ONLINE_GATEWAY')}
                        className="text-[#800000]"
                      />
                      <span className="font-semibold text-slate-800">Online UPI / Cards</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 border rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                      <input
                        type="radio"
                        name="payMethod"
                        value="BANK_CHALLAN"
                        checked={paymentMethod === 'BANK_CHALLAN'}
                        onChange={() => setPaymentMethod('BANK_CHALLAN')}
                        className="text-[#800000]"
                      />
                      <span className="font-semibold text-slate-800">Bank Challan</span>
                    </label>
                  </div>
                </div>

                {/* Workflow Notice */}
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-[11px] leading-relaxed">
                  {admissionMode === 'FRESH' ? (
                    <span>
                      <strong>Semester 1 Rule:</strong> Once payment is confirmed, your record is stored and will receive final approval from the Principal (Super Admin).
                    </span>
                  ) : (
                    <span>
                      <strong>Progression Rule:</strong> As an existing student, your payment will automatically promote you to Semester {form.targetSemester} without waiting for manual permission.
                    </span>
                  )}
                </div>

                {/* Modal Buttons */}
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowFeeModal(false)}
                    className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2 font-bold text-white bg-[#800000] hover:bg-[#5C0000] rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <CreditCard className="w-4 h-4" />
                    {isSubmitting ? 'Processing Payment...' : `Pay ₹${totalFee} & Register`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STATUS CHECK MODAL */}
        {showStatusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative border border-slate-200">
              <button
                onClick={() => setShowStatusModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-base font-bold text-[#800000] mb-1">
                Check Admission & Registration Status
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Enter your Application Ref No or Registration Code and Date of Birth to fetch live database records.
              </p>

              <form onSubmit={handleCheckStatusSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Application Ref No / Registration Code <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MKR-2026-00001 or MKR-REG-..."
                    value={statusRefNo}
                    onChange={(e) => setStatusRefNo(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Your Date of Birth <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={statusDob}
                    onChange={(e) => setStatusDob(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowStatusModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isCheckingStatus}
                    className="px-5 py-2 text-xs font-bold text-white bg-[#800000] hover:bg-[#5C0000] rounded-lg shadow-sm disabled:opacity-50"
                  >
                    {isCheckingStatus ? 'Fetching...' : 'Submit'}
                  </button>
                </div>
              </form>

              {statusResult && (
                <div className="mt-5 p-4 bg-[#FFF8F0] border border-[#800000]/20 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center border-b border-[#800000]/10 pb-2">
                    <span className="text-slate-500 font-bold uppercase">Candidate:</span>
                    <span className="font-bold text-slate-900">{statusResult.candidateName}</span>
                  </div>
                  {statusResult.collegeRollNo && (
                    <div><strong>College Roll No:</strong> <span className="font-mono font-bold text-[#800000]">{statusResult.collegeRollNo}</span></div>
                  )}
                  {statusResult.semester && <div><strong>Standing:</strong> {statusResult.semester}</div>}
                  <div className="flex justify-between items-center">
                    <span><strong>Status:</strong></span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                      {statusResult.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded border border-slate-200 mt-2 leading-relaxed">
                    {statusResult.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
