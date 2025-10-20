// pages/AttendancePage.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, Check, X, Users } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import StatCard from '@/components/StatCard';

interface Student {
  id: number;
  name: string;
  rollNo: string;
  status: 'present' | 'absent' | null;
}

const mockStudents: Student[] = [
  { id: 1, name: 'Alice Johnson', rollNo: 'S001', status: null },
  { id: 2, name: 'Bob Smith', rollNo: 'S002', status: null },
  { id: 3, name: 'Charlie Brown', rollNo: 'S003', status: null },
  { id: 4, name: 'Diana Prince', rollNo: 'S004', status: null },
];

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const markAllPresent = () => {
    setStudents(students.map(s => ({ ...s, status: 'present' })));
  };

  const markAttendance = (id: number, status: 'present' | 'absent') => {
    setStudents(students.map(s => (s.id === id ? { ...s, status } : s)));
  };

  const handleSave = () => {
    toast.success('Attendance saved successfully!');
    // call API to save attendance
  };

  const stats = useMemo(() => {
    const total = students.length;
    const present = students.filter(s => s.status === 'present').length;
    const absent = students.filter(s => s.status === 'absent').length;
    const percentage = total === 0 ? 0 : Math.round((present / total) * 100);
    return { total, present, absent, percentage };
  }, [students]);

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2 text-gray-700">
          <Users className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold">Attendance</h1>
        </div>

        {/* Date picker */}
        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg border-gray-300 hover:bg-gray-50 transition"
          >
            <Calendar className="w-5 h-5 text-gray-600" />
            {new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </button>

          {showDatePicker && (
            <div className="absolute z-10 mt-2 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex justify-end mt-2 gap-2">
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Batch Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <p className="text-gray-500">Batch: <span className="font-semibold text-gray-900">Batch A - Math 101</span></p>
          <p className="text-gray-500">Total Students: <span className="font-semibold text-gray-900">{students.length}</span></p>
        </div>
        <button
          onClick={markAllPresent}
          className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition flex items-center gap-2"
        >
          <Check className="w-4 h-4" /> Mark All Present
        </button>
      </div>

      {/* Attendance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={stats.total} color="indigo" />
        <StatCard icon={Check} label="Present Today" value={stats.present} color="green" />
        <StatCard icon={X} label="Absent Today" value={stats.absent} color="red" />
        <StatCard icon={Users} label="Attendance %" value={`${stats.percentage}%`} color="blue" />
      </div>

      {/* Student Attendance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Roll No</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Student Name</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Attendance</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="py-3 px-4 text-gray-700">{student.rollNo}</td>
                <td className="py-3 px-4 text-gray-700">{student.name}</td>
                <td className="py-3 px-4 text-center space-x-2">
                  <button
                    onClick={() => markAttendance(student.id, 'present')}
                    className={`px-3 py-1 rounded-lg border transition ${
                      student.status === 'present'
                        ? 'bg-green-600 text-white border-green-600'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Present
                  </button>
                  <button
                    onClick={() => markAttendance(student.id, 'absent')}
                    className={`px-3 py-1 rounded-lg border transition ${
                      student.status === 'absent'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Absent
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Save Attendance
        </button>
      </div>
    </div>
  );
}
