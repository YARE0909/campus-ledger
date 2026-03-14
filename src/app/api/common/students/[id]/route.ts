import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getTenantIdFromRequest } from "@/lib/auth/tenant";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const tenantId = getTenantIdFromRequest(req);
    const studentId = Number(id);

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!Number.isFinite(studentId)) {
      return NextResponse.json(
        { success: false, message: "Invalid student id" },
        { status: 400 }
      );
    }

    const student = await prisma.students.findFirst({
      where: {
        id: studentId,
        branches: {
          tenant_id: tenantId,
        },
      },
      include: {
        branches: {
          select: { id: true, name: true },
        },
        enrollments: {
          select: { id: true, product_id: true, status: true, created_at: true },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: student.id,
        branch_id: student.branch_id,
        branch_name: student.branches.name,
        name: student.name,
        email: student.email,
        phone: student.phone,
        address: student.address,
        parent_guardian_name: student.parent_guardian_name,
        parent_guardian_contact: student.parent_guardian_contact,
        parent_guardian_email: student.parent_guardian_email,
        status: student.status,
        created_at: student.created_at,
        modified_at: student.modified_at,
        enrollments: student.enrollments,
      },
    });
  } catch (error) {
    console.error("GET /api/students/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch student" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const tenantId = getTenantIdFromRequest(req);
    const studentId = Number(id);

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!Number.isFinite(studentId)) {
      return NextResponse.json(
        { success: false, message: "Invalid student id" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const student = await prisma.students.findFirst({
      where: {
        id: studentId,
        branches: {
          tenant_id: tenantId,
        },
      },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    const updateData: Prisma.studentsUpdateInput = {};

    if (body.branch_id !== undefined) {
      const numericBranchId = Number(body.branch_id);
      if (!Number.isFinite(numericBranchId)) {
        return NextResponse.json(
          { success: false, message: "Invalid branch_id" },
          { status: 400 }
        );
      }

      const branch = await prisma.branches.findFirst({
        where: {
          id: numericBranchId,
          tenant_id: tenantId,
        },
        select: { id: true },
      });

      if (!branch) {
        return NextResponse.json(
          { success: false, message: "Branch not found for this tenant" },
          { status: 403 }
        );
      }

      updateData.branches = {
        connect: { id: numericBranchId },
      };
    }

    if (body.name !== undefined) updateData.name = String(body.name).trim();
    if (body.email !== undefined) updateData.email = body.email ? String(body.email).trim() : null;
    if (body.phone !== undefined) updateData.phone = String(body.phone).trim();
    if (body.address !== undefined) updateData.address = String(body.address).trim();
    if (body.parent_guardian_name !== undefined)
      updateData.parent_guardian_name = String(body.parent_guardian_name).trim();
    if (body.parent_guardian_contact !== undefined)
      updateData.parent_guardian_contact = String(body.parent_guardian_contact).trim();
    if (body.parent_guardian_email !== undefined)
      updateData.parent_guardian_email = body.parent_guardian_email
        ? String(body.parent_guardian_email).trim()
        : null;
    if (body.status !== undefined) updateData.status = String(body.status).trim();

    const updated = await prisma.students.update({
      where: { id: studentId },
      data: updateData,
      include: {
        branches: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Student updated successfully",
      data: {
        id: updated.id,
        branch_id: updated.branch_id,
        branch_name: updated.branches.name,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        address: updated.address,
        parent_guardian_name: updated.parent_guardian_name,
        parent_guardian_contact: updated.parent_guardian_contact,
        parent_guardian_email: updated.parent_guardian_email,
        status: updated.status,
        created_at: updated.created_at,
        modified_at: updated.modified_at,
      },
    });
  } catch (error) {
    console.error("PUT /api/students/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update student" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const studentId = Number(id);
    const tenantId = getTenantIdFromRequest(req);

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!Number.isFinite(studentId)) {
      return NextResponse.json(
        { success: false, message: "Invalid student id" },
        { status: 400 }
      );
    }

    const student = await prisma.students.findFirst({
      where: {
        id: studentId,
        branches: {
          tenant_id: tenantId,
        },
      },
      include: {
        enrollments: {
          select: { id: true },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    if (student.enrollments.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Student cannot be deleted because enrollments exist",
        },
        { status: 409 }
      );
    }

    await prisma.students.delete({
      where: { id: studentId },
    });

    return NextResponse.json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/students/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete student" },
      { status: 500 }
    );
  }
}