"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Users,
  Loader2,
  User,
  ChevronDown,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

type StudentReport = {
  enrollment_id: number;
  student_id: number;
  student_name: string;
  email?: string | null;
  phone?: string | null;
  summary: {
    total_classes: number;
    present: number;
    absent: number;
    na: number;
    attendance_percentage: number;
  };
  records: {
    date: string;
    status: string;
  }[];
};

type Batch = {
  id: number;
  name: string;
};

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(dateString: string) {
  if (!dateString) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(dateString));
}

export default function AttendanceReportPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchId, setBatchId] = useState<number | null>(null);

  const [startDate, setStartDate] = useState(getToday());
  const [endDate, setEndDate] = useState(getToday());

  const [students, setStudents] = useState<StudentReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/common/batches?limit=1000&page=1");
        const json = await res.json();

        const list = json?.data?.items || json?.data || [];
        setBatches(list);
        if (list.length) setBatchId(list[0].id);
      } catch {
        toast.error("Failed to load batches");
      }
    })();
  }, []);

  const fetchReport = async () => {
    if (!batchId) return;

    try {
      setLoading(true);

      const res = await fetch(
        `/api/common/batch/${batchId}/attendance/report?start_date=${startDate}&end_date=${endDate}`
      );

      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      setStudents(json.data.students || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (batchId) fetchReport();
  }, [batchId, startDate, endDate]);

  const avgAttendance = useMemo(() => {
    if (!students.length) return 0;
    return Math.round(
      students.reduce((acc, s) => acc + s.summary.attendance_percentage, 0) /
        students.length
    );
  }, [students]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" />

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            Attendance Report
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Analyze student attendance trends across batches
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">
                Filters
              </h2>

              <div className="space-y-4">
                {/* Batch */}
                <div>
                  <label className="text-xs text-slate-500">Batch</label>
                  <div className="relative mt-1">
                    <select
                      value={batchId ?? ""}
                      onChange={(e) => setBatchId(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm appearance-none focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <label className="text-xs text-slate-500">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3">
              <StatCard
                icon={Users}
                label="Students"
                value={students.length}
              />
              <StatCard
                icon={CalendarDays}
                label="Average Attendance"
                value={`${avgAttendance}%`}
                helper="Across selected range"
              />
            </div>
          </aside>

          {/* Main */}
          <main className="rounded-xl border bg-white shadow-sm">
            <div className="border-b px-5 py-4">
              <h2 className="font-semibold text-slate-900">
                Students Overview
              </h2>
              <p className="text-xs text-slate-500">
                {startDate} → {endDate}
              </p>
            </div>

            {loading ? (
              <div className="p-10 text-center">
                <Loader2 className="mx-auto animate-spin" />
              </div>
            ) : students.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                No data found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                    <tr>
                      <th className="px-5 py-3 text-left">Student</th>
                      <th className="px-5 py-3 text-center">%</th>
                      <th className="px-5 py-3 text-center">P</th>
                      <th className="px-5 py-3 text-center">A</th>
                      <th className="px-5 py-3 text-center">N/A</th>
                    </tr>
                  </thead>

                  <tbody>
                    {students.map((s) => (
                      <>
                        <tr
                          key={s.student_id}
                          className="border-t hover:bg-slate-50 cursor-pointer"
                          onClick={() =>
                            setExpanded(
                              expanded === s.student_id
                                ? null
                                : s.student_id
                            )
                          }
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="rounded-full bg-slate-100 p-2">
                                <User className="h-4 w-4 text-slate-600" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">
                                  {s.student_name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  ID: {s.student_id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="text-center font-semibold">
                            {s.summary.attendance_percentage}%
                          </td>

                          <td className="text-center text-emerald-600">
                            {s.summary.present}
                          </td>

                          <td className="text-center text-rose-600">
                            {s.summary.absent}
                          </td>

                          <td className="text-center text-amber-600">
                            {s.summary.na}
                          </td>
                        </tr>

                        {expanded === s.student_id && (
                          <tr className="bg-slate-50">
                            <td colSpan={5} className="px-5 py-4">
                              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                                {s.records.map((r, i) => (
                                  <div
                                    key={i}
                                    className="rounded-lg border bg-white p-3"
                                  >
                                    <p className="text-xs text-slate-500">
                                      {formatDate(r.date)}
                                    </p>
                                    <p
                                      className={`mt-1 text-sm font-medium ${
                                        r.status === "Present"
                                          ? "text-emerald-600"
                                          : r.status === "Absent"
                                          ? "text-rose-600"
                                          : "text-amber-600"
                                      }`}
                                    >
                                      {r.status}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

/* ---------- Reusable stat card ---------- */

function StatCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: any;
  label: string;
  value: string | number;
  helper?: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {value}
          </p>
          {helper && (
            <p className="text-xs text-slate-400 mt-1">{helper}</p>
          )}
        </div>
        <div className="rounded-lg bg-slate-100 p-2">
          <Icon className="h-4 w-4 text-slate-600" />
        </div>
      </div>
    </div>
  );
}