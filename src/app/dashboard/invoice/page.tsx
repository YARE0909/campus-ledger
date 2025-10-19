"use client";

import React, { useState, useEffect } from "react";
import {
  IndianRupee,
  FileText,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Eye,
  Mail,
  Plus,
  MoreVertical,
} from "lucide-react";
import DataTable, { Column, Filter } from "@/app/components/DataTable";
import StatCard from "@/app/components/StatCard";
import { FormModal } from "@/app/components/Modal";
import Loader from "@/app/components/Loader";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";
import generateInvoicePDF from "./components/generateInvoice";
import mockData from "@/mock/feeRecord.json";

export interface FeeRecord {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  course_name: string;
  amount: number;
  status: "PAID" | "PENDING" | "OVERDUE";
  due_date: string;
  paid_date: string | null;
  invoice_number: string;
  period_start: string;
  period_end: string;
}

export default function FeePage() {
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FeeRecord | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Stats
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [paidInvoices, setPaidInvoices] = useState(0);
  const [overdueInvoices, setOverdueInvoices] = useState(0);
  const [selectedFeeRecord, setSelectedFeeRecord] = useState<string | null>(
    null
  );

  // Mock data function
  const fetchFeeData = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setFeeRecords(mockData as FeeRecord[]);

    // Calculate stats
    const total = mockData
      .filter((r) => r.status === "PAID")
      .reduce((sum, r) => sum + r.amount, 0);
    const pending = mockData
      .filter((r) => r.status === "PENDING")
      .reduce((sum, r) => sum + r.amount, 0);
    const paid = mockData.filter((r) => r.status === "PAID").length;
    const overdue = mockData.filter((r) => r.status === "OVERDUE").length;

    setTotalRevenue(total);
    setPendingAmount(pending);
    setPaidInvoices(paid);
    setOverdueInvoices(overdue);
    setLoading(false);
  };

  useEffect(() => {
    fetchFeeData();
  }, []);

  // Send Invoice via Email
  const sendInvoice = async (record: FeeRecord) => {
    // Simulate sending email
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success(`Invoice sent to ${record.student_email}`);
  };

  // Define columns
  const columns: Column<FeeRecord>[] = [
    {
      key: "invoice_number",
      label: "Invoice No.",
      sortable: true,
      render: (item) => (
        <div>
          <p className="font-semibold text-gray-900">{item.invoice_number}</p>
          <p className="text-xs text-gray-500">{item.student_id}</p>
        </div>
      ),
      exportRender: (item) => item.invoice_number,
    },
    {
      key: "student_name",
      label: "Student",
      sortable: true,
      render: (item) => (
        <div>
          <p className="font-medium text-gray-900">{item.student_name}</p>
          <p className="text-xs text-gray-500">{item.student_email}</p>
        </div>
      ),
      exportRender: (item) => item.student_name,
    },
    {
      key: "course_name",
      label: "Course",
      sortable: true,
      exportRender: (item) => item.course_name,
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1 font-semibold text-gray-900">
          <IndianRupee className="w-4 h-4" />
          {item.amount.toLocaleString("en-IN")}
        </div>
      ),
      exportRender: (item) => item.amount,
    },
    {
      key: "due_date",
      label: "Due Date",
      sortable: true,
      render: (item) => (
        <span className="text-sm text-gray-700">
          {new Date(item.due_date).toLocaleDateString("en-IN")}
        </span>
      ),
      exportRender: (item) => item.due_date,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (item) => {
        const statusConfig = {
          PAID: {
            bg: "bg-green-100",
            text: "text-green-800",
            icon: CheckCircle,
          },
          PENDING: {
            bg: "bg-yellow-100",
            text: "text-yellow-800",
            icon: Clock,
          },
          OVERDUE: {
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
  ];

  // Define filters
  const filters: Filter[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "PAID", label: "Paid" },
        { value: "PENDING", label: "Pending" },
        { value: "OVERDUE", label: "Overdue" },
      ],
    },
  ];

  // Render actions
  const renderActions = (item: FeeRecord) => (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedFeeRecord(selectedFeeRecord === item.id ? null : item.id);
        }}
        className="p-2 hover:bg-gray-100 rounded-lg transition"
      >
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>
      {selectedFeeRecord === item.id && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <button
            onClick={() => {
              generateInvoicePDF(item, "view");
              setSelectedFeeRecord(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <Eye className="w-4 h-4" />
            View Invoice
          </button>
          <button
            onClick={() => {
              generateInvoicePDF(item, "download");
              setSelectedFeeRecord(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <Download className="w-4 h-4" />
            Download Invoice
          </button>
          <button
            onClick={() => {
              sendInvoice(item);
              setSelectedFeeRecord(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <Mail className="w-4 h-4" />
            Send Invoice
          </button>
          {item.status === "PENDING" && (
            <button
              onClick={() => {
                // Add mark as paid functionality
                toast.success("Marked as paid");
                setSelectedFeeRecord(null);
                // TODO: Implement functionality
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition border-t border-gray-100"
            >
              <CheckCircle className="w-4 h-4" />
              Mark as Paid
            </button>
          )}
          {item.status === "OVERDUE" && (
            <button
              onClick={() => {
                // Add send reminder functionality
                toast.success("Reminder sent");
                setSelectedFeeRecord(null);
                // TODO: Implement functionality
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 transition border-t border-gray-100"
            >
              <AlertCircle className="w-4 h-4" />
              Send Reminder
            </button>
          )}
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
          <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
          <p className="text-gray-600 mt-1">
            Track and manage student fee payments
          </p>
        </div>
        {/* <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-5 h-5" />
          Generate Invoice
        </button> */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={IndianRupee}
          label="Total Revenue"
          value={`₹${(totalRevenue / 100000).toFixed(1)}L`}
          color="green"
        />
        <StatCard
          icon={Clock}
          label="Pending Amount"
          value={`₹${(pendingAmount / 1000).toFixed(0)}K`}
          color="blue"
        />
        <StatCard
          icon={CheckCircle}
          label="Paid Invoices"
          value={paidInvoices}
          color="indigo"
        />
        <StatCard
          icon={AlertCircle}
          label="Overdue Invoices"
          value={overdueInvoices}
          color="red"
        />
      </div>

      {/* Alert for overdue */}
      {overdueInvoices > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800 font-medium">
            {overdueInvoices} invoice{overdueInvoices > 1 ? "s are" : " is"}{" "}
            overdue. Please follow up with students.
          </p>
        </div>
      )}

      {/* DataTable */}
      <DataTable
        data={feeRecords}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search by student name, invoice no..."
        searchKeys={["student_name", "invoice_number", "student_email"]}
        itemsPerPage={5}
        exportFileName="fee-records"
        renderActions={renderActions}
      />
    </div>
  );
}
