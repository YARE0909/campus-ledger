"use client";

import React, { useEffect, useState } from "react";
import {
  Building2,
  Users,
  GraduationCap,
  IndianRupee,
  TrendingUp,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
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
} from "recharts";
import StatCard from "../components/StatCard";
import { apiHandler } from "@/lib/api/apiClient";
import { endpoints } from "@/lib/api/endpoints";
import Loader from "../components/Loader";

type EnrollmentStatus = { name: string; value: number; color: string };
type InstitutionByTier = { tier: string; count: number };
type MonthlyRevenue = { month: string; revenue: number };

export default function SuperAdminDashboard() {
  const [totalInstitutions, setTotalInstitutions] = useState<number>(0);
  const [totalActiveStudents, setTotalActiveStudents] = useState<number>(0);
  const [activeSubscriptionTiers, setActiveSubscriptionTiers] =
    useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<
    MonthlyRevenue[]
  >([]);
  const [enrollmentStatusData, setEnrollmentStatusData] = useState<
    EnrollmentStatus[]
  >([]);
  const [institutionsByTierData, setInstitutionsByTierData] = useState<
    InstitutionByTier[]
  >([]);
  const [overdueInstitutions, setOverdueInstitutions] = useState<number>(0);
  const [totalCourses, setTotalCourses] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  async function fetchDashboardData() {
    const res = await apiHandler(endpoints.getSuperAdminDashboardData, null);
    const { data } = res;

    if (data) {
      setTotalInstitutions(data.totalInstitutions);
      setTotalActiveStudents(data.totalActiveStudents);
      setActiveSubscriptionTiers(data.activeSubscriptionTiers);
      setTotalRevenue(data.totalRevenue);
      setMonthlyRevenueData(data.monthlyRevenueData);
      setEnrollmentStatusData(data.enrollmentStatusData);
      setInstitutionsByTierData(data.institutionsByTierData);
      setOverdueInstitutions(data.overdueInstitutions);
      setTotalCourses(data.totalCourses);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Helper component for empty state
  const EmptyChartState = ({ 
    icon: Icon, 
    message 
  }: { 
    icon: React.ElementType; 
    message: string 
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
  const hasEnrollmentData = enrollmentStatusData.length > 0 && 
    enrollmentStatusData.some(item => item.value > 0);
  const hasInstitutionData = institutionsByTierData.length > 0 && 
    institutionsByTierData.some(item => item.count > 0);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here's what's happening across all institutions.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Building2}
          label="Total Institutions"
          value={totalInstitutions}
          color="blue"
        />
        <StatCard
          icon={Users}
          label="Active Students"
          value={totalActiveStudents.toLocaleString()}
          color="green"
        />
        <StatCard
          icon={GraduationCap}
          label="Total Courses"
          value={totalCourses}
          color="purple"
        />
        <StatCard
          icon={IndianRupee}
          label="Total Revenue"
          value={`₹${(totalRevenue / 100000).toFixed(1)}L`}
          color="indigo"
        />
      </div>

      {/* Alert for overdue payments */}
      {overdueInstitutions > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <p className="text-amber-800 font-medium">
            {overdueInstitutions} institution
            {overdueInstitutions > 1 ? "s have" : " has"} overdue payments
          </p>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

        {/* Institutions by Subscription Tier */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Institutions by Subscription Tier
            </h2>
          </div>
          {hasInstitutionData ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={institutionsByTierData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="tier" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChartState 
              icon={BarChart3} 
              message="No institution data available yet" 
            />
          )}
        </div>
      </div>
    </div>
  );
}
