"use client";

import React from "react";
import {
  LayoutDashboard,
  IndianRupee,
  Users,
  GraduationCap,
  LibraryBig,
  Clock4,
  Split,
  ChartSpline,
  TestTubeDiagonal,
} from "lucide-react";
import DashboardLayout, { NavItem } from "@/components/DashboardLayout";

interface LayoutProps {
  children: React.ReactNode;
}

const superAdminNavItems: NavItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Branches", icon: Split, href: "/dashboard/branches" },
  { name: "Staff", icon: Users, href: "/dashboard/staff" },
  { name: "Courses", icon: LibraryBig, href: "/dashboard/courses" },
  { name: "Batches", icon: Clock4, href: "/dashboard/batches" },
  { name: "Students", icon: GraduationCap, href: "/dashboard/students" },
  { name: "Invoice", icon: IndianRupee, href: "/dashboard/invoice" },
  { name: "Payments", icon: IndianRupee, href: "/dashboard/payments" },
  { name: "Progress", icon: ChartSpline, href: "/dashboard/progress" },
  { name: "Evaluation", icon: TestTubeDiagonal, href: "/dashboard/evaluation" },
];

export default function SuperAdminLayout({ children }: LayoutProps) {
  return (
    <DashboardLayout
      navItems={superAdminNavItems}
      companyName="Art School"
      showNotifications={true}
    >
      {children}
    </DashboardLayout>
  );
}
