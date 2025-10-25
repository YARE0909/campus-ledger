"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Upload,
  Users,
  IndianRupee,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle,
  XCircle,
  Award,
  FileText,
} from "lucide-react";
import DataTable, { Column, Filter } from "@/components/DataTable";
import StatCard from "@/components/StatCard";
import { FormModal } from "@/components/Modal";
import Loader from "@/components/Loader";
import toast from "react-hot-toast";
import mockData from "@/mock/courses.json";

interface Product {
  id: string;
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
}

interface Teacher {
  id: string;
  name: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Product[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Product | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats
  const [totalCourses, setTotalCourses] = useState(0);
  const [activeCourses, setActiveCourses] = useState(0);
  const [totalEnrollments, setTotalEnrollments] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
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

  // Mock data function
  const fetchCourses = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock teachers
    const mockTeachers: Teacher[] = [
      { id: "1", name: "Dr. Rajesh Kumar" },
      { id: "2", name: "Prof. Priya Sharma" },
      { id: "3", name: "Mr. Amit Patel" },
      { id: "4", name: "Dr. Sneha Reddy" },
      { id: "5", name: "Ms. Kavita Singh" },
      { id: "6", name: "Mr. Arjun Mehta" },
    ];

    setCourses(mockData as Product[]);
    setTeachers(mockTeachers);

    // Calculate stats
    setTotalCourses(mockData.length);
    setActiveCourses(mockData.filter((c) => c.status === "ACTIVE").length);
    setTotalEnrollments(
      mockData.reduce((sum, c) => sum + c.enrolled_students, 0)
    );
    setTotalRevenue(
      mockData.reduce((sum, c) => sum + c.fee * c.enrolled_students, 0)
    );

    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
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

  // Handle add course
  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Adding course:", formData);
    toast.success("Product created successfully");
    setShowAddModal(false);
    resetForm();
    fetchCourses();
    setIsSubmitting(false);
  };

  // Handle edit course
  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Updating course:", { ...formData, id: selectedCourse?.id });
    toast.success("Product updated successfully");
    setShowEditModal(false);
    setSelectedCourse(null);
    resetForm();
    fetchCourses();
    setIsSubmitting(false);
  };

  // Open edit modal
  const openEditModal = (course: Product) => {
    setSelectedCourse(course);
    setFormData({
      name: course.name,
      description: course.description,
      duration_weeks: course.duration_weeks.toString(),
      fee: course.fee.toString(),
      start_date: course.start_date,
      end_date: course.end_date,
      assigned_teacher: course.assigned_teacher,
      max_capacity: course.max_capacity.toString(),
      status: course.status,
    });
    setShowEditModal(true);
    setSelectedCourseId(null);
  };

  // Open view modal
  const openViewModal = (course: Product) => {
    setSelectedCourse(course);
    setShowViewModal(true);
    setSelectedCourseId(null);
  };

  // Delete course
  const handleDeleteCourse = async (courseId: string) => {
    if (confirm("Are you sure you want to delete this course?")) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Product deleted successfully");
      fetchCourses();
    }
    setSelectedCourseId(null);
  };

  // View enrolled students
  const viewEnrolledStudents = (course: Product) => {
    toast.success(
      `Viewing ${course.enrolled_students} students in ${course.name}`
    );
    setSelectedCourseId(null);
  };

  // Define columns
  const columns: Column<Product>[] = [
    {
      key: "name",
      label: "Product Name",
      sortable: true,
      render: (item) => (
        <div>
          <p className="font-semibold text-gray-900">{item.name}</p>
          <p className="text-xs text-gray-500 line-clamp-1">
            {item.description}
          </p>
        </div>
      ),
      exportRender: (item) => item.name,
    },
    {
      key: "teacher_name",
      label: "Teacher",
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
      label: "Duration",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">
            {item.duration_weeks} weeks
          </span>
        </div>
      ),
      exportRender: (item) => item.duration_weeks,
    },
    {
      key: "fee",
      label: "Product Fee",
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
      render: (item) => (
        <div className="text-sm">
          <span className="font-semibold text-gray-900">
            {item.enrolled_students}
          </span>
          <span className="text-gray-500">/{item.max_capacity}</span>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div
              className={`h-1.5 rounded-full ${
                (item.enrolled_students / item.max_capacity) * 100 >= 90
                  ? "bg-red-600"
                  : (item.enrolled_students / item.max_capacity) * 100 >= 70
                  ? "bg-amber-600"
                  : "bg-green-600"
              }`}
              style={{
                width: `${(item.enrolled_students / item.max_capacity) * 100}%`,
              }}
            />
          </div>
        </div>
      ),
      exportRender: (item) => item.enrolled_students,
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
      key: "start_date",
      label: "Start Date",
      sortable: true,
      render: (item) => (
        <span className="text-sm text-gray-700">
          {new Date(item.start_date).toLocaleDateString("en-IN")}
        </span>
      ),
      exportRender: (item) => item.start_date,
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
        { value: "COMPLETED", label: "Completed" },
        { value: "UPCOMING", label: "Upcoming" },
      ],
    },
  ];

  // Render actions
  const renderActions = (item: Product) => (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedCourseId(selectedCourseId === item.id ? null : item.id);
        }}
        className="p-2 hover:bg-gray-100 rounded-lg transition"
      >
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>
      {selectedCourseId === item.id && (
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
            Edit Product
          </button>
          <button
            onClick={() => viewEnrolledStudents(item)}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <Users className="w-4 h-4" />
            View Students
          </button>
          <button
            onClick={() => handleDeleteCourse(item.id)}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition border-t border-gray-100"
          >
            <Trash2 className="w-4 h-4" />
            Delete Product
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Product Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage courses, fees, and teacher assignments
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer"
            title="Add Product"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={CheckCircle}
          label="Active Products"
          value={activeCourses}
          color="green"
        />
        <StatCard
          icon={BookOpen}
          label="Avg. Product Enrollments"
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
          label="Avg. Product Revenue"
          value={`₹${(totalRevenue / 100000).toFixed(1)}L`}
          color="indigo"
        />
      </div>

      {/* DataTable */}
      <DataTable
        data={courses}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search by course name, teacher..."
        searchKeys={["name", "description", "teacher_name"]}
        itemsPerPage={5}
        exportFileName="courses"
        renderActions={renderActions}
      />

      {/* Add Product Modal */}
      <FormModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Product"
        onSubmit={handleAddCourse}
        submitLabel="Create Product"
        isSubmitting={isSubmitting}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
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
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (Weeks) *
            </label>
            <input
              type="number"
              value={formData.duration_weeks}
              onChange={(e) =>
                setFormData({ ...formData, duration_weeks: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Fee (₹) *
            </label>
            <input
              type="number"
              value={formData.fee}
              onChange={(e) =>
                setFormData({ ...formData, fee: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date *
            </label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign Teacher *
            </label>
            <select
              value={formData.assigned_teacher}
              onChange={(e) =>
                setFormData({ ...formData, assigned_teacher: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select a teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Capacity *
            </label>
            <input
              type="number"
              value={formData.max_capacity}
              onChange={(e) =>
                setFormData({ ...formData, max_capacity: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="md:col-span-2">
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
              <option value="UPCOMING">Upcoming</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </FormModal>

      {/* Edit Product Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCourse(null);
          resetForm();
        }}
        title="Edit Product"
        onSubmit={handleEditCourse}
        submitLabel="Save Changes"
        isSubmitting={isSubmitting}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
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
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (Weeks) *
            </label>
            <input
              type="number"
              value={formData.duration_weeks}
              onChange={(e) =>
                setFormData({ ...formData, duration_weeks: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Fee (₹) *
            </label>
            <input
              type="number"
              value={formData.fee}
              onChange={(e) =>
                setFormData({ ...formData, fee: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date *
            </label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign Teacher *
            </label>
            <select
              value={formData.assigned_teacher}
              onChange={(e) =>
                setFormData({ ...formData, assigned_teacher: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select a teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Capacity *
            </label>
            <input
              type="number"
              value={formData.max_capacity}
              onChange={(e) =>
                setFormData({ ...formData, max_capacity: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="md:col-span-2">
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
              <option value="UPCOMING">Upcoming</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </FormModal>

      {/* View Product Modal */}
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
          <div className="space-y-4">
            {/* Product Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {selectedCourse.name}
              </h3>
              <p className="text-gray-700">{selectedCourse.description}</p>
            </div>

            {/* Product Details */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Product Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="font-semibold text-gray-900">
                    {selectedCourse.duration_weeks} weeks
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Product Fee</p>
                  <p className="font-semibold text-gray-900">
                    ₹{selectedCourse.fee.toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Start Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedCourse.start_date).toLocaleDateString(
                      "en-IN"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">End Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedCourse.end_date).toLocaleDateString(
                      "en-IN"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      selectedCourse.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : selectedCourse.status === "COMPLETED"
                        ? "bg-blue-100 text-blue-800"
                        : selectedCourse.status === "UPCOMING"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedCourse.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Assigned Teacher</p>
                  <p className="font-semibold text-gray-900">
                    {selectedCourse.teacher_name}
                  </p>
                </div>
              </div>
            </div>

            {/* Enrollment Info */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Enrollment Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Enrolled Students
                  </p>
                  <p className="font-semibold text-gray-900">
                    {selectedCourse.enrolled_students}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Max Capacity</p>
                  <p className="font-semibold text-gray-900">
                    {selectedCourse.max_capacity}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 mb-2">
                    Enrollment Progress
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        (selectedCourse.enrolled_students /
                          selectedCourse.max_capacity) *
                          100 >=
                        90
                          ? "bg-red-600"
                          : (selectedCourse.enrolled_students /
                              selectedCourse.max_capacity) *
                              100 >=
                            70
                          ? "bg-amber-600"
                          : "bg-green-600"
                      }`}
                      style={{
                        width: `${
                          (selectedCourse.enrolled_students /
                            selectedCourse.max_capacity) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {(
                      (selectedCourse.enrolled_students /
                        selectedCourse.max_capacity) *
                      100
                    ).toFixed(0)}
                    % full
                  </p>
                </div>
              </div>
            </div>

            {/* Revenue Info */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Revenue Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="font-semibold text-gray-900">
                    ₹
                    {(
                      selectedCourse.fee * selectedCourse.enrolled_students
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Potential Revenue
                  </p>
                  <p className="font-semibold text-gray-900">
                    ₹
                    {(
                      selectedCourse.fee * selectedCourse.max_capacity
                    ).toLocaleString("en-IN")}
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
