'use client';

import React, { useState } from 'react';
import {
  Home,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  CreditCard,
  Bell,
  UserCircle,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { name: 'Dashboard', icon: Home, href: '/super-admin' },
  { name: 'Institutions', icon: Users, href: '/super-admin/institutions' },
  { name: 'Subscriptions', icon: CreditCard, href: '/super-admin/subscriptions' },
  { name: 'Settings', icon: Settings, href: '/super-admin/settings' },
];

export default function SuperAdminLayout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    // Add your logout logic here
    console.log('Logging out...');
    // Example: router.push('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900">
      {/* Sidebar - Fixed */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col flex-shrink-0`}
      >
        {/* Logo & Toggle */}
        <div className="flex items-center justify-center gap-4 h-16 px-4 border-b border-gray-200 flex-shrink-0">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-indigo-700 transition-opacity duration-300">
              Campus Ledger
            </h1>
          )}
          <button
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? (
              <Menu className="w-5 h-5 text-gray-600" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation - Scrollable if needed */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ name, icon: Icon, href }) => (
            <a
              key={name}
              href={href}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 transition-all group ${
                !sidebarOpen && 'justify-center'
              }`}
              title={!sidebarOpen ? name : ''}
            >
              <Icon className={`${sidebarOpen ? 'w-5 h-5' : 'w-6 h-6'} flex-shrink-0`} />
              {sidebarOpen && (
                <span className="font-medium truncate">{name}</span>
              )}
            </a>
          ))}
        </nav>

        {/* Sidebar Logout */}
        <div className="px-3 h-12 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-3 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all ${
              !sidebarOpen && 'justify-center'
            }`}
            title={!sidebarOpen ? 'Logout' : ''}
          >
            <LogOut className={`${sidebarOpen ? 'w-5 h-5' : 'w-6 h-6'} flex-shrink-0`} />
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
              <p className="text-sm font-semibold text-gray-900">Super Admin</p>
              <p className="text-xs text-gray-500">admin@campusledger.com</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            {children}
          </div>
        </main>

        {/* Footer - Fixed at bottom */}
        <footer className="h-12 bg-white border-t border-gray-200 flex items-center justify-center text-gray-500 text-xs flex-shrink-0">
          © 2025 Campus Ledger. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
