"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  User,
  Calendar,
  Users,
  BookOpen,
  BarChart2,
  CheckCircle,
  Clock,
  PieChart,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import Loader from "../components/Loader";
import StatCard from "../components/StatCard";
import { useUser } from "@/contexts/UserContext";

// --- Types
type Batch = {
  id: string;
  name: string;
  courseId: string;
  course: string;
  schedule: string;
  startDate: string; // ISO
  endDate: string; // ISO
  nextClass?: string; // ISO date-time for next session
  maxStudents: number;
  enrolledStudents: number;
  teachers: string[]; // teacher ids or names
  medium: "Online" | "Offline" | "Hybrid";
  venue?: string;
  status: "Upcoming" | "Active" | "Completed";
};

type AttendancePoint = { month: string; present: number; absent: number };
type PerformancePoint = { batch: string; avgScore: number };

// --- TeacherDashboard component
export default function TeacherDashboard() {
  // teacher from context
  const { user } = useUser(); // expects { name, email, role }
  const teacherName = user?.name ?? "Your Name";

  const [loading, setLoading] = useState(true);

  // Mock data: batches assigned to this teacher
  const [batches, setBatches] = useState<Batch[]>([]);

  // Mock analytics
  const [attendanceTrend, setAttendanceTrend] = useState<AttendancePoint[]>(
    []
  );
  const [performanceData, setPerformanceData] = useState<PerformancePoint[]>(
    []
  );

  // fetch / generate mock data
  useEffect(() => {
    (async () => {
      // simulate load
      await new Promise((r) => setTimeout(r, 700));

      // small mock: your real app would fetch teacher batches filtered by user.id/role
      const mockBatches: Batch[] = [
        {
          id: "B001",
          name: "Web Dev - Morning",
          courseId: "C001",
          course: "Full Stack Web Development",
          schedule: "Mon-Fri • 9:00 AM - 12:00 PM",
          startDate: "2025-11-01",
          endDate: "2026-02-28",
          nextClass: addDaysISO(new Date(), 1, "09:00"), // tomorrow 9am
          maxStudents: 30,
          enrolledStudents: 25,
          teachers: [teacherName],
          medium: "Hybrid",
          venue: "Room 101",
          status: "Upcoming",
        },
        {
          id: "B007",
          name: "Machine Learning - Intensive",
          courseId: "C007",
          course: "Machine Learning & AI",
          schedule: "Mon-Fri • 2:00 PM - 5:00 PM",
          startDate: "2025-09-15",
          endDate: "2025-12-15",
          nextClass: addDaysISO(new Date(), 0, "14:00"), // today 2pm
          maxStudents: 35,
          enrolledStudents: 32,
          teachers: [teacherName],
          medium: "Online",
          venue: undefined,
          status: "Active",
        },
        {
          id: "B006",
          name: "Cloud - Weekend",
          courseId: "C006",
          course: "Cloud Computing with AWS",
          schedule: "Sat-Sun • 9:00 AM - 1:00 PM",
          startDate: "2025-12-01",
          endDate: "2026-03-01",
          nextClass: addDaysISO(new Date(), 3, "09:00"),
          maxStudents: 30,
          enrolledStudents: 12,
          teachers: [teacherName],
          medium: "Hybrid",
          venue: "Lab 301",
          status: "Upcoming",
        },
      ];

      // mock attendance trend (last 6 months)
      const monthNames = getLastNMonthNames(6);
      const mockAttendance = monthNames.map((m, idx) => ({
        month: m,
        present: 250 + idx * 8 + Math.round(Math.random() * 10),
        absent: 30 - idx * 2 + Math.round(Math.random() * 6),
      }));

      // mock performance per batch
      const mockPerf: PerformancePoint[] = mockBatches.map((b, i) => ({
        batch: b.name,
        avgScore: Math.round(60 + i * 8 + Math.random() * 20),
      }));

      setBatches(mockBatches);
      setAttendanceTrend(mockAttendance);
      setPerformanceData(mockPerf);

      setLoading(false);
    })();
  }, [teacherName]);

  // Derived values
  const totalBatches = batches.length;
  const totalStudents = batches.reduce((s, b) => s + b.enrolledStudents, 0);
  const upcomingClasses = batches
    .map((b) => ({
      ...b,
      nextClassDate: b.nextClass ? new Date(b.nextClass) : null,
    }))
    .filter((b) => b.nextClassDate && b.nextClassDate >= new Date())
    .sort(
      (a, b) =>
        (a.nextClassDate?.getTime() ?? Infinity) -
        (b.nextClassDate?.getTime() ?? Infinity)
    );

  const avgAttendancePercent = useMemo(() => {
    // simple mock conversion: present / (present + absent) averaged across months
    if (!attendanceTrend.length) return 0;
    const arr = attendanceTrend.map((p) =>
      Math.round((p.present / (p.present + p.absent)) * 100 * 10) / 10
    );
    return Math.round((arr.reduce((s, v) => s + v, 0) / arr.length) * 10) / 10;
  }, [attendanceTrend]);

  // UI helpers
  function formatDateTimeISO(iso?: string | null) {
    if (!iso) return "TBD";
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  if (loading) return <Loader />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Hello, {teacherName}
          </h1>
          <p className="text-gray-600 mt-1">
            Here's your teaching overview and upcoming sessions.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={BookOpen}
          label="Assigned Batches"
          value={totalBatches}
          color="indigo"
        />
        <StatCard icon={Users} label="Total Students" value={totalStudents} color="green" />
        <StatCard icon={Clock} label="Upcoming Classes" value={upcomingClasses.length} color="yellow" />
        <StatCard icon={CheckCircle} label="Avg Attendance" value={`${avgAttendancePercent}%`} color="blue" />
      </div>

      {/* Main grid: charts + upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Attendance Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900">Attendance Trend</h2>
              </div>
              <p className="text-sm text-gray-500">Last 6 months</p>
            </div>

            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    formatter={(value: number) => `${value} students`}
                    contentStyle={{ backgroundColor: "#fff", borderRadius: 8 }}
                  />
                  <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Present" />
                  <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Absent" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Student Performance by Batch */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900">Avg Student Performance</h2>
              </div>
              <p className="text-sm text-gray-500">By Batch</p>
            </div>

            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={performanceData} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="batch" stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6b7280" />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Legend />
                  <Bar dataKey="avgScore" fill="#6366f1" radius={[6, 6, 0, 0]} name="Avg Score (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right column: upcoming classes + active batches mini */}
        <div className="space-y-6">
          {/* Upcoming classes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Classes</h3>
              </div>
              <p className="text-sm text-gray-500">{upcomingClasses.length} upcoming</p>
            </div>

            {upcomingClasses.length === 0 ? (
              <div className="py-8 text-center text-gray-500">No upcoming classes scheduled.</div>
            ) : (
              <ul className="space-y-3">
                {upcomingClasses.slice(0, 5).map((b) => (
                  <li key={b.id} className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{b.name}</p>
                      <p className="text-sm text-gray-500">
                        {b.course} • {b.schedule}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Next class: <span className="font-medium text-gray-800">{formatDateTimeISO(b.nextClass)}</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Active batches overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">Active Batches</h3>
              </div>
              <p className="text-sm text-gray-500">{batches.length} total</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {batches.map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-3 p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{b.name}</p>
                    <p className="text-xs text-gray-500">{b.course}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {b.enrolledStudents}/{b.maxStudents} students • {b.medium}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {b.status}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Next: {formatDateTimeISO(b.nextClass)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer quick summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <p className="text-sm text-gray-600">Student-Teacher Ratio (avg)</p>
            <p className="text-2xl font-bold text-gray-900">{Math.round(totalStudents / Math.max(1, totalBatches))}:1</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <p className="text-sm text-gray-600">Average Class Size</p>
            <p className="text-2xl font-bold text-gray-900">{Math.round(totalStudents / Math.max(1, totalBatches))}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <p className="text-sm text-gray-600">Active Batches</p>
            <p className="text-2xl font-bold text-gray-900">{batches.filter(b=>b.status==="Active").length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper functions ---

function getLastNMonthNames(n: number) {
  const months: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toLocaleString("en-US", { month: "short" }));
  }
  return months;
}

/**
 * Add days to current date and return an ISO-like string with specified time (HH:mm)
 * e.g. addDaysISO(new Date(), 1, "09:00") -> "2025-10-21T09:00:00"
 */
function addDaysISO(base: Date, days: number, time: string) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  const [hh, mm] = time.split(":").map(Number);
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
}

function formatDateISOShort(iso?: string) {
  if (!iso) return "TBD";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}
