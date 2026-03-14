import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getTenantIdFromRequest } from "@/lib/auth/tenant";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = getTenantIdFromRequest(req);
    const staffId = Number(params.id);

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!Number.isFinite(staffId)) {
      return NextResponse.json(
        { success: false, message: "Invalid staff id" },
        { status: 400 }
      );
    }

    const tenantBranches = await prisma.branches.findMany({
      where: { tenant_id: tenantId },
      select: { id: true, name: true },
    });

    const branchNameMap = new Map(tenantBranches.map((b) => [b.id, b.name]));
    const branchIds = tenantBranches.map((b) => b.id);

    const staff = await prisma.staff.findFirst({
      where: {
        id: staffId,
        branch_id: { in: branchIds },
      },
    });

    if (!staff) {
      return NextResponse.json(
        { success: false, message: "Staff not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: staff.id,
        branch_id: staff.branch_id,
        branch_name: branchNameMap.get(staff.branch_id) || null,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        qualification: staff.qualification,
        experience: staff.experience,
        specialization: staff.specialization,
        salary: staff.salary ? staff.salary.toString() : null,
        start_date: staff.start_date,
        end_date: staff.end_date,
        user_id: staff.user_id,
        staff_status: staff.staff_status,
        staff_title: staff.staff_title,
        created_at: staff.created_at,
        modified_at: staff.modified_at,
      },
    });
  } catch (error) {
    console.error("GET /api/staff/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = getTenantIdFromRequest(req);
    const staffId = Number(params.id);

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!Number.isFinite(staffId)) {
      return NextResponse.json(
        { success: false, message: "Invalid staff id" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const tenantBranches = await prisma.branches.findMany({
      where: { tenant_id: tenantId },
      select: { id: true },
    });
    const branchIds = tenantBranches.map((b) => b.id);

    const existing = await prisma.staff.findFirst({
      where: {
        id: staffId,
        branch_id: { in: branchIds },
      },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Staff not found" },
        { status: 404 }
      );
    }

    const updateData: Prisma.staffUpdateInput = {};

    if (body.branch_id !== undefined) {
      const numericBranchId = Number(body.branch_id);
      if (!Number.isFinite(numericBranchId)) {
        return NextResponse.json(
          { success: false, message: "Invalid branch_id" },
          { status: 400 }
        );
      }

      if (!branchIds.includes(numericBranchId)) {
        return NextResponse.json(
          { success: false, message: "Branch does not belong to this tenant" },
          { status: 403 }
        );
      }

      updateData.branch_id = numericBranchId;
    }

    if (body.name !== undefined) updateData.name = String(body.name).trim();
    if (body.email !== undefined) updateData.email = body.email ? String(body.email).trim() : null;
    if (body.phone !== undefined) updateData.phone = body.phone ? String(body.phone).trim() : null;
    if (body.qualification !== undefined)
      updateData.qualification = body.qualification ? String(body.qualification).trim() : null;
    if (body.experience !== undefined)
      updateData.experience = body.experience ? String(body.experience).trim() : null;
    if (body.specialization !== undefined)
      updateData.specialization = body.specialization ? String(body.specialization).trim() : null;

    if (body.salary !== undefined) {
      updateData.salary =
        body.salary === null || body.salary === ""
          ? null
          : new Prisma.Decimal(body.salary);
    }

    if (body.start_date !== undefined) {
      updateData.start_date = body.start_date ? new Date(body.start_date) : null;
    }

    if (body.end_date !== undefined) {
      updateData.end_date = body.end_date ? new Date(body.end_date) : null;
    }

    if (body.staff_status !== undefined) {
      updateData.staff_status = body.staff_status;
    }

    if (body.staff_title !== undefined) {
      updateData.staff_title = body.staff_title;
    }

    if (body.user_id !== undefined) {
      updateData.user_id =
        body.user_id === null || body.user_id === ""
          ? null
          : Number(body.user_id);
    }

    const updated = await prisma.staff.update({
      where: { id: staffId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Staff updated successfully",
      data: {
        id: updated.id,
        branch_id: updated.branch_id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        qualification: updated.qualification,
        experience: updated.experience,
        specialization: updated.specialization,
        salary: updated.salary ? updated.salary.toString() : null,
        start_date: updated.start_date,
        end_date: updated.end_date,
        user_id: updated.user_id,
        staff_status: updated.staff_status,
        staff_title: updated.staff_title,
        created_at: updated.created_at,
        modified_at: updated.modified_at,
      },
    });
  } catch (error) {
    console.error("PUT /api/staff/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update staff" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = getTenantIdFromRequest(req);
    const staffId = Number(params.id);

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!Number.isFinite(staffId)) {
      return NextResponse.json(
        { success: false, message: "Invalid staff id" },
        { status: 400 }
      );
    }

    const tenantBranches = await prisma.branches.findMany({
      where: { tenant_id: tenantId },
      select: { id: true },
    });

    const branchIds = tenantBranches.map((b) => b.id);

    const staff = await prisma.staff.findFirst({
      where: {
        id: staffId,
        branch_id: { in: branchIds },
      },
      include: {
        staffmappings: {
          select: { id: true },
        },
      },
    });

    if (!staff) {
      return NextResponse.json(
        { success: false, message: "Staff not found" },
        { status: 404 }
      );
    }

    if (staff.staffmappings.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Staff cannot be deleted because mappings exist",
        },
        { status: 409 }
      );
    }

    await prisma.staff.delete({
      where: { id: staffId },
    });

    return NextResponse.json({
      success: true,
      message: "Staff deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/staff/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete staff" },
      { status: 500 }
    );
  }
}