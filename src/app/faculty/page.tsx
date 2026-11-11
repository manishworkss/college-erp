'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import CollegeLogo from '@/components/CollegeLogo';
import Footer from '@/components/Footer';
import { COLLEGE_DEPARTMENTS } from '@/lib/college-config';
import {
  UserCheck,
  CheckCircle2,
  FileText,
  Save,
  RefreshCw,
  AlertCircle,
  LogOut,
} from 'lucide-react';

interface FacultyStudent {
  id: string;
  applicationNo: string;
  collegeRollNo: string | null;
  fullName: string;
}

export default function FacultyAdminPage() {
  const [department, setDepartment] = useState<string>('History');
  const [semester, setSemester] = useState('1');
  const [courseCode, setCourseCode] = useState('BA-SS');
  const [activeView, setActiveView] = useState<'attendance' | 'marks'>('attendance');
  const [students, setStudents] = useState<FacultyStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'PRESENT' | 'ABSENT'>>({});
  const [marksMap, setMarksMap] = useState<
    Record<string, { midTermExam: number; assignment: number; attendanceScore: number }>
  >({});

  const fetchCourseStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/students?semester=${encodeURIComponent(semester)}&courseCode=${encodeURIComponent(courseCode)}`
      );
      const json = await res.json();
      if (json && Array.isArray(json.data)) {
        setStudents(json.data);
        const initialAtt: Record<string, 'PRESENT' | 'ABSENT'> = {};
        const initialMarks: Record<
          string,
          { midTermExam: number; assignment: number; attendanceScore: number }
        > = {};
        for (const st of json.data as FacultyStudent[]) {
          initialAtt[st.id] = 'PRESENT';
          initialMarks[st.id] = { midTermExam: 0, assignment: 0, attendanceScore: 0 };
        }
        setAttendanceMap(initialAtt);
        setMarksMap(initialMarks);
      } else {
        setStudents([]);
      }
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [semester, courseCode]);

  useEffect(() => {
    fetchCourseStudents();
  }, [fetchCourseStudents]);

  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (students.length === 0) return;

    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/faculty/academics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ATTENDANCE',
          department,
          courseCode,
          semester: parseInt(semester, 10),
          records: students.map((s) => ({
            studentId: s.id,
            status: attendanceMap[s.id] || 'PRESENT',
          })),
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setStatusMessage({ type: 'error', text: json.error || 'Failed to save lecture attendance.' });
        return;
      }

      setStatusMessage({ type: 'success', text: json.message });
    } catch {
      setStatusMessage({ type: 'error', text: 'Network error while saving attendance.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (students.length === 0) return;

    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/faculty/academics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'CIA_MARKS',
          department,
          courseCode,
          semester: parseInt(semester, 10),
          marks: students.map((s) => ({
            studentId: s.id,
            midTermExam: marksMap[s.id]?.midTermExam || 0,
            assignment: marksMap[s.id]?.assignment || 0,
            attendanceScore: marksMap[s.id]?.attendanceScore || 0,
          })),
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setStatusMessage({ type: 'error', text: json.error || 'Failed to save CIA marks.' });
        return;
      }

      setStatusMessage({ type: 'success', text: json.message });
    } catch {
      setStatusMessage({ type: 'error', text: 'Network error while saving CIA marks.' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    window.location.href = '/login';
  };

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
                  Faculty Admin Portal
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#002B5C] text-white uppercase">
                  Academic Staff
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-none">
                Continuous Internal Assessment (CIA) & Lecture Rolls • BRABU CBCS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition inline-flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
            <Link
              href="/"
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Exit to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Faculty / Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none"
              >
                {COLLEGE_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    Department of {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Academic Program
              </label>
              <select
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none"
              >
                <option value="BA-SS">Bachelor&apos;s of Arts (BA) – Social Science</option>
                <option value="BA-HUM">Bachelor&apos;s of Arts (B.A) – Humanities</option>
                <option value="BCOM">Bachelor&apos;s of Commerce (B.COM)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Semester Standing
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={String(sem)}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <div className="flex items-center gap-1 w-full bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveView('attendance')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                    activeView === 'attendance'
                      ? 'bg-[#800000] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Attendance
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('marks')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                    activeView === 'marks'
                      ? 'bg-[#800000] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  CIA Marks
                </button>
              </div>
            </div>
          </div>
        </div>

        {statusMessage && (
          <div
            className={`mb-4 p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {activeView === 'attendance' && (
          <form onSubmit={handleSaveAttendance} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 mb-4 gap-2">
              <div>
                <h3 className="text-sm font-bold text-[#800000] uppercase tracking-wider">
                  Daily Lecture Attendance Sheet
                </h3>
                <p className="text-xs text-slate-500">
                  {department} • {courseCode} • Semester {semester} • Date: {new Date().toLocaleDateString('en-IN')}
                </p>
              </div>

              {students.length > 0 && (
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#800000] hover:bg-[#5C0000] rounded-lg shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Daily Roll'}
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#800000]" />
                Loading enrolled students for Semester {semester}...
              </div>
            ) : students.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="p-3 border-b">Roll No</th>
                      <th className="p-3 border-b">Student Name</th>
                      <th className="p-3 border-b">Application No</th>
                      <th className="p-3 border-b text-center w-36">Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-900">{s.collegeRollNo || `P-${idx + 1}`}</td>
                        <td className="p-3 font-medium text-slate-800">{s.fullName}</td>
                        <td className="p-3 text-slate-500 font-mono">{s.applicationNo}</td>
                        <td className="p-3 text-center">
                          <div className="inline-flex items-center gap-2">
                            <label className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 cursor-pointer">
                              <input
                                type="radio"
                                name={`att_${s.id}`}
                                checked={(attendanceMap[s.id] || 'PRESENT') === 'PRESENT'}
                                onChange={() => setAttendanceMap((prev) => ({ ...prev, [s.id]: 'PRESENT' }))}
                                className="text-emerald-600"
                              />
                              P
                            </label>
                            <label className="flex items-center gap-1 text-[11px] font-bold text-rose-700 cursor-pointer">
                              <input
                                type="radio"
                                name={`att_${s.id}`}
                                checked={attendanceMap[s.id] === 'ABSENT'}
                                onChange={() => setAttendanceMap((prev) => ({ ...prev, [s.id]: 'ABSENT' }))}
                                className="text-rose-600"
                              />
                              A
                            </label>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-xl">
                <UserCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-700 text-sm">
                  No Students Enrolled in {courseCode} Semester {semester}
                </p>
                <p className="text-slate-500 mt-1">
                  Once students are admitted or promoted to this semester, they will appear in your lecture roll automatically.
                </p>
              </div>
            )}
          </form>
        )}

        {activeView === 'marks' && (
          <form onSubmit={handleSaveMarks} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 mb-4 gap-2">
              <div>
                <h3 className="text-sm font-bold text-[#800000] uppercase tracking-wider">
                  BRABU Continuous Internal Assessment (CIA) Marks
                </h3>
                <p className="text-xs text-slate-500">
                  {department} • Total CIA Weightage: 30 Marks (Test: 15, Assignment: 10, Attendance: 5)
                </p>
              </div>

              {students.length > 0 && (
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#800000] hover:bg-[#5C0000] rounded-lg shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Lock & Submit Marks'}
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#800000]" />
                Loading students...
              </div>
            ) : students.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="p-2.5 border-b">Roll No</th>
                      <th className="p-2.5 border-b">Student Name</th>
                      <th className="p-2.5 border-b w-32">Mid-Sem Test (15)</th>
                      <th className="p-2.5 border-b w-32">Seminar / Project (10)</th>
                      <th className="p-2.5 border-b w-32">Attendance (5)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono font-bold">{s.collegeRollNo || `P-${idx + 1}`}</td>
                        <td className="p-2.5 font-medium">{s.fullName}</td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            max={15}
                            min={0}
                            value={marksMap[s.id]?.midTermExam ?? 0}
                            onChange={(e) =>
                              setMarksMap((prev) => ({
                                ...prev,
                                [s.id]: { ...prev[s.id], midTermExam: Number(e.target.value) || 0 },
                              }))
                            }
                            className="w-24 p-1 border border-slate-200 rounded text-center"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            max={10}
                            min={0}
                            value={marksMap[s.id]?.assignment ?? 0}
                            onChange={(e) =>
                              setMarksMap((prev) => ({
                                ...prev,
                                [s.id]: { ...prev[s.id], assignment: Number(e.target.value) || 0 },
                              }))
                            }
                            className="w-24 p-1 border border-slate-200 rounded text-center"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            max={5}
                            min={0}
                            value={marksMap[s.id]?.attendanceScore ?? 0}
                            onChange={(e) =>
                              setMarksMap((prev) => ({
                                ...prev,
                                [s.id]: { ...prev[s.id], attendanceScore: Number(e.target.value) || 0 },
                              }))
                            }
                            className="w-24 p-1 border border-slate-200 rounded text-center"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-xl">
                <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-700 text-sm">No Student Records Found</p>
                <p className="text-slate-500 mt-1">
                  Enrolled students for {department} ({courseCode}) in Semester {semester} will appear here for CIA marks entry.
                </p>
              </div>
            )}
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
