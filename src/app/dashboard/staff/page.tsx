"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Mail,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
  BookOpen,
  Award,
  Lock,
  UserCheck,
  IndianRupee,
} from "lucide-react";
import DataTable, { Column, Filter } from "@/components/DataTable";
import StatCard from "@/components/StatCard";
import { FormModal } from "@/components/Modal";
import Loader from "@/components/Loader";
import toast from "react-hot-toast";
import { apiHandler } from "@/lib/api/apiClient";
import { endpoints } from "@/lib/api/endpoints";
import { CreateStaffRequest, GetStaffResponse } from "@/lib/api/types";

interface Branch {
  id: number;
  name: string;
}

const statusLabelMap: Record<string, string> = {
  Active: "Active",
  Inactive: "Inactive",
  On_Leave: "On Leave",
  Suspended: "Suspended",
  Terminated: "Terminated",
  Archived: "Archived",
  Quit: "Quit",
};

const statusClassMap: Record<string, string> = {
  Active: "bg-green-100 text-green-800",
  Inactive: "bg-gray-100 text-gray-800",
  On_Leave: "bg-yellow-100 text-yellow-800",
  Suspended: "bg-orange-100 text-orange-800",
  Terminated: "bg-red-100 text-red-800",
  Archived: "bg-slate-100 text-slate-800",
  Quit: "bg-pink-100 text-pink-800",
};

export default function StaffPage() {
  const [teachers, setTeachers] = useState<GetStaffResponse[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [selectedTeacher, setSelectedTeacher] =
    useState<GetStaffResponse | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(
    null,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [activeTeachers, setActiveTeachers] = useState(0);
  const [averageSalary, setAverageSalary] = useState(0);
  const [newTeachersThisMonth, setNewTeachersThisMonth] = useState(0);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null,
  );
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  // Form state
  const [formData, setFormData] = useState({
    branch_id: "",
    name: "",
    email: "",
    phone: "",
    qualification: "",
    experience: "",
    specialization: "",
    salary: "",
    staff_status: "Active",
    staff_title: "",
    start_date: "",
    end_date: "",
  });

  const fetchBranches = async () => {
    const res = await apiHandler(endpoints.getBranches, null);

    if (res.error) {
      throw new Error(res.errorMessage || res.message);
    }

    setBranches(res.data ?? []);
  };

  const fetchTeachers = async () => {
    const res = await apiHandler(endpoints.getStaffs, null);

    if (res.error) {
      throw new Error(res.errorMessage || res.message);
    }

    const data: GetStaffResponse[] = res.data ?? [];

    setTeachers(data);

    setTotalTeachers(data.length);
    setActiveTeachers(data.filter((t) => t.staff_status === "Active").length);

    const salaries = data
      .map((t) => (t.salary ? Number(t.salary) : NaN))
      .filter((n) => Number.isFinite(n)) as number[];

    setAverageSalary(
      salaries.length
        ? Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length)
        : 0,
    );

    const now = new Date();
    setNewTeachersThisMonth(
      data.filter((t) => {
        const d = new Date(t.created_at);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }).length,
    );
  };

  useEffect(() => {
    if (branches.length && !formData.branch_id) {
      setFormData((prev) => ({
        ...prev,
        branch_id: String(branches[0].id),
      }));
    }
  }, [branches]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchBranches(), fetchTeachers()]);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormData({
      branch_id: branches.length ? String(branches[0].id) : "",
      name: "",
      email: "",
      phone: "",
      qualification: "",
      experience: "",
      specialization: "",
      salary: "",
      staff_status: "Active",
      staff_title: "",
      start_date: "",
      end_date: "",
    });
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.branch_id) {
      toast.error("Branch is required");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: CreateStaffRequest = {
        branch_id: Number(formData.branch_id),
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        qualification: formData.qualification.trim() || null,
        experience: formData.experience.trim() || null,
        specialization: formData.specialization.trim() || null,
        salary:
          formData.salary && !isNaN(Number(formData.salary))
            ? formData.salary
            : null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        staff_status: formData.staff_status as
          | "Active"
          | "Inactive"
          | "On_Leave"
          | "Suspended"
          | "Terminated"
          | "Archived"
          | "Quit"
          | null
          | undefined,
        staff_title: formData.staff_title || (null as any),
      };

      const res = await apiHandler(endpoints.createStaff, payload);

      if (res.error) {
        throw new Error(res.errorMessage || res.message);
      }

      const tempPassword = res.data?.temporary_password;

      if (tempPassword) {
        setGeneratedPassword(tempPassword);
        setShowPasswordModal(true);
      }

      toast.success("Instructor added successfully");
      setShowAddModal(false);
      resetForm();
      await fetchTeachers();
    } catch (err: any) {
      toast.error(err?.message || "Failed to add instructor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTeacher = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTeacher) return;

    if (!formData.branch_id) {
      toast.error("Branch is required");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        id: selectedTeacher.id,
        branch_id: Number(formData.branch_id),
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        qualification: formData.qualification.trim() || null,
        experience: formData.experience.trim() || null,
        specialization: formData.specialization.trim() || null,
        salary:
          formData.salary && !isNaN(Number(formData.salary))
            ? formData.salary
            : null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        staff_status: formData.staff_status,
        staff_title: formData.staff_title || null,
      };

      const res = await apiHandler(endpoints.updateStaff, payload as any);

      if (res.error) {
        throw new Error(res.errorMessage || res.message);
      }

      toast.success("Instructor updated successfully");
      setShowEditModal(false);
      setSelectedTeacher(null);
      resetForm();
      await fetchTeachers();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update instructor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeacher = async (teacherId: number) => {
    if (!confirm("Are you sure you want to delete this instructor?")) return;

    try {
      const res = await apiHandler(endpoints.deleteStaff, { id: teacherId });

      if (res.error) {
        throw new Error(res.errorMessage || res.message);
      }

      toast.success("Instructor deleted successfully");
      await fetchTeachers();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete instructor");
    }
  };

  const openEditModal = (teacher: GetStaffResponse) => {
    setSelectedTeacher(teacher);
    setFormData({
      branch_id: String(teacher.branch_id),
      name: teacher.name || "",
      email: teacher.email || "",
      phone: teacher.phone || "",
      qualification: teacher.qualification || "",
      experience: teacher.experience || "",
      specialization: teacher.specialization || "",
      salary: teacher.salary || "",
      staff_status: teacher.staff_status || "Active",
      staff_title: teacher.staff_title || "",
      start_date: teacher.start_date
        ? String(teacher.start_date).slice(0, 10)
        : "",
      end_date: teacher.end_date ? String(teacher.end_date).slice(0, 10) : "",
    });
    setShowEditModal(true);
    setSelectedTeacherId(null);
  };

  const openViewModal = (teacher: GetStaffResponse) => {
    setSelectedTeacher(teacher);
    setShowViewModal(true);
    setSelectedTeacherId(null);
  };

  const sendEmail = async (teacher: GetStaffResponse) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    toast.success(
      `Email action triggered for ${teacher.email || "this instructor"}`,
    );
    setSelectedTeacherId(null);
  };

  const resetPassword = async (teacher: GetStaffResponse) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    toast.success("Password reset link sent successfully");
    setSelectedTeacherId(null);
  };

  const columns: Column<GetStaffResponse>[] = [
    {
      key: "name",
      label: "Instructor",
      sortable: true,
      render: (item) => (
        <div>
          <p className="font-semibold text-gray-900">{item.name}</p>
          <p className="text-xs text-gray-500">{item.email}</p>
          {item.branch_name && (
            <p className="text-xs text-gray-400">{item.branch_name}</p>
          )}
        </div>
      ),
      exportRender: (item) => item.name,
    },
    {
      key: "qualification",
      label: "Qualification",
      sortable: true,
      render: (item) => (
        <div>
          <p className="text-sm text-gray-900">{item.qualification || "-"}</p>
          <p className="text-xs text-gray-500">{item.specialization || "-"}</p>
        </div>
      ),
      exportRender: (item) => item.qualification || "",
    },
    {
      key: "experience",
      label: "Experience",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-gray-900">
            {item.experience || "-"}
          </span>
        </div>
      ),
      exportRender: (item) => item.experience || "",
    },
    {
      key: "salary",
      label: "Salary",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-gray-900">
            {item.salary
              ? `₹${Number(item.salary).toLocaleString("en-IN")}`
              : "-"}
          </span>
        </div>
      ),
      exportRender: (item) => item.salary || "",
    },
    {
      key: "staff_status",
      label: "Status",
      sortable: true,
      render: (item) => {
        const status = item.staff_status || "Inactive";
        const Icon = status === "Active" ? CheckCircle : XCircle;

        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
              statusClassMap[status] || "bg-gray-100 text-gray-800"
            }`}
          >
            <Icon className="w-3 h-3" />
            {statusLabelMap[status] || status}
          </span>
        );
      },
      exportRender: (item) => item.staff_status || "",
    },
    {
      key: "created_at",
      label: "Joined",
      sortable: true,
      render: (item) => (
        <span className="text-sm text-gray-700">
          {new Date(item.created_at).toLocaleDateString("en-IN")}
        </span>
      ),
      exportRender: (item) => item.created_at,
    },
  ];

  const filters: Filter[] = [
    {
      key: "staff_status",
      label: "Status",
      options: [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
        { value: "On_Leave", label: "On Leave" },
        { value: "Suspended", label: "Suspended" },
        { value: "Terminated", label: "Terminated" },
        { value: "Archived", label: "Archived" },
        { value: "Quit", label: "Quit" },
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

  const renderActions = (item: GetStaffResponse) => (
    <div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedTeacherId(selectedTeacherId === item.id ? null : item.id);
        }}
        className="p-2 hover:bg-gray-100 rounded-lg transition"
      >
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>

      {selectedTeacherId === item.id && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <button
            onClick={() => openViewModal(item)}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>

          <button
            onClick={() => openEditModal(item)}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <Edit className="w-4 h-4" />
            Edit Instructor
          </button>

          <button
            onClick={() => sendEmail(item)}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <Mail className="w-4 h-4" />
            Send Email
          </button>

          <button
            onClick={() => resetPassword(item)}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <Lock className="w-4 h-4" />
            Reset Password
          </button>

          <button
            onClick={() => handleDeleteTeacher(item.id)}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition border-t border-gray-100"
          >
            <Trash2 className="w-4 h-4" />
            Delete Instructor
          </button>
        </div>
      )}
    </div>
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 mt-1">
            Manage teachers and faculty members
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer"
            title="Add Instructor"
          >
            <UserPlus className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={UserCheck}
          label="Active Instructors"
          value={activeTeachers}
          color="green"
        />
        <StatCard
          icon={Users}
          label="Total Staff"
          value={totalTeachers}
          color="blue"
        />
        <StatCard
          icon={IndianRupee}
          label="Avg Salary"
          value={`₹${averageSalary.toLocaleString("en-IN")}`}
          color="blue"
        />
        <StatCard
          icon={CheckCircle}
          label="New This Month"
          value={newTeachersThisMonth}
          color="green"
        />
      </div>

      <DataTable
        data={teachers}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search by name, email, qualification..."
        searchKeys={[
          "name",
          "email",
          "qualification",
          "specialization",
          "experience",
        ]}
        itemsPerPage={5}
        exportFileName="teachers"
        renderActions={renderActions}
      />

      {/* Add Instructor Modal */}
      <FormModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Instructor"
        onSubmit={handleAddTeacher}
        submitLabel="Add Instructor"
        isSubmitting={isSubmitting}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Branch *
            </label>
            <select
              value={formData.branch_id}
              onChange={(e) =>
                setFormData({ ...formData, branch_id: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience
            </label>
            <input
              type="text"
              value={formData.experience}
              onChange={(e) =>
                setFormData({ ...formData, experience: e.target.value })
              }
              placeholder="e.g. 5 years"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qualification
            </label>
            <input
              type="text"
              value={formData.qualification}
              onChange={(e) =>
                setFormData({ ...formData, qualification: e.target.value })
              }
              placeholder="e.g. M.Sc. Mathematics"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salary
            </label>
            <input
              type="number"
              value={formData.salary}
              onChange={(e) =>
                setFormData({ ...formData, salary: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Staff Title
            </label>
            <select
              value={formData.staff_title}
              onChange={(e) =>
                setFormData({ ...formData, staff_title: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select title</option>
              <option value="Mr">Mr</option>
              <option value="Mrs">Mrs</option>
              <option value="Ms">Ms</option>
              <option value="Miss">Miss</option>
              <option value="Dr">Dr</option>
              <option value="Prof">Prof</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.staff_status}
              onChange={(e) =>
                setFormData({ ...formData, staff_status: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On_Leave">On Leave</option>
              <option value="Suspended">Suspended</option>
              <option value="Terminated">Terminated</option>
              <option value="Archived">Archived</option>
              <option value="Quit">Quit</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialization
            </label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) =>
                setFormData({ ...formData, specialization: e.target.value })
              }
              placeholder="e.g. Algebra, Calculus, Geometry"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </FormModal>

      {/* Edit Instructor Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTeacher(null);
          resetForm();
        }}
        title="Edit Instructor"
        onSubmit={handleEditTeacher}
        submitLabel="Save Changes"
        isSubmitting={isSubmitting}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Branch *
            </label>
            <select
              value={formData.branch_id}
              onChange={(e) =>
                setFormData({ ...formData, branch_id: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience
            </label>
            <input
              type="text"
              value={formData.experience}
              onChange={(e) =>
                setFormData({ ...formData, experience: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qualification
            </label>
            <input
              type="text"
              value={formData.qualification}
              onChange={(e) =>
                setFormData({ ...formData, qualification: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salary
            </label>
            <input
              type="number"
              value={formData.salary}
              onChange={(e) =>
                setFormData({ ...formData, salary: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Staff Title
            </label>
            <select
              value={formData.staff_title}
              onChange={(e) =>
                setFormData({ ...formData, staff_title: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select title</option>
              <option value="Mr">Mr</option>
              <option value="Mrs">Mrs</option>
              <option value="Ms">Ms</option>
              <option value="Miss">Miss</option>
              <option value="Dr">Dr</option>
              <option value="Prof">Prof</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.staff_status}
              onChange={(e) =>
                setFormData({ ...formData, staff_status: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On_Leave">On Leave</option>
              <option value="Suspended">Suspended</option>
              <option value="Terminated">Terminated</option>
              <option value="Archived">Archived</option>
              <option value="Quit">Quit</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialization
            </label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) =>
                setFormData({ ...formData, specialization: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </FormModal>

      {/* View Instructor Modal */}
      {selectedTeacher && (
        <FormModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedTeacher(null);
          }}
          title="Instructor Details"
          onSubmit={(e) => {
            e.preventDefault();
            setShowViewModal(false);
          }}
          submitLabel="Close"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Full Name</p>
                <p className="font-semibold text-gray-900">
                  {selectedTeacher.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="font-semibold text-gray-900">
                  {selectedTeacher.email || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Phone</p>
                <p className="font-semibold text-gray-900">
                  {selectedTeacher.phone || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    statusClassMap[
                      selectedTeacher.staff_status || "Inactive"
                    ] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {statusLabelMap[selectedTeacher.staff_status || "Inactive"] ||
                    selectedTeacher.staff_status ||
                    "Inactive"}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Employment Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Branch</p>
                  <p className="font-semibold text-gray-900">
                    {selectedTeacher.branch_name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Staff Title</p>
                  <p className="font-semibold text-gray-900">
                    {selectedTeacher.staff_title || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Qualification</p>
                  <p className="font-semibold text-gray-900">
                    {selectedTeacher.qualification || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Experience</p>
                  <p className="font-semibold text-gray-900">
                    {selectedTeacher.experience || "-"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Specialization</p>
                  <p className="font-semibold text-gray-900">
                    {selectedTeacher.specialization || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Start Date</p>
                  <p className="font-semibold text-gray-900">
                    {selectedTeacher.start_date
                      ? new Date(selectedTeacher.start_date).toLocaleDateString(
                          "en-IN",
                        )
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">End Date</p>
                  <p className="font-semibold text-gray-900">
                    {selectedTeacher.end_date
                      ? new Date(selectedTeacher.end_date).toLocaleDateString(
                          "en-IN",
                        )
                      : "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Salary Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Monthly Salary</p>
                  <p className="font-semibold text-gray-900">
                    {selectedTeacher.salary
                      ? `₹${Number(selectedTeacher.salary).toLocaleString("en-IN")}`
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Joined Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedTeacher.created_at).toLocaleDateString(
                      "en-IN",
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FormModal>
      )}
      {generatedPassword && (
        <FormModal
          isOpen={showPasswordModal}
          onClose={() => {
            setShowPasswordModal(false);
            setGeneratedPassword(null);
          }}
          title="Temporary Password"
          onSubmit={(e) => {
            e.preventDefault();
            setShowPasswordModal(false);
            setGeneratedPassword(null);
          }}
          submitLabel="Close"
          size="sm"
        >
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              This password is shown only once. Please copy and share with the
              instructor.
            </p>

            <div className="p-3 bg-gray-100 rounded-lg font-mono text-lg text-center">
              {generatedPassword}
            </div>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(generatedPassword);
                toast.success("Copied to clipboard");
              }}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg"
            >
              Copy Password
            </button>
          </div>
        </FormModal>
      )}
    </div>
  );
}
