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
  UserMinus,
  X,
} from "lucide-react";
import DataTable, { Column, Filter } from "@/components/DataTable";
import Modal, { FormModal } from "@/components/Modal";
import StatCard from "@/components/StatCard";
import timeToDate from "@/lib/timeToDate";
import toast from "react-hot-toast";

type BatchStatus =
  | "Draft"
  | "Open"
  | "Closed"
  | "Ongoing"
  | "Completed"
  | "Cancelled";
type BatchMedium = "Online" | "Offline" | "Hybrid";

type StaffRole = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  qualification?: string;
  specialization?: string;
};

type StudentRecord = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  batchIds: string[];
};

type BatchFormData = {
  name: string;
  branchId: string;
  weekdays: string[];
  startTime: string;
  endTime: string;
  maxStudents: number;
  medium: BatchMedium;
  status: BatchStatus;
};

type BatchRow = {
  id: string;
  name: string;
  branchId: string;
  weekdays: string;
  startTime: string;
  endTime: string;
  maxStudents: number;
  enrolledStudents: number;
  medium: BatchMedium;
  status: BatchStatus;
  staff: StaffRole[];
  students: StudentRecord[];
};

type Branch = {
  id: string;
  name: string;
};

const WEEKDAY_OPTIONS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;

function normalizeTimeValue(value?: string | null) {
  if (!value) return "";
  if (value.includes("T")) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(11, 16);
  }
  return value.length >= 5 ? value.slice(0, 5) : value;
}

function formatTime(value?: string) {
  return normalizeTimeValue(value);
}

function formatWeekdays(weekdays?: string) {
  return weekdays?.trim() ? weekdays : "No weekdays";
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

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

function joinWeekdays(days: string[]) {
  return days.join(",");
}

export default function BatchManagementPage() {
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [staff, setStaff] = useState<StaffRole[]>([]);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<BatchRow | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAssignStaffModalOpen, setIsAssignStaffModalOpen] = useState(false);
  const [isAssignStudentsModalOpen, setIsAssignStudentsModalOpen] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function getBranchName(branchId: string) {
    return branches.find((b) => b.id === branchId)?.name ?? branchId;
  }

  const [formData, setFormData] = useState<BatchFormData>({
    name: "",
    branchId: "",
    weekdays: [],
    startTime: "",
    endTime: "",
    maxStudents: 30,
    medium: "Offline",
    status: "Draft",
  });

  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  async function fetchBranches() {
    const res = await fetch("/api/common/branches", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const json = await res.json();

    const items = Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json)
        ? json
        : [];

    const normalized: Branch[] = items.map((item: any) => ({
      id: String(item.id),
      name: String(item.name ?? ""),
    }));

    setBranches(normalized);
  }

  async function fetchBatches() {
    const res = await fetch("/api/common/batches", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const json = await res.json();
    const items = Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json)
        ? json
        : [];

    const normalized: BatchRow[] = items.map((item: any) => {
      const staffList = Array.isArray(item.staffmappings)
        ? item.staffmappings
            .map((mapping: any) => mapping?.staff)
            .filter(Boolean)
            .map((s: any) => ({
              id: String(s.id),
              name: String(s.name ?? ""),
              email: s.email ? String(s.email) : undefined,
              phone: s.phone ? String(s.phone) : undefined,
              qualification: s.qualification
                ? String(s.qualification)
                : undefined,
              specialization: s.specialization
                ? String(s.specialization)
                : undefined,
            }))
        : Array.isArray(item.staff)
          ? item.staff.map((s: any) => ({
              id: String(s.id),
              name: String(s.name ?? ""),
              email: s.email ? String(s.email) : undefined,
              phone: s.phone ? String(s.phone) : undefined,
              qualification: s.qualification
                ? String(s.qualification)
                : undefined,
              specialization: s.specialization
                ? String(s.specialization)
                : undefined,
            }))
          : [];

      const studentList = Array.isArray(item.enrollmentbatches)
        ? item.enrollmentbatches
            .map((row: any) => row?.enrollments?.students)
            .filter(Boolean)
            .map((s: any) => ({
              id: String(s.id),
              name: String(s.name ?? ""),
              email: s.email ? String(s.email) : undefined,
              phone: s.phone ? String(s.phone) : undefined,
              batchIds: [],
            }))
        : Array.isArray(item.students)
          ? item.students.map((s: any) => ({
              id: String(s.id),
              name: String(s.name ?? ""),
              email: s.email ? String(s.email) : undefined,
              phone: s.phone ? String(s.phone) : undefined,
              batchIds: [],
            }))
          : [];

      return {
        id: String(item.id),
        name: String(item.name ?? ""),
        branchId: String(item.branchId ?? item.branch_id ?? ""),
        weekdays: String(item.weekdays ?? ""),
        startTime: normalizeTimeValue(item.startTime ?? item.start_time),
        endTime: normalizeTimeValue(item.endTime ?? item.end_time),
        maxStudents: Number(item.maxStudents ?? item.max_students ?? 0),
        enrolledStudents: Number(
          item.enrolledStudents ??
            item.enrollmentCount ??
            studentList.length ??
            0,
        ),
        medium: (item.medium ?? "Offline") as BatchMedium,
        status: (item.status ?? "Draft") as BatchStatus,
        staff: staffList,
        students: studentList,
      };
    });

    setBatches(normalized);
  }

  async function fetchStaff() {
    const res = await fetch("/api/common/staff", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const json = await res.json();
    const items = Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json)
        ? json
        : [];

    const normalized: StaffRole[] = items.map((item: any) => ({
      id: String(item.id),
      name: String(item.name ?? ""),
      email: item.email ? String(item.email) : undefined,
      phone: item.phone ? String(item.phone) : undefined,
      qualification: item.qualification
        ? String(item.qualification)
        : undefined,
      specialization: item.specialization
        ? String(item.specialization)
        : undefined,
    }));

    setStaff(normalized);
  }

  async function fetchStudents() {
    const res = await fetch("/api/common/students", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const json = await res.json();
    const items = Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json)
        ? json
        : [];

    const normalized: StudentRecord[] = items.map((item: any) => ({
      id: String(item.id),
      name: String(item.name ?? ""),
      email: item.email ? String(item.email) : undefined,
      phone: item.phone ? String(item.phone) : undefined,
      batchIds: Array.isArray(item.batchIds)
        ? item.batchIds.map(String)
        : Array.isArray(item.enrolledBatches)
          ? item.enrolledBatches.map(String)
          : [],
    }));

    setStudents(normalized);
  }

  async function reloadAll() {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchBatches(),
        fetchStaff(),
        fetchStudents(),
        fetchBranches(),
      ]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reloadAll();
  }, []);

  const stats = useMemo(() => {
    const totalTeachers = new Set(
      batches.flatMap((batch) => batch.staff.map((s) => s.id)),
    ).size;
    const totalEnrolled = batches.reduce(
      (sum, batch) => sum + batch.enrolledStudents,
      0,
    );
    return {
      totalBatches: batches.length,
      activeBatches: batches.filter(
        (b) => b.status === "Open" || b.status === "Ongoing",
      ).length,
      totalStudents: totalEnrolled,
      averageBatchSize: batches.length
        ? Math.round(totalEnrolled / batches.length)
        : 0,
      totalTeachers,
      unassignedStudents: students.length,
      unassignedInstructors: Math.max(staff.length - totalTeachers, 0),
    };
  }, [batches, staff.length, students.length]);

  const columns: Column<BatchRow>[] = [
    { key: "id", label: "Batch ID", sortable: true },
    {
      key: "name",
      label: "Batch Name",
      sortable: true,
      render: (batch) => (
        <div>
          <p className="font-medium text-gray-900">{batch.name}</p>
          <p className="text-sm text-gray-500">
            {getBranchName(batch.branchId)}
          </p>
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
            {formatWeekdays(batch.weekdays)}
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
        const percent =
          batch.maxStudents > 0
            ? (batch.enrolledStudents / batch.maxStudents) * 100
            : 0;
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
      key: "staff",
      label: "Instructors",
      render: (batch) => (
        <div className="text-sm text-gray-700">
          {batch.staff.length > 0
            ? batch.staff.map((s) => s.name).join(", ")
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
      options: branches.map((b) => ({ value: b.id, label: b.name })),
    },
  ];

  function resetForm() {
    setFormData({
      name: "",
      branchId: "",
      weekdays: [],
      startTime: "",
      endTime: "",
      maxStudents: 30,
      medium: "Offline",
      status: "Draft",
    });
    setSelectedStaffIds([]);
    setSelectedStudentIds([]);
  }

  function openEditModal(batch: BatchRow) {
    setSelectedBatch(batch);
    setFormData({
      name: batch.name,
      branchId: batch.branchId,
      weekdays: batch.weekdays
        ? batch.weekdays
            .split(",")
            .map((d) => d.trim())
            .filter(Boolean)
        : [],
      startTime: normalizeTimeValue(batch.startTime),
      endTime: normalizeTimeValue(batch.endTime),
      maxStudents: batch.maxStudents,
      medium: batch.medium,
      status: batch.status,
    });
    setIsEditModalOpen(true);
  }

  function openViewModal(batch: BatchRow) {
    setSelectedBatch(batch);
    setIsViewModalOpen(true);
  }

  function openAssignStaffModal(batch: BatchRow) {
    setSelectedBatch(batch);
    setSelectedStaffIds(batch.staff.map((s) => s.id));
    setIsAssignStaffModalOpen(true);
  }

  function openAssignStudentsModal(batch: BatchRow) {
    setSelectedBatch(batch);
    setSelectedStudentIds(batch.students.map((s) => s.id));
    setIsAssignStudentsModalOpen(true);
  }

  async function handleCreateBatch(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const startTimeDate = timeToDate(formData.startTime);
      const endTimeDate = timeToDate(formData.endTime);

      if (!startTimeDate || !endTimeDate) {
        toast.error("Please select valid start and end times");
      }
      const res = await fetch("/api/common/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          branch_id: Number(formData.branchId),
          weekdays: joinWeekdays(formData.weekdays),
          start_time: startTimeDate,
          end_time: endTimeDate,
          max_students: Number(formData.maxStudents),
          medium: formData.medium,
          status: formData.status,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create batch");
      }

      setIsCreateModalOpen(false);
      resetForm();
      await reloadAll();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEditBatch(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBatch) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/common/batches", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedBatch.id,
          name: formData.name,
          branch_id: Number(formData.branchId),
          weekdays: joinWeekdays(formData.weekdays),
          start_time: formData.startTime, // send "HH:MM"
          end_time: formData.endTime, // send "HH:MM"
          max_students: Number(formData.maxStudents),
          medium: formData.medium,
          status: formData.status,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update batch");
      }

      setIsEditModalOpen(false);
      setSelectedBatch(null);
      resetForm();
      await reloadAll();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteBatch(batchId: string) {
    if (!confirm("Delete this batch?")) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/common/batches", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: batchId }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete batch");
      }

      await reloadAll();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAssignStaff(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBatch) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const existingIds = new Set(selectedBatch.staff.map((s) => s.id));
      const desiredIds = new Set(selectedStaffIds);

      const toAdd = [...desiredIds].filter((id) => !existingIds.has(id));
      const toRemove = [...existingIds].filter((id) => !desiredIds.has(id));

      const addRequests = toAdd.map((staffId) =>
        fetch(`/api/common/batches/${selectedBatch.id}/staff`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            staff_id: Number(staffId),
            product_id: null, // optional, depends on your schema
          }),
        }),
      );

      const removeRequests = toRemove.map((staffId) =>
        fetch(`/api/common/batches/${selectedBatch.id}/staff`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            staff_id: Number(staffId),
          }),
        }),
      );

      const responses = await Promise.all([...addRequests, ...removeRequests]);

      const failed = responses.find((r) => !r.ok);
      if (failed) {
        throw new Error("Failed to update staff assignments");
      }

      toast.success("Staff assignments updated");

      setIsAssignStaffModalOpen(false);
      setSelectedBatch(null);
      setSelectedStaffIds([]);

      await reloadAll();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAssignStudents(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBatch) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const existingIds = new Set(selectedBatch.students.map((s) => s.id));
      const desiredIds = new Set(selectedStudentIds);

      const toAdd = [...desiredIds].filter((id) => !existingIds.has(id));
      const toRemove = [...existingIds].filter((id) => !desiredIds.has(id));

      for (const studentId of toAdd) {
        const student = students.find((s) => s.id === studentId);
        if (!student) continue;

        const res = await fetch(
          `/api/common/batches/${selectedBatch.id}/students`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              student_id: Number(studentId),
              // product_id: 1,
              start_date: new Date().toISOString().slice(0, 10),
              end_date: null,
            }),
          },
        );

        if (!res.ok) {
          throw new Error(`Failed to enroll ${student.name}`);
        }
      }

      for (const studentId of toRemove) {
        const res = await fetch(
          `/api/common/batches/${selectedBatch.id}/students`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ student_id: Number(studentId) }),
          },
        );

        if (!res.ok) {
          throw new Error("Failed to unenroll student");
        }
      }

      setIsAssignStudentsModalOpen(false);
      setSelectedBatch(null);
      setSelectedStudentIds([]);
      await reloadAll();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  const renderActions = (batch: BatchRow) => (
    <div className="">
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
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-99">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openViewModal(batch);
              setSelectedBatchId(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
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
              openAssignStaffModal(batch);
              setSelectedBatchId(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <UserPlus className="w-4 h-4" />
            Assign / Unassign Staff
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
            Enroll / Unenroll Students
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteBatch(batch.id);
              setSelectedBatchId(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition border-t border-gray-100"
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
            Create batches, assign teachers, enroll students, and keep
            everything in sync.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer"
          title="Add Batch"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 flex items-start justify-between gap-3">
          <p className="text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <StatCard
          icon={BookOpen}
          label="Total Batches"
          value={stats.totalBatches}
          color="blue"
        />
        <StatCard
          icon={Users}
          label="Active Batches"
          value={stats.activeBatches}
          color="indigo"
        />
        <StatCard
          icon={User}
          label="Total Students"
          value={stats.totalStudents}
          color="green"
        />
        <StatCard
          icon={GraduationCap}
          label="Assigned Instructors"
          value={stats.totalTeachers}
          color="red"
        />
        <StatCard
          icon={Calendar}
          label="Avg. Batch Students"
          value={stats.averageBatchSize}
          color="blue"
        />
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
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, branchId: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a branch</option>
              {branches.map((branch) => (
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
                setFormData({
                  ...formData,
                  maxStudents: Number(e.target.value),
                })
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
                setFormData({
                  ...formData,
                  medium: e.target.value as BatchMedium,
                })
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
                setFormData({
                  ...formData,
                  status: e.target.value as BatchStatus,
                })
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
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <span>to</span>
              <div className="w-1/2">
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, branchId: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a branch</option>
              {branches.map((branch) => (
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
                setFormData({
                  ...formData,
                  maxStudents: Number(e.target.value),
                })
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
                setFormData({
                  ...formData,
                  medium: e.target.value as BatchMedium,
                })
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
                setFormData({
                  ...formData,
                  status: e.target.value as BatchStatus,
                })
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
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <span>to</span>
              <div className="w-1/2">
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Batch ID</p>
                <p className="text-base text-gray-900">{selectedBatch.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusStyles(selectedBatch.status)}`}
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
                {formatWeekdays(selectedBatch.weekdays)} |{" "}
                {formatTime(selectedBatch.startTime)} -{" "}
                {formatTime(selectedBatch.endTime)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Medium</p>
                <p className="text-base text-gray-900">
                  {selectedBatch.medium}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Max Students
                </p>
                <p className="text-base text-gray-900">
                  {selectedBatch.maxStudents}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Enrollment</p>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-base text-gray-900">
                  {selectedBatch.enrolledStudents} / {selectedBatch.maxStudents}{" "}
                  students
                </p>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-indigo-600 h-3 rounded-full"
                    style={{
                      width: `${Math.min((selectedBatch.enrolledStudents / Math.max(selectedBatch.maxStudents, 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                Assigned Staff
              </p>
              {selectedBatch.staff.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedBatch.staff.map((member) => (
                    <span
                      key={member.id}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                    >
                      {member.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No staff assigned yet</p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                Enrolled Students
              </p>
              {selectedBatch.students.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedBatch.students.map((student) => (
                    <span
                      key={student.id}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                    >
                      {student.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No students enrolled yet
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>

      <FormModal
        isOpen={isAssignStaffModalOpen}
        onClose={() => {
          setIsAssignStaffModalOpen(false);
          setSelectedBatch(null);
          setSelectedStaffIds([]);
        }}
        title="Assign / Unassign Staff"
        onSubmit={handleAssignStaff}
        submitLabel="Save Staff Assignment"
        isSubmitting={isSubmitting}
      >
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Select staff for <strong>{selectedBatch?.name}</strong>
          </p>

          <div className="border border-gray-300 rounded-lg p-3 max-h-72 overflow-y-auto space-y-2">
            {staff.map((member) => (
              <label
                key={member.id}
                className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  checked={selectedStaffIds.includes(member.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedStaffIds((prev) => [...prev, member.id]);
                    } else {
                      setSelectedStaffIds((prev) =>
                        prev.filter((id) => id !== member.id),
                      );
                    }
                  }}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-1"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {member.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {member.email ?? "No email"}
                  </p>
                  {member.specialization ? (
                    <p className="text-xs text-gray-500">
                      {member.specialization}
                    </p>
                  ) : null}
                </div>
              </label>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-2">
            {selectedStaffIds.length} staff selected
          </p>
        </div>
      </FormModal>

      <FormModal
        isOpen={isAssignStudentsModalOpen}
        onClose={() => {
          setIsAssignStudentsModalOpen(false);
          setSelectedBatch(null);
          setSelectedStudentIds([]);
        }}
        title="Enroll / Unenroll Students"
        onSubmit={handleAssignStudents}
        submitLabel="Save Enrollments"
        isSubmitting={isSubmitting}
      >
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Select students for <strong>{selectedBatch?.name}</strong>
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800">
              Available seats:{" "}
              <strong>
                {selectedBatch
                  ? Math.max(
                      selectedBatch.maxStudents -
                        selectedBatch.enrolledStudents,
                      0,
                    )
                  : 0}
              </strong>
            </p>
          </div>

          <div className="border border-gray-300 rounded-lg p-3 max-h-72 overflow-y-auto space-y-2">
            {students.map((student) => (
              <label
                key={student.id}
                className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  checked={selectedStudentIds.includes(student.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedStudentIds((prev) => [...prev, student.id]);
                    } else {
                      setSelectedStudentIds((prev) =>
                        prev.filter((id) => id !== student.id),
                      );
                    }
                  }}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-1"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {student.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {student.email ?? "No email"}
                  </p>
                  {student.phone ? (
                    <p className="text-xs text-gray-500">{student.phone}</p>
                  ) : null}
                </div>
              </label>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-2">
            {selectedStudentIds.length} student(s) selected
          </p>
        </div>
      </FormModal>

      {loading && (
        <p className="text-sm text-gray-500">
          Loading batches, staff, and students...
        </p>
      )}
    </div>
  );
}
