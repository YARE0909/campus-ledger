"use client";

import React, { useEffect, useState } from "react";
import { LogOut, Menu, Bell, UserCircle, LucideIcon } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { destroyCookie, parseCookies } from "nookies";
import { useUser } from "@/contexts/UserContext";
import jwt from "jsonwebtoken";

export interface NavItem {
  name: string;
  icon: LucideIcon;
  href: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  companyName?: string;
  showNotifications?: boolean;
}

export default function DashboardLayout({
  children,
  navItems,
  companyName,
  showNotifications = true,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, clearUser, setUser } = useUser();
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname

  const fetchUser = async () => {
    const cookies = parseCookies();

    const { token } = cookies;
    if (token) {
      const decoded = jwt.decode(token);
      const { id, name, email, role }: any = decoded;
      setUser({
        id,
        name,
        email,
        role,
      });
    }
  };

  const handleLogout = () => {
    // Clear user context
    clearUser();

    // Delete token cookie
    destroyCookie(null, "token", {
      path: "/",
    });

    // Redirect to login
    router.push("/login");
  };

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900">
      {/* Sidebar - Fixed */}
      <aside
        className={`${
          sidebarOpen ? "w-56" : "w-20"
        } bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col flex-shrink-0`}
      >
        {/* Logo & Toggle */}
        <div className="flex items-center justify-center gap-16 h-16 px-4 border-b border-gray-200 flex-shrink-0">
          {sidebarOpen && (
            <h1 className="text-2xl font-bold text-indigo-700 transition-opacity duration-300">
              Acadify
            </h1>
          )}
          <button
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation - Scrollable if needed */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ name, icon: Icon, href }) => {
            const isActive = pathname === href;

            return (
              <a
                key={name}
                href={href}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all group ${
                  !sidebarOpen && "justify-center"
                } ${
                  isActive
                    ? "bg-indigo-100 text-indigo-700 font-semibold"
                    : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                }`}
                title={!sidebarOpen ? name : ""}
              >
                <Icon
                  className={`${
                    sidebarOpen ? "w-5 h-5" : "w-6 h-6"
                  } flex-shrink-0 ${isActive ? "text-indigo-700" : ""}`}
                />
                {sidebarOpen && (
                  <span className="font-medium truncate">{name}</span>
                )}
              </a>
            );
          })}
        </nav>

        {/* Sidebar Logout */}
        <div className="px-3 h-12 border-t border-gray-200 flex-shrink-0 flex items-center justify-center">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-1 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer ${
              !sidebarOpen && "justify-center"
            }`}
            title={!sidebarOpen ? "Logout" : ""}
          >
            <LogOut
              className={`${sidebarOpen ? "w-5 h-5" : "w-6 h-6"} flex-shrink-0`}
            />
            {sidebarOpen && <span className="font-bold truncate">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navbar - Fixed */}
        <header className="flex items-center justify-between h-16 bg-white px-6 border-b border-gray-200 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <UserCircle className="w-8 h-8 text-indigo-600" />
            <div>
              <p className="font-semibold text-gray-900">
                {user?.name}
              </p>
              {/* <p className="text-xs text-gray-500">{user?.email}</p> */}
            </div>
          </div>

          <div className="flex items-center gap-5">
            {/* Notifications */}
            {companyName && (
              <div>
                <h1 className="text-3xl font-bold">{companyName}</h1>
              </div>
            )}
            {showNotifications && (
              <button
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            )}
          </div>
        </header>

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">{children}</div>
        </main>

        {/* Footer - Fixed at bottom */}
        <footer className="h-12 bg-white border-t border-gray-200 flex items-center justify-center text-gray-500 text-xs flex-shrink-0">
          © 2025 Acadify. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
