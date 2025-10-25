// app/admin/branches/page.tsx
"use client";

import React, { useState } from "react";
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
import branchData from "@/mock/branches.json";
import studentData from "@/mock/students.json";
import teacherData from "@/mock/teachers.json";

// Types
interface Branch {
  id: string;
  name: string;
  address: string;
  code: string;
  teachers: Teacher[];
  students: Student[];
}

interface Product {
  id: string;
  name: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  specialization: string;
  experience_years: number;
  assigned_courses: number;
  total_students: number;
  is_active: boolean;
  joined_date: string;
  salary: number;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  guardian_name: string;
  guardian_contact: string;
  status: "ACTIVE" | "INACTIVE" | "GRADUATED" | "DROPPED";
  enrolled_courses: number;
  total_fees: number;
  pending_fees: number;
  created_at: string; // ISO date format
}

export default function BatchManagementPage() {
  // Sample Data (Replace with API calls)
  const [branches, setBranches] = useState<Branch[]>(branchData as Branch[]);

  const [courses] = useState<Product[]>([
    { id: "C001", name: "Full Stack Web Development" },
    { id: "C002", name: "Data Science & Analytics" },
    { id: "C003", name: "Mobile App Development" },
    { id: "C004", name: "UI/UX Design" },
    { id: "C005", name: "Cybersecurity Fundamentals" },
    { id: "C006", name: "Cloud Computing with AWS" },
    { id: "C007", name: "Machine Learning & AI" },
    { id: "C008", name: "Digital Marketing Essentials" },
  ]);

  const [teachers] = useState<Teacher[]>(teacherData as Teacher[]);

  const [students] = useState<Student[]>(studentData as Student[]);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAssignStudentsModalOpen, setIsAssignStudentsModalOpen] =
    useState(false);
  const [isAssignTeachersModalOpen, setIsAssignTeachersModalOpen] =
    useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Branch | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    name: "",
    courseId: "",
    branchId: "",
    startDate: "",
    endDate: "",
    schedule: "",
    maxStudents: 30,
    medium: "Online" as "Online" | "Offline" | "Hybrid",
    venue: "",
    scheduleType: "",
    weekdays: [""],
    startTime: "",
    endTime: "",
  });

  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Table Columns
  const columns: Column<Branch>[] = [
    {
      key: "id",
      label: "Branch ID",
      sortable: true,
    },
    {
      key: "name",
      label: "Branch Name",
      sortable: true,
      render: (batch) => (
        <div>
          <p className="font-medium text-gray-900">{batch.name}</p>
          <p className="text-sm text-gray-500">{batch.course}</p>
        </div>
      ),
    },
    {
      key: "schedule",
      label: "Schedule",
      render: (batch) => (
        <div className="text-sm">
          <p className="text-gray-900">{batch.schedule}</p>
          <p className="text-gray-500">
            {new Date(batch.startDate).toLocaleDateString("en-IN")} -{" "}
            {new Date(batch.endDate).toLocaleDateString("en-IN")}
          </p>
        </div>
      ),
    },
    {
      key: "enrolledStudents",
      label: "Students",
      sortable: true,
      render: (batch) => (
        <div>
          <p className="text-sm font-medium text-gray-900">
            {batch.enrolledStudents} / {batch.maxStudents}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div
              className="bg-indigo-600 h-2 rounded-full"
              style={{
                width: `${(batch.enrolledStudents / batch.maxStudents) * 100}%`,
              }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "teachers",
      label: "Teachers",
      render: (batch) => (
        <div className="text-sm text-gray-700">
          {batch.teachers.length > 0
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
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            batch.medium === "Online"
              ? "bg-blue-100 text-blue-700"
              : batch.medium === "Offline"
              ? "bg-green-100 text-green-700"
              : "bg-purple-100 text-purple-700"
          }`}
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
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            batch.status === "Active"
              ? "bg-green-100 text-green-700"
              : batch.status === "Upcoming"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {batch.status}
        </span>
      ),
    },
  ];

  // Filters
  const filters: Filter[] = [
    {
      key: "status",
      label: "All Status",
      options: [
        { value: "Active", label: "Active" },
        { value: "Upcoming", label: "Upcoming" },
        { value: "Completed", label: "Completed" },
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
      key: "courseId",
      label: "All Products",
      options: courses.map((c) => ({ value: c.id, label: c.name })),
    },
  ];

  const renderActions = (batch: Branch) => (
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
            Edit Branch
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
            Assign Teachers
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
            Delete Branch
          </button>
        </div>
      )}
    </div>
  );

  // Handlers
  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const newBatch: Branch = {
        id: `B${String(branches.length + 1).padStart(3, "0")}`,
        name: formData.name,
        course: courses.find((c) => c.id === formData.courseId)?.name || "",
        courseId: formData.courseId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        schedule: formData.schedule,
        maxStudents: formData.maxStudents,
        enrolledStudents: 0,
        teachers: selectedTeachers,
        status:
          new Date(formData.startDate) > new Date() ? "Upcoming" : "Active",
        medium: formData.medium,
        venue: formData.venue,
      };

      setBranches([...branches, newBatch]);
      setIsCreateModalOpen(false);
      resetForm();
      setIsSubmitting(false);
    }, 1000);
  };

  const handleEditBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setBranches(
        branches.map((batch) =>
          batch.id === selectedBatch.id
            ? {
                ...batch,
                name: formData.name,
                courseId: formData.courseId,
                course:
                  courses.find((c) => c.id === formData.courseId)?.name || "",
                startDate: formData.startDate,
                endDate: formData.endDate,
                schedule: formData.schedule,
                maxStudents: formData.maxStudents,
                medium: formData.medium,
                venue: formData.venue,
              }
            : batch
        )
      );
      setIsEditModalOpen(false);
      setSelectedBatch(null);
      resetForm();
      setIsSubmitting(false);
    }, 1000);
  };

  const handleDeleteBatch = (batchId: string) => {
    if (confirm("Are you sure you want to delete this batch?")) {
      setBranches(branches.filter((b) => b.id !== batchId));
    }
  };

  const handleAssignTeachers = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setBranches(
        branches.map((batch) =>
          batch.id === selectedBatch.id
            ? {
                ...batch,
                teachers: selectedTeachers.map(
                  (tid) => teachers.find((t) => t.id === tid)?.name || ""
                ),
              }
            : batch
        )
      );
      setIsAssignTeachersModalOpen(false);
      setSelectedBatch(null);
      setSelectedTeachers([]);
      setIsSubmitting(false);
    }, 1000);
  };

  const handleAssignStudents = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setBranches(
        branches.map((batch) =>
          batch.id === selectedBatch.id
            ? {
                ...batch,
                enrolledStudents:
                  batch.enrolledStudents + selectedStudents.length,
              }
            : batch
        )
      );
      setIsAssignStudentsModalOpen(false);
      setSelectedBatch(null);
      setSelectedStudents([]);
      setIsSubmitting(false);
    }, 1000);
  };

  const openEditModal = (batch: Branch) => {
    setSelectedBatch(batch);
    setFormData({
      name: batch.name,
      courseId: batch.courseId,
      branchId: batch.branchId!,
      startDate: batch.startDate,
      endDate: batch.endDate,
      schedule: batch.schedule,
      maxStudents: batch.maxStudents,
      medium: batch.medium,
      venue: batch.venue || "",
      scheduleType: "",
      weekdays: [],
      startTime: "",
      endTime: "",
    });
    setIsEditModalOpen(true);
  };

  const openViewModal = (batch: Branch) => {
    setSelectedBatch(batch);
    setIsViewModalOpen(true);
  };

  const openAssignTeachersModal = (batch: Branch) => {
    setSelectedBatch(batch);
    const teacherIds = teachers
      .filter((t) => batch.teachers.includes(t.name))
      .map((t) => t.id);
    setSelectedTeachers(teacherIds);
    setIsAssignTeachersModalOpen(true);
  };

  const openAssignStudentsModal = (batch: Branch) => {
    setSelectedBatch(batch);
    setSelectedStudents([]);
    setIsAssignStudentsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      courseId: "",
      branchId: "",
      startDate: "",
      endDate: "",
      schedule: "",
      maxStudents: 30,
      medium: "Online",
      venue: "",
      scheduleType: "",
      weekdays: [],
      startTime: "",
      endTime: "",
    });
    setSelectedTeachers([]);
    setSelectedStudents([]);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Branch Management
          </h1>
          <p className="text-gray-600 mt-2">
            Create and manage branches, assign students and teachers
          </p>
        </div>

        {/* Create Button */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer"
            title="Add Branch"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <StatCard
          icon={BookOpen}
          label="Active Branches"
          value={stats.totalBatches}
          color="blue"
        />
        <StatCard
          icon={Users}
          label="Total Students"
          value={stats.totalStudents}
          color="indigo"
        />
        <StatCard
          icon={User}
          label="Avg. Branch Students"
          value={"20"}
          color="green"
        />
        <StatCard
          icon={Users}
          label="Unassigned Students"
          value={stats.totalTeachers}
          color="red"
        />
        <StatCard
          icon={GraduationCap}
          label="Unassigned Teachers"
          value={stats.totalTeachers}
          color="red"
        />
      </div>

      {/* Data Table */}
      <DataTable
        data={branches}
        columns={columns}
        filters={filters}
        dateFilter={{ key: "startDate", label: "Filter by Start Date" }}
        searchPlaceholder="Search branches..."
        searchKeys={["name", "course", "id", "schedule"]}
        exportFileName="branches"
        itemsPerPage={5}
        renderActions={renderActions}
      />

      {/* Create Branch Modal */}
      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Create New Branch"
        onSubmit={handleCreateBatch}
        submitLabel="Create Branch"
        isSubmitting={isSubmitting}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Branch Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Branch Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Web Development - Morning Branch"
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
              <option key="1" value={1}>
                Indiranagar
              </option>
              <option key="2" value={2}>
                HRBR Layout
              </option>
            </select>
          </div>

          {/* Product */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Product
            </label>
            <select
              required
              value={formData.courseId}
              onChange={(e) =>
                setFormData({ ...formData, courseId: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Select Weekdays
            </label>
            <div className="w-full flex items-center gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    const isSelected = formData.weekdays?.includes(day);
                    setFormData({
                      ...formData,
                      weekdays: isSelected
                        ? formData.weekdays.filter((d) => d !== day)
                        : [...(formData.weekdays || []), day],
                    });
                  }}
                  className={`w-full px-3 py-1 rounded-lg border cursor-pointer ${
                    formData.weekdays?.includes(day)
                      ? "bg-indigo-500 text-white"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Timings */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Branch Timings
            </label>
            <div className="flex items-center gap-3">
              <div className="w-1/2">
                <CustomTimePicker
                  value={formData.startTime}
                  onChange={(val) =>
                    setFormData({ ...formData, startTime: val })
                  }
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

      {/* Edit Branch Modal */}
      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBatch(null);
          resetForm();
        }}
        title="Edit Branch"
        onSubmit={handleEditBatch}
        submitLabel="Update Branch"
        isSubmitting={isSubmitting}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Branch Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Branch Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Web Development - Morning Branch"
            />
          </div>

          {/* Branch */}
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
              <option key="1" value={1}>
                Indiranagar
              </option>
              <option key="2" value={2}>
                HRBR Layout
              </option>
            </select>
          </div>

          {/* Product */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product *
            </label>
            <select
              required
              value={formData.courseId}
              onChange={(e) =>
                setFormData({ ...formData, courseId: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          {/* Select Weekdays */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Weekdays *
            </label>
            <div className="flex flex-wrap gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    const isSelected = formData.weekdays?.includes(day);
                    setFormData({
                      ...formData,
                      weekdays: isSelected
                        ? formData.weekdays.filter((d) => d !== day)
                        : [...(formData.weekdays || []), day],
                    });
                  }}
                  className={`px-3 py-1 rounded-lg border cursor-pointer ${
                    formData.weekdays?.includes(day)
                      ? "bg-indigo-500 text-white"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Timings with CustomTimePicker */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Branch Timings *
            </label>
            <div className="flex items-center gap-3">
              <div className="w-1/2">
                <CustomTimePicker
                  label="Start Time"
                  value={formData.startTime}
                  onChange={(val) =>
                    setFormData({ ...formData, startTime: val })
                  }
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

      {/* View Branch Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedBatch(null);
        }}
        title="Branch Details"
        size="lg"
      >
        {selectedBatch && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Branch ID</p>
                <p className="text-base text-gray-900">{selectedBatch.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    selectedBatch.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : selectedBatch.status === "Upcoming"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {selectedBatch.status}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Branch Name</p>
              <p className="text-base text-gray-900">{selectedBatch.name}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Product</p>
              <p className="text-base text-gray-900">{selectedBatch.course}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Start Date</p>
                <p className="text-base text-gray-900">
                  {new Date(selectedBatch.startDate).toLocaleDateString(
                    "en-IN",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">End Date</p>
                <p className="text-base text-gray-900">
                  {new Date(selectedBatch.endDate).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Schedule</p>
              <p className="text-base text-gray-900">
                {selectedBatch.schedule}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Medium</p>
                <p className="text-base text-gray-900">
                  {selectedBatch.medium}
                </p>
              </div>
              {selectedBatch.venue && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Venue</p>
                  <p className="text-base text-gray-900">
                    {selectedBatch.venue}
                  </p>
                </div>
              )}
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
                      width: `${
                        (selectedBatch.enrolledStudents /
                          selectedBatch.maxStudents) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                Assigned Teachers
              </p>
              {selectedBatch.teachers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedBatch.teachers.map((teacher, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                    >
                      {teacher}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No teachers assigned yet
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Teachers Modal */}
      <FormModal
        isOpen={isAssignTeachersModalOpen}
        onClose={() => {
          setIsAssignTeachersModalOpen(false);
          setSelectedBatch(null);
          setSelectedTeachers([]);
        }}
        title="Assign Teachers to Branch"
        onSubmit={handleAssignTeachers}
        submitLabel="Assign Teachers"
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
                        selectedTeachers.filter((id) => id !== teacher.id)
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

      {/* Assign Students Modal */}
      <FormModal
        isOpen={isAssignStudentsModalOpen}
        onClose={() => {
          setIsAssignStudentsModalOpen(false);
          setSelectedBatch(null);
          setSelectedStudents([]);
        }}
        title="Assign Students to Branch"
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
                  ? selectedBatch.maxStudents - selectedBatch.enrolledStudents
                  : 0}
              </strong>
            </p>
          </div>
          <div className="border border-gray-300 rounded-lg p-3 max-h-64 overflow-y-auto">
            {students
              .filter(
                (student) =>
                  !student.enrolledBatches.includes(selectedBatch?.id || "")
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
                          selectedStudents.filter((id) => id !== student.id)
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
