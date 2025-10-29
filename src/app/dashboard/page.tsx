"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  IndianRupee,
  TrendingUp,
  AlertCircle,
  BookOpen,
  UserCheck,
  Calendar,
  PieChart as PieChartIcon,
  BarChart3,
  DollarSign,
  BanknoteArrowDown,
  BanknoteX,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import StatCard from "../../components/StatCard";
import Loader from "../../components/Loader";

type EnrollmentStatus = { name: string; value: number; color: string };
type MonthlyRevenue = { month: string; revenue: number };
type CourseEnrollment = { name: string; students: number };
type AttendanceData = { month: string; present: number; absent: number };

export default function AdminDashboard() {
  const [totalActiveStudents, setTotalActiveStudents] = useState<number>(0);
  const [totalCourses, setTotalCourses] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalTeachers, setTotalTeachers] = useState<number>(0);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<
    MonthlyRevenue[]
  >([]);
  const [enrollmentStatusData, setEnrollmentStatusData] = useState<
    EnrollmentStatus[]
  >([]);
  const [courseEnrollmentData, setCourseEnrollmentData] = useState<
    CourseEnrollment[]
  >([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [overduePayments, setOverduePayments] = useState<number>(0);
  const [averageAttendance, setAverageAttendance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Mock data function
  const fetchDashboardData = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock statistics
    setTotalActiveStudents(342);
    setTotalCourses(18);
    setTotalRevenue(1250000); // ₹12.5L
    setTotalTeachers(24);
    setOverduePayments(15);
    setAverageAttendance(87.5);

    // Mock monthly revenue data
    setMonthlyRevenueData([
      { month: "Jan", revenue: 180000 },
      { month: "Feb", revenue: 195000 },
      { month: "Mar", revenue: 210000 },
      { month: "Apr", revenue: 205000 },
      { month: "May", revenue: 225000 },
      { month: "Jun", revenue: 235000 },
    ]);

    // Mock enrollment status data
    setEnrollmentStatusData([
      { name: "Active", value: 285, color: "#10b981" },
      { name: "Completed", value: 42, color: "#6366f1" },
      { name: "Dropped", value: 15, color: "#ef4444" },
    ]);

    // Mock course enrollment data
    setCourseEnrollmentData([
      { name: "Mathematics", students: 85 },
      { name: "Physics", students: 72 },
      { name: "Chemistry", students: 68 },
      { name: "Biology", students: 55 },
      { name: "English", students: 95 },
      { name: "Computer Sc.", students: 78 },
    ]);

    // Mock attendance data
    setAttendanceData([
      { month: "Jan", present: 75, absent: 25 },
      { month: "Feb", present: 50, absent: 50 },
      { month: "Mar", present: 60, absent: 40 },
      { month: "Apr", present: 70, absent: 30 },
      { month: "May", present: 90, absent: 10 },
      { month: "Jun", present: 80, absent: 20 },
    ]);

    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Helper component for empty state
  const EmptyChartState = ({
    icon: Icon,
    message,
  }: {
    icon: React.ElementType;
    message: string;
  }) => (
    <div className="h-[300px] flex items-center justify-center">
      <div className="text-center text-gray-400">
        <Icon className="w-12 h-12 mx-auto mb-3" />
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );

  if (loading) {
    return <Loader />;
  }

  // Check if data exists
  const hasMonthlyRevenue = monthlyRevenueData.length > 0;
  const hasEnrollmentData =
    enrollmentStatusData.length > 0 &&
    enrollmentStatusData.some((item) => item.value > 0);
  const hasCourseData = courseEnrollmentData.length > 0;
  const hasAttendanceData = attendanceData.length > 0;

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="w-full flex justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here's what's happening in your institution.
          </p>
        </div>

        <div>
          <select className="bg-white rounded-md px-6 py-2 border border-gray-300 shadow-md font-bold">
            <option value="1">This Month</option>
            <option value="2">This Year</option>
            <option value="3">Custom</option>
          </select>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          icon={IndianRupee}
          label="Revenue"
          value={`₹1,00,000`}
          color="indigo"
        />
        <StatCard
          icon={IndianRupee}
          label="Revenue Earned"
          value={`₹50,000`}
          color="green"
        />

        <StatCard
          icon={IndianRupee}
          label="Revenue Due"
          value={`₹50,000`}
          color="orange"
        />
        <StatCard
          icon={BanknoteArrowDown}
          label="Invoices"
          value={"20"}
          color="indigo"
        />
        <StatCard
          icon={BanknoteArrowDown}
          label="Pending Invoices"
          value={"10"}
          color="orange"
        />
        <StatCard
          icon={BanknoteX}
          label="Overdue Invoices"
          value={"10"}
          color="red"
        />
        <StatCard
          icon={BanknoteArrowDown}
          label="Payments"
          value={"20"}
          color="indigo"
        />
        <StatCard
          icon={IndianRupee}
          label="Pending Payments"
          value={"20"}
          color="orange"
        />
        <StatCard
          icon={IndianRupee}
          label="Overdue Payments"
          value={"20"}
          color="red"
        />
        <StatCard
          icon={Users}
          label="Active Students"
          value={totalActiveStudents.toLocaleString()}
          color="green"
        />
        <StatCard
          icon={GraduationCap}
          label="Total Products"
          value={totalCourses}
          color="purple"
        />
        <StatCard
          icon={Calendar}
          label="Avg. Attendance"
          value={`${averageAttendance}%`}
          color="green"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Revenue Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Monthly Revenue Trend
            </h2>
          </div>
          {hasMonthlyRevenue ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) =>
                    `₹${(value / 1000).toFixed(0)}K`
                  }
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: "#6366f1", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChartState
              icon={TrendingUp}
              message="No revenue data available yet"
            />
          )}
        </div>

        {/* Enrollment Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Enrollment Status
            </h2>
          </div>
          {hasEnrollmentData ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={enrollmentStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }: any) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {enrollmentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChartState
              icon={PieChartIcon}
              message="No enrollment data available yet"
            />
          )}
        </div>

        {/* Product Enrollments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Students per Product
            </h2>
          </div>
          {hasCourseData ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={courseEnrollmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="students" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChartState
              icon={BookOpen}
              message="No course data available yet"
            />
          )}
        </div>

        {/* Attendance Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Attendance Percentage Trend
            </h2>
          </div>
          {hasAttendanceData ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="present" fill="#10b981" name="Present(%)" />
                <Bar dataKey="absent" fill="#ef4444" name="Absent(%)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChartState
              icon={BarChart3}
              message="No attendance data available yet"
            />
          )}
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm font-medium mb-1">
              Student-Instructor Ratio
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(totalActiveStudents / totalTeachers)}:1
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm font-medium mb-1">
              Avg Students per Product
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(totalActiveStudents / totalCourses)}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm font-medium mb-1">
              Collection Rate
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {((1 - overduePayments / totalActiveStudents) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
