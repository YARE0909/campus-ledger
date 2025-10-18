"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  Users,
  IndianRupee,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Ban,
  PlayCircle,
  Plus,
  Building2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import DataTable, { Column, Filter } from "@/app/components/DataTable";
import StatCard from "@/app/components/StatCard";
import { FormModal } from "@/app/components/Modal";
import InstitutionForm from "./components/InstitutionForm";

interface Institution {
  id: number;
  name: string;
  contact_email: string;
  phone: string;
  address: string;
  subscription_tier: string;
  subscription_tier_id: number;
  status: string;
  active_students: number;
  total_courses: number;
  monthly_revenue: number;
  created_at: string;
  last_payment: string | null;
  payment_status: string;
}

export default function InstitutionsPage() {
  const [selectedInstitution, setSelectedInstitution] = useState<number | null>(
    null
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    contact_email: "",
    phone: "",
    address: "",
    subscription_tier_id: "",
  });
  const [subscriptionTiers, setSubscriptionTiers] = useState<
    { id: string; name: string }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function fetchTiers() {
    try {
      const res = await fetch("/api/super-admin/subscription-tiers");
      const data = await res.json();
      setSubscriptionTiers(data);
    } catch (err) {
      console.error("Failed to fetch subscription tiers", err);
    }
  }

  async function fetchData() {
    try {
      const res = await fetch("/api/super-admin/institutionsAnalytics");
      const data = await res.json();
      setInstitutions(data.institutions);
    } catch (error) {
      console.error("Failed to fetch institutions", error);
    } finally {
      setLoading(false);
    }
  }

  // Fetch institutions and summary data from API
  useEffect(() => {
    fetchTiers();
    fetchData();
  }, []);

  // Define columns
  const columns: Column<Institution>[] = [
    {
      key: "name",
      label: "Institution",
      sortable: true,
      render: (item) => (
        <div>
          <p className="font-semibold text-gray-900">{item.name}</p>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <Calendar className="w-3 h-3" />
            Joined {new Date(item.created_at).toLocaleDateString()}
          </div>
        </div>
      ),
      exportRender: (item) => item.name,
    },
    {
      key: "contact_email",
      label: "Contact",
      render: (item) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="truncate max-w-[180px]">{item.contact_email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Phone className="w-4 h-4 text-gray-400" />
            {item.phone}
          </div>
        </div>
      ),
      exportRender: (item) => item.contact_email,
    },
    {
      key: "subscription_tier",
      label: "Subscription",
      sortable: true,
      render: (item) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          {item.subscription_tier}
        </span>
      ),
      exportRender: (item) => item.subscription_tier,
    },
    {
      key: "active_students",
      label: "Students",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-gray-900">
            {item.active_students}
          </span>
        </div>
      ),
      exportRender: (item) => item.active_students,
    },
    {
      key: "monthly_revenue",
      label: "Revenue",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
          <IndianRupee className="w-4 h-4" />
          {(item.monthly_revenue / 1000).toFixed(0)}K/mo
        </div>
      ),
      exportRender: (item) => item.monthly_revenue,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (item) => {
        const statusStyles = {
          active: "bg-green-100 text-green-800",
          suspended: "bg-red-100 text-red-800",
          inactive: "bg-gray-100 text-gray-800",
        };
        return (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              statusStyles[item.status as keyof typeof statusStyles]
            }`}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </span>
        );
      },
      exportRender: (item) => item.status,
    },
    {
      key: "payment_status",
      label: "Payment",
      sortable: true,
      render: (item) => {
        const paymentStyles = {
          paid: "bg-green-100 text-green-800",
          overdue: "bg-red-100 text-red-800",
          pending: "bg-yellow-100 text-yellow-800",
        };
        return (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              paymentStyles[item.payment_status as keyof typeof paymentStyles]
            }`}
          >
            {item.payment_status.charAt(0).toUpperCase() +
              item.payment_status.slice(1)}
          </span>
        );
      },
      exportRender: (item) => item.payment_status,
    },
  ];

  // Define filters
  const filters: Filter[] = [
    {
      key: "status",
      label: "All Status",
      options: [
        { value: "active", label: "Active" },
        { value: "suspended", label: "Suspended" },
        { value: "inactive", label: "Inactive" },
      ],
    },
    {
      key: "payment_status",
      label: "Payment Status",
      options: [
        { value: "paid", label: "Paid" },
        { value: "overdue", label: "Overdue" },
        { value: "pending", label: "Pending" },
      ],
    },
    {
      key: "subscription_tier",
      label: "Subscription Tier",
      options: subscriptionTiers.map((item) => {
        return { value: item.id, label: item.name };
      }),
    },
  ];

  // Render actions dropdown
  const renderActions = (item: Institution) => (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedInstitution(
            selectedInstitution === item.id ? null : item.id
          );
        }}
        className="p-2 hover:bg-gray-100 rounded-lg transition"
      >
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>
      {selectedInstitution === item.id && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
            <Eye className="w-4 h-4" />
            View Details
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
            <Mail className="w-4 h-4" />
            Send Email
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
            <IndianRupee className="w-4 h-4" />
            View Billing
          </button>
          {item.status === "active" ? (
            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition">
              <Ban className="w-4 h-4" />
              Suspend
            </button>
          ) : (
            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition">
              <PlayCircle className="w-4 h-4" />
              Activate
            </button>
          )}
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition border-t border-gray-100">
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/super-admin/institutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        throw new Error("Failed to create institution");
      }
      setShowAddModal(false);
      setFormData({
        name: "",
        contact_email: "",
        phone: "",
        address: "",
        subscription_tier_id: "",
      });
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Error creating institution.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading institutions...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Institutions</h1>
          <p className="text-gray-600 mt-1">
            Manage all registered institutions
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-5 h-5" />
          Add Institution
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={Building2}
          label="Total Institutions"
          value={institutions.length}
          color="blue"
        />
        <StatCard
          icon={CheckCircle}
          label="Active"
          value={institutions.filter((i) => i.status === "active").length}
          color="green"
        />
        <StatCard
          icon={AlertCircle}
          label="Overdue Payments"
          value={
            institutions.filter((i) => i.payment_status === "overdue").length
          }
          color="red"
        />
        <StatCard
          icon={IndianRupee}
          label="Monthly Revenue"
          value={`₹${(
            institutions.reduce((sum, i) => sum + i.monthly_revenue, 0) / 1000
          ).toFixed(0)}K`}
          color="indigo"
        />
      </div>

      {/* DataTable */}
      <DataTable
        data={institutions}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search institutions..."
        searchKeys={["name", "contact_email", "phone", "address"]}
        itemsPerPage={10}
        exportFileName="institutions"
        renderActions={renderActions}
        onRowClick={(item: any) => console.log("Clicked institution:", item)}
      />

      <FormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Institution"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Create Institution"
      >
        <InstitutionForm
          formData={formData}
          setFormData={setFormData}
          subscriptionTiers={subscriptionTiers}
        />
      </FormModal>
    </div>
  );
}
