import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantIdFromRequest } from "@/lib/auth/tenant";

function parseBatchId(value: string) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

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

    const rows = await prisma.enrollmentbatches.findMany({
      where: { batch_id: batchId },
      select: {
        enrollment_id: true,
        enrollments: {
          select: {
            id: true,
            status: true,
            student_id: true,
            students: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { id: "asc" },
    });

    const data = rows.map((row) => ({
      enrollment_id: row.enrollment_id,
      student_id: row.enrollments.student_id,
      student_name: row.enrollments.students.name,
      student_email: row.enrollments.students.email,
      student_phone: row.enrollments.students.phone,
      student_status: row.enrollments.students.status,
      enrollment_status: row.enrollments.status,
    }));

    return NextResponse.json({
      success: true,
      data: {
        batch: {
          id: batch.id,
          name: batch.name,
          branch_id: batch.branch_id,
        },
        students: data,
      },
    });
  } catch (error) {
    console.error("GET /api/common/batch/[batchId]/students error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch batch students" },
      { status: 500 },
    );
  }
}