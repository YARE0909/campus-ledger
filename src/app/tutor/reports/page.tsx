// pages/teacher/ReportsPage.tsx
"use client";

import React, { useState, useMemo } from "react";
import DataTable, { Column, Filter, DateFilter } from "@/components/DataTable";
import StatCard from "@/components/StatCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Users,
  CheckCircle,
  XCircle,
  Calendar,
  MoreVertical,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Modal from "@/components/Modal";

interface StudentReport {
  id: number;
  name: string;
  batch: string;
  attendance: number; // percent
  testsTaken: number;
  avgScore: number;
  lastActive: string;
}

const mockReports: StudentReport[] = [
  {
    id: 1,
    name: "Alice",
    batch: "A",
    attendance: 90,
    testsTaken: 5,
    avgScore: 88,
    lastActive: "2025-10-20",
  },
  {
    id: 2,
    name: "Bob",
    batch: "A",
    attendance: 75,
    testsTaken: 4,
    avgScore: 72,
    lastActive: "2025-10-19",
  },
  {
    id: 3,
    name: "Charlie",
    batch: "B",
    attendance: 100,
    testsTaken: 6,
    avgScore: 95,
    lastActive: "2025-10-18",
  },
  {
    id: 4,
    name: "David",
    batch: "B",
    attendance: 60,
    testsTaken: 3,
    avgScore: 65,
    lastActive: "2025-10-20",
  },
  {
    id: 5,
    name: "Eva",
    batch: "C",
    attendance: 85,
    testsTaken: 5,
    avgScore: 78,
    lastActive: "2025-10-20",
  },
];

const batchOptions = [
  { value: "all", label: "All Batches" },
  { value: "A", label: "Batch A" },
  { value: "B", label: "Batch B" },
  { value: "C", label: "Batch C" },
];

export default function ReportsPage() {
  const [selectedStudent, setSelectedStudent] = useState<StudentReport | null>(
    null
  );

  // Filters
  const filters: Filter[] = [
    { key: "batch", label: "Batch", options: batchOptions },
  ];

  const dateFilter: DateFilter = { key: "lastActive", label: "Last Active" };

  const columns: Column<StudentReport>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "batch", label: "Batch", sortable: true },
    { key: "attendance", label: "Attendance (%)", sortable: true },
    { key: "testsTaken", label: "Tests Taken", sortable: true },
    { key: "avgScore", label: "Average Score", sortable: true },
    { key: "lastActive", label: "Last Active", sortable: true },
  ];

  // Derived summary stats
  const totalStudents = mockReports.length;
  const avgAttendance = useMemo(() => {
    if (!mockReports.length) return 0;
    return Math.round(
      mockReports.reduce((acc, s) => acc + s.attendance, 0) / totalStudents
    );
  }, []);

  const avgScore = useMemo(() => {
    if (!mockReports.length) return 0;
    return Math.round(
      mockReports.reduce((acc, s) => acc + s.avgScore, 0) / totalStudents
    );
  }, []);

  const testCounts = useMemo(() => {
    return mockReports.reduce((acc, s) => acc + s.testsTaken, 0);
  }, []);

  // Chart data
  const attendanceData = mockReports.map((s) => ({
    name: s.name,
    attendance: s.attendance,
  }));
  const testData = mockReports.map((s) => ({
    name: s.name,
    tests: s.testsTaken,
  }));
  const scorePieData = [
    {
      name: "Above 80%",
      value: mockReports.filter((s) => s.avgScore > 80).length,
      color: "#4f46e5",
    },
    {
      name: "Below 80%",
      value: mockReports.filter((s) => s.avgScore <= 80).length,
      color: "#10b981",
    },
  ];

  const renderActions = (student: { name: any; }) => (
    <button onClick={() => toast.success(`Viewing report for ${student.name}`)}>
      <MoreVertical className="w-5 h-5 text-gray-600" />
    </button>
  );

  return (
    <div className="p-6 space-y-6">
      <Toaster position="top-right" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Students"
          value={totalStudents}
          color="blue"
        />
        <StatCard
          icon={CheckCircle}
          label="Avg Attendance (%)"
          value={avgAttendance}
          color="green"
        />
        <StatCard
          icon={Calendar}
          label="Avg Score"
          value={avgScore}
          color="indigo"
        />
        <StatCard
          icon={XCircle}
          label="Tests Taken"
          value={testCounts}
          color="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Attendance Chart</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={attendanceData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="attendance" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Tests Taken Chart</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={testData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tests" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Score Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={scorePieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {scorePieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        data={mockReports}
        columns={columns}
        filters={filters}
        dateFilter={dateFilter}
        searchPlaceholder="Search students..."
        searchKeys={["name", "batch"]}
        renderActions={renderActions}
      />

      {/* Modal for detailed student report */}
      <Modal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title={
          selectedStudent ? `${selectedStudent.name} - Detailed Report` : ""
        }
        size="lg"
      >
        {selectedStudent && (
          <div className="space-y-4">
            <p>
              <strong>Batch:</strong> {selectedStudent.batch}
            </p>
            <p>
              <strong>Attendance:</strong> {selectedStudent.attendance}%
            </p>
            <p>
              <strong>Tests Taken:</strong> {selectedStudent.testsTaken}
            </p>
            <p>
              <strong>Average Score:</strong> {selectedStudent.avgScore}
            </p>
            <p>
              <strong>Last Active:</strong> {selectedStudent.lastActive}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
