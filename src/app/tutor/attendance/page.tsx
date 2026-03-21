"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Loader2,
  RotateCcw,
  Save,
  School,
  Users,
  XCircle,
  CircleDashed,
  User,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

type AttendanceStatus = "Present" | "Absent" | "NA";

interface BatchOption {
  id: number;
  name: string;
  branch_name?: string | null;
  medium?: string | null;
  status?: string | null;
}

interface BatchStudentOption {
  enrollment_id: number;
  student_id: number;
  student_name: string;
  student_email?: string | null;
  student_phone?: string | null;
  enrollment_status?: string | null;
}

interface AttendanceStudent extends BatchStudentOption {
  attendance: {
    id: number;
    status: string | null;
    attendance_date: string | Date;
  } | null;
  status: AttendanceStatus | null;
}

function getTodayIST() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());
}

function normalizeStatus(value?: string | null): AttendanceStatus | null {
  const v = String(value || "")
    .trim()
    .toLowerCase();

  if (v === "present") return "Present";
  if (v === "absent") return "Absent";
  if (v === "na" || v === "n/a" || v === "not applicable") return "NA";

  return null;
}

function statusToLabel(status: AttendanceStatus | null) {
  if (!status) return "Not marked";
  if (status === "NA") return "N/A";
  return status;
}

function statusStyles(status: AttendanceStatus | null) {
  if (status === "Present")
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "Absent") return "bg-rose-50 text-rose-700 border-rose-200";
  if (status === "NA") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-50 text-slate-500 border-slate-200";
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || `Request failed (${response.status})`);
  }

  return data as T;
}

function StatCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  helper?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
          {helper ? (
            <p className="mt-1 text-xs text-slate-400">{helper}</p>
          ) : null}
        </div>
        <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function AttendancePage() {
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [attendanceDate, setAttendanceDate] = useState<string>(getTodayIST());
  const [students, setStudents] = useState<AttendanceStudent[]>([]);
  const [batchStudents, setBatchStudents] = useState<BatchStudentOption[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | "">("");
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedBatch = useMemo(
    () => batches.find((b) => b.id === selectedBatchId) || null,
    [batches, selectedBatchId],
  );

  const loadBatches = async () => {
    setLoadingBatches(true);
    try {
      const res = await fetchJson<any>("/api/common/batches?limit=1000&page=1");
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.items)
          ? res.data.items
          : Array.isArray(res?.data?.batches)
            ? res.data.batches
            : [];

      const mapped: BatchOption[] = list.map((batch: any) => ({
        id: Number(batch.id),
        name: String(batch.name ?? `Batch ${batch.id}`),
        branch_name: batch.branch_name ?? batch.branch?.name ?? null,
        medium: batch.medium ?? null,
        status: batch.status ?? null,
      }));

      setBatches(mapped);

      if (mapped.length > 0 && selectedBatchId === null) {
        setSelectedBatchId(mapped[0].id);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to load batches");
    } finally {
      setLoadingBatches(false);
    }
  };

  const loadBatchStudents = async (batchId: number) => {
    const res = await fetchJson<any>(`/api/common/batch/${batchId}/students`);
    const list = Array.isArray(res?.data?.students) ? res.data.students : [];

    const normalized: BatchStudentOption[] = list.map((item: any) => ({
      enrollment_id: Number(item.enrollment_id),
      student_id: Number(item.student_id),
      student_name: String(item.student_name ?? "Unnamed Student"),
      student_email: item.student_email ?? null,
      student_phone: item.student_phone ?? null,
      enrollment_status: item.enrollment_status ?? null,
    }));

    setBatchStudents(normalized);
  };

  const loadAttendance = async (batchId: number, date: string) => {
    setLoadingAttendance(true);
    try {
      const res = await fetchJson<any>(
        `/api/common/batch/${batchId}/attendance?date=${encodeURIComponent(date)}`,
      );

      const list = Array.isArray(res?.data?.students) ? res.data.students : [];

      const normalized: AttendanceStudent[] = list.map((item: any) => ({
        enrollment_id: Number(item.enrollment_id),
        student_id: Number(item.student_id),
        student_name: String(item.student_name ?? "Unnamed Student"),
        student_email: item.student_email ?? null,
        student_phone: item.student_phone ?? null,
        enrollment_status: item.enrollment_status ?? null,
        attendance: item.attendance
          ? {
              id: Number(item.attendance.id),
              status: item.attendance.status ?? null,
              attendance_date: item.attendance.attendance_date,
            }
          : null,
        status: normalizeStatus(item.attendance?.status),
      }));

      setStudents(normalized);
    } catch (error: any) {
      setStudents([]);
      toast.error(error?.message || "Failed to load attendance");
    } finally {
      setLoadingAttendance(false);
    }
  };

  useEffect(() => {
    void loadBatches();
  }, []);

  useEffect(() => {
    if (selectedBatchId !== null) {
      void (async () => {
        try {
          await Promise.all([
            loadBatchStudents(selectedBatchId),
            loadAttendance(selectedBatchId, attendanceDate),
          ]);
        } catch (error: any) {
          toast.error(error?.message || "Failed to load batch data");
        }
      })();
    } else {
      setStudents([]);
      setBatchStudents([]);
      setSelectedStudentId("");
    }
  }, [selectedBatchId, attendanceDate]);

  const stats = useMemo(() => {
    const total = students.length;
    const marked = students.filter((s) => s.status !== null).length;
    const present = students.filter((s) => s.status === "Present").length;
    const absent = students.filter((s) => s.status === "Absent").length;
    const na = students.filter((s) => s.status === "NA").length;
    const percentage = total === 0 ? 0 : Math.round((marked / total) * 100);

    return { total, marked, present, absent, na, percentage };
  }, [students]);

  const selectedStudent = useMemo(
    () => students.find((s) => s.student_id === selectedStudentId) || null,
    [students, selectedStudentId],
  );

  const setStudentStatus = (studentId: number, status: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.student_id === studentId ? { ...student, status } : student,
      ),
    );
  };

  const markAllPresent = () => {
    setStudents((prev) =>
      prev.map((student) => ({ ...student, status: "Present" })),
    );
    toast.success("All students marked present");
  };

  const clearAll = () => {
    setStudents((prev) =>
      prev.map((student) => ({ ...student, status: null })),
    );
    toast.success("Attendance cleared");
  };

  const handleSave = async () => {
    if (!selectedBatchId) {
      toast.error("Please select a batch");
      return;
    }

    if (students.length === 0) {
      toast.error("No students found in this batch");
      return;
    }

    const incomplete = students.filter((student) => !student.status);
    if (incomplete.length > 0) {
      toast.error("Please mark every student before saving");
      return;
    }

    try {
      setSaving(true);

      await fetchJson(`/api/common/batch/${selectedBatchId}/attendance`, {
        method: "POST",
        body: JSON.stringify({
          attendance_date: attendanceDate,
          records: students.map((student) => ({
            student_id: student.student_id,
            status: student.status,
          })),
        }),
      });

      toast.success("Attendance saved successfully");
      await loadAttendance(selectedBatchId, attendanceDate);
    } catch (error: any) {
      toast.error(error?.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const isBusy = loadingBatches || loadingAttendance;

  return (
    <div className="min-h-screen">
      <Toaster position="top-right" />

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">Attendance</h1>
          <p className="text-sm text-slate-500">
            Mark and manage student attendance for your batches.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">
                Controls
              </h2>

              <div className="space-y-4">
                {/* Batch */}
                <div>
                  <label className="text-xs font-medium text-slate-500">
                    Batch
                  </label>
                  <select
                    value={selectedBatchId ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedBatchId(val ? Number(val) : null);
                      setSelectedStudentId("");
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Select batch</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="text-xs font-medium text-slate-500">
                    Date
                  </label>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* Student dropdown */}
                <div>
                  <label className="text-xs font-medium text-slate-500">
                    Jump to student
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) =>
                      setSelectedStudentId(
                        e.target.value ? Number(e.target.value) : "",
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Select student</option>
                    {batchStudents.map((s) => (
                      <option key={s.student_id} value={s.student_id}>
                        {s.student_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={markAllPresent}
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700"
                  >
                    Mark all present
                  </button>

                  {/* <button
                    onClick={clearAll}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    Clear
                  </button> */}

                  <button
                    onClick={() =>
                      selectedBatchId
                        ? loadAttendance(selectedBatchId, attendanceDate)
                        : loadBatches()
                    }
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Summary
              </h3>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-slate-50">
                  <p className="text-slate-500">Total</p>
                  <p className="font-semibold">{stats.total}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50">
                  <p className="text-slate-500">Marked</p>
                  <p className="font-semibold">{stats.marked}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50">
                  <p className="text-slate-500">Absent</p>
                  <p className="font-semibold">{stats.absent}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50">
                  <p className="text-slate-500">Completion</p>
                  <p className="font-semibold">{stats.percentage}%</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* Top bar */}
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="font-semibold text-slate-900">
                  {selectedBatch?.name || "Select a batch"}
                </h2>
                <p className="text-xs text-slate-500">
                  {attendanceDate} · {students.length} students
                </p>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                  <tr>
                    <th className="px-5 py-3 text-left">Student</th>
                    <th className="px-5 py-3 text-left">Enrollment</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((s) => (
                    <tr
                      key={s.student_id}
                      className={`border-t hover:bg-slate-50 ${
                        selectedStudentId === s.student_id ? "bg-indigo-50" : ""
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">
                          {s.student_name}
                        </div>
                        <div className="text-xs text-slate-500">
                          ID: {s.student_id}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        #{s.enrollment_id}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-medium ${statusStyles(
                            s.status,
                          )}`}
                        >
                          {statusToLabel(s.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              setStudentStatus(s.student_id, "Present")
                            }
                            className={`px-3 py-1 rounded-md text-xs ${
                              s.status === "Present"
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-100"
                            }`}
                          >
                            P
                          </button>

                          <button
                            onClick={() =>
                              setStudentStatus(s.student_id, "Absent")
                            }
                            className={`px-3 py-1 rounded-md text-xs ${
                              s.status === "Absent"
                                ? "bg-rose-600 text-white"
                                : "bg-slate-100"
                            }`}
                          >
                            A
                          </button>

                          <button
                            onClick={() => setStudentStatus(s.student_id, "NA")}
                            className={`px-3 py-1 rounded-md text-xs ${
                              s.status === "NA"
                                ? "bg-amber-500 text-white"
                                : "bg-slate-100"
                            }`}
                          >
                            N/A
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
