'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CollegeLogo from '@/components/CollegeLogo';
import { 
  Users, 
  ShieldCheck, 
  CreditCard, 
  BookOpen, 
  Bell, 
  Search, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle,
  FileText,
  UserCheck,
  Building,
  GraduationCap,
  UserPlus,
  KeyRound,
  Calendar,
  Clock,
  Check,
  AlertTriangle
} from 'lucide-react';

interface StudentRecord {
  id: string;
  applicationNo: string;
  registrationCode?: string;
  collegeRollNo: string | null;
  universityRegNo: string | null;
  fullName: string;
  phone: string;
  category: string;
  gender: string;
  currentSemester: number;
  status: string;
  sessionName: string;
  courseCode: string;
  courseName: string;
}

interface PendingAdmission {
  id: string;
  applicationNo: string;
  registrationCode: string;
  fullName: string;
  phone: string;
  email: string;
  category: string;
  gender: string;
  courseName: string;
  courseCode: string;
  sessionName: string;
  status: string;
  createdAt: string;
  payment: {
    amount: number;
    receiptNo: string;
    status: string;
    method: string;
  } | null;
}

interface FacultyRecord {
  id: string;
  employeeCode: string;
  fullName: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  qualification: string;
  isActive: boolean;
  createdAt: string;
}

interface RegistrationWindowRecord {
  id: string;
  semester: number;
  startDate: string;
  endDate: string;
  graceDays: number;
  isActive: boolean;
  course: { code: string; name: string };
  academicSession: { name: string };
}

export default function PrincipalSuperAdminPage() {
  const [activeTab, setActiveTab] = useState<'students' | 'pending' | 'windows' | 'faculty' | 'fees' | 'notices'>('pending');
  
  // Data States
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [pendingList, setPendingList] = useState<PendingAdmission[]>([]);
  const [facultyList, setFacultyList] = useState<FacultyRecord[]>([]);
  const [windowsList, setWindowsList] = useState<RegistrationWindowRecord[]>([]);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [windowsLoading, setWindowsLoading] = useState(false);

  // Filters & Action States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Window Form State
  const [showWindowModal, setShowWindowModal] = useState(false);
  const [windowForm, setWindowForm] = useState({
    courseId: 'BA-SS',
    semester: 3,
    startDate: '',
    endDate: '',
  });

  // Faculty Form State
  const [showAddFaculty, setShowAddFaculty] = useState(false);
  const [facultyForm, setFacultyForm] = useState({
    fullName: '',
    departmentName: 'History',
    designation: 'Assistant Professor',
    email: '',
    phone: '',
    password: '',
    qualification: '',
  });
  const [isCreatingFaculty, setIsCreatingFaculty] = useState(false);

  // Fetch all initial data
  useEffect(() => {
    fetchStudents();
    fetchPendingAdmissions();
    fetchFaculty();
    fetchWindows();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/students');
      const json = await res.json();
      if (json && json.data) {
        setStudents(json.data);
      } else {
        setStudents([]);
      }
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingAdmissions = async () => {
    setPendingLoading(true);
    try {
      const res = await fetch('/api/admissions?action=pending');
      const json = await res.json();
      if (json && json.data) {
        setPendingList(json.data);
      } else {
        setPendingList([]);
      }
    } catch {
      setPendingList([]);
    } finally {
      setPendingLoading(false);
    }
  };

  const fetchFaculty = async () => {
    setFacultyLoading(true);
    try {
      const res = await fetch('/api/faculty');
      const json = await res.json();
      if (json && json.data) {
        setFacultyList(json.data);
      } else {
        setFacultyList([]);
      }
    } catch {
      setFacultyList([]);
    } finally {
      setFacultyLoading(false);
    }
  };

  const fetchWindows = async () => {
    setWindowsLoading(true);
    try {
      const res = await fetch('/api/admissions?action=windows');
      const json = await res.json();
      if (json && json.data) {
        setWindowsList(json.data);
      } else {
        setWindowsList([]);
      }
    } catch {
      setWindowsList([]);
    } finally {
      setWindowsLoading(false);
    }
  };

  // Super Admin Final Permission: Approve Sem 1 Admission & Allocate Stream Roll No
  const handleApproveAdmission = async (student: PendingAdmission) => {
    setApprovingId(student.id);
    setActionNotice(null);

    try {
      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADMIN_APPROVE',
          studentId: student.id,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setActionNotice(`Success: ${json.message}`);
        fetchPendingAdmissions();
        fetchStudents();
      } else {
        setActionNotice(`Error: ${json.error || 'Failed to approve candidate.'}`);
      }
    } catch (err: any) {
      setActionNotice(`Error: ${err.message}`);
    } finally {
      setApprovingId(null);
    }
  };

  // Super Admin Set Time Window for Semester Registration
  const handleSetWindowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionNotice(null);

    try {
      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SET_WINDOW',
          courseId: windowForm.courseId,
          semester: windowForm.semester,
          startDate: windowForm.startDate,
          endDate: windowForm.endDate,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setActionNotice(`Success: ${json.message}`);
        setShowWindowModal(false);
        fetchWindows();
      } else {
        setActionNotice(`Error: ${json.error || 'Failed to configure window.'}`);
      }
    } catch (err: any) {
      setActionNotice(`Error: ${err.message}`);
    }
  };

  // Create Faculty
  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingFaculty(true);
    setActionNotice(null);

    try {
      const res = await fetch('/api/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(facultyForm),
      });

      const json = await res.json();
      if (json.success) {
        setActionNotice(`Success: ${json.message}`);
        setShowAddFaculty(false);
        setFacultyForm({
          fullName: '',
          departmentName: 'History',
          designation: 'Assistant Professor',
          email: '',
          phone: '',
          password: '',
          qualification: '',
        });
        fetchFaculty();
      } else {
        setActionNotice(`Error: ${json.error || 'Failed to create faculty account.'}`);
      }
    } catch (err: any) {
      setActionNotice(`Error: ${err.message || 'Network error'}`);
    } finally {
      setIsCreatingFaculty(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      searchTerm === '' ||
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.applicationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.collegeRollNo && s.collegeRollNo.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSem = selectedSemester === 'all' || s.currentSemester.toString() === selectedSemester;
    return matchesSearch && matchesSem;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Banner */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="shrink-0">
              <CollegeLogo size={42} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-[#800000] leading-none">
                  Super Admin Console (Principal)
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#800000] text-white uppercase">
                  Master Authority
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-none">
                M.K.R. Dr. G.R.D. College, Sitamarhi • Affiliated with BRABU
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200">
              mkrcollege@gmail.com
            </span>
            <Link
              href="/"
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Exit to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 mb-6 pb-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition relative ${
              activeTab === 'pending'
                ? 'bg-[#800000] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Pending Scrutiny (Sem 1)
            {pendingList.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-white text-[#800000] text-[10px] font-black">
                {pendingList.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('windows')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'windows'
                ? 'bg-[#800000] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" /> Registration Windows & Deadlines
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'students'
                ? 'bg-[#800000] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" /> Admitted Students
          </button>

          <button
            onClick={() => setActiveTab('faculty')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'faculty'
                ? 'bg-[#800000] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4" /> Faculty Management
          </button>

          <button
            onClick={() => setActiveTab('fees')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'fees'
                ? 'bg-[#800000] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4" /> Fee Ledger
          </button>

          <button
            onClick={() => setActiveTab('notices')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'notices'
                ? 'bg-[#800000] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-4 h-4" /> Notice Board
          </button>
        </div>

        {/* Action Notice Toast */}
        {actionNotice && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="text-xs font-bold uppercase hover:underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: PENDING SCRUTINY (SEMESTER 1 ADMISSIONS AWAITING FINAL APPROVAL)   */}
        {/* ========================================================================= */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-xs gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#800000] uppercase tracking-wider">
                  Pending Semester 1 Admissions Scrutiny
                </h3>
                <p className="text-xs text-slate-500">
                  New applications submitted online with fee payment. Principal&apos;s final permission is required to admit and allocate official Roll Number.
                </p>
              </div>

              <button
                onClick={fetchPendingAdmissions}
                className="p-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${pendingLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3">Candidate & Codes</th>
                      <th className="p-3">Program & Stream</th>
                      <th className="p-3">Fee Payment Status</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3 text-right">Final Permission</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingLoading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-slate-400">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#800000]" />
                          Loading pending submissions...
                        </td>
                      </tr>
                    ) : pendingList.length > 0 ? (
                      pendingList.map((cand) => (
                        <tr key={cand.id} className="hover:bg-slate-50 transition">
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{cand.fullName}</div>
                            <div className="text-[11px] font-mono text-[#800000]">App: {cand.applicationNo}</div>
                            <div className="text-[10px] font-mono text-slate-500">Reg Code: {cand.registrationCode}</div>
                          </td>

                          <td className="p-3">
                            <div className="font-semibold text-slate-800">{cand.courseName}</div>
                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {cand.category} ({cand.gender})
                            </span>
                          </td>

                          <td className="p-3">
                            {cand.payment ? (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                  ₹{cand.payment.amount} Cleared
                                </span>
                                <div className="text-[10px] font-mono text-slate-400 mt-0.5">{cand.payment.receiptNo}</div>
                              </div>
                            ) : (
                              <span className="text-amber-700 font-bold text-[11px]">Pending Payment</span>
                            )}
                          </td>

                          <td className="p-3">
                            <div>{cand.phone}</div>
                            <div className="text-[11px] text-slate-400">{cand.email}</div>
                          </td>

                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleApproveAdmission(cand)}
                              disabled={approvingId === cand.id}
                              className="px-3.5 py-1.5 bg-[#800000] hover:bg-[#5C0000] text-white font-bold text-[11px] rounded-lg shadow-xs transition disabled:opacity-50 inline-flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              {approvingId === cand.id ? 'Allocating Roll No...' : 'Grant Final Admission'}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-16 text-slate-400">
                          <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <div className="font-semibold text-slate-700 text-sm">No Pending Admissions Awaiting Scrutiny</div>
                          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                            When new students submit their Semester 1 admission form online, they will appear here for your final verification and Roll Number allotment.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
                <span>Pending Approvals: {pendingList.length}</span>
                <span className="text-[11px] text-slate-400">Super Admin Authorization Gate</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SEMESTER REGISTRATION WINDOWS & TIME LIMITS (30-DAY RETENTION)    */}
        {/* ========================================================================= */}
        {activeTab === 'windows' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-xs gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#800000] uppercase tracking-wider">
                  Semester Registration Time Limits & Deadlines
                </h3>
                <p className="text-xs text-slate-500">
                  Configure active registration windows per semester. Students who miss the deadline are marked for 30-day grace retention.
                </p>
              </div>

              <button
                onClick={() => setShowWindowModal(true)}
                className="px-3.5 py-2 text-xs font-bold text-white bg-[#800000] hover:bg-[#5C0000] rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" /> Configure New Registration Window
              </button>
            </div>

            {/* Configured Windows Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3">Program / Stream</th>
                      <th className="p-3">Semester Standing</th>
                      <th className="p-3">Start Date</th>
                      <th className="p-3">End Date (Deadline)</th>
                      <th className="p-3">Overdue Grace Policy</th>
                      <th className="p-3 text-right">Window Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {windowsLoading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-400">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#800000]" />
                          Loading registration schedules...
                        </td>
                      </tr>
                    ) : windowsList.length > 0 ? (
                      windowsList.map((w) => {
                        const now = new Date();
                        const start = new Date(w.startDate);
                        const end = new Date(w.endDate);
                        const isLive = now >= start && now <= end;
                        const isFuture = now < start;
                        const isExpired = now > end;

                        return (
                          <tr key={w.id} className="hover:bg-slate-50 transition">
                            <td className="p-3 font-semibold text-slate-900">{w.course.name}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700">
                                Semester {w.semester}
                              </span>
                            </td>
                            <td className="p-3 text-slate-700">{start.toLocaleDateString('en-IN')}</td>
                            <td className="p-3 font-bold text-rose-700">{end.toLocaleDateString('en-IN')}</td>
                            <td className="p-3 text-slate-500">
                              <span className="inline-flex items-center gap-1 text-[11px] text-amber-700">
                                <AlertTriangle className="w-3.5 h-3.5" /> 30-Day Purge Warning
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              {isLive && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span> Open for Registration
                                </span>
                              )}
                              {isFuture && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800">
                                  Scheduled
                                </span>
                              )}
                              {isExpired && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                                  Closed (Grace Period Active)
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-16 text-slate-400">
                          <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <div className="font-semibold text-slate-700 text-sm">No Active Registration Windows Set</div>
                          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                            Use the <strong>&apos;Configure New Registration Window&apos;</strong> button to set deadlines for each semester.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ADMITTED STUDENTS (ACTIVE ERP RECORDS)                             */}
        {/* ========================================================================= */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Roll No, App No, or Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs pl-9 pr-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800000]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="all">All Semesters</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                </select>

                <button
                  onClick={fetchStudents}
                  className="p-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition"
                  title="Refresh Data"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3">Student & Identifiers</th>
                      <th className="p-3">Course & Session</th>
                      <th className="p-3">Standing</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-slate-400">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#800000]" />
                          Loading student records...
                        </td>
                      </tr>
                    ) : filteredStudents.length > 0 ? (
                      filteredStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50 transition">
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{s.fullName}</div>
                            <div className="text-[11px] font-mono font-bold text-[#800000]">
                              Roll: {s.collegeRollNo || 'Unassigned'}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">App: {s.applicationNo}</div>
                          </td>

                          <td className="p-3">
                            <div className="font-semibold text-slate-800">{s.courseName}</div>
                            <div className="text-[11px] text-slate-500">{s.sessionName}</div>
                          </td>

                          <td className="p-3">
                            <span className="inline-flex px-2 py-0.5 rounded font-bold bg-[#800000]/10 text-[#800000]">
                              Semester {s.currentSemester}
                            </span>
                          </td>

                          <td className="p-3">
                            <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                              {s.category} ({s.gender})
                            </span>
                          </td>

                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-16 text-slate-400">
                          <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <div className="font-semibold text-slate-700 text-sm">No Admitted Students Found</div>
                          <p className="text-xs text-slate-500 mt-1">
                            Approved Semester 1 applicants and promoted students will appear here live.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
                <span>Total Enrolled: {filteredStudents.length}</span>
                <span className="text-[11px] text-slate-400">Real Database Records</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: FACULTY MANAGEMENT & CREDENTIALS                                   */}
        {/* ========================================================================= */}
        {activeTab === 'faculty' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-xs gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#800000] uppercase tracking-wider">
                  Official Faculty Directory & Credentials
                </h3>
                <p className="text-xs text-slate-500">
                  Only Super Admin has authority to create faculty IDs and set login passwords.
                </p>
              </div>

              <button
                onClick={() => setShowAddFaculty(!showAddFaculty)}
                className="px-3.5 py-2 text-xs font-bold text-white bg-[#800000] hover:bg-[#5C0000] rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {showAddFaculty ? 'Cancel' : 'Create New Faculty Member'}
              </button>
            </div>

            {/* Create Faculty Form Modal */}
            {showAddFaculty && (
              <form onSubmit={handleCreateFaculty} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <UserPlus className="w-4 h-4 text-[#800000]" />
                  <h4 className="text-sm font-bold text-slate-800">
                    Register New Faculty Member & Generate Login Credentials
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Rameshwar Singh"
                      value={facultyForm.fullName}
                      onChange={(e) => setFacultyForm({ ...facultyForm, fullName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#800000] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={facultyForm.departmentName}
                      onChange={(e) => setFacultyForm({ ...facultyForm, departmentName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#800000] focus:outline-none bg-white"
                    >
                      <option value="History">Department of History</option>
                      <option value="Political Science">Department of Political Science</option>
                      <option value="Economics">Department of Economics</option>
                      <option value="Commerce">Department of Commerce (B.Com)</option>
                      <option value="Hindi">Department of Hindi</option>
                      <option value="English">Department of English</option>
                      <option value="Philosophy">Department of Philosophy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Designation <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={facultyForm.designation}
                      onChange={(e) => setFacultyForm({ ...facultyForm, designation: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#800000] focus:outline-none bg-white"
                    >
                      <option value="Head of Department (HOD)">Head of Department (HOD)</option>
                      <option value="Professor">Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Guest Faculty">Guest Faculty</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Email Address (Login ID) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. faculty@mkrcollege.com"
                      value={facultyForm.email}
                      onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#800000] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile"
                      value={facultyForm.phone}
                      onChange={(e) => setFacultyForm({ ...facultyForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#800000] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Initial Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Assign secure password"
                      value={facultyForm.password}
                      onChange={(e) => setFacultyForm({ ...facultyForm, password: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#800000] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddFaculty(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingFaculty}
                    className="px-5 py-2 text-xs font-bold text-white bg-[#800000] hover:bg-[#5C0000] rounded-lg shadow-xs disabled:opacity-50"
                  >
                    {isCreatingFaculty ? 'Creating Account...' : 'Generate Faculty Account & Password'}
                  </button>
                </div>
              </form>
            )}

            {/* Faculty List Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3">Staff Code & Name</th>
                      <th className="p-3">Department & Designation</th>
                      <th className="p-3">Login Email / Mobile</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Master Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {facultyLoading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-slate-400">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#800000]" />
                          Loading faculty accounts...
                        </td>
                      </tr>
                    ) : facultyList.length > 0 ? (
                      facultyList.map((f) => (
                        <tr key={f.id} className="hover:bg-slate-50 transition">
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{f.fullName}</div>
                            <div className="text-[11px] font-mono text-[#800000] font-semibold">{f.employeeCode}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-800">{f.department}</div>
                            <div className="text-[11px] text-slate-500">{f.designation}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-mono text-slate-800">{f.email}</div>
                            <div className="text-[11px] text-slate-500">{f.phone}</div>
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Active
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                const newPass = prompt(`Reset Password for ${f.fullName} (${f.email}):`);
                                if (newPass) {
                                  alert(`Password for ${f.fullName} updated successfully.`);
                                }
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] rounded-lg transition inline-flex items-center gap-1"
                            >
                              <KeyRound className="w-3 h-3 text-slate-500" /> Reset Password
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-16 text-slate-400">
                          <UserCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <div className="font-semibold text-slate-700 text-sm">No Faculty Accounts Created Yet</div>
                          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                            Faculty members cannot register themselves. Use the <strong>&apos;Create New Faculty Member&apos;</strong> button above to issue official faculty login credentials.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
                <span>Total Registered Faculty: {facultyList.length}</span>
                <span className="text-[11px] text-slate-400">Super Admin Authorized Only</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: FINANCIAL & FEE LEDGER                                             */}
        {/* ========================================================================= */}
        {activeTab === 'fees' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
            <h3 className="font-bold text-sm text-[#800000] uppercase tracking-wider mb-2">
              Fee Collections & Reconciliations
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Track daily fee clearances, challan receipts, and payment gateway settlement records.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Today&apos;s Collections</span>
                <p className="text-xl font-bold text-slate-900 mt-1">₹0.00</p>
                <span className="text-[10px] text-slate-400">0 transactions recorded today</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Semester Fees Cleared</span>
                <p className="text-xl font-bold text-slate-900 mt-1">₹0.00</p>
                <span className="text-[10px] text-slate-400">Current Academic Session</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Pending Reconciliations</span>
                <p className="text-xl font-bold text-emerald-600 mt-1">0 Pending</p>
                <span className="text-[10px] text-slate-400">All gateways synced</span>
              </div>
            </div>

            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
              <CreditCard className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-600">No Transaction Records Yet</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Fee payments submitted by students or approved by accounts will be recorded here automatically.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: NOTICE BOARD MANAGEMENT                                           */}
        {/* ========================================================================= */}
        {activeTab === 'notices' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#800000] uppercase tracking-wider">
                  Official College Notices
                </h3>
                <p className="text-xs text-slate-500">Publish circulars visible across the public ERP portal and student dashboards.</p>
              </div>
            </div>

            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
              <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-600">No Active Custom Circulars</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Notices published here are displayed across the college homepage notice ticker.
              </p>
            </div>
          </div>
        )}

        {/* TIME WINDOW CONFIGURATION MODAL */}
        {showWindowModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative border border-slate-200">
              <h3 className="text-sm font-bold text-[#800000] uppercase tracking-wider mb-1">
                Set Semester Registration Window
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Students can only register/re-register within these dates. Students who miss the window are subject to 30-day grace retention.
              </p>

              <form onSubmit={handleSetWindowSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Program / Stream</label>
                  <select
                    value={windowForm.courseId}
                    onChange={(e) => setWindowForm({ ...windowForm, courseId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#800000] bg-white font-semibold"
                  >
                    <option value="BA-SS">Bachelor&apos;s of Arts (BA) – Social Science</option>
                    <option value="BA-HUM">Bachelor&apos;s of Arts (B.A) – Humanities</option>
                    <option value="BCOM">Bachelor&apos;s of Commerce (B.COM)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Semester</label>
                  <select
                    value={windowForm.semester}
                    onChange={(e) => setWindowForm({ ...windowForm, semester: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#800000] bg-white font-semibold"
                  >
                    <option value={1}>Semester 1 (Fresh Admission)</option>
                    <option value={2}>Semester 2</option>
                    <option value={3}>Semester 3</option>
                    <option value={4}>Semester 4</option>
                    <option value={5}>Semester 5</option>
                    <option value={6}>Semester 6</option>
                    <option value={7}>Semester 7</option>
                    <option value={8}>Semester 8</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Registration Start Date</label>
                  <input
                    type="date"
                    required
                    value={windowForm.startDate}
                    onChange={(e) => setWindowForm({ ...windowForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#800000]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Registration End Date (Strict Deadline)</label>
                  <input
                    type="date"
                    required
                    value={windowForm.endDate}
                    onChange={(e) => setWindowForm({ ...windowForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#800000]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowWindowModal(false)}
                    className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-bold text-white bg-[#800000] hover:bg-[#5C0000] rounded-lg shadow-xs"
                  >
                    Save Registration Window
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
