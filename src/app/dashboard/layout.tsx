"use client";

import React from "react";
import {
  LayoutDashboard,
  IndianRupee,
  Users,
  GraduationCap,
  LibraryBig,
} from "lucide-react";
import DashboardLayout, { NavItem } from "@/app/components/DashboardLayout";

interface LayoutProps {
  children: React.ReactNode;
}

const superAdminNavItems: NavItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Fee", icon: IndianRupee, href: "/dashboard/fee" },
  { name: "Students", icon: GraduationCap, href: "/dashboard/students" },
  { name: "Staff", icon: Users, href: "/dashboard/staff" },
  { name: "Courses", icon: LibraryBig, href: "/dashboard/courses" },
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
