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
  UploadCloud, 
  Printer, 
  School, 
  X,
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function OnlineAdmissionPage() {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [submittedData, setSubmittedData] = useState<any | null>(null);

  // Status Modal Inputs
  const [statusRefNo, setStatusRefNo] = useState('');
  const [statusDob, setStatusDob] = useState('');
  const [statusResult, setStatusResult] = useState<any | null>(null);

  // Form State matching college.mkrcollege.com
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

    // University Registration & Photo
    universityAppNo: '',
    photoFileName: '',

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

    // Document
    docFileName: '',
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
    let val = e.target.value.replace(/\D/g, ''); // Numbers only
    if (val.length > 12) val = val.substring(0, 12);
    // Format into XXXX-XXXX-XXXX
    const formatted = val.match(/.{1,4}/g)?.join('-') || val;
    setForm({ ...form, aadhaarNo: formatted });
  };

  const handleApaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ''); // Numbers only
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const refNo = `MKR-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    setSubmittedData({
      ...form,
      refNo,
      submittedAt: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCheckStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusRefNo || !statusDob) return;
    setStatusResult({
      refNo: statusRefNo,
      candidateName: 'Rahul Kumar (Sample Record)',
      fatherName: 'Ramdev Ray',
      course: 'B.A. (Honours) - CBCS 4-Year',
      faculty: 'Social Science',
      mjc: 'HISTORY',
      mic: 'POLITICAL SCIENCE',
      status: 'DOCUMENT_VERIFIED',
      message: 'Your documents have been verified by the college scrutiny committee. Please proceed with Semester 1 fee clearance at the accounts counter or online portal.',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Top Instruction Banner */}
          <div className="bg-[#FFF8F0] border-l-4 border-[#800000] p-4 rounded-r-xl shadow-xs mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#800000] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Important Instruction
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-medium mt-0.5">
                Please Print Form And Submit in College with All Required Documents.
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
                  Online Admission Application Form (Session 2026–2030)
                </div>
              </div>

              {/* Application Summary Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Application Ref No:</span>
                  <span className="font-mono text-base font-bold text-[#800000]">{submittedData.refNo}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">BRABU Portal App No:</span>
                  <span className="font-mono text-base font-bold text-slate-900">{submittedData.universityAppNo || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Date of Submission:</span>
                  <span className="font-bold text-slate-900">{submittedData.submittedAt}</span>
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
                  <div><strong>Religion:</strong> {submittedData.religion}</div>
                  <div><strong>Marital Status:</strong> {submittedData.maritalStatus}</div>
                  <div><strong>Mobile:</strong> {submittedData.phone}</div>
                  <div><strong>Email:</strong> {submittedData.email || 'N/A'}</div>
                  <div><strong>Aadhaar No:</strong> {submittedData.aadhaarNo || 'N/A'}</div>
                  <div><strong>APAAR / ABC ID:</strong> {submittedData.apaarNo || 'N/A'}</div>
                </div>

                <h3 className="font-bold text-sm text-[#800000] border-b border-slate-200 pb-1 uppercase tracking-wider pt-2">
                  2. Parent Particulars
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-slate-100">
                  <div><strong>Father's Name:</strong> {submittedData.fatherName}</div>
                  <div><strong>Father's Mobile:</strong> {submittedData.fatherPhone || 'N/A'}</div>
                  <div><strong>Mother's Name:</strong> {submittedData.motherName || 'N/A'}</div>
                </div>

                <h3 className="font-bold text-sm text-[#800000] border-b border-slate-200 pb-1 uppercase tracking-wider pt-2">
                  3. BRABU 4-Year CBCS Subject Allocations
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-slate-100">
                  <div><strong>Faculty:</strong> {submittedData.faculty}</div>
                  <div><strong>Major Course (MJC):</strong> <span className="font-bold text-[#800000]">{submittedData.mjcSubject}</span></div>
                  <div><strong>Minor Course (MIC):</strong> {submittedData.micSubject}</div>
                  <div><strong>Multidisciplinary (MDC):</strong> {submittedData.mdcSubject}</div>
                  <div><strong>Ability Enhancement (AEC):</strong> {submittedData.aecSubject}</div>
                  <div><strong>Skill Enhancement (SEC):</strong> {submittedData.secSubject}</div>
                  <div className="sm:col-span-3"><strong>Value Added Course (VAC):</strong> {submittedData.vacSubject}</div>
                </div>

                <h3 className="font-bold text-sm text-[#800000] border-b border-slate-200 pb-1 uppercase tracking-wider pt-2">
                  4. Academic Record (10th & 12th)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-slate-300">
                    <thead className="bg-slate-100 font-bold text-[11px]">
                      <tr>
                        <th className="border border-slate-300 p-2">Class</th>
                        <th className="border border-slate-300 p-2">Board</th>
                        <th className="border border-slate-300 p-2">Passing Year</th>
                        <th className="border border-slate-300 p-2">Roll No</th>
                        <th className="border border-slate-300 p-2">Marks Obtained</th>
                        <th className="border border-slate-300 p-2">Marks %</th>
                        <th className="border border-slate-300 p-2">School / College</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-2 font-bold">Matric (10th)</td>
                        <td className="border border-slate-300 p-2">{submittedData.matricBoard}</td>
                        <td className="border border-slate-300 p-2">{submittedData.matricPassingYear}</td>
                        <td className="border border-slate-300 p-2">{submittedData.matricRollNum || '-'}</td>
                        <td className="border border-slate-300 p-2">{submittedData.matricMarks || '-'}</td>
                        <td className="border border-slate-300 p-2">{submittedData.matricPercent || '-'}</td>
                        <td className="border border-slate-300 p-2">{submittedData.matricSchool || '-'}</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 font-bold">Inter (12th)</td>
                        <td className="border border-slate-300 p-2">{submittedData.interBoard}</td>
                        <td className="border border-slate-300 p-2">{submittedData.interPassingYear}</td>
                        <td className="border border-slate-300 p-2">{submittedData.interRollNum || '-'}</td>
                        <td className="border border-slate-300 p-2">{submittedData.interMarks || '-'}</td>
                        <td className="border border-slate-300 p-2">{submittedData.interPercent || '-'}</td>
                        <td className="border border-slate-300 p-2">{submittedData.interSchool || '-'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="font-bold text-sm text-[#800000] border-b border-slate-200 pb-1 uppercase tracking-wider pt-2">
                  5. Residential Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-slate-100">
                  <div><strong>Current Address:</strong> {submittedData.currentAddress || 'N/A'}</div>
                  <div><strong>Permanent Address:</strong> {submittedData.permanentAddress || 'N/A'}</div>
                </div>

                {/* Signatures */}
                <div className="pt-12 flex justify-between items-end border-t border-slate-300 mt-8">
                  <div className="text-center">
                    <div className="w-40 border-b border-slate-400 mb-1"></div>
                    <span className="text-[11px] text-slate-500">Candidate Signature</span>
                  </div>
                  <div className="text-center">
                    <div className="w-40 border-b border-slate-400 mb-1"></div>
                    <span className="text-[11px] text-slate-500">Scrutiny Officer (MKR College)</span>
                  </div>
                  <div className="text-center">
                    <div className="w-40 border-b border-slate-400 mb-1"></div>
                    <span className="text-[11px] text-slate-500">Principal Signature & Seal</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap justify-center gap-4 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-[#800000] hover:bg-[#5C0000] rounded-xl shadow-sm flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Print Application Form
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
            /* Main Form */
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
              {/* Session Indicator */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#800000] tracking-tight">
                    Online Registration & Admission Form
                  </h2>
                  <p className="text-xs text-slate-500">Admission For Session 2026–2030 (4-Year CBCS Degree)</p>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#FFF8F0] border border-[#800000]/20 text-[#800000] text-xs font-bold">
                  UG Semester 1
                </span>
              </div>

              {/* SECTION 1: Personal Information */}
              <div>
                <h3 className="text-sm font-bold text-[#800000] uppercase tracking-wider mb-4 pb-1 border-b border-slate-100">
                  1. Student Basic Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      First Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="First Name"
                      pattern="[A-Za-z ]*"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Middle Name</label>
                    <input
                      type="text"
                      placeholder="Middle Name"
                      pattern="[A-Za-z ]*"
                      value={form.middleName}
                      onChange={(e) => setForm({ ...form, middleName: e.target.value })}
                      className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Last Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Last Name"
                      pattern="[A-Za-z ]*"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Gender <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none bg-white"
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
                      value={form.dob}
                      onChange={(e) => setForm({ ...form, dob: e.target.value })}
                      className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mobile No.</label>
                    <input
                      type="tel"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      placeholder="10-digit mobile"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="student@gmail.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none bg-white font-medium"
                    >
                      <option value="General">General</option>
                      <option value="BC">BC (Backward Class)</option>
                      <option value="OBC">OBC</option>
                      <option value="EBC">EBC (Extremely Backward Class)</option>
                      <option value="SC">SC (Scheduled Caste)</option>
                      <option value="ST">ST (Scheduled Tribe)</option>
                      <option value="WBC">WBC (Women Backward Class)</option>
                      <option value="EWS">EWS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Religion</label>
                    <select
                      value={form.religion}
                      onChange={(e) => setForm({ ...form, religion: e.target.value })}
                      className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none bg-white"
                    >
                      <option value="Hinduism">Hinduism</option>
                      <option value="Islam">Islam</option>
                      <option value="Jainism">Jainism</option>
                      <option value="Christianity">Christianity</option>
                      <option value="Buddhism">Buddhism</option>
                      <option value="Sikhism">Sikhism</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Marital Status</label>
                    <select
                      value={form.maritalStatus}
                      onChange={(e) => setForm({ ...form, maritalStatus: e.target.value })}
                      className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none bg-white"
                    >
                      <option value="Unmarried">Unmarried</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Divorced">Divorced</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: CBCS Subject Selection */}
              <div>
                <h3 className="text-sm font-bold text-[#800000] uppercase tracking-wider mb-4 pb-1 border-b border-slate-100">
                  2. BRABU 4-Year CBCS Subject Choices
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Faculty <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={form.faculty}
                      onChange={(e) => handleFacultyChange(e.target.value)}
                      className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none bg-white font-bold"
                    >
                      <option value="Social Science">Social Science</option>
                      <option value="Humanities">Humanities</option>
                      <option value="Commerce">Commerce</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Honours Subject (MJC - Major) <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={form.mjcSubject}
                      onChange={(e) => setForm({ ...form, mjcSubject: e.target.value })}
                      className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none bg-white font-bold text-[#800000]"
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
                      className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none bg-white font-medium"
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
                      className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none bg-white"
                    >
                      {facultySubjects[form.faculty]?.mdc.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ability Enhancement Course (AEC)
                    </label>
                    <select
                      value={form.aecSubject}
                      onChange={(e) => setForm({ ...form, aecSubject: e.target.value })}
                      className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none bg-white"
                    >
                      <option value="Hindi">Hindi</option>
                      <option value="English">English</option>
                      <option value="Urdu">Urdu</option>
                      <option value="Bangali">Bangali</option>
                      <option value="Maithili">Maithili</option>
                      <option value="Bhojpuri">Bhojpuri</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Skill Enhancement Subject (SEC)
                    </label>
                    <select
                      value={form.secSubject}
                      onChange={(e) => setForm({ ...form, secSubject: e.target.value })}
                      className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none bg-white"
                    >
                      <option value="Creative Writing">Creative Writing</option>
                      <option value="Communication in Every Day Life">Communication in Every Day Life</option>
                      <option value="Public Speaking in English and Leadership">Public Speaking in English and Leadership</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Value Added Course Subject (VAC)
                    </label>
                    <select
                      value={form.vacSubject}
                      onChange={(e) => setForm({ ...form, vacSubject: e.target.value })}
                      className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none bg-white"
                    >
                      <option value="Development of Personality">Development of Personality</option>
                      <option value="Sport and Life">Sport and Life</option>
                      <option value="Ethics and Culture">Ethics and Culture</option>
                      <option value="Gandhi and Education">Gandhi and Education</option>
                      <option value="Swachh Bharat">Swachh Bharat</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: University Registration & Photo */}
              <div>
                <h3 className="text-sm font-bold text-[#800000] uppercase tracking-wider mb-4 pb-1 border-b border-slate-100">
                  3. University Credentials & Photo
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      University Application No <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter BRABU Online Application Number"
                      value={form.universityAppNo}
                      onChange={(e) => setForm({ ...form, universityAppNo: e.target.value })}
                      className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Student Photo (Max Size: 50 KB)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setForm({ ...form, photoFileName: e.target.files?.[0]?.name || '' })}
                      className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#800000] file:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: Parent Details */}
              <div>
                <h3 className="text-sm font-bold text-[#800000] uppercase tracking-wider mb-4 pb-1 border-b border-slate-100">
                  4. Parent Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Father Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Father's Name"
                      value={form.fatherName}
                      onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                      className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Father Phone</label>
                    <input
                      type="tel"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      placeholder="10-digit mobile"
                      value={form.fatherPhone}
                      onChange={(e) => setForm({ ...form, fatherPhone: e.target.value })}
                      className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mother Name</label>
                    <input
                      type="text"
                      placeholder="Mother's Name"
                      value={form.motherName}
                      onChange={(e) => setForm({ ...form, motherName: e.target.value })}
                      className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: Details of Academic Record Table */}
              <div>
                <h3 className="text-sm font-bold text-[#800000] uppercase tracking-wider mb-4 pb-1 border-b border-slate-100">
                  5. Details of Academic Record
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-300 rounded-lg">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="p-2.5 border-b border-r border-slate-300 w-28">Class</th>
                        <th className="p-2.5 border-b border-r border-slate-300 w-36">Board</th>
                        <th className="p-2.5 border-b border-r border-slate-300 w-28">Passing Year</th>
                        <th className="p-2.5 border-b border-r border-slate-300 w-32">Roll No.</th>
                        <th className="p-2.5 border-b border-r border-slate-300 w-28">Marks Obt</th>
                        <th className="p-2.5 border-b border-r border-slate-300 w-24">Marks %</th>
                        <th className="p-2.5 border-b border-slate-300">Which School/College Passed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {/* 10th Record */}
                      <tr>
                        <td className="p-2 border-r border-slate-300 font-bold bg-slate-50">Matric (10th)</td>
                        <td className="p-2 border-r border-slate-300">
                          <input
                            type="text"
                            value={form.matricBoard}
                            onChange={(e) => setForm({ ...form, matricBoard: e.target.value })}
                            className="w-full p-1 border border-slate-200 rounded"
                          />
                        </td>
                        <td className="p-2 border-r border-slate-300">
                          <input
                            type="text"
                            value={form.matricPassingYear}
                            onChange={(e) => setForm({ ...form, matricPassingYear: e.target.value })}
                            className="w-full p-1 border border-slate-200 rounded"
                          />
                        </td>
                        <td className="p-2 border-r border-slate-300">
                          <input
                            type="text"
                            placeholder="Roll No"
                            value={form.matricRollNum}
                            onChange={(e) => setForm({ ...form, matricRollNum: e.target.value })}
                            className="w-full p-1 border border-slate-200 rounded"
                          />
                        </td>
                        <td className="p-2 border-r border-slate-300">
                          <input
                            type="text"
                            placeholder="Marks"
                            value={form.matricMarks}
                            onChange={(e) => setForm({ ...form, matricMarks: e.target.value })}
                            className="w-full p-1 border border-slate-200 rounded"
                          />
                        </td>
                        <td className="p-2 border-r border-slate-300">
                          <input
                            type="text"
                            placeholder="%"
                            value={form.matricPercent}
                            onChange={(e) => setForm({ ...form, matricPercent: e.target.value })}
                            className="w-full p-1 border border-slate-200 rounded"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            placeholder="School Name"
                            value={form.matricSchool}
                            onChange={(e) => setForm({ ...form, matricSchool: e.target.value })}
                            className="w-full p-1 border border-slate-200 rounded"
                          />
                        </td>
                      </tr>

                      {/* 12th Record */}
                      <tr>
                        <td className="p-2 border-r border-slate-300 font-bold bg-slate-50">Inter (12th)</td>
                        <td className="p-2 border-r border-slate-300">
                          <input
                            type="text"
                            value={form.interBoard}
                            onChange={(e) => setForm({ ...form, interBoard: e.target.value })}
                            className="w-full p-1 border border-slate-200 rounded"
                          />
                        </td>
                        <td className="p-2 border-r border-slate-300">
                          <input
                            type="text"
                            value={form.interPassingYear}
                            onChange={(e) => setForm({ ...form, interPassingYear: e.target.value })}
                            className="w-full p-1 border border-slate-200 rounded"
                          />
                        </td>
                        <td className="p-2 border-r border-slate-300">
                          <input
                            type="text"
                            placeholder="Roll No"
                            value={form.interRollNum}
                            onChange={(e) => setForm({ ...form, interRollNum: e.target.value })}
                            className="w-full p-1 border border-slate-200 rounded"
                          />
                        </td>
                        <td className="p-2 border-r border-slate-300">
                          <input
                            type="text"
                            placeholder="Marks"
                            value={form.interMarks}
                            onChange={(e) => setForm({ ...form, interMarks: e.target.value })}
                            className="w-full p-1 border border-slate-200 rounded"
                          />
                        </td>
                        <td className="p-2 border-r border-slate-300">
                          <input
                            type="text"
                            placeholder="%"
                            value={form.interPercent}
                            onChange={(e) => setForm({ ...form, interPercent: e.target.value })}
                            className="w-full p-1 border border-slate-200 rounded"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            placeholder="College Name"
                            value={form.interSchool}
                            onChange={(e) => setForm({ ...form, interSchool: e.target.value })}
                            className="w-full p-1 border border-slate-200 rounded"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 6: Miscellaneous Identifiers */}
              <div>
                <h3 className="text-sm font-bold text-[#800000] uppercase tracking-wider mb-4 pb-1 border-b border-slate-100">
                  6. Miscellaneous Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Aadhaar No</label>
                    <input
                      type="text"
                      maxLength={14}
                      placeholder="XXXX-XXXX-XXXX"
                      value={form.aadhaarNo}
                      onChange={handleAadhaarChange}
                      className="w-full text-sm font-mono px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Apaar No / ABC ID</label>
                    <input
                      type="text"
                      maxLength={14}
                      placeholder="XXXX-XXXX-XXXX"
                      value={form.apaarNo}
                      onChange={handleApaarChange}
                      className="w-full text-sm font-mono px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 7: Address Details */}
              <div>
                <h3 className="text-sm font-bold text-[#800000] uppercase tracking-wider mb-4 pb-1 border-b border-slate-100">
                  7. Student Address Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Current Address *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Village / Ward, Post Office, Police Station, District (Sitamarhi), PIN"
                      value={form.currentAddress}
                      onChange={(e) => setForm({ ...form, currentAddress: e.target.value })}
                      className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
                    ></textarea>

                    <label className="flex items-center gap-2 mt-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.sameAsCurrentAddress}
                        onChange={(e) => handleSameAddressToggle(e.target.checked)}
                        className="rounded text-[#800000] focus:ring-[#800000]"
                      />
                      <span>If Permanent Address Is Current Address</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Permanent Address *</label>
                    <textarea
                      rows={3}
                      required
                      disabled={form.sameAsCurrentAddress}
                      placeholder="Permanent Residence Address"
                      value={form.sameAsCurrentAddress ? form.currentAddress : form.permanentAddress}
                      onChange={(e) => setForm({ ...form, permanentAddress: e.target.value })}
                      className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none disabled:bg-slate-100"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* SECTION 8: Upload Documents */}
              <div>
                <h3 className="text-sm font-bold text-[#800000] uppercase tracking-wider mb-4 pb-1 border-b border-slate-100">
                  8. Upload Documents
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Documents <span className="text-slate-500 font-normal">(To Upload Multiple Documents, Compress into a Single File - Max Size: 200 KB)</span>
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setForm({ ...form, docFileName: e.target.files?.[0]?.name || '' })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#800000] file:text-white"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 text-sm font-bold text-white bg-[#800000] hover:bg-[#5C0000] rounded-xl shadow-md transition flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Submit Application
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal: Check Form Status */}
        {showStatusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200 animate-in fade-in zoom-in-95">
              <button
                onClick={() => setShowStatusModal(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 mb-4 border-b border-slate-100 pb-3">
                <Search className="w-5 h-5 text-[#800000]" />
                <h3 className="text-base font-bold text-slate-900">Check Your Form Status</h3>
              </div>

              <form onSubmit={handleCheckStatusSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enter Your Reference Number <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MKR-2026-00102"
                    value={statusRefNo}
                    onChange={(e) => setStatusRefNo(e.target.value)}
                    className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
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
                    className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
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
                    className="px-5 py-2 text-xs font-bold text-white bg-[#800000] hover:bg-[#5C0000] rounded-lg shadow-sm"
                  >
                    Submit
                  </button>
                </div>
              </form>

              {statusResult && (
                <div className="mt-5 p-4 bg-[#FFF8F0] border border-[#800000]/20 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center border-b border-[#800000]/10 pb-2">
                    <span className="text-slate-500 font-bold uppercase">Candidate:</span>
                    <span className="font-bold text-slate-900">{statusResult.candidateName}</span>
                  </div>
                  <div><strong>Course:</strong> {statusResult.course}</div>
                  <div><strong>Major (MJC):</strong> {statusResult.mjc}</div>
                  <div className="flex justify-between items-center">
                    <span><strong>Status:</strong></span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      {statusResult.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded border border-slate-200 mt-2">
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
