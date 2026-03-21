import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantIdFromRequest } from "@/lib/auth/tenant";

function parseDate(dateString: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return null;
  const d = new Date(`${dateString}T00:00:00.000Z`);
  return isNaN(d.getTime()) ? null : d;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ batchId: string }> }
) {
  try {
    const tenantId = getTenantIdFromRequest(req);
    if (!tenantId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { batchId: batchIdParam } = await context.params;
    const batchId = Number(batchIdParam);

    if (!batchId) {
      return NextResponse.json({ success: false, message: "Invalid batch id" }, { status: 400 });
    }

    const searchParams = req.nextUrl.searchParams;

    const startDateStr = searchParams.get("start_date");
    const endDateStr = searchParams.get("end_date");

    if (!startDateStr || !endDateStr) {
      return NextResponse.json(
        { success: false, message: "start_date and end_date are required" },
        { status: 400 }
      );
    }

    const startDate = parseDate(startDateStr);
    const endDate = parseDate(endDateStr);

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: "Invalid date format (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    // ✅ Validate batch belongs to tenant
    const batch = await prisma.batches.findFirst({
      where: {
        id: batchId,
        branches: {
          is: { tenant_id: tenantId },
        },
      },
      select: { id: true, name: true },
    });

    if (!batch) {
      return NextResponse.json({ success: false, message: "Batch not found" }, { status: 404 });
    }

    // ✅ Get all enrollments in batch
    const enrollments = await prisma.enrollmentbatches.findMany({
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
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    const enrollmentIds = enrollments.map((e) => e.enrollment_id);

    // ✅ Fetch attendance in range
    const attendance = await prisma.attendance.findMany({
      where: {
        enrollment_id: { in: enrollmentIds },
        attendance_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        enrollment_id: true,
        status: true,
        attendance_date: true,
      },
    });

    // ✅ Group attendance
    const attendanceMap = new Map<number, typeof attendance>();

    for (const row of attendance) {
      if (!attendanceMap.has(row.enrollment_id)) {
        attendanceMap.set(row.enrollment_id, []);
      }
      attendanceMap.get(row.enrollment_id)!.push(row);
    }

    // ✅ Build response
    const result = enrollments.map((e) => {
      const records = attendanceMap.get(e.enrollment_id) || [];

      const total = records.length;
      const present = records.filter((r) => r.status === "Present").length;
      const absent = records.filter((r) => r.status === "Absent").length;
      const na = records.filter((r) => r.status === "NA").length;

      const percentage = total === 0 ? 0 : Math.round((present / total) * 100);

      return {
        enrollment_id: e.enrollment_id,
        student_id: e.enrollments.student_id,
        student_name: e.enrollments.students.name,
        email: e.enrollments.students.email,
        phone: e.enrollments.students.phone,

        summary: {
          total_classes: total,
          present,
          absent,
          na,
          attendance_percentage: percentage,
        },

        records: records.map((r) => ({
          date: r.attendance_date,
          status: r.status,
        })),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        batch,
        start_date: startDateStr,
        end_date: endDateStr,
        students: result,
      },
    });
  } catch (error) {
    console.error("Attendance report error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch attendance report" },
      { status: 500 }
    );
  }
}