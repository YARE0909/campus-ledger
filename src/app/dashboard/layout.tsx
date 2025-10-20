"use client";

import React from "react";
import {
  LayoutDashboard,
  IndianRupee,
  Users,
  GraduationCap,
  LibraryBig,
  Clock4,
} from "lucide-react";
import DashboardLayout, { NavItem } from "@/app/components/DashboardLayout";

interface LayoutProps {
  children: React.ReactNode;
}

const superAdminNavItems: NavItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Invoice", icon: IndianRupee, href: "/dashboard/invoice" },
  { name: "Students", icon: GraduationCap, href: "/dashboard/students" },
  { name: "Staff", icon: Users, href: "/dashboard/staff" },
  { name: "Courses", icon: LibraryBig, href: "/dashboard/courses" },
  { name: "Batches", icon: Clock4, href: "/dashboard/batches" },
];

export default function SuperAdminLayout({ children }: LayoutProps) {
  return (
    <DashboardLayout
      navItems={superAdminNavItems}
      appName="Acadify"
      showNotifications={true}
    >
      {children}
    </DashboardLayout>
  );
}
