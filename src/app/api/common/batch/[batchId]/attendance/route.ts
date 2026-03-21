import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getTenantIdFromRequest } from "@/lib/auth/tenant";

function parseBatchId(value: string) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseDateOnly(dateString: string) {
  // Expects YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return null;
  const date = new Date(`${dateString}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function todayInIST() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());
}

type AttendanceRecordInput = {
  enrollment_id?: number;
  student_id?: number;
  status: string;
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ batchId: string }> },
) {
  try {
    const tenantId = getTenantIdFromRequest(req);
    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { batchId: batchIdParam } = await context.params;
    const batchId = parseBatchId(batchIdParam);

    if (!batchId) {
      return NextResponse.json(
        { success: false, message: "Invalid batch id" },
        { status: 400 },
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const dateParam = searchParams.get("date") || todayInIST();
    const attendanceDate = parseDateOnly(dateParam);

    if (!attendanceDate) {
      return NextResponse.json(
        { success: false, message: "Invalid date. Use YYYY-MM-DD" },
        { status: 400 },
      );
    }

    const batch = await prisma.batches.findFirst({
      where: {
        id: batchId,
        branches: {
          is: {
            tenant_id: tenantId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        branch_id: true,
      },
    });

    if (!batch) {
      return NextResponse.json(
        { success: false, message: "Batch not found" },
        { status: 404 },
      );
    }

    const enrollmentsInBatch = await prisma.enrollmentbatches.findMany({
      where: { batch_id: batchId },
      select: {
        enrollment_id: true,
        enrollments: {
          select: {
            id: true,
            student_id: true,
            status: true,
            students: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { id: "asc" },
    });

    const enrollmentIds = enrollmentsInBatch.map((row) => row.enrollment_id);

    const attendanceRows = enrollmentIds.length
      ? await prisma.attendance.findMany({
          where: {
            enrollment_id: { in: enrollmentIds },
            attendance_date: attendanceDate,
          },
          select: {
            id: true,
            enrollment_id: true,
            status: true,
            attendance_date: true,
            created_at: true,
            modified_at: true,
          },
        })
      : [];

    const attendanceMap = new Map(
      attendanceRows.map((row) => [row.enrollment_id, row]),
    );

    const data = enrollmentsInBatch.map((row) => {
      const attendance = attendanceMap.get(row.enrollment_id);

      return {
        enrollment_id: row.enrollment_id,
        student_id: row.enrollments.student_id,
        student_name: row.enrollments.students.name,
        student_email: row.enrollments.students.email,
        student_phone: row.enrollments.students.phone,
        enrollment_status: row.enrollments.status,
        attendance: attendance
          ? {
              id: attendance.id,
              status: attendance.status,
              attendance_date: attendance.attendance_date,
              created_at: attendance.created_at,
              modified_at: attendance.modified_at,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        batch: {
          id: batch.id,
          name: batch.name,
          branch_id: batch.branch_id,
        },
        attendance_date: dateParam,
        students: data,
      },
    });
  } catch (error) {
    console.error("GET /api/common/batches/[batchId]/attendance error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch attendance" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ batchId: string }> },
) {
  try {
    const tenantId = getTenantIdFromRequest(req);

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { batchId: batchIdParam } = await context.params;
    const batchId = parseBatchId(batchIdParam);

    if (!batchId) {
      return NextResponse.json(
        { success: false, message: "Invalid batch id" },
        { status: 400 },
      );
    }

    const body = await req.json();

    const attendanceDateString = String(
      body.attendance_date || body.date || "",
    ).trim();

    const attendanceDate = parseDateOnly(attendanceDateString);

    if (!attendanceDate) {
      return NextResponse.json(
        { success: false, message: "attendance_date is required in YYYY-MM-DD format" },
        { status: 400 },
      );
    }

    const records: AttendanceRecordInput[] = Array.isArray(body.records)
      ? body.records
      : [];

    if (records.length === 0) {
      return NextResponse.json(
        { success: false, message: "records array is required" },
        { status: 400 },
      );
    }

    const batch = await prisma.batches.findFirst({
      where: {
        id: batchId,
        branches: {
          is: {
            tenant_id: tenantId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        branch_id: true,
      },
    });

    if (!batch) {
      return NextResponse.json(
        { success: false, message: "Batch not found" },
        { status: 404 },
      );
    }

    const enrollmentsInBatch = await prisma.enrollmentbatches.findMany({
      where: { batch_id: batchId },
      select: {
        enrollment_id: true,
        enrollments: {
          select: {
            id: true,
            student_id: true,
            students: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (enrollmentsInBatch.length === 0) {
      return NextResponse.json(
        { success: false, message: "No students found in this batch" },
        { status: 400 },
      );
    }

    const enrollmentById = new Map(
      enrollmentsInBatch.map((row) => [row.enrollment_id, row]),
    );

    const enrollmentByStudentId = new Map<number, number>();
    for (const row of enrollmentsInBatch) {
      enrollmentByStudentId.set(row.enrollments.student_id, row.enrollment_id);
    }

    const normalizedRecords = records.map((record, index) => {
      const status = String(record.status || "").trim();
      if (!status) {
        throw new Error(`status is required for record at index ${index}`);
      }

      let enrollmentId: number | null = null;

      if (record.enrollment_id !== undefined && record.enrollment_id !== null) {
        enrollmentId = Number(record.enrollment_id);
        if (!Number.isFinite(enrollmentId)) {
          throw new Error(`Invalid enrollment_id at index ${index}`);
        }
      } else if (
        record.student_id !== undefined &&
        record.student_id !== null
      ) {
        const studentId = Number(record.student_id);
        if (!Number.isFinite(studentId)) {
          throw new Error(`Invalid student_id at index ${index}`);
        }

        enrollmentId = enrollmentByStudentId.get(studentId) ?? null;
        if (!enrollmentId) {
          throw new Error(
            `Student ${studentId} is not enrolled in this batch`,
          );
        }
      } else {
        throw new Error(
          `Either enrollment_id or student_id is required at index ${index}`,
        );
      }

      if (!enrollmentById.has(enrollmentId)) {
        throw new Error(
          `Enrollment ${enrollmentId} is not part of this batch`,
        );
      }

      return {
        enrollment_id: enrollmentId,
        status,
      };
    });

    const saved = await prisma.$transaction(async (tx) => {
      const results: Array<{
        id: number;
        enrollment_id: number;
        status: string | null;
        attendance_date: Date;
      }> = [];

      for (const record of normalizedRecords) {
        const existing = await tx.attendance.findFirst({
          where: {
            enrollment_id: record.enrollment_id,
            attendance_date: attendanceDate,
          },
          select: { id: true },
        });

        const row = existing
          ? await tx.attendance.update({
              where: { id: existing.id },
              data: {
                status: record.status,
                modified_at: new Date(),
              },
              select: {
                id: true,
                enrollment_id: true,
                status: true,
                attendance_date: true,
              },
            })
          : await tx.attendance.create({
              data: {
                enrollment_id: record.enrollment_id,
                status: record.status,
                attendance_date: attendanceDate,
                created_at: new Date(),
                modified_at: new Date(),
              },
              select: {
                id: true,
                enrollment_id: true,
                status: true,
                attendance_date: true,
              },
            });

        results.push(row);
      }

      return results;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Attendance marked successfully",
        data: {
          batch_id: batch.id,
          attendance_date: attendanceDateString,
          records: saved,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("POST /api/common/batches/[batchId]/attendance error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to mark attendance",
      },
      { status: 500 },
    );
  }
}