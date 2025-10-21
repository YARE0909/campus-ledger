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
} from "lucide-react";
import DashboardLayout, { NavItem } from "@/components/DashboardLayout";

interface LayoutProps {
  children: React.ReactNode;
}

const superAdminNavItems: NavItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Batches", icon: Clock4, href: "/dashboard/batches" },
  { name: "Branches", icon: Split, href: "/dashboard/branches" },
  { name: "Courses", icon: LibraryBig, href: "/dashboard/courses" },
  { name: "Invoice", icon: IndianRupee, href: "/dashboard/invoice" },
  { name: "Staff", icon: Users, href: "/dashboard/staff" },
  { name: "Students", icon: GraduationCap, href: "/dashboard/students" },
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
