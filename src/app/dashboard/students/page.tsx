"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import DataTable, { Column, Filter } from "@/components/DataTable";
import StatCard from "@/components/StatCard";
import { FormModal } from "@/components/Modal";
import Loader from "@/components/Loader";
import toast from "react-hot-toast";
import { apiHandler } from "@/lib/api/apiClient";
import { endpoints } from "@/lib/api/endpoints";
import { GetBranchByTenantResponse } from "@/lib/api/types";

interface Student {
  id: number;
  branch_id: number;
  branch_name?: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  parent_guardian_name: string | null;
  parent_guardian_contact: string | null;
  parent_guardian_email?: string | null;
  status: "ACTIVE" | "INACTIVE" | "GRADUATED" | "QUIT";
  enrollment_count?: number;
  created_at: string;
  modified_at?: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [branches, setBranches] = useState<GetBranchByTenantResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [totalStudents, setTotalStudents] = useState(0);
  const [activeStudents, setActiveStudents] = useState(0);
  const [newStudentsThisMonth, setNewStudentsThisMonth] = useState(0);

  const [formData, setFormData] = useState({
    branch_id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    parent_guardian_name: "",
    parent_guardian_contact: "",
    parent_guardian_email: "",
    status: "ACTIVE",
  });

  // -------------------------
  // Fetch Students
  // -------------------------

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const res = await apiHandler(endpoints.getStudents, null);

      if (res.error) {
        throw new Error(res.errorMessage || res.message);
      }

      const data: Student[] = res.data ?? [];

      setStudents(data);

      setTotalStudents(data.length);
      setActiveStudents(data.filter((s) => s.status === "ACTIVE").length);

      const now = new Date();

      setNewStudentsThisMonth(
        data.filter((s) => {
          const d = new Date(s.created_at);
          return (
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
          );
        }).length
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Fetch Branches
  // -------------------------

  const fetchBranches = async () => {
    try {
      const res = await apiHandler(endpoints.getBranchByTenant, {
        tenant_id: 0,
      });

      if (res.error) return;

      setBranches(res.data || []);
    } catch {
      console.warn("Failed to fetch branches");
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchStudents();
  }, []);

  const resetForm = () => {
    setFormData({
      branch_id: branches.length ? String(branches[0].id) : "",
      name: "",
      email: "",
      phone: "",
      address: "",
      parent_guardian_name: "",
      parent_guardian_contact: "",
      parent_guardian_email: "",
      status: "ACTIVE",
    });
  };

  // -------------------------
  // Create Student
  // -------------------------

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!formData.branch_id) {
      toast.error("Branch is required");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        branch_id: Number(formData.branch_id),
        name: formData.name.trim(),
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        parent_guardian_name: formData.parent_guardian_name || null,
        parent_guardian_contact: formData.parent_guardian_contact || null,
        parent_guardian_email: formData.parent_guardian_email || null,
        status: formData.status,
      };

      const res = await apiHandler(endpoints.createStudent, payload);

      if (res.error) {
        throw new Error(res.errorMessage || res.message);
      }

      toast.success("Student added successfully");

      setShowAddModal(false);
      resetForm();
      fetchStudents();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------
  // Update Student
  // -------------------------

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent) return;

    try {
      setIsSubmitting(true);

      const payload = {
        id: selectedStudent.id,
        branch_id: Number(formData.branch_id),
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        parent_guardian_name: formData.parent_guardian_name || null,
        parent_guardian_contact: formData.parent_guardian_contact || null,
        parent_guardian_email: formData.parent_guardian_email || null,
        status: formData.status,
      };

      const res = await apiHandler(endpoints.updateStudent, payload);

      if (res.error) {
        throw new Error(res.errorMessage || res.message);
      }

      toast.success("Student updated successfully");

      setShowEditModal(false);
      setSelectedStudent(null);
      resetForm();
      fetchStudents();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------
  // Delete Student
  // -------------------------

  const handleDeleteStudent = async (studentId: number) => {
    if (!confirm("Delete this student?")) return;

    try {
      const res = await apiHandler(endpoints.deleteStudent, {
        id: studentId,
      });

      if (res.error) {
        throw new Error(res.errorMessage || res.message);
      }

      toast.success("Student deleted");

      fetchStudents();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openEditModal = (student: Student) => {
    setSelectedStudent(student);

    setFormData({
      branch_id: String(student.branch_id),
      name: student.name || "",
      email: student.email || "",
      phone: student.phone || "",
      address: student.address || "",
      parent_guardian_name: student.parent_guardian_name || "",
      parent_guardian_contact: student.parent_guardian_contact || "",
      parent_guardian_email: student.parent_guardian_email || "",
      status: student.status || "ACTIVE",
    });

    setShowEditModal(true);
  };

  const openViewModal = (student: Student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  // -------------------------
  // Table Columns
  // -------------------------

  const columns: Column<Student>[] = [
    {
      key: "name",
      label: "Student",
      sortable: true,
      render: (item) => (
        <div>
          <p className="font-semibold">{item.name}</p>
          <p className="text-xs text-gray-500">{item.email}</p>
          {item.branch_name && (
            <p className="text-xs text-gray-400">{item.branch_name}</p>
          )}
        </div>
      ),
    },
    {
      key: "phone",
      label: "Contact",
      render: (item) => (
        <div>
          <p>{item.phone}</p>
          <p className="text-xs text-gray-500">
            {item.parent_guardian_contact}
          </p>
        </div>
      ),
    },
    {
      key: "parent_guardian_name",
      label: "Guardian",
      sortable: true,
    },
    {
      key: "enrollment_count",
      label: "Enrollment",
      render: (item) =>
        item.enrollment_count ? (
          <span className="text-green-600 font-semibold">
            {item.enrollment_count} Enrolled
          </span>
        ) : (
          <span className="text-gray-500">Not Enrolled</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => {
        const config: Record<string, string> = {
          ACTIVE: "bg-green-100 text-green-800",
          INACTIVE: "bg-gray-100 text-gray-800",
          GRADUATED: "bg-blue-100 text-blue-800",
          QUIT: "bg-red-100 text-red-800",
        };

        return (
          <span
            className={`px-2 py-1 text-xs rounded-full ${config[item.status]}`}
          >
            {item.status}
          </span>
        );
      },
    },
    {
      key: "created_at",
      label: "Joined",
      render: (item) =>
        new Date(item.created_at).toLocaleDateString("en-IN"),
    },
  ];

  const filters: Filter[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "ACTIVE", label: "Active" },
        { value: "INACTIVE", label: "Inactive" },
        { value: "GRADUATED", label: "Graduated" },
        { value: "QUIT", label: "Quit" },
      ],
    },
    {
      key: "branch_id",
      label: "Branch",
      options: branches.map((b) => ({
        value: String(b.id),
        label: b.name,
      })),
    },
  ];

  const renderActions = (item: Student) => (
    <div className="flex gap-2">
      <button onClick={() => openViewModal(item)}>
        <Eye className="w-4 h-4" />
      </button>

      <button onClick={() => openEditModal(item)}>
        <Edit className="w-4 h-4" />
      </button>

      <button onClick={() => handleDeleteStudent(item.id)}>
        <Trash2 className="w-4 h-4 text-red-600" />
      </button>
    </div>
  );

  if (loading) return <Loader />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Student Management</h1>
          <p className="text-gray-600">Manage student records</p>
        </div>

        <button
          onClick={() => {
            // initialize branch default if available
            setFormData((prev) => ({
              ...prev,
              branch_id: branches.length ? String(branches[0].id) : "",
            }));
            resetForm();
            setShowAddModal(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex gap-2 items-center"
        >
          <UserPlus className="w-5 h-5" />
          Add Student
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        <StatCard icon={Users} label="Total Students" value={totalStudents} color="blue" />
        <StatCard icon={CheckCircle} label="Active Students" value={activeStudents} color="emerald" />
        <StatCard icon={UserPlus} label="New This Month" value={newStudentsThisMonth} color="fuchsia" />
      </div>

      {/* Table */}
      <DataTable
        data={students}
        columns={columns}
        filters={filters}
        searchKeys={["name", "email", "phone", "parent_guardian_name"]}
        searchPlaceholder="Search students..."
        renderActions={renderActions}
      />

      {/* Add Student Modal */}
      <FormModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Student"
        onSubmit={handleAddStudent}
        submitLabel="Add Student"
        isSubmitting={isSubmitting}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* branch select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Branch *
            </label>
            <select
              value={formData.branch_id}
              onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              required
            >
              <option value="">Select branch</option>
              {branches.map((b) => (
                <option key={b.id} value={String(b.id)}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Student Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Name</label>
            <input
              type="text"
              value={formData.parent_guardian_name}
              onChange={(e) => setFormData({ ...formData, parent_guardian_name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Contact</label>
            <input
              type="tel"
              value={formData.parent_guardian_contact}
              onChange={(e) => setFormData({ ...formData, parent_guardian_contact: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Email</label>
            <input
              type="email"
              value={formData.parent_guardian_email}
              onChange={(e) => setFormData({ ...formData, parent_guardian_email: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="GRADUATED">Graduated</option>
              <option value="QUIT">Quit</option>
            </select>
          </div>
        </div>
      </FormModal>

      {/* Edit Student Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedStudent(null);
          resetForm();
        }}
        title="Edit Student"
        onSubmit={handleEditStudent}
        submitLabel="Save Changes"
        isSubmitting={isSubmitting}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Branch *</label>
            <select
              value={formData.branch_id}
              onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            >
              <option value="">Select branch</option>
              {branches.map((b) => (
                <option key={b.id} value={String(b.id)}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Student Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Name</label>
            <input
              type="text"
              value={formData.parent_guardian_name}
              onChange={(e) => setFormData({ ...formData, parent_guardian_name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Contact</label>
            <input
              type="tel"
              value={formData.parent_guardian_contact}
              onChange={(e) => setFormData({ ...formData, parent_guardian_contact: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Email</label>
            <input
              type="email"
              value={formData.parent_guardian_email}
              onChange={(e) => setFormData({ ...formData, parent_guardian_email: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="GRADUATED">Graduated</option>
              <option value="QUIT">Quit</option>
            </select>
          </div>
        </div>
      </FormModal>

      {/* View Student Modal */}
      {selectedStudent && (
        <FormModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedStudent(null);
          }}
          title="Student Details"
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            setShowViewModal(false);
          }}
          submitLabel="Close"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Student Name</p>
                <p className="font-semibold text-gray-900">{selectedStudent.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="font-semibold text-gray-900">{selectedStudent.email || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Phone</p>
                <p className="font-semibold text-gray-900">{selectedStudent.phone || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  selectedStudent.status === "ACTIVE" ? "bg-green-100 text-green-800" :
                  selectedStudent.status === "GRADUATED" ? "bg-blue-100 text-blue-800" :
                  selectedStudent.status === "QUIT" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {selectedStudent.status}
                </span>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600 mb-1">Address</p>
                <p className="font-semibold text-gray-900">{selectedStudent.address || "-"}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Guardian Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Guardian Name</p>
                  <p className="font-semibold text-gray-900">{selectedStudent.parent_guardian_name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Guardian Contact</p>
                  <p className="font-semibold text-gray-900">{selectedStudent.parent_guardian_contact || "-"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Guardian Email</p>
                  <p className="font-semibold text-gray-900">{selectedStudent.parent_guardian_email || "-"}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Enrollments</p>
                  <p className="font-semibold text-gray-900">{selectedStudent.enrollment_count || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Joined</p>
                  <p className="font-semibold text-gray-900">{new Date(selectedStudent.created_at).toLocaleDateString("en-IN")}</p>
                </div>
              </div>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}