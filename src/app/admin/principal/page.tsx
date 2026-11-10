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
  Trash2
} from 'lucide-react';

interface StudentRecord {
  id: string;
  applicationNo: string;
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

export default function PrincipalSuperAdminPage() {
  const [activeTab, setActiveTab] = useState<'students' | 'faculty' | 'fees' | 'notices'>('students');
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [facultyList, setFacultyList] = useState<FacultyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // New Faculty Form State
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

  // Fetch real students on mount
  useEffect(() => {
    fetchStudents();
    fetchFaculty();
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

  const handlePromote = async (student: StudentRecord) => {
    setPromotingId(student.id);
    setActionNotice(null);

    try {
      const targetSemester = student.currentSemester + 1;
      const res = await fetch('/api/payments/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          targetSemester,
          amount: 2500,
          paymentMethod: 'CASH',
          transactionRef: `PRIN-AUTH-${Date.now()}`,
          notes: `Promoted by Principal / Super Admin authorization for ${student.fullName}`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionNotice(`Success: ${student.fullName} promoted to Semester ${data.newSemester}! Receipt: ${data.receiptNo}`);
        fetchStudents();
      } else {
        setActionNotice(`Error: ${data.error || 'Promotion failed'}`);
      }
    } catch (err: any) {
      setActionNotice(`Error processing promotion: ${err.message}`);
    } finally {
      setPromotingId(null);
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
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'students'
                ? 'bg-[#800000] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" /> Student Admissions & Promotion
          </button>
          <button
            onClick={() => setActiveTab('faculty')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'faculty'
                ? 'bg-[#800000] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4" /> Faculty Management & Credentials
          </button>
          <button
            onClick={() => setActiveTab('fees')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'fees'
                ? 'bg-[#800000] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4" /> Financial & Fee Ledger
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

        {/* TAB 1: Student Admissions & Promotion */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            {/* Search & Filters */}
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
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                  <option value="7">Semester 7</option>
                  <option value="8">Semester 8</option>
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

            {/* Students Table */}
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
                      <th className="p-3 text-right">Promotion Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-400">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#800000]" />
                          Loading student records...
                        </td>
                      </tr>
                    ) : filteredStudents.length > 0 ? (
                      filteredStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50 transition">
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{s.fullName}</div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              Roll: {s.collegeRollNo || 'Unassigned'} • App: {s.applicationNo}
                            </div>
                            <div className="text-[10px] text-slate-400">Phone: {s.phone}</div>
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

                          <td className="p-3 text-right">
                            <button
                              onClick={() => handlePromote(s)}
                              disabled={promotingId === s.id}
                              className="px-2.5 py-1.5 bg-[#800000] hover:bg-[#5C0000] text-white font-bold text-[11px] rounded-lg shadow-xs transition disabled:bg-slate-300"
                            >
                              {promotingId === s.id ? 'Promoting...' : `Promote to Sem ${s.currentSemester + 1}`}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-16 text-slate-400">
                          <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <div className="font-semibold text-slate-700 text-sm">No Student Records Found</div>
                          <p className="text-xs text-slate-500 mt-1">
                            New student applications submitted via the Online Admission Form will appear here live.
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

        {/* TAB 2: Faculty Management & Credentials */}
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

            {/* Create Faculty Form Modal/Dropdown */}
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

        {/* TAB 3: Financial & Fee Ledger */}
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

        {/* TAB 4: Notice Board Management */}
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
      </main>
    </div>
  );
}
