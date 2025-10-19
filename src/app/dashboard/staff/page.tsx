"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  GraduationCap,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Upload,
  CheckCircle,
  XCircle,
  BookOpen,
  Award,
  Calendar,
  Lock,
  UserCheck,
} from "lucide-react";
import DataTable, { Column, Filter } from "@/app/components/DataTable";
import StatCard from "@/app/components/StatCard";
import { FormModal } from "@/app/components/Modal";
import Loader from "@/app/components/Loader";
import toast from "react-hot-toast";
import mockData from "@/mock/teachers.json";

interface Teacher {
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

export default function StaffPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [activeTeachers, setActiveTeachers] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [avgExperience, setAvgExperience] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    qualification: "",
    specialization: "",
    experience_years: "",
    salary: "",
    is_active: true,
  });

  // Mock data function
  const fetchTeachers = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setTeachers(mockData);

    // Calculate stats
    setTotalTeachers(mockData.length);
    setActiveTeachers(mockData.filter((t) => t.is_active).length);
    setTotalCourses(mockData.reduce((sum, t) => sum + t.assigned_courses, 0));
    setAvgExperience(
      Math.round(
        mockData.reduce((sum, t) => sum + t.experience_years, 0) /
          mockData.length
      )
    );

    setLoading(false);
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      qualification: "",
      specialization: "",
      experience_years: "",
      salary: "",
      is_active: true,
    });
  };

  // Handle add teacher
  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Adding teacher:", formData);
    toast.success("Teacher added successfully");
    setShowAddModal(false);
    resetForm();
    fetchTeachers();
    setIsSubmitting(false);
  };

  // Handle edit teacher
  const handleEditTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Updating teacher:", { ...formData, id: selectedTeacher?.id });
    toast.success("Teacher updated successfully");
    setShowEditModal(false);
    setSelectedTeacher(null);
    resetForm();
    fetchTeachers();
    setIsSubmitting(false);
  };

  // Open edit modal
  const openEditModal = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      qualification: teacher.qualification,
      specialization: teacher.specialization,
      experience_years: teacher.experience_years.toString(),
      salary: teacher.salary.toString(),
      is_active: teacher.is_active,
    });
    setShowEditModal(true);
    setSelectedTeacherId(null);
  };

  // Open view modal
  const openViewModal = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowViewModal(true);
    setSelectedTeacherId(null);
  };

  // Delete teacher
  const handleDeleteTeacher = async (teacherId: string) => {
    if (confirm("Are you sure you want to delete this teacher?")) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Teacher deleted successfully");
      fetchTeachers();
    }
    setSelectedTeacherId(null);
  };

  // Toggle active status
  const toggleActiveStatus = async (teacher: Teacher) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success(
      `Teacher ${teacher.is_active ? "deactivated" : "activated"} successfully`
    );
    fetchTeachers();
    setSelectedTeacherId(null);
  };

  // Send email
  const sendEmail = async (teacher: Teacher) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success(`Email sent to ${teacher.email}`);
    setSelectedTeacherId(null);
  };

  // Reset password
  const resetPassword = async (teacher: Teacher) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Password reset link sent successfully");
    setSelectedTeacherId(null);
  };

  // Define columns
  const columns: Column<Teacher>[] = [
    {
      key: "name",
      label: "Teacher Name",
      sortable: true,
      render: (item) => (
        <div>
          <p className="font-semibold text-gray-900">{item.name}</p>
          <p className="text-xs text-gray-500">{item.email}</p>
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
          <p className="text-sm text-gray-900">{item.qualification}</p>
          <p className="text-xs text-gray-500">{item.specialization}</p>
        </div>
      ),
      exportRender: (item) => item.qualification,
    },
    {
      key: "experience_years",
      label: "Experience",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-gray-900">
            {item.experience_years} years
          </span>
        </div>
      ),
      exportRender: (item) => item.experience_years,
    },
    {
      key: "assigned_courses",
      label: "Courses",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-gray-900">
            {item.assigned_courses}
          </span>
        </div>
      ),
      exportRender: (item) => item.assigned_courses,
    },
    {
      key: "total_students",
      label: "Students",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-gray-900">
            {item.total_students}
          </span>
        </div>
      ),
      exportRender: (item) => item.total_students,
    },
    {
      key: "is_active",
      label: "Status",
      sortable: true,
      render: (item) => {
        const Icon = item.is_active ? CheckCircle : XCircle;
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
              item.is_active
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            <Icon className="w-3 h-3" />
            {item.is_active ? "Active" : "Inactive"}
          </span>
        );
      },
      exportRender: (item) => (item.is_active ? "Active" : "Inactive"),
    },
    {
      key: "joined_date",
      label: "Joined",
      sortable: true,
      render: (item) => (
        <span className="text-sm text-gray-700">
          {new Date(item.joined_date).toLocaleDateString("en-IN")}
        </span>
      ),
      exportRender: (item) => item.joined_date,
    },
  ];

  // Define filters
  const filters: Filter[] = [
    {
      key: "is_active",
      label: "Status",
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
  ];

  // Render actions
  const renderActions = (item: Teacher) => (
    <div className="relative">
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
            Edit Teacher
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
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
            <BookOpen className="w-4 h-4" />
            View Courses
          </button>
          <button
            onClick={() => toggleActiveStatus(item)}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition border-t border-gray-100 ${
              item.is_active
                ? "text-amber-600 hover:bg-amber-50"
                : "text-green-600 hover:bg-green-50"
            }`}
          >
            {item.is_active ? (
              <>
                <XCircle className="w-4 h-4" />
                Deactivate
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Activate
              </>
            )}
          </button>
          <button
            onClick={() => handleDeleteTeacher(item.id)}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition border-t border-gray-100"
          >
            <Trash2 className="w-4 h-4" />
            Delete Teacher
          </button>
        </div>
      )}
    </div>
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
            title="Add Teacher"
          >
            <UserPlus className="w-6 h-6" />
            {/* Add Teacher */}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Total Teachers"
          value={totalTeachers}
          color="blue"
        />
        <StatCard
          icon={UserCheck}
          label="Active Teachers"
          value={activeTeachers}
          color="green"
        />
        <StatCard
          icon={BookOpen}
          label="Total Courses"
          value={totalCourses}
          color="indigo"
        />
        <StatCard
          icon={Award}
          label="Avg Experience"
          value={`${avgExperience} years`}
          color="blue"
        />
      </div>

      {/* DataTable */}
      <DataTable
        data={teachers}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search by name, email, qualification..."
        searchKeys={["name", "email", "qualification", "specialization"]}
        itemsPerPage={5}
        exportFileName="teachers"
        renderActions={renderActions}
      />

      {/* Add Teacher Modal */}
      <FormModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Teacher"
        onSubmit={handleAddTeacher}
        submitLabel="Add Teacher"
        isSubmitting={isSubmitting}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience (Years) *
            </label>
            <input
              type="number"
              value={formData.experience_years}
              onChange={(e) =>
                setFormData({ ...formData, experience_years: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qualification *
            </label>
            <input
              type="text"
              value={formData.qualification}
              onChange={(e) =>
                setFormData({ ...formData, qualification: e.target.value })
              }
              placeholder="e.g., M.Sc. Mathematics"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salary (Monthly) *
            </label>
            <input
              type="number"
              value={formData.salary}
              onChange={(e) =>
                setFormData({ ...formData, salary: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialization *
            </label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) =>
                setFormData({ ...formData, specialization: e.target.value })
              }
              placeholder="e.g., Algebra, Calculus, Geometry"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Active Status</span>
            </label>
          </div>
        </div>
      </FormModal>

      {/* Edit Teacher Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTeacher(null);
          resetForm();
        }}
        title="Edit Teacher"
        onSubmit={handleEditTeacher}
        submitLabel="Save Changes"
        isSubmitting={isSubmitting}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience (Years) *
            </label>
            <input
              type="number"
              value={formData.experience_years}
              onChange={(e) =>
                setFormData({ ...formData, experience_years: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qualification *
            </label>
            <input
              type="text"
              value={formData.qualification}
              onChange={(e) =>
                setFormData({ ...formData, qualification: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salary (Monthly) *
            </label>
            <input
              type="number"
              value={formData.salary}
              onChange={(e) =>
                setFormData({ ...formData, salary: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialization *
            </label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) =>
                setFormData({ ...formData, specialization: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Active Status</span>
            </label>
          </div>
        </div>
      </FormModal>

      {/* View Teacher Modal */}
      {selectedTeacher && (
        <FormModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedTeacher(null);
          }}
          title="Teacher Details"
          onSubmit={(e) => {
            e.preventDefault();
            setShowViewModal(false);
          }}
          submitLabel="Close"
          size="lg"
        >
          <div className="space-y-6">
            {/* Personal Info */}
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
                  {selectedTeacher.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Phone</p>
                <p className="font-semibold text-gray-900">
                  {selectedTeacher.phone}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    selectedTeacher.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {selectedTeacher.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Academic Info */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Academic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Qualification</p>
                  <p className="font-semibold text-gray-900">
                    {selectedTeacher.qualification}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Experience</p>
                  <p className="font-semibold text-gray-900">
                    {selectedTeacher.experience_years} years
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Specialization</p>
                  <p className="font-semibold text-gray-900">
                    {selectedTeacher.specialization}
                  </p>
                </div>
              </div>
            </div>

            {/* Teaching Load */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Teaching Load
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Assigned Courses</p>
                  <p className="font-semibold text-gray-900">
                    {selectedTeacher.assigned_courses}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Students</p>
                  <p className="font-semibold text-gray-900">
                    {selectedTeacher.total_students}
                  </p>
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Employment Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Joined Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedTeacher.joined_date).toLocaleDateString(
                      "en-IN"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Monthly Salary</p>
                  <p className="font-semibold text-gray-900">
                    ₹{selectedTeacher.salary.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}
