'use client';
import { Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-10 space-y-8 ring-1 ring-gray-200">
        <h1 className="text-3xl font-semibold text-gray-900 text-center">
          Campus Ledger
        </h1>
        <form className="space-y-6" autoComplete="off">
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700 flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-600" /> Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700 flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-600" /> Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 rounded-xl text-white font-semibold text-lg hover:bg-indigo-700 transition"
          >
            Sign In
          </button>
        </form>
        <p className="text-center text-gray-500 text-sm select-none">
          © 2025 Campus Ledger. All rights reserved.
        </p>
      </div>
    </main>
  );
}
