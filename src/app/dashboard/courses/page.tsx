"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Users,
  IndianRupee,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle,
  XCircle,
  Award,
  ChevronDown,
} from "lucide-react";
import DataTable, { Column, Filter } from "@/components/DataTable";
import StatCard from "@/components/StatCard";
import { FormModal } from "@/components/Modal";
import Loader from "@/components/Loader";
import toast from "react-hot-toast";

interface Product {
  id: string;
  branch_id: string;
  branch_name?: string;
  name: string;
  description: string;
  duration_weeks: number;
  fee: number;
  start_date: string;
  end_date: string;
  assigned_teacher: string;
  teacher_name: string;
  enrolled_students: number;
  max_capacity: number;
  status: "ACTIVE" | "INACTIVE" | "COMPLETED" | "UPCOMING";
  created_at: string;
  batch_id?: string;
  assignments?: {
    id: number;
    staff_id: number;
    staff_name: string;
    batch_id: number;
    batch_name: string;
  }[];
}

interface Instructor {
  id: string;
  name: string;
  email?: string | null;
}

interface BranchOption {
  id: string;
  name: string;
}

interface BatchOption {
  id: string;
  name: string;
  branch_id: string;
  branch_name: string;
  status?: string;
}

type FormState = {
  branch_id: string;
  batch_id: string;
  name: string;
  description: string;
  duration_weeks: string;
  fee: string;
  start_date: string;
  end_date: string;
  assigned_teacher: string;
  max_capacity: string;
  status: "ACTIVE" | "INACTIVE" | "COMPLETED" | "UPCOMING";
};

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";
const labelClass = "block text-sm font-medium text-gray-700 mb-2";
const sectionClass =
  "rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-4";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className={labelClass}>{children}</label>;
}

function getApiData(json: any) {
  return json?.data ?? json;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Product[]>([]);
  const [teachers, setTeachers] = useState<Instructor[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState<Product | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [totalCourses, setTotalCourses] = useState(0);
  const [activeCourses, setActiveCourses] = useState(0);
  const [totalEnrollments, setTotalEnrollments] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [formData, setFormData] = useState<FormState>({
    branch_id: "",
    batch_id: "",
    name: "",
    description: "",
    duration_weeks: "",
    fee: "",
    start_date: "",
    end_date: "",
    assigned_teacher: "",
    max_capacity: "",
    status: "ACTIVE",
  });

  const resetForm = () => {
    setFormData({
      branch_id: "",
      batch_id: "",
      name: "",
      description: "",
      duration_weeks: "",
      fee: "",
      start_date: "",
      end_date: "",
      assigned_teacher: "",
      max_capacity: "",
      status: "ACTIVE",
    });
  };

  const fetchCourses = async () => {
    const res = await fetch("/api/common/courses");
    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to load courses");
    }

    const data = (json.data || []).map((item: any) => ({
      id: String(item.id),
      branch_id: String(item.branch_id ?? ""),
      branch_name: item.branch_name ?? "",
      name: item.name,
      description: item.description || "",
      duration_weeks: Number(item.duration_weeks || 0),
      fee: Number(item.fee || 0),
      start_date: item.start_date || "",
      end_date: item.end_date || "",
      assigned_teacher: item.assigned_teacher
        ? String(item.assigned_teacher)
        : "",
      teacher_name: item.teacher_name || "Unassigned",
      enrolled_students: Number(item.enrolled_students || 0),
      max_capacity: Number(item.max_capacity || 0),
      status: item.status,
      created_at: item.created_at || "",
      batch_id: item.batch_id ? String(item.batch_id) : "",
      assignments: item.assignments || [],
    })) as Product[];

    setCourses(data);

    setTotalCourses(data.length);
    setActiveCourses(data.filter((c) => c.status === "ACTIVE").length);
    setTotalEnrollments(data.reduce((sum, c) => sum + c.enrolled_students, 0));
    setTotalRevenue(
      data.reduce((sum, c) => sum + c.fee * c.enrolled_students, 0),
    );
  };

  const fetchTeachers = async () => {
    const res = await fetch("/api/common/staff?limit=100&page=1");
    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to load staff");
    }

    const list = (json.data || []).map((item: any) => ({
      id: String(item.id),
      name: item.name,
      email: item.email,
    })) as Instructor[];

    setTeachers(list);
  };

  const fetchBranches = async () => {
    const endpoints = ["/api/common/branches"];

    for (const endpoint of endpoints) {
      try {
        const res = await fetch(endpoint);
        const json = await res.json();

        const data = getApiData(json);
        if (
          res.ok &&
          (json.success === true || json.error === false) &&
          Array.isArray(data)
        ) {
          setBranches(
            data.map((item: any) => ({
              id: String(item.id),
              name: item.name,
            })),
          );
          return;
        }
      } catch {
        // try next endpoint
      }
    }

    throw new Error("Failed to load branches");
  };

  const fetchBatches = async () => {
    const res = await fetch("/api/common/batches");
    const json = await res.json();

    const data = getApiData(json);
    if (!res.ok || !json.success || !Array.isArray(data)) {
      throw new Error(json.message || "Failed to load batches");
    }

    setBatches(
      data.map((item: any) => ({
        id: String(item.id),
        name: item.name,
        branch_id: String(item.branch_id ?? item.branches?.id ?? ""),
        branch_name: item.branches?.name ?? "",
        status: item.status ?? "",
      })),
    );
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchCourses(),
          fetchTeachers(),
          fetchBranches(),
          fetchBatches(),
        ]);
      } catch (error: any) {
        toast.error(error?.message || "Failed to load page data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredBatches = useMemo(() => {
    if (!formData.branch_id) return [];
    return batches.filter((batch) => batch.branch_id === formData.branch_id);
  }, [batches, formData.branch_id]);

  const selectedBranchName = useMemo(() => {
    return branches.find((b) => b.id === formData.branch_id)?.name || "";
  }, [branches, formData.branch_id]);

  const openEditModal = (course: Product) => {
    setSelectedCourse(course);
    const firstAssignment = course.assignments?.[0];

    setFormData({
      branch_id: course.branch_id || "",
      batch_id: firstAssignment?.batch_id
        ? String(firstAssignment.batch_id)
        : course.batch_id || "",
      name: course.name,
      description: course.description,
      duration_weeks: String(course.duration_weeks || ""),
      fee: String(course.fee || ""),
      start_date: course.start_date ? course.start_date.slice(0, 10) : "",
      end_date: course.end_date ? course.end_date.slice(0, 10) : "",
      assigned_teacher: firstAssignment?.staff_id
        ? String(firstAssignment.staff_id)
        : course.assigned_teacher || "",
      max_capacity: String(course.max_capacity || ""),
      status: course.status,
    });

    setShowEditModal(true);
    setSelectedCourseId(null);
  };

  const openViewModal = (course: Product) => {
    setSelectedCourse(course);
    setShowViewModal(true);
    setSelectedCourseId(null);
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        branch_id: Number(formData.branch_id),
        batch_id: Number(formData.batch_id),
        name: formData.name,
        description: formData.description,
        duration_weeks: Number(formData.duration_weeks),
        fee: Number(formData.fee),
        start_date: formData.start_date,
        end_date: formData.end_date,
        assigned_teacher: formData.assigned_teacher
          ? Number(formData.assigned_teacher)
          : null,
        max_capacity: Number(formData.max_capacity),
        status: formData.status,
      };

      const res = await fetch("/api/common/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to create course");
      }

      toast.success("Course created successfully");
      setShowAddModal(false);
      resetForm();
      await fetchCourses();
    } catch (error: any) {
      toast.error(error?.message || "Failed to create course");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourse) return;

    setIsSubmitting(true);

    try {
      const payload = {
        branch_id: Number(formData.branch_id),
        batch_id: Number(formData.batch_id),
        name: formData.name,
        description: formData.description,
        duration_weeks: Number(formData.duration_weeks),
        fee: Number(formData.fee),
        start_date: formData.start_date,
        end_date: formData.end_date,
        assigned_teacher: formData.assigned_teacher
          ? Number(formData.assigned_teacher)
          : null,
        max_capacity: Number(formData.max_capacity),
        status: formData.status,
      };

      const res = await fetch(`/api/common/courses/${selectedCourse.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to update course");
      }

      toast.success("Course updated successfully");
      setShowEditModal(false);
      setSelectedCourse(null);
      resetForm();
      await fetchCourses();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update course");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const res = await fetch(`/api/common/courses/${courseId}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to delete course");
      }

      toast.success("Course deleted successfully");
      await fetchCourses();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete course");
    }

    setSelectedCourseId(null);
  };

  const statusBadge = (status: Product["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "INACTIVE":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "UPCOMING":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const branchLabelById = (id: string) =>
    branches.find((b) => b.id === id)?.name || `Branch #${id || "-"}`;

  const batchLabelById = (id: string) =>
    batches.find((b) => b.id === id)?.name || `Batch #${id || "-"}`;

  const columns: Column<Product>[] = useMemo(
    () => [
      {
        key: "name",
        label: "Course",
        sortable: true,
        render: (item) => (
          <div>
            <p className="font-semibold text-gray-900">{item.name}</p>
            <p className="mt-1 text-xs text-gray-500 line-clamp-1">
              {item.description}
            </p>
          </div>
        ),
        exportRender: (item) => item.name,
      },
      {
        key: "teacher_name",
        label: "Instructor",
        sortable: true,
        render: (item) => (
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-900">{item.teacher_name}</span>
          </div>
        ),
        exportRender: (item) => item.teacher_name,
      },
      {
        key: "duration_weeks",
        label: "Classes",
        sortable: true,
        render: (item) => (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-900">{item.duration_weeks}</span>
          </div>
        ),
        exportRender: (item) => item.duration_weeks,
      },
      {
        key: "fee",
        label: "Fee",
        sortable: true,
        render: (item) => (
          <div className="flex items-center gap-1 font-semibold text-gray-900">
            <IndianRupee className="w-4 h-4" />
            {item.fee.toLocaleString("en-IN")}
          </div>
        ),
        exportRender: (item) => item.fee,
      },
      {
        key: "enrolled_students",
        label: "Enrollments",
        sortable: true,
        render: (item) => {
          const capacity = item.max_capacity > 0 ? item.max_capacity : 0;
          const percentage =
            capacity > 0
              ? Math.min(100, (item.enrolled_students / capacity) * 100)
              : 0;

          return (
            <div className="text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-gray-900">
                  {item.enrolled_students}
                </span>
                <span className="text-gray-500">
                  {capacity > 0 ? `/${capacity}` : ""}
                </span>
              </div>
              {capacity > 0 && (
                <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                  <div
                    className={`h-2 rounded-full ${
                      percentage >= 90
                        ? "bg-red-600"
                        : percentage >= 70
                          ? "bg-amber-600"
                          : "bg-green-600"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}
            </div>
          );
        },
        exportRender: (item) => item.enrolled_students,
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        render: (item) => {
          const config = {
            ACTIVE: {
              bg: "bg-green-100",
              text: "text-green-800",
              icon: CheckCircle,
            },
            INACTIVE: {
              bg: "bg-gray-100",
              text: "text-gray-800",
              icon: XCircle,
            },
            COMPLETED: {
              bg: "bg-blue-100",
              text: "text-blue-800",
              icon: Award,
            },
            UPCOMING: {
              bg: "bg-purple-100",
              text: "text-purple-800",
              icon: Calendar,
            },
          } as const;

          const cfg = config[item.status];
          const Icon = cfg.icon;

          return (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.bg} ${cfg.text}`}
            >
              <Icon className="h-3 w-3" />
              {item.status}
            </span>
          );
        },
        exportRender: (item) => item.status,
      },
      {
        key: "start_date",
        label: "Start Date",
        sortable: true,
        render: (item) => (
          <span className="text-sm text-gray-700">
            {item.start_date
              ? new Date(item.start_date).toLocaleDateString("en-IN")
              : "-"}
          </span>
        ),
        exportRender: (item) => item.start_date,
      },
    ],
    [],
  );

  const filters: Filter[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "ACTIVE", label: "Active" },
        { value: "INACTIVE", label: "Inactive" },
        { value: "COMPLETED", label: "Completed" },
        { value: "UPCOMING", label: "Upcoming" },
      ],
    },
  ];

  const renderActions = (item: Product) => (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedCourseId(selectedCourseId === item.id ? null : item.id);
        }}
        className="rounded-lg p-2 transition hover:bg-gray-100"
      >
        <MoreVertical className="h-5 w-5 text-gray-600" />
      </button>

      {selectedCourseId === item.id && (
        <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          <button
            onClick={() => openViewModal(item)}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
          >
            <Eye className="h-4 w-4" />
            View details
          </button>
          <button
            onClick={() => openEditModal(item)}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
          >
            <Edit className="h-4 w-4" />
            Edit course
          </button>
          <button
            onClick={() => handleDeleteCourse(item.id)}
            className="flex w-full items-center gap-3 border-t border-gray-100 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete course
          </button>
        </div>
      )}
    </div>
  );

  const handleBranchChange = (branchId: string) => {
    setFormData((prev) => ({
      ...prev,
      branch_id: branchId,
      batch_id: "",
    }));
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Product Management
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-600">
              Manage courses, pricing, capacity, branch assignment, and staff
              assignments in one place.
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add course
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CheckCircle}
          label="Active Products"
          value={activeCourses}
          color="green"
        />
        <StatCard
          icon={BookOpen}
          label="Total Products"
          value={totalCourses}
          color="blue"
        />
        <StatCard
          icon={Users}
          label="Total Enrollments"
          value={totalEnrollments}
          color="indigo"
        />
        <StatCard
          icon={IndianRupee}
          label="Revenue"
          value={`₹${(totalRevenue / 100000).toFixed(1)}L`}
          color="indigo"
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <DataTable
          data={courses}
          columns={columns}
          filters={filters}
          searchPlaceholder="Search by course, description, or instructor..."
          searchKeys={["name", "description", "teacher_name"]}
          itemsPerPage={5}
          exportFileName="courses"
          renderActions={renderActions}
        />
      </div>

      <FormModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Product"
        onSubmit={handleAddCourse}
        submitLabel={isSubmitting ? "Creating..." : "Create Product"}
        isSubmitting={isSubmitting}
        size="lg"
      >
        <div className="space-y-5 max-h-128 overflow-y-auto pr-1">
          <div className={sectionClass}>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Course information
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Enter the course basics, pricing, and dates.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <FieldLabel>Course name *</FieldLabel>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={inputClass}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <FieldLabel>Description *</FieldLabel>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className={`${inputClass} resize-none`}
                  required
                />
              </div>

              <div>
                <FieldLabel>Number of classes *</FieldLabel>
                <input
                  type="number"
                  value={formData.duration_weeks}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration_weeks: e.target.value,
                    })
                  }
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <FieldLabel>Max capacity *</FieldLabel>
                <input
                  type="number"
                  value={formData.max_capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_capacity: e.target.value,
                    })
                  }
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <FieldLabel>Fee (₹) *</FieldLabel>
                <input
                  type="number"
                  value={formData.fee}
                  onChange={(e) =>
                    setFormData({ ...formData, fee: e.target.value })
                  }
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <FieldLabel>Status *</FieldLabel>
                <div className="relative">
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as FormState["status"],
                      })
                    }
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="UPCOMING">Upcoming</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <FieldLabel>Start date *</FieldLabel>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      start_date: e.target.value,
                    })
                  }
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <FieldLabel>End date *</FieldLabel>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      end_date: e.target.value,
                    })
                  }
                  className={inputClass}
                  required
                />
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Branch and batch
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Pick a branch first, then choose one of its batches.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <FieldLabel>Branch *</FieldLabel>
                <div className="relative">
                  <select
                    value={formData.branch_id}
                    onChange={(e) => handleBranchChange(e.target.value)}
                    className={`${inputClass} appearance-none pr-10`}
                    required
                  >
                    <option value="">Select branch</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <FieldLabel>Batch *</FieldLabel>
                <div className="relative">
                  <select
                    value={formData.batch_id}
                    onChange={(e) =>
                      setFormData({ ...formData, batch_id: e.target.value })
                    }
                    className={`${inputClass} appearance-none pr-10`}
                    disabled={!formData.branch_id}
                    required
                  >
                    <option value="">
                      {formData.branch_id
                        ? filteredBatches.length
                          ? "Select batch"
                          : "No batches found"
                        : "Select branch first"}
                    </option>
                    {filteredBatches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
                {formData.branch_id && (
                  <p className="mt-2 text-xs text-gray-500">
                    {selectedBranchName
                      ? `Showing batches for ${selectedBranchName}.`
                      : "Showing batches for the selected branch."}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <FieldLabel>Assign staff</FieldLabel>
                <div className="relative">
                  <select
                    value={formData.assigned_teacher}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        assigned_teacher: e.target.value,
                      })
                    }
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    <option value="">Select staff</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </FormModal>

      <FormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCourse(null);
          resetForm();
        }}
        title="Edit Product"
        onSubmit={handleEditCourse}
        submitLabel={isSubmitting ? "Saving..." : "Save Changes"}
        isSubmitting={isSubmitting}
        size="lg"
      >
        <div className="space-y-5 max-h-128 overflow-y-auto pr-1">
          <div className={sectionClass}>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Course information
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Update the course details below.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <FieldLabel>Course name *</FieldLabel>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={inputClass}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <FieldLabel>Description *</FieldLabel>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className={`${inputClass} resize-none`}
                  required
                />
              </div>

              <div>
                <FieldLabel>Number of classes *</FieldLabel>
                <input
                  type="number"
                  value={formData.duration_weeks}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration_weeks: e.target.value,
                    })
                  }
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <FieldLabel>Max capacity *</FieldLabel>
                <input
                  type="number"
                  value={formData.max_capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_capacity: e.target.value,
                    })
                  }
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <FieldLabel>Fee (₹) *</FieldLabel>
                <input
                  type="number"
                  value={formData.fee}
                  onChange={(e) =>
                    setFormData({ ...formData, fee: e.target.value })
                  }
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <FieldLabel>Status *</FieldLabel>
                <div className="relative">
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as FormState["status"],
                      })
                    }
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="UPCOMING">Upcoming</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <FieldLabel>Start date *</FieldLabel>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      start_date: e.target.value,
                    })
                  }
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <FieldLabel>End date *</FieldLabel>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      end_date: e.target.value,
                    })
                  }
                  className={inputClass}
                  required
                />
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Branch and batch
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Pick a branch first, then choose one of its batches.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <FieldLabel>Branch *</FieldLabel>
                <div className="relative">
                  <select
                    value={formData.branch_id}
                    onChange={(e) => handleBranchChange(e.target.value)}
                    className={`${inputClass} appearance-none pr-10`}
                    required
                  >
                    <option value="">Select branch</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <FieldLabel>Batch *</FieldLabel>
                <div className="relative">
                  <select
                    value={formData.batch_id}
                    onChange={(e) =>
                      setFormData({ ...formData, batch_id: e.target.value })
                    }
                    className={`${inputClass} appearance-none pr-10`}
                    disabled={!formData.branch_id}
                    required
                  >
                    <option value="">
                      {formData.branch_id
                        ? filteredBatches.length
                          ? "Select batch"
                          : "No batches found"
                        : "Select branch first"}
                    </option>
                    {filteredBatches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
                {formData.branch_id && (
                  <p className="mt-2 text-xs text-gray-500">
                    {selectedBranchName
                      ? `Showing batches for ${selectedBranchName}.`
                      : "Showing batches for the selected branch."}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <FieldLabel>Assign staff</FieldLabel>
                <div className="relative">
                  <select
                    value={formData.assigned_teacher}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        assigned_teacher: e.target.value,
                      })
                    }
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    <option value="">Select staff</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </FormModal>

      {selectedCourse && (
        <FormModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedCourse(null);
          }}
          title="Product Details"
          onSubmit={(e) => {
            e.preventDefault();
            setShowViewModal(false);
          }}
          submitLabel="Close"
          size="lg"
        >
          <div className="space-y-5">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedCourse.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {selectedCourse.description}
                  </p>
                </div>

                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${statusBadge(
                    selectedCourse.status,
                  )}`}
                >
                  {selectedCourse.status}
                </span>
              </div>
            </div>

            <div className={sectionClass}>
              <h3 className="text-sm font-semibold text-gray-900">
                Course information
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <DetailItem
                  label="Branch"
                  value={branchLabelById(selectedCourse.branch_id)}
                />
                <DetailItem
                  label="Batch"
                  value={
                    selectedCourse.batch_id
                      ? batchLabelById(selectedCourse.batch_id)
                      : "-"
                  }
                />
                <DetailItem
                  label="Classes"
                  value={selectedCourse.duration_weeks}
                />
                <DetailItem
                  label="Fee"
                  value={`₹${selectedCourse.fee.toLocaleString("en-IN")}`}
                />
                <DetailItem
                  label="Start date"
                  value={
                    selectedCourse.start_date
                      ? new Date(selectedCourse.start_date).toLocaleDateString(
                          "en-IN",
                        )
                      : "-"
                  }
                />
                <DetailItem
                  label="End date"
                  value={
                    selectedCourse.end_date
                      ? new Date(selectedCourse.end_date).toLocaleDateString(
                          "en-IN",
                        )
                      : "-"
                  }
                />
                <DetailItem
                  label="Assigned staff"
                  value={selectedCourse.teacher_name || "Unassigned"}
                />
              </div>
            </div>

            <div className={sectionClass}>
              <h3 className="text-sm font-semibold text-gray-900">
                Enrollment information
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <DetailItem
                  label="Enrolled students"
                  value={selectedCourse.enrolled_students}
                />
                <DetailItem
                  label="Max capacity"
                  value={selectedCourse.max_capacity || "-"}
                />
                <div className="md:col-span-2">
                  <p className="mb-2 text-sm text-gray-600">Progress</p>
                  <div className="h-3 w-full rounded-full bg-gray-200">
                    <div
                      className={`h-3 rounded-full ${
                        selectedCourse.max_capacity > 0 &&
                        (selectedCourse.enrolled_students /
                          selectedCourse.max_capacity) *
                          100 >=
                          90
                          ? "bg-red-600"
                          : selectedCourse.max_capacity > 0 &&
                              (selectedCourse.enrolled_students /
                                selectedCourse.max_capacity) *
                                100 >=
                                70
                            ? "bg-amber-600"
                            : "bg-green-600"
                      }`}
                      style={{
                        width:
                          selectedCourse.max_capacity > 0
                            ? `${Math.min(
                                100,
                                (selectedCourse.enrolled_students /
                                  selectedCourse.max_capacity) *
                                  100,
                              )}%`
                            : "0%",
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    {selectedCourse.max_capacity > 0
                      ? `${(
                          (selectedCourse.enrolled_students /
                            selectedCourse.max_capacity) *
                          100
                        ).toFixed(0)}% filled`
                      : "No capacity set"}
                  </p>
                </div>
              </div>
            </div>

            <div className={sectionClass}>
              <h3 className="text-sm font-semibold text-gray-900">
                Assignments
              </h3>
              <div className="space-y-3">
                {selectedCourse.assignments?.length ? (
                  selectedCourse.assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="rounded-lg border border-gray-200 bg-white px-4 py-3"
                    >
                      <p className="font-medium text-gray-900">
                        {assignment.staff_name}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        Batch: {assignment.batch_name || assignment.batch_id}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No staff assigned yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}
