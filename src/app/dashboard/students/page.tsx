"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Mail,
  GraduationCap,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import DataTable, { Column, Filter } from "@/app/components/DataTable";
import StatCard from "@/app/components/StatCard";
import { FormModal } from "@/app/components/Modal";
import Loader from "@/app/components/Loader";
import toast from "react-hot-toast";
import mockData from "@/mock/students.json";

interface Student {
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
  created_at: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats
  const [totalStudents, setTotalStudents] = useState(0);
  const [activeStudents, setActiveStudents] = useState(0);
  const [newStudentsThisMonth, setNewStudentsThisMonth] = useState(0);
  const [studentsWithPending, setStudentsWithPending] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    guardian_name: "",
    guardian_contact: "",
    status: "ACTIVE",
  });

  // Mock data function
  const fetchStudents = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setStudents(mockData as Student[]);

    // Calculate stats
    setTotalStudents(mockData.length);
    setActiveStudents(mockData.filter((s) => s.status === "ACTIVE").length);
    setNewStudentsThisMonth(
      mockData.filter(
        (s) =>
          new Date(s.created_at).getMonth() === new Date().getMonth() &&
          new Date(s.created_at).getFullYear() === new Date().getFullYear()
      ).length
    );
    setStudentsWithPending(mockData.filter((s) => s.pending_fees > 0).length);

    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      guardian_name: "",
      guardian_contact: "",
      status: "ACTIVE",
    });
  };

  // Handle add student
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Adding student:", formData);
    toast.success("Student added successfully");
    setShowAddModal(false);
    resetForm();
    fetchStudents();
    setIsSubmitting(false);
  };

  // Handle edit student
  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Updating student:", { ...formData, id: selectedStudent?.id });
    toast.success("Student updated successfully");
    setShowEditModal(false);
    setSelectedStudent(null);
    resetForm();
    fetchStudents();
    setIsSubmitting(false);
  };

  // Open edit modal
  const openEditModal = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone,
      address: student.address,
      guardian_name: student.guardian_name,
      guardian_contact: student.guardian_contact,
      status: student.status,
    });
    setShowEditModal(true);
    setSelectedStudentId(null);
  };

  // Open view modal
  const openViewModal = (student: Student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
    setSelectedStudentId(null);
  };

  // Delete student
  const handleDeleteStudent = async (studentId: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Student deleted successfully");
      fetchStudents();
    }
    setSelectedStudentId(null);
  };

  // Send email
  const sendEmail = async (student: Student) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success(`Email sent to ${student.email}`);
    setSelectedStudentId(null);
  };

  // Define columns
  const columns: Column<Student>[] = [
    {
      key: "name",
      label: "Student Name",
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
      key: "phone",
      label: "Contact",
      render: (item) => (
        <div>
          <p className="text-sm text-gray-700">{item.phone}</p>
          <p className="text-xs text-gray-500">{item.guardian_contact}</p>
        </div>
      ),
      exportRender: (item) => item.phone,
    },
    {
      key: "guardian_name",
      label: "Guardian",
      sortable: true,
      exportRender: (item) => item.guardian_name,
    },
    {
      key: "enrolled_courses",
      label: "Courses",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-gray-900">
            {item.enrolled_courses}
          </span>
        </div>
      ),
      exportRender: (item) => item.enrolled_courses,
    },
    {
      key: "pending_fees",
      label: "Pending Fees",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1 text-sm font-semibold">
          {item.pending_fees > 0 ? (
            <span className="text-red-600">
              ₹{item.pending_fees.toLocaleString("en-IN")}
            </span>
          ) : (
            <span className="text-green-600">Paid</span>
          )}
        </div>
      ),
      exportRender: (item) => item.pending_fees,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (item) => {
        const statusConfig = {
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
          GRADUATED: {
            bg: "bg-blue-100",
            text: "text-blue-800",
            icon: GraduationCap,
          },
          DROPPED: {
            bg: "bg-red-100",
            text: "text-red-800",
            icon: AlertCircle,
          },
        };
        const config = statusConfig[item.status];
        const Icon = config.icon;

        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
          >
            <Icon className="w-3 h-3" />
            {item.status}
          </span>
        );
      },
      exportRender: (item) => item.status,
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

  // Define filters
  const filters: Filter[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "ACTIVE", label: "Active" },
        { value: "INACTIVE", label: "Inactive" },
        { value: "GRADUATED", label: "Graduated" },
        { value: "DROPPED", label: "Dropped" },
      ],
    },
  ];

  // Render actions
  const renderActions = (item: Student) => (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedStudentId(selectedStudentId === item.id ? null : item.id);
        }}
        className="p-2 hover:bg-gray-100 rounded-lg transition"
      >
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>
      {selectedStudentId === item.id && (
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
            Edit Student
          </button>
          <button
            onClick={() => sendEmail(item)}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <Mail className="w-4 h-4" />
            Send Email
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
            <FileText className="w-4 h-4" />
            View Invoices
          </button>
          <button
            onClick={() => handleDeleteStudent(item.id)}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition border-t border-gray-100"
          >
            <Trash2 className="w-4 h-4" />
            Delete Student
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
          <h1 className="text-3xl font-bold text-gray-900">
            Student Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage student information and enrollments
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer"
            title="Add Student"
          >
            <UserPlus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Total Students"
          value={totalStudents}
          color="blue"
        />
        <StatCard
          icon={CheckCircle}
          label="Active Students"
          value={activeStudents}
          color="green"
        />
        <StatCard
          icon={UserPlus}
          label="New This Month"
          value={newStudentsThisMonth}
          color="indigo"
        />
        <StatCard
          icon={AlertCircle}
          label="Pending Fees"
          value={studentsWithPending}
          color="red"
        />
      </div>

      {/* Alert for pending fees */}
      {studentsWithPending > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <p className="text-amber-800 font-medium">
            {studentsWithPending} student
            {studentsWithPending > 1 ? "s have" : " has"} pending fee payments
          </p>
        </div>
      )}

      {/* DataTable */}
      <DataTable
        data={students}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search by name, email, phone..."
        searchKeys={["name", "email", "phone", "guardian_name"]}
        itemsPerPage={5}
        exportFileName="students"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student Name *
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
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="GRADUATED">Graduated</option>
              <option value="DROPPED">Dropped</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <textarea
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guardian Name *
            </label>
            <input
              type="text"
              value={formData.guardian_name}
              onChange={(e) =>
                setFormData({ ...formData, guardian_name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guardian Contact *
            </label>
            <input
              type="tel"
              value={formData.guardian_contact}
              onChange={(e) =>
                setFormData({ ...formData, guardian_contact: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student Name *
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
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="GRADUATED">Graduated</option>
              <option value="DROPPED">Dropped</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <textarea
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guardian Name *
            </label>
            <input
              type="text"
              value={formData.guardian_name}
              onChange={(e) =>
                setFormData({ ...formData, guardian_name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guardian Contact *
            </label>
            <input
              type="tel"
              value={formData.guardian_contact}
              onChange={(e) =>
                setFormData({ ...formData, guardian_contact: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
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
          onSubmit={(e) => {
            e.preventDefault();
            setShowViewModal(false);
          }}
          submitLabel="Close"
          size="lg"
        >
          <div className="space-y-6">
            {/* Student Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Student Name</p>
                <p className="font-semibold text-gray-900">
                  {selectedStudent.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="font-semibold text-gray-900">
                  {selectedStudent.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Phone</p>
                <p className="font-semibold text-gray-900">
                  {selectedStudent.phone}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    selectedStudent.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : selectedStudent.status === "GRADUATED"
                      ? "bg-blue-100 text-blue-800"
                      : selectedStudent.status === "DROPPED"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {selectedStudent.status}
                </span>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600 mb-1">Address</p>
                <p className="font-semibold text-gray-900">
                  {selectedStudent.address}
                </p>
              </div>
            </div>

            {/* Guardian Info */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Guardian Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Guardian Name</p>
                  <p className="font-semibold text-gray-900">
                    {selectedStudent.guardian_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Guardian Contact</p>
                  <p className="font-semibold text-gray-900">
                    {selectedStudent.guardian_contact}
                  </p>
                </div>
              </div>
            </div>

            {/* Academic Info */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Academic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Enrolled Courses</p>
                  <p className="font-semibold text-gray-900">
                    {selectedStudent.enrolled_courses}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Joined Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedStudent.created_at).toLocaleDateString(
                      "en-IN"
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Fee Info */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Fee Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Fees</p>
                  <p className="font-semibold text-gray-900">
                    ₹{selectedStudent.total_fees.toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Fees</p>
                  <p
                    className={`font-semibold ${
                      selectedStudent.pending_fees > 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {selectedStudent.pending_fees > 0
                      ? `₹${selectedStudent.pending_fees.toLocaleString(
                          "en-IN"
                        )}`
                      : "Fully Paid"}
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
