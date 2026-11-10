'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  GraduationCap, 
  FileText, 
  CheckCircle2, 
  Search, 
  ArrowRight, 
  AlertCircle, 
  UploadCloud, 
  User, 
  BookOpen, 
  Calendar,
  Sparkles
} from 'lucide-react';

export default function OnlineAdmissionPage() {
  const [activeTab, setActiveTab] = useState<'apply' | 'status'>('apply');
  const [currentStep, setCurrentStep] = useState(1);
  const [submittedAppNo, setSubmittedAppNo] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal
    fullName: '',
    fatherName: '',
    motherName: '',
    dateOfBirth: '',
    gender: 'Male',
    category: 'GEN',
    phone: '',
    email: '',
    aadharNo: '',
    address: '',
    // Step 2: Academic (12th)
    board12th: 'BSEB, Patna',
    stream12th: 'Arts',
    passingYear: '2026',
    rollCode: '',
    rollNo: '',
    obtainedMarks: '',
    totalMarks: '500',
    // Step 3: Course Selection
    course: 'BA',
    majorSubject: 'History',
    minorSubject: 'Political Science',
  });

  // Track status state
  const [trackRef, setTrackRef] = useState('');
  const [trackResult, setTrackResult] = useState<any | null>(null);

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    const appNo = `MKR-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    setSubmittedAppNo(appNo);
  };

  const handleTrackStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackRef) return;
    setTrackResult({
      appNo: trackRef,
      name: 'Candidate Verification Sample',
      course: 'B.A. (Honours) - CBCS 4 Year',
      major: 'History',
      status: 'DOCUMENT_VERIFIED',
      stageMessage: 'Application approved by college verification committee. Eligible for Semester 1 Admission Fee Clearance.',
      submittedAt: '10 Nov 2026',
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
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0f2744] text-xs font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> UG Admission Session 2026–2030 (BRABU CBCS)
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Online Admission Portal
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Matashri Kaushalya Ramdev Dr. Ganesh Ray Degree College, Sitamarhi
                </p>
              </div>

              {/* Tabs Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab('apply')}
                  className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition ${
                    activeTab === 'apply'
                      ? 'bg-white text-[#0f2744] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  New Application Form
                </button>
                <button
                  onClick={() => setActiveTab('status')}
                  className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition ${
                    activeTab === 'status'
                      ? 'bg-white text-[#0f2744] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Track Application Status
                </button>
              </div>
            </div>
          </div>

          {activeTab === 'apply' ? (
            /* Application Form Container */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {submittedAppNo ? (
                /* Submission Confirmation */
                <div className="p-8 sm:p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Application Submitted Successfully!</h2>
                  <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                    Your application for UG Semester 1 (Batch 2026-2030) has been recorded. Please preserve your reference number.
                  </p>
                  <div className="mt-6 inline-block bg-slate-100 border border-slate-300 rounded-xl px-6 py-4 font-mono text-xl font-black text-[#0f2744] tracking-wider">
                    {submittedAppNo}
                  </div>
                  <p className="text-xs text-slate-500 mt-3">
                    A confirmation SMS has been dispatched. College verification will be completed within 24–48 hours.
                  </p>

                  <div className="mt-8 flex justify-center gap-4">
                    <button
                      onClick={() => {
                        setSubmittedAppNo(null);
                        setCurrentStep(1);
                      }}
                      className="px-5 py-2.5 text-xs font-bold text-white bg-[#0f2744] rounded-lg shadow-sm"
                    >
                      Fill Another Form
                    </button>
                    <Link
                      href="/"
                      className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                    >
                      Return to Home
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {/* Step Progress Indicator */}
                  <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center justify-between max-w-2xl mx-auto">
                      <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          currentStep >= 1 ? 'bg-[#0f2744] text-white' : 'bg-slate-200 text-slate-500'
                        }`}>1</span>
                        <span className="text-xs font-bold text-slate-700 hidden sm:inline">Personal Details</span>
                      </div>
                      <div className="flex-1 h-0.5 bg-slate-200 mx-3"></div>
                      <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          currentStep >= 2 ? 'bg-[#0f2744] text-white' : 'bg-slate-200 text-slate-500'
                        }`}>2</span>
                        <span className="text-xs font-bold text-slate-700 hidden sm:inline">12th Qualification</span>
                      </div>
                      <div className="flex-1 h-0.5 bg-slate-200 mx-3"></div>
                      <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          currentStep >= 3 ? 'bg-[#0f2744] text-white' : 'bg-slate-200 text-slate-500'
                        }`}>3</span>
                        <span className="text-xs font-bold text-slate-700 hidden sm:inline">CBCS Subjects</span>
                      </div>
                      <div className="flex-1 h-0.5 bg-slate-200 mx-3"></div>
                      <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          currentStep >= 4 ? 'bg-[#0f2744] text-white' : 'bg-slate-200 text-slate-500'
                        }`}>4</span>
                        <span className="text-xs font-bold text-slate-700 hidden sm:inline">Documents</span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmitApplication} className="p-6 sm:p-8">
                    {/* STEP 1: Personal Details */}
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <div className="border-b border-slate-100 pb-3">
                          <h3 className="text-base font-bold text-slate-900">Step 1: Personal & Identification Information</h3>
                          <p className="text-xs text-slate-500">Ensure name matches strictly with Class 10/12 matriculation certificates.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Candidate's Full Name *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Rahul Kumar"
                              value={formData.fullName}
                              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f2744] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Father's Name *</label>
                            <input
                              type="text"
                              required
                              placeholder="Father's Name"
                              value={formData.fatherName}
                              onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f2744] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Mother's Name *</label>
                            <input
                              type="text"
                              required
                              placeholder="Mother's Name"
                              value={formData.motherName}
                              onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f2744] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth *</label>
                            <input
                              type="date"
                              required
                              value={formData.dateOfBirth}
                              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f2744] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
                            <select
                              value={formData.gender}
                              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f2744] focus:outline-none bg-white"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Caste Category *</label>
                            <select
                              value={formData.category}
                              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f2744] focus:outline-none bg-white"
                            >
                              <option value="GEN">General (Unreserved)</option>
                              <option value="OBC">OBC (BC-II)</option>
                              <option value="EBC">EBC (BC-I)</option>
                              <option value="SC">Scheduled Caste (SC)</option>
                              <option value="ST">Scheduled Tribe (ST)</option>
                              <option value="EWS">Economically Weaker Section (EWS)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number (WhatsApp Active) *</label>
                            <input
                              type="tel"
                              required
                              maxLength={10}
                              placeholder="10-digit mobile"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f2744] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                            <input
                              type="email"
                              required
                              placeholder="candidate@gmail.com"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f2744] focus:outline-none"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 mb-1">Aadhar Card Number *</label>
                            <input
                              type="text"
                              maxLength={12}
                              placeholder="12-digit UIDAI Aadhar Number"
                              value={formData.aadharNo}
                              onChange={(e) => setFormData({ ...formData, aadharNo: e.target.value })}
                              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f2744] focus:outline-none"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 mb-1">Permanent Residential Address *</label>
                            <textarea
                              rows={2}
                              required
                              placeholder="Village / Mohalla, Post Office, Police Station, District (Sitamarhi), PIN"
                              value={formData.address}
                              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f2744] focus:outline-none"
                            ></textarea>
                          </div>
                        </div>

                        <div className="flex justify-end pt-4">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="px-6 py-2.5 text-xs font-bold text-white bg-[#0f2744] hover:bg-[#1b4374] rounded-lg shadow-sm flex items-center gap-2"
                          >
                            Proceed to Qualification <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: Academic Qualifications */}
                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <div className="border-b border-slate-100 pb-3">
                          <h3 className="text-base font-bold text-slate-900">Step 2: Class 12th (Intermediate / +2) Details</h3>
                          <p className="text-xs text-slate-500">Provide intermediate board exam credentials for BRABU eligibility verification.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Intermediate Board *</label>
                            <input
                              type="text"
                              value={formData.board12th}
                              onChange={(e) => setFormData({ ...formData, board12th: e.target.value })}
                              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f2744] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Intermediate Stream *</label>
                            <select
                              value={formData.stream12th}
                              onChange={(e) => setFormData({ ...formData, stream12th: e.target.value })}
                              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f2744] focus:outline-none bg-white"
                            >
                              <option value="Arts">Arts (I.A.)</option>
                              <option value="Commerce">Commerce (I.Com.)</option>
                              <option value="Science">Science (I.Sc.)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Roll Code *</label>
                            <input
                              type="text"
                              placeholder="e.g. 51042"
                              value={formData.rollCode}
                              onChange={(e) => setFormData({ ...formData, rollCode: e.target.value })}
                              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f2744] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Roll Number *</label>
                            <input
                              type="text"
                              placeholder="e.g. 26010045"
                              value={formData.rollNo}
                              onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f2744] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Total Marks Obtained *</label>
                            <input
                              type="number"
                              placeholder="e.g. 385"
                              value={formData.obtainedMarks}
                              onChange={(e) => setFormData({ ...formData, obtainedMarks: e.target.value })}
                              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f2744] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Maximum Marks</label>
                            <input
                              type="number"
                              disabled
                              value={formData.totalMarks}
                              className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-500"
                            />
                          </div>
                        </div>

                        <div className="flex justify-between pt-4">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(3)}
                            className="px-6 py-2.5 text-xs font-bold text-white bg-[#0f2744] hover:bg-[#1b4374] rounded-lg shadow-sm flex items-center gap-2"
                          >
                            Proceed to Subject Choice <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: CBCS Subject Selection */}
                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <div className="border-b border-slate-100 pb-3">
                          <h3 className="text-base font-bold text-slate-900">Step 3: BRABU 4-Year CBCS Program & Subject Preference</h3>
                          <p className="text-xs text-slate-500">Choice Based Credit System structure for B.A. / B.Com. (Honours).</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 mb-1">Undergraduate Program *</label>
                            <select
                              value={formData.course}
                              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f2744] focus:outline-none bg-white font-bold"
                            >
                              <option value="BA">Bachelor of Arts (Honours) — 4-Year CBCS</option>
                              <option value="BCOM">Bachelor of Commerce (Honours) — 4-Year CBCS</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Major Course (MJC-1) *</label>
                            <select
                              value={formData.majorSubject}
                              onChange={(e) => setFormData({ ...formData, majorSubject: e.target.value })}
                              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f2744] focus:outline-none bg-white font-semibold"
                            >
                              <option value="History">History</option>
                              <option value="Political Science">Political Science</option>
                              <option value="Economics">Economics</option>
                              <option value="Psychology">Psychology</option>
                              <option value="Hindi">Hindi</option>
                              <option value="English">English</option>
                              <option value="Commerce">Accounts & Finance (B.Com)</option>
                            </select>
                            <p className="text-[11px] text-slate-500 mt-1">Core Discipline Credit (4 Credits)</p>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Minor Course (MIC-1) *</label>
                            <select
                              value={formData.minorSubject}
                              onChange={(e) => setFormData({ ...formData, minorSubject: e.target.value })}
                              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f2744] focus:outline-none bg-white"
                            >
                              <option value="Political Science">Political Science</option>
                              <option value="History">History</option>
                              <option value="Sociology">Sociology</option>
                              <option value="Philosophy">Philosophy</option>
                              <option value="Business Management">Business Management</option>
                            </select>
                            <p className="text-[11px] text-slate-500 mt-1">Allied Discipline Credit (3 Credits)</p>
                          </div>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
                          <strong>Note on Remaining CBCS Papers:</strong> Multidisciplinary Course (MDC), Ability Enhancement (AEC - English/MIL), Skill Enhancement (SEC), and Value Added Courses (VAC) will be verified and mapped automatically according to BRABU regulations during document verification.
                        </div>

                        <div className="flex justify-between pt-4">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(4)}
                            className="px-6 py-2.5 text-xs font-bold text-white bg-[#0f2744] hover:bg-[#1b4374] rounded-lg shadow-sm flex items-center gap-2"
                          >
                            Proceed to Uploads <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 4: Document Uploads & Declaration */}
                    {currentStep === 4 && (
                      <div className="space-y-6">
                        <div className="border-b border-slate-100 pb-3">
                          <h3 className="text-base font-bold text-slate-900">Step 4: Document Verification Uploads</h3>
                          <p className="text-xs text-slate-500">Upload scanned passport photo, signature, and Class 12th marksheet (JPG/PDF, Max 2MB).</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-[#0f2744] transition cursor-pointer bg-slate-50">
                            <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <span className="text-xs font-bold text-slate-700 block">Passport Size Photo</span>
                            <span className="text-[11px] text-slate-500">Max 200KB</span>
                          </div>

                          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-[#0f2744] transition cursor-pointer bg-slate-50">
                            <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <span className="text-xs font-bold text-slate-700 block">Candidate Signature</span>
                            <span className="text-[11px] text-slate-500">Max 100KB</span>
                          </div>

                          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-[#0f2744] transition cursor-pointer bg-slate-50">
                            <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <span className="text-xs font-bold text-slate-700 block">12th Marksheet</span>
                            <span className="text-[11px] text-slate-500">PDF / JPG Max 2MB</span>
                          </div>
                        </div>

                        <div className="pt-2">
                          <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                            <input type="checkbox" required className="mt-0.5 rounded text-[#0f2744] focus:ring-[#0f2744]" />
                            <span>
                              I hereby solemnly declare that all particulars stated in this application are true and correct. If any information is found incorrect, my admission will stand cancelled under B.R.A. Bihar University regulations.
                            </span>
                          </label>
                        </div>

                        <div className="flex justify-between pt-4">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(3)}
                            className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            className="px-8 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md flex items-center gap-2 transition"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Final Submit Application
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                </>
              )}
            </div>
          ) : (
            /* Track Status Container */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="max-w-xl mx-auto">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Track Application & Verification Status</h2>
                  <p className="text-xs text-slate-600 mt-1">
                    Enter your application reference number assigned during online submission.
                  </p>
                </div>

                <form onSubmit={handleTrackStatus} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Application Reference No *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MKR-2026-00102"
                      value={trackRef}
                      onChange={(e) => setTrackRef(e.target.value)}
                      className="w-full text-sm px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f2744] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 text-xs font-bold text-white bg-[#0f2744] hover:bg-[#1b4374] rounded-lg shadow-sm transition"
                  >
                    Check Live Status
                  </button>
                </form>

                {trackResult && (
                  <div className="mt-8 p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <span className="text-xs font-bold text-slate-500 uppercase">Application ID</span>
                      <span className="font-mono text-sm font-bold text-[#0f2744]">{trackResult.appNo}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Program</span>
                      <span className="font-semibold text-slate-800">{trackResult.course} ({trackResult.major})</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Current Standing</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        {trackResult.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 mt-2">
                      <strong>Status Update:</strong> {trackResult.stageMessage}
                    </p>
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
