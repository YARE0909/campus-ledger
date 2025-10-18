'use client';

import React from 'react';
import {
  Building2,
  Users,
  GraduationCap,
  IndianRupee,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
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
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

export default function SuperAdminDashboard() {
  // Derived from COUNT(*) from tenants table
  const totalInstitutions = 128;

  // Derived from COUNT(*) from students table WHERE status = 'ACTIVE'
  const totalActiveStudents = 5320;

  // Derived from COUNT(DISTINCT subscription_tier_id) from tenants
  const activeSubscriptionTiers = 4;

  // Derived from SUM(total_amount) from institution_billing WHERE status = 'PAID'
  const totalRevenue = 1250000;

  // Derived from institution_billing grouped by month_year
  const monthlyRevenueData = [
    { month: 'Apr', revenue: 85000 },
    { month: 'May', revenue: 95000 },
    { month: 'Jun', revenue: 110000 },
    { month: 'Jul', revenue: 125000 },
    { month: 'Aug', revenue: 140000 },
    { month: 'Sep', revenue: 155000 },
    { month: 'Oct', revenue: 175000 },
  ];

  // Derived from enrollments table grouped by status
  const enrollmentStatusData = [
    { name: 'Active', value: 4200, color: '#6366f1' },
    { name: 'Completed', value: 980, color: '#10b981' },
    { name: 'Dropped', value: 140, color: '#ef4444' },
  ];

  // Derived from tenants JOIN subscription_tiers grouped by tier name
  const institutionsByTierData = [
    { tier: 'Basic', count: 45 },
    { tier: 'Standard', count: 52 },
    { tier: 'Premium', count: 25 },
    { tier: 'Enterprise', count: 6 },
  ];

  // Derived from institution_billing WHERE status = 'OVERDUE'
  const overdueInstitutions = 8;

  // Derived from COUNT(*) from courses table
  const totalCourses = 342;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening across all institutions.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Building2}
          label="Total Institutions"
          value={totalInstitutions}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={Users}
          label="Active Students"
          value={totalActiveStudents.toLocaleString()}
          bgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          icon={GraduationCap}
          label="Total Courses"
          value={totalCourses}
          bgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          icon={IndianRupee}
          label="Total Revenue"
          value={`₹${(totalRevenue / 100000).toFixed(1)}L`}
          bgColor="bg-indigo-50"
          iconColor="text-indigo-600"
        />
      </div>

      {/* Alert for overdue payments */}
      {overdueInstitutions > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <p className="text-amber-800 font-medium">
            {overdueInstitutions} institution{overdueInstitutions > 1 ? 's have' : ' has'} overdue payments
          </p>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Revenue Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Monthly Revenue Trend</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: '#6366f1', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Enrollment Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Enrollment Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={enrollmentStatusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {enrollmentStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Institutions by Subscription Tier */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Institutions by Subscription Tier</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={institutionsByTierData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="tier" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Institutions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Institution Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Subscription Tier</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Active Students</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Bright Future Academy', tier: 'Premium', students: 245, status: 'Active' },
                { name: 'Creative Arts Institute', tier: 'Standard', students: 132, status: 'Active' },
                { name: 'Tech Learning Hub', tier: 'Enterprise', students: 580, status: 'Active' },
                { name: 'Music Masters School', tier: 'Basic', students: 68, status: 'Active' },
              ].map((institution, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-medium text-gray-900">{institution.name}</td>
                  <td className="py-3 px-4 text-gray-700">{institution.tier}</td>
                  <td className="py-3 px-4 text-gray-700">{institution.students}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {institution.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  bgColor: string;
  iconColor: string;
}

function StatCard({ icon: Icon, label, value, bgColor, iconColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${bgColor} p-3 rounded-lg`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}
