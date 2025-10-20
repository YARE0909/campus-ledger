// app/admin/batches/page.tsx
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
} from "lucide-react";
import DataTable, { Column, Filter } from "@/app/components/DataTable";
import Modal, { FormModal } from "@/app/components/Modal";
import StatCard from "@/app/components/StatCard";

// Types
interface Batch {
  id: string;
  name: string;
  course: string;
  courseId: string;
  startDate: string;
  endDate: string;
  schedule: string;
  maxStudents: number;
  enrolledStudents: number;
  teachers: string[];
  status: "Active" | "Upcoming" | "Completed";
  medium: "Online" | "Offline" | "Hybrid";
  venue?: string;
}

interface Course {
  id: string;
  name: string;
}

interface Teacher {
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

export default function BatchManagementPage() {
  // Sample Data (Replace with API calls)
  const [batches, setBatches] = useState<Batch[]>([
    {
      id: "B001",
      name: "Web Development - Morning Batch",
      course: "Full Stack Web Development",
      courseId: "C001",
      startDate: "2025-11-01",
      endDate: "2026-02-28",
      schedule: "Mon-Fri, 9:00 AM - 12:00 PM",
      maxStudents: 30,
      enrolledStudents: 25,
      teachers: ["John Doe", "Jane Smith"],
      status: "Upcoming",
      medium: "Hybrid",
      venue: "Room 101",
    },
    {
      id: "B002",
      name: "Data Science - Evening Batch",
      course: "Data Science & Analytics",
      courseId: "C002",
      startDate: "2025-10-15",
      endDate: "2026-01-15",
      schedule: "Mon-Wed-Fri, 6:00 PM - 9:00 PM",
      maxStudents: 25,
      enrolledStudents: 22,
      teachers: ["Mike Johnson"],
      status: "Active",
      medium: "Online",
    },
    {
      id: "B003",
      name: "Mobile Development - Weekend Batch",
      course: "Mobile App Development",
      courseId: "C003",
      startDate: "2025-09-01",
      endDate: "2025-10-10",
      schedule: "Sat-Sun, 10:00 AM - 2:00 PM",
      maxStudents: 20,
      enrolledStudents: 20,
      teachers: ["Sarah Williams"],
      status: "Completed",
      medium: "Offline",
      venue: "Lab 205",
    },
    {
      id: "B004",
      name: "UI/UX Design - Morning Batch",
      course: "UI/UX Design",
      courseId: "C004",
      startDate: "2025-10-20",
      endDate: "2025-12-20",
      schedule: "Mon-Fri, 10:00 AM - 1:00 PM",
      maxStudents: 25,
      enrolledStudents: 18,
      teachers: ["Jane Smith"],
      status: "Active",
      medium: "Offline",
      venue: "Design Studio 1",
    },
    {
      id: "B005",
      name: "Cybersecurity - Evening Batch",
      course: "Cybersecurity Fundamentals",
      courseId: "C005",
      startDate: "2025-11-10",
      endDate: "2026-02-15",
      schedule: "Tue-Thu, 6:00 PM - 9:00 PM",
      maxStudents: 20,
      enrolledStudents: 16,
      teachers: ["Rajesh Kumar"],
      status: "Upcoming",
      medium: "Online",
    },
    {
      id: "B006",
      name: "Cloud Computing - Weekend Batch",
      course: "Cloud Computing with AWS",
      courseId: "C006",
      startDate: "2025-12-01",
      endDate: "2026-03-01",
      schedule: "Sat-Sun, 9:00 AM - 1:00 PM",
      maxStudents: 30,
      enrolledStudents: 12,
      teachers: ["Priya Sharma"],
      status: "Upcoming",
      medium: "Hybrid",
      venue: "Lab 301",
    },
    {
      id: "B007",
      name: "Machine Learning - Intensive Batch",
      course: "Machine Learning & AI",
      courseId: "C007",
      startDate: "2025-09-15",
      endDate: "2025-12-15",
      schedule: "Mon-Fri, 2:00 PM - 5:00 PM",
      maxStudents: 35,
      enrolledStudents: 32,
      teachers: ["Amit Patel"],
      status: "Active",
      medium: "Online",
    },
    {
      id: "B008",
      name: "Digital Marketing - Fast Track",
      course: "Digital Marketing Essentials",
      courseId: "C008",
      startDate: "2025-08-01",
      endDate: "2025-09-15",
      schedule: "Mon-Fri, 11:00 AM - 1:00 PM",
      maxStudents: 40,
      enrolledStudents: 38,
      teachers: ["Sneha Reddy"],
      status: "Completed",
      medium: "Offline",
      venue: "Room 203",
    },
  ]);

  const [courses] = useState<Course[]>([
    { id: "C001", name: "Full Stack Web Development" },
    { id: "C002", name: "Data Science & Analytics" },
    { id: "C003", name: "Mobile App Development" },
    { id: "C004", name: "UI/UX Design" },
    { id: "C005", name: "Cybersecurity Fundamentals" },
    { id: "C006", name: "Cloud Computing with AWS" },
    { id: "C007", name: "Machine Learning & AI" },
    { id: "C008", name: "Digital Marketing Essentials" },
  ]);

  const [teachers] = useState<Teacher[]>([
    { id: "T001", name: "John Doe", email: "john@example.com" },
    { id: "T002", name: "Jane Smith", email: "jane@example.com" },
    { id: "T003", name: "Mike Johnson", email: "mike@example.com" },
    { id: "T004", name: "Sarah Williams", email: "sarah@example.com" },
    { id: "T005", name: "Rajesh Kumar", email: "rajesh@example.com" },
    { id: "T006", name: "Priya Sharma", email: "priya@example.com" },
    { id: "T007", name: "Amit Patel", email: "amit@example.com" },
    { id: "T008", name: "Sneha Reddy", email: "sneha@example.com" },
  ]);

  const [students] = useState<Student[]>([
    {
      id: "S001",
      name: "Alex Brown",
      email: "alex@example.com",
      enrolledBatches: ["B001"],
    },
    {
      id: "S002",
      name: "Emma Davis",
      email: "emma@example.com",
      enrolledBatches: ["B002"],
    },
    {
      id: "S003",
      name: "Oliver Wilson",
      email: "oliver@example.com",
      enrolledBatches: ["B001", "B002"],
    },
    {
      id: "S004",
      name: "Sophia Taylor",
      email: "sophia@example.com",
      enrolledBatches: ["B003"],
    },
    {
      id: "S005",
      name: "Liam Martinez",
      email: "liam@example.com",
      enrolledBatches: ["B001", "B004"],
    },
    {
      id: "S006",
      name: "Ava Thomas",
      email: "ava@example.com",
      enrolledBatches: ["B002"],
    },
    {
      id: "S007",
      name: "Noah Anderson",
      email: "noah@example.com",
      enrolledBatches: ["B004"],
    },
    {
      id: "S008",
      name: "Mia Hernandez",
      email: "mia@example.com",
      enrolledBatches: ["B003"],
    },
  ]);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAssignStudentsModalOpen, setIsAssignStudentsModalOpen] =
    useState(false);
  const [isAssignTeachersModalOpen, setIsAssignTeachersModalOpen] =
    useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    name: "",
    courseId: "",
    startDate: "",
    endDate: "",
    schedule: "",
    maxStudents: 30,
    medium: "Online" as "Online" | "Offline" | "Hybrid",
    venue: "",
  });

  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Stats
  const stats = {
    totalBatches: batches.length,
    activeBatches: batches.filter((b) => b.status === "Active").length,
    totalStudents: batches.reduce((sum, b) => sum + b.enrolledStudents, 0),
    totalTeachers: new Set(batches.flatMap((b) => b.teachers)).size,
  };

  // Table Columns
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
      label: "All Courses",
      options: courses.map((c) => ({ value: c.id, label: c.name })),
    },
  ];

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
            Delete Batch
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
      const newBatch: Batch = {
        id: `B${String(batches.length + 1).padStart(3, "0")}`,
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

      setBatches([...batches, newBatch]);
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
      setBatches(
        batches.map((batch) =>
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
      setBatches(batches.filter((b) => b.id !== batchId));
    }
  };

  const handleAssignTeachers = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setBatches(
        batches.map((batch) =>
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
      setBatches(
        batches.map((batch) =>
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

  const openEditModal = (batch: Batch) => {
    setSelectedBatch(batch);
    setFormData({
      name: batch.name,
      courseId: batch.courseId,
      startDate: batch.startDate,
      endDate: batch.endDate,
      schedule: batch.schedule,
      maxStudents: batch.maxStudents,
      medium: batch.medium,
      venue: batch.venue || "",
    });
    setIsEditModalOpen(true);
  };

  const openViewModal = (batch: Batch) => {
    setSelectedBatch(batch);
    setIsViewModalOpen(true);
  };

  const openAssignTeachersModal = (batch: Batch) => {
    setSelectedBatch(batch);
    const teacherIds = teachers
      .filter((t) => batch.teachers.includes(t.name))
      .map((t) => t.id);
    setSelectedTeachers(teacherIds);
    setIsAssignTeachersModalOpen(true);
  };

  const openAssignStudentsModal = (batch: Batch) => {
    setSelectedBatch(batch);
    setSelectedStudents([]);
    setIsAssignStudentsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      courseId: "",
      startDate: "",
      endDate: "",
      schedule: "",
      maxStudents: 30,
      medium: "Online",
      venue: "",
    });
    setSelectedTeachers([]);
    setSelectedStudents([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Batch Management</h1>
          <p className="text-gray-600 mt-2">
            Create and manage batches, assign students and teachers, and track
            batch progress
          </p>
        </div>

        {/* Create Button */}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <StatCard
          icon={BookOpen}
          label="Total Batches"
          value={stats.totalBatches}
          color="blue"
        />
        <StatCard
          icon={Calendar}
          label="Active Batches"
          value={stats.activeBatches}
          color="green"
        />
        <StatCard
          icon={Users}
          label="Total Students"
          value={stats.totalStudents}
          color="indigo"
        />
        <StatCard
          icon={Users}
          label="Unassigned Students"
          value={stats.totalTeachers}
          color="red"
        />
        <StatCard
          icon={GraduationCap}
          label="Total Teachers"
          value={stats.totalTeachers}
          color="red"
        />
      </div>

      {/* Data Table */}
      <DataTable
        data={batches}
        columns={columns}
        filters={filters}
        dateFilter={{ key: "startDate", label: "Filter by Start Date" }}
        searchPlaceholder="Search batches..."
        searchKeys={["name", "course", "id", "schedule"]}
        exportFileName="batches"
        itemsPerPage={5}
        renderActions={renderActions}
      />

      {/* Create Batch Modal */}
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
              placeholder="e.g., Web Development - Morning Batch"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course *
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date *
            </label>
            <input
              type="date"
              required
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule *
            </label>
            <input
              type="text"
              required
              value={formData.schedule}
              onChange={(e) =>
                setFormData({ ...formData, schedule: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Mon-Fri, 9:00 AM - 12:00 PM"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Students *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.maxStudents}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxStudents: parseInt(e.target.value),
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
                  medium: e.target.value as "Online" | "Offline" | "Hybrid",
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          {(formData.medium === "Offline" || formData.medium === "Hybrid") && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Venue
              </label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) =>
                  setFormData({ ...formData, venue: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Room 101, Lab 205"
              />
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign Teachers (Optional)
            </label>
            <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
              {teachers.map((teacher) => (
                <label
                  key={teacher.id}
                  className="flex items-center gap-2 mb-2 cursor-pointer"
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
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">
                    {teacher.name} ({teacher.email})
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </FormModal>

      {/* Edit Batch Modal */}
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
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course *
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date *
            </label>
            <input
              type="date"
              required
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule *
            </label>
            <input
              type="text"
              required
              value={formData.schedule}
              onChange={(e) =>
                setFormData({ ...formData, schedule: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Students *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.maxStudents}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxStudents: parseInt(e.target.value),
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
                  medium: e.target.value as "Online" | "Offline" | "Hybrid",
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          {(formData.medium === "Offline" || formData.medium === "Hybrid") && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Venue
              </label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) =>
                  setFormData({ ...formData, venue: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>
      </FormModal>

      {/* View Batch Details Modal */}
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
              <p className="text-sm font-medium text-gray-600">Batch Name</p>
              <p className="text-base text-gray-900">{selectedBatch.name}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Course</p>
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
        title="Assign Teachers to Batch"
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
