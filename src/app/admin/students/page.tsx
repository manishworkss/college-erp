'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  IndianRupee,
  RefreshCw,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import CollegeLogo from '@/components/CollegeLogo';
import { calculateSemesterFeeBreakdown, MAX_SEMESTERS } from '@/lib/college-config';

interface StudentItem {
  id: string;
  applicationNo: string;
  registrationCode: string | null;
  collegeRollNo: string | null;
  universityRegNo: string | null;
  fullName: string;
  fatherName: string;
  phone: string;
  email: string;
  category: string;
  gender: string;
  currentSemester: number;
  status: string;
  isOverdue: boolean;
  markedForDeletionAt: string | null;
  sessionName: string;
  courseCode: string;
  courseName: string;
}

interface DirectoryStats {
  totalStudents: number;
  promotedCount: number;
  pendingCount: number;
  totalFeeCleared: number;
  totalTransactions: number;
}

export default function AdminStudentsDirectoryPage() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isPromoting, setIsPromoting] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCourseCode, setSelectedCourseCode] = useState('all');

  const [stats, setStats] = useState<DirectoryStats>({
    totalStudents: 0,
    promotedCount: 0,
    pendingCount: 0,
    totalFeeCleared: 0,
    totalTransactions: 0,
  });

  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const [allRes, promotedRes, pendingRes, paymentsRes] = await Promise.all([
        fetch('/api/students?page=1&pageSize=1'),
        fetch('/api/students?status=PROMOTED&page=1&pageSize=1'),
        fetch('/api/students?status=APPLIED&page=1&pageSize=1'),
        fetch('/api/payments?limit=1'),
      ]);

      const [allJson, promotedJson, pendingJson, paymentsJson] = await Promise.all([
        allRes.json(),
        promotedRes.json(),
        pendingRes.json(),
        paymentsRes.json(),
      ]);

      setStats({
        totalStudents: allJson?.pagination?.total ?? 0,
        promotedCount: promotedJson?.pagination?.total ?? 0,
        pendingCount: pendingJson?.pagination?.total ?? 0,
        totalFeeCleared: paymentsJson?.summary?.totalCleared ?? 0,
        totalTransactions: paymentsJson?.summary?.totalCompletedTransactions ?? 0,
      });
    } catch {
      // Keep zero-state cleanly if DB unavailable
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: '25',
      });
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      if (selectedSemester !== 'all') params.set('semester', selectedSemester);
      if (selectedStatus !== 'all') params.set('status', selectedStatus);
      if (selectedCourseCode !== 'all') params.set('courseCode', selectedCourseCode);

      const res = await fetch(`/api/students?${params.toString()}`);
      const json = await res.json();

      if (!res.ok) {
        setStudents([]);
        setTotalFiltered(0);
        setNotice({ type: 'error', text: json.error || 'Unable to load student records from database.' });
      } else {
        setStudents(json.data || []);
        setTotalFiltered(json.pagination?.total ?? 0);
        setTotalPages(json.pagination?.totalPages ?? 1);
      }
    } catch {
      setNotice({ type: 'error', text: 'Network error connecting to Student Directory API.' });
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm, selectedSemester, selectedStatus, selectedCourseCode]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchStudents]);

  const handlePromoteStudent = async (student: StudentItem) => {
    if (student.status === 'APPLIED') {
      setNotice({
        type: 'error',
        text: `${student.fullName} is still pending Super Admin Sem-1 approval. Approve in Super Admin Console first.`,
      });
      return;
    }

    const targetSemester = student.currentSemester + 1;
    if (targetSemester > MAX_SEMESTERS) {
      setNotice({
        type: 'error',
        text: `${student.fullName} is already in final Semester ${MAX_SEMESTERS}.`,
      });
      return;
    }

    const feeBreakdown = calculateSemesterFeeBreakdown(student.courseCode, targetSemester);
    setIsPromoting(student.id);
    setNotice(null);

    try {
      const res = await fetch('/api/payments/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          targetSemester,
          amount: feeBreakdown.totalAmount,
          paymentMethod: 'ONLINE_GATEWAY',
          transactionRef: `ADMIN-TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          notes: `Admin verified fee clearance & promotion to Semester ${targetSemester}`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotice({ type: 'error', text: data.error || 'Failed to process semester promotion.' });
      } else {
        setNotice({
          type: 'success',
          text: `${student.fullName} promoted to Semester ${targetSemester} (Status: PROMOTED | Receipt: ${data.receiptNo} | Paid: ₹${data.amountPaid ?? feeBreakdown.totalAmount}).`,
        });
        await Promise.all([fetchStudents(), fetchStats()]);
      }
    } catch {
      setNotice({ type: 'error', text: 'Network error while executing fee promotion transaction.' });
    } finally {
      setIsPromoting(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <CollegeLogo size={36} />
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                M.K.R. Dr. G.R.D. College
              </p>
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                Student Directory &amp; Auto-Promotion Ledger
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/admin/principal"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Super Admin Console
            </Link>
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Portal Home
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {notice && (
          <div
            className={`p-4 rounded-xl border text-sm font-medium flex items-start justify-between gap-3 ${
              notice.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notice.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{notice.text}</span>
            </div>
            <button
              onClick={() => setNotice(null)}
              className="text-xs font-bold underline opacity-75 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Live Database Metrics (Zero Dummy Data) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span>Total Enrolled</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">
              {stats.totalStudents.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 mt-1">Live count from MySQL `Student` table</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span>Pending Sem-1 Approval</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">
              {stats.pendingCount.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 mt-1">Awaiting Super Admin permission</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span>Promoted (Sem 2–8)</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">
              {stats.promotedCount.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 mt-1">Direct payment auto-promoted students</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span>Total Fee Cleared</span>
              <IndianRupee className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">
              ₹{stats.totalFeeCleared.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {stats.totalTransactions} verified payment receipt(s)
            </p>
          </div>
        </section>

        {/* Search & Filter Toolbar */}
        <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setPage(1);
                setSearchTerm(e.target.value);
              }}
              placeholder="Search by Name, Reg Code (MKR-REG-...), Roll No, App No, or Mobile..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Filter by Program"
              value={selectedCourseCode}
              onChange={(e) => {
                setPage(1);
                setSelectedCourseCode(e.target.value);
              }}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">All Programs</option>
              <option value="BA-SS">B.A. Social Science</option>
              <option value="BA-HUM">B.A. Humanities</option>
              <option value="BCOM">B.Com Commerce</option>
            </select>

            <select
              aria-label="Filter by Semester"
              value={selectedSemester}
              onChange={(e) => {
                setPage(1);
                setSelectedSemester(e.target.value);
              }}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={String(sem)}>
                  Semester {sem}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by Status"
              value={selectedStatus}
              onChange={(e) => {
                setPage(1);
                setSelectedStatus(e.target.value);
              }}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="APPLIED">Pending Approval (APPLIED)</option>
              <option value="ADMITTED">Admitted (Sem 1)</option>
              <option value="PROMOTED">Promoted (Sem 2–8)</option>
              <option value="ALUMNI">Alumni</option>
              <option value="DROPPED">Dropped</option>
            </select>

            <button
              onClick={() => {
                fetchStudents();
                fetchStats();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </section>

        {/* Student Directory Table */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing <strong className="text-slate-900">{students.length}</strong> of{' '}
              <strong className="text-slate-900">{totalFiltered}</strong> matching record(s)
            </span>
            <Link href="/admission" className="text-blue-700 font-semibold hover:underline">
              + Open Admission &amp; Progression Form
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                  <th className="py-3 px-4">Student &amp; Father</th>
                  <th className="py-3 px-4">Codes &amp; Roll No</th>
                  <th className="py-3 px-4">Program</th>
                  <th className="py-3 px-4">Semester &amp; Status</th>
                  <th className="py-3 px-4 text-right">Next Sem Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      Loading real student records from database...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      No matching student records found in MySQL database.
                    </td>
                  </tr>
                ) : (
                  students.map((st) => {
                    const nextSem = st.currentSemester + 1;
                    const nextFee = calculateSemesterFeeBreakdown(st.courseCode, nextSem).totalAmount;
                    return (
                      <tr key={st.id} className="hover:bg-slate-50/70">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{st.fullName}</div>
                          <div className="text-xs text-slate-500">
                            S/o, D/o: {st.fatherName} | {st.phone}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs space-y-0.5">
                          <div className="text-slate-800 font-semibold">
                            Reg: {st.registrationCode || 'N/A'}
                          </div>
                          <div className="text-slate-600">
                            Roll: {st.collegeRollNo || 'Pending Approval'}
                          </div>
                          <div className="text-slate-400">App: {st.applicationNo}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{st.courseName}</div>
                          <div className="text-xs text-slate-500">
                            {st.courseCode} • {st.sessionName} ({st.category})
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            Semester {st.currentSemester}
                          </span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${
                                st.status === 'APPLIED'
                                  ? 'bg-amber-100 text-amber-800'
                                  : st.status === 'PROMOTED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {st.status}
                            </span>
                            {st.isOverdue && (
                              <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">
                                OVERDUE 30-DAY QUEUE
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {st.status === 'APPLIED' ? (
                            <Link
                              href="/admin/principal"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                            >
                              Approve in Super Admin
                            </Link>
                          ) : st.currentSemester < MAX_SEMESTERS ? (
                            <button
                              onClick={() => handlePromoteStudent(st)}
                              disabled={isPromoting === st.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition"
                            >
                              {isPromoting === st.id
                                ? 'Processing...'
                                : `Clear ₹${nextFee} & Promote → Sem ${nextSem}`}
                            </button>
                          ) : (
                            <span className="text-xs font-semibold text-slate-400">
                              Final Semester Reached
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-slate-300 rounded bg-white disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-slate-600 font-medium">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 border border-slate-300 rounded bg-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
