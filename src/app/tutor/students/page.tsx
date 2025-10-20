'use client';

import { useState, useMemo } from 'react';
import { Users, UserCheck, BookOpen, GraduationCap } from 'lucide-react';
import DataTable, { Column } from '@/components/DataTable';
import StatCard from '@/components/StatCard';
import Modal from '@/components/Modal';

interface Student {
  id: string;
  name: string;
  email: string;
  batch: string;
  course: string;
  progress: number;
  attendance: number;
  status: 'Active' | 'Completed' | 'Dropped';
  joinedDate: string;
}

export default function TeacherStudentsPage() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Mock Data
  const students: Student[] = [
    {
      id: 'S001',
      name: 'Alex Brown',
      email: 'alex@example.com',
      batch: 'Web Development - Morning Batch',
      course: 'Full Stack Web Development',
      progress: 82,
      attendance: 90,
      status: 'Active',
      joinedDate: '2025-11-01',
    },
    {
      id: 'S002',
      name: 'Emma Davis',
      email: 'emma@example.com',
      batch: 'Data Science - Evening Batch',
      course: 'Data Science & Analytics',
      progress: 65,
      attendance: 80,
      status: 'Active',
      joinedDate: '2025-10-15',
    },
    {
      id: 'S003',
      name: 'Oliver Wilson',
      email: 'oliver@example.com',
      batch: 'Web Development - Morning Batch',
      course: 'Full Stack Web Development',
      progress: 100,
      attendance: 95,
      status: 'Completed',
      joinedDate: '2025-09-01',
    },
    {
      id: 'S004',
      name: 'Sophia Taylor',
      email: 'sophia@example.com',
      batch: 'UI/UX - Afternoon Batch',
      course: 'UI/UX Design',
      progress: 48,
      attendance: 70,
      status: 'Active',
      joinedDate: '2025-10-01',
    },
    {
      id: 'S005',
      name: 'Liam Johnson',
      email: 'liam@example.com',
      batch: 'Mobile App Dev - Weekend Batch',
      course: 'Mobile App Development',
      progress: 20,
      attendance: 60,
      status: 'Dropped',
      joinedDate: '2025-09-10',
    },
  ];

  // Derived insights
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'Active').length;
  const completed = students.filter((s) => s.status === 'Completed').length;
  const averageProgress = Math.round(
    students.reduce((acc, s) => acc + s.progress, 0) / totalStudents
  );

  // DataTable setup
  const columns: Column<Student>[] = [
    { key: 'name', label: 'Student Name', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'batch', label: 'Batch', sortable: true },
    { key: 'course', label: 'Course', sortable: true },
    {
      key: 'progress',
      label: 'Progress',
      sortable: true,
      render: (s) => (
        <div className="flex items-center gap-2">
          <div className="w-24 bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-2 rounded-full"
              style={{ width: `${s.progress}%` }}
            />
          </div>
          <span className="text-sm text-gray-700">{s.progress}%</span>
        </div>
      ),
    },
    {
      key: 'attendance',
      label: 'Attendance',
      sortable: true,
      render: (s) => (
        <span
          className={`px-2 py-1 rounded-lg text-xs font-medium ${
            s.attendance >= 85
              ? 'bg-green-100 text-green-700'
              : s.attendance >= 70
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {s.attendance}%
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (s) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            s.status === 'Active'
              ? 'bg-blue-100 text-blue-700'
              : s.status === 'Completed'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {s.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Students</h1>
        <p className="text-gray-600">View and manage all your students here.</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Students"
          value={totalStudents}
          color="indigo"
        />
        <StatCard
          icon={UserCheck}
          label="Active Students"
          value={activeStudents}
          color="green"
        />
        <StatCard
          icon={GraduationCap}
          label="Completed"
          value={completed}
          color="blue"
        />
        <StatCard
          icon={BookOpen}
          label="Avg Progress"
          value={`${averageProgress}%`}
          color="red"
        />
      </div>

      {/* Data Table */}
      <DataTable<Student>
        data={students}
        columns={columns}
        searchKeys={['name', 'email', 'batch', 'course']}
        filters={[
          {
            key: 'status',
            label: 'Filter by Status',
            options: [
              { value: 'Active', label: 'Active' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Dropped', label: 'Dropped' },
            ],
          },
        ]}
        dateFilter={{
          key: 'joinedDate',
          label: 'Joined Date',
        }}
        exportFileName="students_list"
        onRowClick={(student) => setSelectedStudent(student)}
      />

      {/* Student Detail Modal */}
      <Modal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title="Student Details"
        size="lg"
      >
        {selectedStudent && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedStudent.name}
                </h3>
                <p className="text-gray-600">{selectedStudent.email}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedStudent.status === 'Active'
                    ? 'bg-blue-100 text-blue-700'
                    : selectedStudent.status === 'Completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {selectedStudent.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <p>
                <strong>Course:</strong> {selectedStudent.course}
              </p>
              <p>
                <strong>Batch:</strong> {selectedStudent.batch}
              </p>
              <p>
                <strong>Progress:</strong> {selectedStudent.progress}%
              </p>
              <p>
                <strong>Attendance:</strong> {selectedStudent.attendance}%
              </p>
              <p>
                <strong>Joined Date:</strong>{' '}
                {new Date(selectedStudent.joinedDate).toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
