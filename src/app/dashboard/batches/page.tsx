// app/admin/batches/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Edit,
  Trash2,
  Eye,
  Plus,
  UserPlus,
  UserCheck,
  MoreVertical,
  User,
} from "lucide-react";
import DataTable, { Column, Filter } from "@/components/DataTable";
import Modal, { FormModal } from "@/components/Modal";
import StatCard from "@/components/StatCard";
import CustomTimePicker from "@/components/CustomTimePicker";

type BatchStatus = "Draft" | "Open" | "Closed" | "Ongoing" | "Completed" | "Cancelled";
type BatchMedium = "Online" | "Offline" | "Hybrid";

interface Batch {
  id: string;
  name: string;
  branchId: string;
  weekdays?: string;
  startTime?: string;
  endTime?: string;
  maxStudents: number;
  enrolledStudents: number;
  medium: BatchMedium;
  status: BatchStatus;
  teachers?: string[];
}

interface Instructor {
  id: string;
  name: string;
  email: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  enrolledBatches: string[];
}

interface BatchFormData {
  name: string;
  branchId: string;
  maxStudents: number;
  medium: BatchMedium;
  status: BatchStatus;
  weekdays: string[];
  startTime: string;
  endTime: string;
}

const BRANCHES = [
  { id: "1", name: "Indiranagar" },
  { id: "2", name: "HRBR Layout" },
];

const WEEKDAY_OPTIONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function normalizeTimeValue(value?: string | null) {
  if (!value) return "";
  if (value.includes("T")) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(11, 16);
  }
  if (value.length >= 5) return value.slice(0, 5);
  return value;
}

function formatTime(value?: string) {
  const time = normalizeTimeValue(value);
  if (!time) return "";
  return time;
}

function formatSchedule(weekdays?: string, startTime?: string, endTime?: string) {
  const days = weekdays?.trim() ? weekdays : "No weekdays";
  const start = formatTime(startTime);
  const end = formatTime(endTime);
  if (start && end) return `${days} | ${start} - ${end}`;
  if (start) return `${days} | ${start}`;
  if (end) return `${days} | ${end}`;
  return days;
}

function getBranchName(branchId: string) {
  return BRANCHES.find((b) => b.id === branchId)?.name ?? branchId;
}

function getStatusStyles(status: string) {
  switch (status) {
    case "Open":
    case "Ongoing":
      return "bg-green-100 text-green-700";
    case "Draft":
      return "bg-gray-100 text-gray-700";
    case "Closed":
      return "bg-yellow-100 text-yellow-700";
    case "Completed":
      return "bg-blue-100 text-blue-700";
    case "Cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getMediumStyles(medium: string) {
  switch (medium) {
    case "Online":
      return "bg-blue-100 text-blue-700";
    case "Offline":
      return "bg-green-100 text-green-700";
    case "Hybrid":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function BatchManagementPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAssignStudentsModalOpen, setIsAssignStudentsModalOpen] = useState(false);
  const [isAssignTeachersModalOpen, setIsAssignTeachersModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<BatchFormData>({
    name: "",
    branchId: "",
    maxStudents: 30,
    medium: "Online",
    status: "Draft",
    weekdays: [],
    startTime: "",
    endTime: "",
  });

  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const teachers: Instructor[] = [
    { id: "T001", name: "John Doe", email: "john@example.com" },
    { id: "T002", name: "Jane Smith", email: "jane@example.com" },
    { id: "T003", name: "Mike Johnson", email: "mike@example.com" },
    { id: "T004", name: "Sarah Williams", email: "sarah@example.com" },
    { id: "T005", name: "Rajesh Kumar", email: "rajesh@example.com" },
    { id: "T006", name: "Priya Sharma", email: "priya@example.com" },
    { id: "T007", name: "Amit Patel", email: "amit@example.com" },
    { id: "T008", name: "Sneha Reddy", email: "sneha@example.com" },
  ];

  const students: Student[] = [
    { id: "S001", name: "Alex Brown", email: "alex@example.com", enrolledBatches: ["B001"] },
    { id: "S002", name: "Emma Davis", email: "emma@example.com", enrolledBatches: ["B002"] },
    { id: "S003", name: "Oliver Wilson", email: "oliver@example.com", enrolledBatches: ["B001", "B002"] },
    { id: "S004", name: "Sophia Taylor", email: "sophia@example.com", enrolledBatches: ["B003"] },
    { id: "S005", name: "Liam Martinez", email: "liam@example.com", enrolledBatches: ["B001", "B004"] },
    { id: "S006", name: "Ava Thomas", email: "ava@example.com", enrolledBatches: ["B002"] },
    { id: "S007", name: "Noah Anderson", email: "noah@example.com", enrolledBatches: ["B004"] },
    { id: "S008", name: "Mia Hernandez", email: "mia@example.com", enrolledBatches: ["B003"] },
  ];

  async function fetchBatches() {
    const res = await fetch("/api/common/batches", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const json = await res.json();

    const normalized: Batch[] = Array.isArray(json?.data)
      ? json.data.map((item: any) => ({
          id: String(item.id),
          name: String(item.name ?? ""),
          branchId: String(item.branchId ?? item.branch_id ?? ""),
          weekdays: item.weekdays ? String(item.weekdays) : "",
          startTime: normalizeTimeValue(item.startTime ?? item.start_time),
          endTime: normalizeTimeValue(item.endTime ?? item.end_time),
          maxStudents: Number(item.maxStudents ?? item.max_students ?? 0),
          enrolledStudents: Number(item.enrolledStudents ?? item.enrollmentCount ?? 0),
          medium: (item.medium ?? "Online") as BatchMedium,
          status: (item.status ?? "Draft") as BatchStatus,
          teachers: Array.isArray(item.teachers) ? item.teachers : [],
        }))
      : [];

    setBatches(normalized);
  }

  useEffect(() => {
    fetchBatches();
  }, []);

  const stats = useMemo(() => {
    const totalTeachers = new Set(
      batches.flatMap((batch) => batch.teachers ?? []),
    ).size;

    return {
      totalBatches: batches.length,
      activeBatches: batches.filter((b) => b.status === "Open" || b.status === "Ongoing").length,
      totalStudents: batches.reduce((sum, b) => sum + (Number.isFinite(b.enrolledStudents) ? b.enrolledStudents : 0), 0),
      averageBatchSize: batches.length
        ? Math.round(
            batches.reduce((sum, b) => sum + (Number.isFinite(b.enrolledStudents) ? b.enrolledStudents : 0), 0) /
              batches.length,
          )
        : 0,
      totalTeachers,
      unassignedStudents: students.length,
      unassignedInstructors: teachers.length - totalTeachers,
    };
  }, [batches]);

  const columns: Column<Batch>[] = [
    {
      key: "id",
      label: "Batch ID",
      sortable: true,
    },
    {
      key: "name",
      label: "Batch Name",
      sortable: true,
      render: (batch) => (
        <div>
          <p className="font-medium text-gray-900">{batch.name}</p>
          <p className="text-sm text-gray-500">{getBranchName(batch.branchId)}</p>
        </div>
      ),
    },
    {
      key: "weekdays",
      label: "Schedule",
      render: (batch) => (
        <div className="text-sm">
          <p className="text-gray-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            {batch.weekdays || "No weekdays"}
          </p>
          <p className="text-gray-500">
            {formatTime(batch.startTime)} - {formatTime(batch.endTime)}
          </p>
        </div>
      ),
    },
    {
      key: "enrolledStudents",
      label: "Students",
      sortable: true,
      render: (batch) => {
        const percent = batch.maxStudents > 0 ? (batch.enrolledStudents / batch.maxStudents) * 100 : 0;
        return (
          <div>
            <p className="text-sm font-medium text-gray-900">
              {batch.enrolledStudents} / {batch.maxStudents}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="bg-indigo-600 h-2 rounded-full"
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: "teachers",
      label: "Instructors",
      render: (batch) => (
        <div className="text-sm text-gray-700">
          {batch.teachers && batch.teachers.length > 0
            ? batch.teachers.join(", ")
            : "Not assigned"}
        </div>
      ),
    },
    {
      key: "medium",
      label: "Medium",
      render: (batch) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${getMediumStyles(batch.medium)}`}
        >
          {batch.medium}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (batch) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyles(batch.status)}`}
        >
          {batch.status}
        </span>
      ),
    },
  ];

  const filters: Filter[] = [
    {
      key: "status",
      label: "All Status",
      options: [
        { value: "Draft", label: "Draft" },
        { value: "Open", label: "Open" },
        { value: "Ongoing", label: "Ongoing" },
        { value: "Closed", label: "Closed" },
        { value: "Completed", label: "Completed" },
        { value: "Cancelled", label: "Cancelled" },
      ],
    },
    {
      key: "medium",
      label: "All Mediums",
      options: [
        { value: "Online", label: "Online" },
        { value: "Offline", label: "Offline" },
        { value: "Hybrid", label: "Hybrid" },
      ],
    },
    {
      key: "branchId",
      label: "All Branches",
      options: BRANCHES.map((b) => ({ value: b.id, label: b.name })),
    },
  ];

  function resetForm() {
    setFormData({
      name: "",
      branchId: "",
      maxStudents: 30,
      medium: "Online",
      status: "Draft",
      weekdays: [],
      startTime: "",
      endTime: "",
    });
    setSelectedTeachers([]);
    setSelectedStudents([]);
  }

  function openEditModal(batch: Batch) {
    setSelectedBatch(batch);
    setFormData({
      name: batch.name,
      branchId: batch.branchId,
      maxStudents: batch.maxStudents,
      medium: batch.medium,
      status: batch.status,
      weekdays: batch.weekdays ? batch.weekdays.split(",").map((d) => d.trim()).filter(Boolean) : [],
      startTime: normalizeTimeValue(batch.startTime),
      endTime: normalizeTimeValue(batch.endTime),
    });
    setIsEditModalOpen(true);
  }

  function openViewModal(batch: Batch) {
    setSelectedBatch(batch);
    setIsViewModalOpen(true);
  }

  function openAssignTeachersModal(batch: Batch) {
    setSelectedBatch(batch);
    const teacherIds = teachers
      .filter((t) => (batch.teachers ?? []).includes(t.name))
      .map((t) => t.id);
    setSelectedTeachers(teacherIds);
    setIsAssignTeachersModalOpen(true);
  }

  function openAssignStudentsModal(batch: Batch) {
    setSelectedBatch(batch);
    setSelectedStudents([]);
    setIsAssignStudentsModalOpen(true);
  }

  async function handleCreateBatch(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        branchId: formData.branchId,
        branch_id: Number(formData.branchId),
        maxStudents: Number(formData.maxStudents),
        max_students: Number(formData.maxStudents),
        medium: formData.medium,
        status: formData.status,
        weekdays: formData.weekdays,
        startTime: formData.startTime,
        endTime: formData.endTime,
        start_time: formData.startTime,
        end_time: formData.endTime,
      };

      const res = await fetch("/api/common/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to create batch");
      }

      await fetchBatches();
      setIsCreateModalOpen(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEditBatch(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBatch) return;

    setIsSubmitting(true);

    try {
      const payload = {
        id: selectedBatch.id,
        name: formData.name,
        branchId: formData.branchId,
        branch_id: Number(formData.branchId),
        maxStudents: Number(formData.maxStudents),
        max_students: Number(formData.maxStudents),
        medium: formData.medium,
        status: formData.status,
        weekdays: formData.weekdays,
        startTime: formData.startTime,
        endTime: formData.endTime,
        start_time: formData.startTime,
        end_time: formData.endTime,
      };

      const res = await fetch("/api/common/batch", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to update batch");
      }

      await fetchBatches();
      setIsEditModalOpen(false);
      setSelectedBatch(null);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteBatch(batchId: string) {
    if (!confirm("Delete batch?")) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/common/batch", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: batchId }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete batch");
      }

      await fetchBatches();
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleAssignTeachers(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBatch) return;

    setIsSubmitting(true);

    setBatches((prev) =>
      prev.map((batch) =>
        batch.id === selectedBatch.id
          ? {
              ...batch,
              teachers: selectedTeachers.map(
                (tid) => teachers.find((t) => t.id === tid)?.name || "",
              ),
            }
          : batch,
      ),
    );

    setIsAssignTeachersModalOpen(false);
    setSelectedBatch(null);
    setSelectedTeachers([]);
    setIsSubmitting(false);
  }

  function handleAssignStudents(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBatch) return;

    setIsSubmitting(true);

    setBatches((prev) =>
      prev.map((batch) =>
        batch.id === selectedBatch.id
          ? {
              ...batch,
              enrolledStudents: Math.min(
                batch.maxStudents,
                batch.enrolledStudents + selectedStudents.length,
              ),
            }
          : batch,
      ),
    );

    setIsAssignStudentsModalOpen(false);
    setSelectedBatch(null);
    setSelectedStudents([]);
    setIsSubmitting(false);
  }

  const renderActions = (batch: Batch) => (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedBatchId(selectedBatchId === batch.id ? null : batch.id);
        }}
        className="p-2 hover:bg-gray-100 rounded-lg transition"
      >
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>

      {selectedBatchId === batch.id && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openViewModal(batch);
              setSelectedBatchId(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition rounded-t-lg"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(batch);
              setSelectedBatchId(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <Edit className="w-4 h-4" />
            Edit Batch
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              openAssignTeachersModal(batch);
              setSelectedBatchId(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <UserPlus className="w-4 h-4" />
            Assign Instructors
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              openAssignStudentsModal(batch);
              setSelectedBatchId(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <UserCheck className="w-4 h-4" />
            Assign Students
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteBatch(batch.id);
              setSelectedBatchId(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition border-t border-gray-100 rounded-b-lg"
          >
            <Trash2 className="w-4 h-4" />
            Delete Batch
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Batch Management</h1>
          <p className="text-gray-600 mt-2">
            Create and manage batches, assign students and teachers, and track batch progress
          </p>
        </div>

        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer"
            title="Add Batch"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <StatCard icon={BookOpen} label="Total Batches" value={stats.totalBatches} color="blue" />
        <StatCard icon={Users} label="Active Batches" value={stats.activeBatches} color="indigo" />
        <StatCard icon={User} label="Total Students" value={stats.totalStudents} color="green" />
        <StatCard icon={GraduationCap} label="Assigned Instructors" value={stats.totalTeachers} color="red" />
        <StatCard icon={Calendar} label="Avg. Batch Students" value={stats.averageBatchSize} color="blue" />
      </div>

      <DataTable
        data={batches}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search batches..."
        searchKeys={["name", "id", "branchId", "weekdays", "medium", "status"]}
        exportFileName="batches"
        itemsPerPage={5}
        renderActions={renderActions}
        onRowClick={(item: any) => openViewModal(item)}
      />

      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Create New Batch"
        onSubmit={handleCreateBatch}
        submitLabel="Create Batch"
        isSubmitting={isSubmitting}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Batch Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Morning Batch"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Branch
            </label>
            <select
              required
              value={formData.branchId}
              onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a branch</option>
              {BRANCHES.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Max Students
            </label>
            <input
              type="number"
              min={1}
              required
              value={formData.maxStudents}
              onChange={(e) =>
                setFormData({ ...formData, maxStudents: Number(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Medium
            </label>
            <select
              required
              value={formData.medium}
              onChange={(e) =>
                setFormData({ ...formData, medium: e.target.value as BatchMedium })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Status
            </label>
            <select
              required
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as BatchStatus })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Draft">Draft</option>
              <option value="Open">Open</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Closed">Closed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Select Weekdays
            </label>
            <div className="w-full flex items-center gap-2 flex-wrap">
              {WEEKDAY_OPTIONS.map((day) => {
                const isSelected = formData.weekdays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        weekdays: isSelected
                          ? formData.weekdays.filter((d) => d !== day)
                          : [...formData.weekdays, day],
                      });
                    }}
                    className={`px-3 py-1 rounded-lg border cursor-pointer ${
                      isSelected
                        ? "bg-indigo-500 text-white border-indigo-500"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Batch Timings
            </label>
            <div className="flex items-center gap-3">
              <div className="w-1/2">
                <CustomTimePicker
                  value={formData.startTime}
                  onChange={(val) => setFormData({ ...formData, startTime: val })}
                />
              </div>
              <span>to</span>
              <div className="w-1/2">
                <CustomTimePicker
                  value={formData.endTime}
                  onChange={(val) => setFormData({ ...formData, endTime: val })}
                />
              </div>
            </div>
          </div>
        </div>
      </FormModal>

      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBatch(null);
          resetForm();
        }}
        title="Edit Batch"
        onSubmit={handleEditBatch}
        submitLabel="Update Batch"
        isSubmitting={isSubmitting}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batch Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Morning Batch"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Branch *
            </label>
            <select
              required
              value={formData.branchId}
              onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a branch</option>
              {BRANCHES.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Students *
            </label>
            <input
              type="number"
              min={1}
              required
              value={formData.maxStudents}
              onChange={(e) =>
                setFormData({ ...formData, maxStudents: Number(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medium *
            </label>
            <select
              required
              value={formData.medium}
              onChange={(e) =>
                setFormData({ ...formData, medium: e.target.value as BatchMedium })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              required
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as BatchStatus })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Draft">Draft</option>
              <option value="Open">Open</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Closed">Closed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Weekdays *
            </label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAY_OPTIONS.map((day) => {
                const isSelected = formData.weekdays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        weekdays: isSelected
                          ? formData.weekdays.filter((d) => d !== day)
                          : [...formData.weekdays, day],
                      });
                    }}
                    className={`px-3 py-1 rounded-lg border cursor-pointer ${
                      isSelected
                        ? "bg-indigo-500 text-white border-indigo-500"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batch Timings *
            </label>
            <div className="flex items-center gap-3">
              <div className="w-1/2">
                <CustomTimePicker
                  label="Start Time"
                  value={formData.startTime}
                  onChange={(val) => setFormData({ ...formData, startTime: val })}
                />
              </div>
              <span>to</span>
              <div className="w-1/2">
                <CustomTimePicker
                  label="End Time"
                  value={formData.endTime}
                  onChange={(val) => setFormData({ ...formData, endTime: val })}
                />
              </div>
            </div>
          </div>
        </div>
      </FormModal>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedBatch(null);
        }}
        title="Batch Details"
        size="lg"
      >
        {selectedBatch && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Batch ID</p>
                <p className="text-base text-gray-900">{selectedBatch.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusStyles(
                    selectedBatch.status,
                  )}`}
                >
                  {selectedBatch.status}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Batch Name</p>
              <p className="text-base text-gray-900">{selectedBatch.name}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Branch</p>
              <p className="text-base text-gray-900">
                {getBranchName(selectedBatch.branchId)}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Schedule</p>
              <p className="text-base text-gray-900">
                {formatSchedule(
                  selectedBatch.weekdays,
                  selectedBatch.startTime,
                  selectedBatch.endTime,
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Medium</p>
                <p className="text-base text-gray-900">{selectedBatch.medium}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Max Students</p>
                <p className="text-base text-gray-900">{selectedBatch.maxStudents}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Enrollment</p>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-base text-gray-900">
                  {selectedBatch.enrolledStudents} / {selectedBatch.maxStudents} students
                </p>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-indigo-600 h-3 rounded-full"
                    style={{
                      width: `${Math.min(
                        (selectedBatch.enrolledStudents / Math.max(selectedBatch.maxStudents, 1)) * 100,
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                Assigned Instructors
              </p>
              {(selectedBatch.teachers ?? []).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {(selectedBatch.teachers ?? []).map((teacher, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                    >
                      {teacher}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No teachers assigned yet</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      <FormModal
        isOpen={isAssignTeachersModalOpen}
        onClose={() => {
          setIsAssignTeachersModalOpen(false);
          setSelectedBatch(null);
          setSelectedTeachers([]);
        }}
        title="Assign Instructors to Batch"
        onSubmit={handleAssignTeachers}
        submitLabel="Assign Instructors"
        isSubmitting={isSubmitting}
      >
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Select teachers to assign to <strong>{selectedBatch?.name}</strong>
          </p>
          <div className="border border-gray-300 rounded-lg p-3 max-h-64 overflow-y-auto">
            {teachers.map((teacher) => (
              <label
                key={teacher.id}
                className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  checked={selectedTeachers.includes(teacher.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTeachers([...selectedTeachers, teacher.id]);
                    } else {
                      setSelectedTeachers(
                        selectedTeachers.filter((id) => id !== teacher.id),
                      );
                    }
                  }}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-1"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {teacher.name}
                  </p>
                  <p className="text-xs text-gray-500">{teacher.email}</p>
                </div>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {selectedTeachers.length} teacher(s) selected
          </p>
        </div>
      </FormModal>

      <FormModal
        isOpen={isAssignStudentsModalOpen}
        onClose={() => {
          setIsAssignStudentsModalOpen(false);
          setSelectedBatch(null);
          setSelectedStudents([]);
        }}
        title="Assign Students to Batch"
        onSubmit={handleAssignStudents}
        submitLabel="Assign Students"
        isSubmitting={isSubmitting}
      >
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Select students to enroll in <strong>{selectedBatch?.name}</strong>
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800">
              Available seats:{" "}
              <strong>
                {selectedBatch
                  ? Math.max(selectedBatch.maxStudents - selectedBatch.enrolledStudents, 0)
                  : 0}
              </strong>
            </p>
          </div>
          <div className="border border-gray-300 rounded-lg p-3 max-h-64 overflow-y-auto">
            {students
              .filter(
                (student) =>
                  !student.enrolledBatches.includes(selectedBatch?.id || ""),
              )
              .map((student) => (
                <label
                  key={student.id}
                  className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents([...selectedStudents, student.id]);
                      } else {
                        setSelectedStudents(
                          selectedStudents.filter((id) => id !== student.id),
                        );
                      }
                    }}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-1 disabled:opacity-50"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {student.name}
                    </p>
                    <p className="text-xs text-gray-500">{student.email}</p>
                  </div>
                </label>
              ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {selectedStudents.length} student(s) selected
          </p>
        </div>
      </FormModal>
    </div>
  );
}