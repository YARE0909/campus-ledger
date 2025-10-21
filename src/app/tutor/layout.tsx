"use client";

import React from "react";
import { LayoutDashboard, Users, ListChecks, FileText } from "lucide-react";
import DashboardLayout, { NavItem } from "@/components/DashboardLayout";

interface LayoutProps {
  children: React.ReactNode;
}

const superAdminNavItems: NavItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/tutor" },
  { name: "Attendance", icon: ListChecks, href: "/tutor/attendance" },
  { name: "Reports", icon: FileText, href: "/tutor/reports" },
  { name: "Students", icon: Users, href: "/tutor/students" },
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
