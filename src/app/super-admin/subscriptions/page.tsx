// app/super-admin/subscriptions/page.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  CreditCard,
  Users,
  IndianRupee,
  Calendar,
  TrendingUp,
  Building2,
  PieChart as PieChartIcon,
  BarChart3,
} from "lucide-react";
import DataTable, { Column, Filter } from "@/app/components/DataTable";
import StatCard from "@/app/components/StatCard";
import TierForm from "./components/TierForm";
import { FormModal } from "@/app/components/Modal";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { apiHandler } from "@/lib/api/apiClient";
import toast from "react-hot-toast";
import { endpoints } from "@/lib/api/endpoints";
import {
  CreateSubscriptionTierRequest,
  SubscriptionTierAnalytics,
} from "@/lib/api/types";
import Loader from "@/app/components/Loader";

interface SubscriptionTier {
  id: number;
  name: string;
  student_count_min: number;
  student_count_max: number;
  price_per_student: number;
  billing_cycle: string;
  created_at: string;
  updated_at: string;
  active_institutions: number;
  total_revenue: number;
}

// Mock monthly revenue trend data
const monthlyTrends = [
  {
    month: "Jan",
    Basic: 38000,
    Standard: 72000,
    Premium: 95000,
    Enterprise: 78000,
  },
  {
    month: "Feb",
    Basic: 40000,
    Standard: 75000,
    Premium: 102000,
    Enterprise: 82000,
  },
  {
    month: "Mar",
    Basic: 42000,
    Standard: 78000,
    Premium: 108000,
    Enterprise: 85000,
  },
  {
    month: "Apr",
    Basic: 43000,
    Standard: 80000,
    Premium: 115000,
    Enterprise: 88000,
  },
  {
    month: "May",
    Basic: 44000,
    Standard: 82000,
    Premium: 118000,
    Enterprise: 90000,
  },
  {
    month: "Jun",
    Basic: 45000,
    Standard: 85000,
    Premium: 125000,
    Enterprise: 95000,
  },
];

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];

export default function SubscriptionsPage() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTier, setEditingTier] =
    useState<SubscriptionTierAnalytics | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionTiers, setSubscriptionTiers] = useState<
    SubscriptionTierAnalytics[]
  >([]);
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    student_count_min: "",
    student_count_max: "",
    price_per_student: "",
    billing_cycle: "monthly",
  });
  const [loading, setLoading] = useState(true);

  // Calculate chart data
  const institutionDistribution = useMemo(() => {
    return subscriptionTiers.map((tier, index) => ({
      name: tier.name,
      value: tier.active_institutions,
      color: COLORS[index % COLORS.length],
    }));
  }, [subscriptionTiers]);

  const hasRevenueData = subscriptionTiers.some(
    (tier) => tier.total_revenue > 0
  );
  const revenueDistribution = useMemo(() => {
    return subscriptionTiers.map((tier, index) => ({
      name: tier.name,
      value: tier.total_revenue,
      color: COLORS[index % COLORS.length],
    }));
  }, [subscriptionTiers]);

  const tierComparison = useMemo(() => {
    return subscriptionTiers.map((tier) => ({
      name: tier.name,
      institutions: tier.active_institutions,
      revenue: tier.total_revenue / 1000, // in thousands
      price: tier.price_per_student,
    }));
  }, [subscriptionTiers]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      student_count_min: "",
      student_count_max: "",
      price_per_student: "",
      billing_cycle: "monthly",
    });
  };

  // Handle add tier
  const handleAddTier = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare payload with appropriate types
      const payload: CreateSubscriptionTierRequest = {
        name: formData.name,
        student_count_min: Number(formData.student_count_min),
        student_count_max: Number(formData.student_count_max),
        price_per_student: parseFloat(formData.price_per_student),
        billing_cycle: formData.billing_cycle,
      };

      const res = await apiHandler(endpoints.createSubscriptionTier, payload);

      if (!res.status || res.status !== 201) {
        const errorData = res;
        throw new Error(
          errorData.errorMessage || "Failed to create subscription tier"
        );
      }

      setShowAddModal(false);
      resetForm();
      fetchTiers();
      toast.success("Subscription tier created successfully");
    } catch (error: any) {
      toast.error(error.message || "Error creating subscription tier");
      console.error("Error creating subscription tier:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit tier
  const handleEditTier = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Updated tier:", { ...formData, id: editingTier?.id });
    setIsSubmitting(false);
    setShowEditModal(false);
    setEditingTier(null);
    resetForm();
  };

  // Open edit modal
  const openEditModal = (tier: SubscriptionTierAnalytics) => {
    setEditingTier(tier);
    setFormData({
      name: tier.name,
      student_count_min: tier.student_count_min.toString(),
      student_count_max: tier.student_count_max.toString(),
      price_per_student: tier.price_per_student.toString(),
      billing_cycle: tier.billing_cycle,
    });
    setShowEditModal(true);
    setSelectedTier(null);
  };

  // Define columns
  const columns: Column<SubscriptionTierAnalytics>[] = [
    {
      key: "name",
      label: "Tier Name",
      sortable: true,
      render: (item) => (
        <div>
          <p className="font-semibold text-gray-900">{item.name}</p>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <Calendar className="w-3 h-3" />
            Created {new Date(item.created_at).toLocaleDateString()}
          </div>
        </div>
      ),
      exportRender: (item) => item.name,
    },
    {
      key: "student_range",
      label: "Student Range",
      render: (item) => (
        <div className="text-sm text-gray-700">
          <span className="font-medium">
            {item.student_count_min} -{" "}
            {item.student_count_max === 9999 ? "∞" : item.student_count_max}
          </span>
          <div className="text-xs text-gray-500">students</div>
        </div>
      ),
      exportRender: (item) =>
        `${item.student_count_min}-${item.student_count_max}`,
    },
    {
      key: "price_per_student",
      label: "Price per Student",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
          <IndianRupee className="w-4 h-4" />
          {item.price_per_student.toFixed(2)}
          <span className="text-xs text-gray-500 font-normal">
            /{item.billing_cycle}
          </span>
        </div>
      ),
      exportRender: (item) => item.price_per_student,
    },
    {
      key: "billing_cycle",
      label: "Billing Cycle",
      sortable: true,
      render: (item) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
          {item.billing_cycle}
        </span>
      ),
      exportRender: (item) => item.billing_cycle,
    },
    {
      key: "active_institutions",
      label: "Active Institutions",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-gray-900">
            {item.active_institutions}
          </span>
        </div>
      ),
      exportRender: (item) => item.active_institutions,
    },
    {
      key: "total_revenue",
      label: "Total Revenue",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
          <IndianRupee className="w-4 h-4" />
          {(item.total_revenue / 1000).toFixed(0)}K
        </div>
      ),
      exportRender: (item) => item.total_revenue,
    },
  ];

  // Define filters
  const filters: Filter[] = [
    {
      key: "billing_cycle",
      label: "Billing Cycle",
      options: [
        { value: "monthly", label: "Monthly" },
        { value: "quarterly", label: "Quarterly" },
        { value: "yearly", label: "Yearly" },
      ],
    },
  ];

  // Render actions dropdown
  const renderActions = (item: SubscriptionTierAnalytics) => (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedTier(selectedTier === item.id ? null : item.id);
        }}
        className="p-2 hover:bg-gray-100 rounded-lg transition"
      >
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>

      {selectedTier === item.id && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
            <Eye className="w-4 h-4" />
            View Details
          </button>
          <button
            onClick={() => openEditModal(item)}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <Edit className="w-4 h-4" />
            Edit Tier
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
            <Users className="w-4 h-4" />
            View Institutions
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition border-t border-gray-100">
            <Trash2 className="w-4 h-4" />
            Delete Tier
          </button>
        </div>
      )}
    </div>
  );

  async function fetchTiers() {
    try {
      const res = await apiHandler(
        endpoints.getSubscriptionTiersAnalytics,
        null
      );
      const { data } = res;
      if (data) {
        setSubscriptionTiers(data.subscriptionTiers);
        setLoading(false);
      } else {
        toast.error("No subscriptionTiers data found");
        console.error("No subscriptionTiers data");
      }
    } catch (err) {
      toast.error("Failed to fetch subscription tiers analytics");
      console.error("Failed to fetch subscription tiers analytics", err);
    }
  }

  useEffect(() => {
    fetchTiers();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Subscription Tiers
          </h1>
          <p className="text-gray-600 mt-1">
            Manage pricing tiers and subscription plans
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-5 h-5" />
          Add Tier
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={CreditCard}
          label="Total Tiers"
          value={subscriptionTiers.length}
          color="blue"
        />
        <StatCard
          icon={Building2}
          label="Total Institutions"
          value={subscriptionTiers.reduce(
            (sum, tier) => sum + tier.active_institutions,
            0
          )}
          color="green"
        />
        <StatCard
          icon={IndianRupee}
          label="Total Revenue"
          value={`₹${(
            subscriptionTiers.reduce(
              (sum, tier) => sum + tier.total_revenue,
              0
            ) / 1000
          ).toFixed(0)}K`}
          color="indigo"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Price/Student"
          value={`₹${(
            subscriptionTiers.reduce(
              (sum, tier) => sum + tier.price_per_student,
              0
            ) / subscriptionTiers.length
          ).toFixed(0)}`}
          color="purple"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Institution Distribution Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Institution Distribution
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={institutionDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }: any) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {institutionDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Distribution Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <IndianRupee className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Revenue Distribution
            </h2>
          </div>
          {hasRevenueData ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value }: any) =>
                    `${name} ₹${(value / 1000).toFixed(0)}K`
                  }
                >
                  {revenueDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) =>
                    `₹${(value / 1000).toFixed(2)}K`
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <IndianRupee className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No revenue data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Tier Comparison Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Tier Comparison
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tierComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis yAxisId="left" stroke="#6b7280" />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="institutions"
                fill="#3b82f6"
                name="Institutions"
              />
              <Bar
                yAxisId="right"
                dataKey="revenue"
                fill="#10b981"
                name="Revenue (₹K)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Revenue Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Monthly Revenue Trend by Tier
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => `₹${(value / 1000).toFixed(1)}K`}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="Basic"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="Standard"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="Premium"
                stackId="1"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="Enterprise"
                stackId="1"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        data={subscriptionTiers}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search subscription tiers..."
        searchKeys={["name", "billing_cycle"]}
        itemsPerPage={10}
        exportFileName="subscription-tiers"
        renderActions={renderActions}
        onRowClick={(item: any) => console.log("Clicked tier:", item)}
      />

      {/* Add Tier Modal */}
      <FormModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Tier"
        onSubmit={handleAddTier}
        submitLabel="Add Tier"
        isSubmitting={isSubmitting}
      >
        <TierForm formData={formData} setFormData={setFormData} />
      </FormModal>

      {/* Edit Tier Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingTier(null);
          resetForm();
        }}
        title="Edit Tier"
        onSubmit={handleEditTier}
        submitLabel="Save Changes"
        isSubmitting={isSubmitting}
      >
        <TierForm formData={formData} setFormData={setFormData} />
      </FormModal>
    </div>
  );
}
