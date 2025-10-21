// pages/AttendancePage.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar,
  Check,
  X,
  Users,
  User,
  CheckCircle,
  XCircle,
  School,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import StatCard from "@/components/StatCard";

interface Student {
  id: number;
  name: string;
  rollNo: string;
  status: "present" | "absent" | "na" | null;
}

const mockBatches = [
  {
    id: 1,
    name: "Batch A - Math 101",
    students: [
      { id: 1, name: "Alice Johnson", rollNo: "S001", status: null },
      { id: 2, name: "Bob Smith", rollNo: "S002", status: null },
      { id: 3, name: "Charlie Brown", rollNo: "S003", status: null },
      { id: 4, name: "Diana Prince", rollNo: "S004", status: null },
    ],
  },
  {
    id: 2,
    name: "Batch B - Science 202",
    students: [
      { id: 5, name: "Ethan Lee", rollNo: "S005", status: null },
      { id: 6, name: "Fiona Adams", rollNo: "S006", status: null },
      { id: 7, name: "George Miller", rollNo: "S007", status: null },
    ],
  },
];

export default function AttendancePage() {
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const handleBatchSelect = (value: string) => {
    if (value === "") {
      setSelectedBatchId(null);
      setStudents([]);
      return;
    }

    const batchId = Number(value);
    const batch = mockBatches.find((b) => b.id === batchId);
    setSelectedBatchId(batchId);
    setStudents(batch ? batch.students : []);
  };

  const markAllPresent = () => {
    setStudents(students.map((s) => ({ ...s, status: "present" })));
  };

  const markAttendance = (id: number, status: "present" | "absent" | "na") => {
    setStudents(students.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const handleSave = () => {
    if (!selectedBatchId) return;
    toast.success("Attendance saved successfully!");
  };

  const stats = useMemo(() => {
    const total = students.length;
    const present = students.filter((s) => s.status === "present").length;
    const absent = students.filter((s) => s.status === "absent").length;
    const percentage = total === 0 ? 0 : Math.round((present / total) * 100);
    return { total, present, absent, percentage };
  }, [students]);

  const selectedBatch = mockBatches.find((b) => b.id === selectedBatchId);

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold">Attendance</h1>
        </div>
      </div>

      {/* Batch Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center gap-3">
          <School className="text-indigo-600 w-6 h-6" />
          <div>
            <select
              className="mt-1 border border-gray-300 rounded-lg px-4 py-2 w-64 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              onChange={(e) => handleBatchSelect(e.target.value)}
              value={selectedBatchId ?? ""} // keep this as is
            >
              <option value="">Choose a Batch</option>
              {mockBatches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* No Batch Selected */}
      {!selectedBatchId && (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl">
          <School className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-lg font-semibold text-gray-700">
            Please select a batch to start marking attendance
          </h2>
          <p className="text-gray-500 mt-1">
            Once selected, you’ll be able to mark students as present or absent.
          </p>
        </div>
      )}

      {/* Attendance Section */}
      {selectedBatchId && (
        <>
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Attendance — {selectedBatch?.name}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage attendance for today’s session
              </p>
            </div>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={markAllPresent}
                className="bg-indigo-100 font-bold text-indigo-700 px-4 py-1 rounded-md cursor-pointer"
              >
                Mark All Present
              </button>
              <button
                onClick={handleSave}
                className="bg-green-100 font-bold text-green-700 px-4 py-1 rounded-md cursor-pointer"
              >
                Save Attendance
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Users}
              label="Total Students"
              value={stats.total}
              color="indigo"
            />
            <StatCard
              icon={Check}
              label="Present Today"
              value={stats.present}
              color="green"
            />
            <StatCard
              icon={X}
              label="Absent Today"
              value={stats.absent}
              color="red"
            />
            <StatCard
              icon={Users}
              label="Attendance %"
              value={`${stats.percentage}%`}
              color="blue"
            />
          </div>

          {/* Student List */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Student Attendance
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-6"
                >
                  <div className="flex items-center gap-3 border-b border-gray-100">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-800">
                        {student.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex justify-between gap-3">
                    <button
                      onClick={() => markAttendance(student.id, "present")}
                      className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-bold cursor-pointer transition ${
                        student.status === "present"
                          ? "text-white bg-green-500"
                          : "text-green-700 bg-gray-100"
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Present
                    </button>
                    <button
                      onClick={() => markAttendance(student.id, "absent")}
                      className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-bold cursor-pointer transition ${
                        student.status === "absent"
                          ? "text-white bg-red-500"
                          : "text-red-700 bg-gray-100"
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      Absent
                    </button>
                    <button
                      onClick={() => markAttendance(student.id, "na")}
                      className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-bold cursor-pointer transition ${
                        student.status === "na"
                          ? "text-white bg-orange-500"
                          : "text-orange-700 bg-gray-100"
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      N/A
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
