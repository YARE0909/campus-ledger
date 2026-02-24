"use client";

import { useEffect, useState } from "react";
import { CreditCard, IndianRupee, FileText } from "lucide-react";
import DataTable, { Column } from "@/components/DataTable";
import StatCard from "@/components/StatCard";

interface Payment {
  id: string;
  paid_on: string;
  transaction: string;
  comments: string;
  Invoice: {
    amount: number;
    Student: {
      name: string;
    };
    Product: {
      name: string;
    };
    Branch: {
      name: string;
    };
  };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalRevenue: 0,
    monthlyRevenue: {},
  });

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch("/api/common/payments");
      const data = await res.json();
      setPayments(data?.data ?? []);
    } catch (err) {
      console.error(err);
      setPayments([]);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/common/payments/stats");
      const data = await res.json();
      setStats(
        data?.data ?? {
          totalPayments: 0,
          totalRevenue: 0,
          monthlyRevenue: {},
        },
      );
    } catch (err) {
      console.error(err);
    }
  };

  const columns: Column<Payment>[] = [
    {
      key: "id",
      label: "Payment ID",
    },
    {
      key: "student",
      label: "Student",
      render: (p) => (
        <div>
          <p className="font-medium text-gray-900">{p.Invoice.Student.name}</p>
          <p className="text-xs text-gray-500">{p.Invoice.Product.name}</p>
        </div>
      ),
    },
    {
      key: "branch",
      label: "Branch",
      render: (p) => p.Invoice.Branch.name,
    },
    {
      key: "amount",
      label: "Amount",
      render: (p) => (
        <span className="font-semibold text-green-600">
          ₹{p.Invoice.amount}
        </span>
      ),
    },
    {
      key: "paid_on",
      label: "Paid On",
      render: (p) => new Date(p.paid_on).toLocaleDateString("en-IN"),
    },
    {
      key: "transaction",
      label: "Transaction ID",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600 mt-2">
          Manage and track all payments across branches
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard
          icon={CreditCard}
          label="Total Payments"
          value={stats.totalPayments}
          color="blue"
        />

        <StatCard
          icon={IndianRupee}
          label="Total Revenue"
          value={`₹${stats.totalRevenue}`}
          color="green"
        />

        <StatCard
          icon={FileText}
          label="Avg Payment"
          value={
            stats.totalPayments
              ? `₹${Math.round(stats.totalRevenue / stats.totalPayments)}`
              : "₹0"
          }
          color="indigo"
        />
      </div>

      {/* Table */}

      <DataTable
        data={payments}
        columns={columns}
        searchPlaceholder="Search payments..."
        searchKeys={["id", "transaction"]}
        exportFileName="payments"
        itemsPerPage={10}
      />
    </div>
  );
}
