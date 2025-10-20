"use client";

import React from "react";
import {
  Settings,
  CreditCard,
  Landmark,
  LayoutDashboard,
} from "lucide-react";
import DashboardLayout, { NavItem } from "@/components/DashboardLayout";

interface LayoutProps {
  children: React.ReactNode;
}

const superAdminNavItems: NavItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/super-admin" },
  { name: "Institutions", icon: Landmark, href: "/super-admin/institutions" },
  { name: "Subscriptions", icon: CreditCard, href: "/super-admin/subscriptions" },
  { name: "Settings", icon: Settings, href: "/super-admin/settings" },
];

export default function SuperAdminLayout({ children }: LayoutProps) {
  return (
    <DashboardLayout
      navItems={superAdminNavItems}
      showNotifications={true}
    >
      {children}
    </DashboardLayout>
  );
}
