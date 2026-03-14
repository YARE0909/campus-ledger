import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getTenantIdFromRequest } from "@/lib/auth/tenant";

function toInt(value: string | null, fallback: number) {
  const n = value ? Number(value) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(req);

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = req.nextUrl;
    const search = (searchParams.get("search") || "").trim();
    const status = searchParams.get("status") || undefined;
    const branchIdParam = searchParams.get("branchId");
    const page = Math.max(1, toInt(searchParams.get("page"), 1));
    const limit = Math.min(100, Math.max(1, toInt(searchParams.get("limit"), 20)));
    const skip = (page - 1) * limit;

    const tenantBranches = await prisma.branches.findMany({
      where: { tenant_id: tenantId },
      select: { id: true, name: true },
    });

    const branchIds = tenantBranches.map((b) => b.id);
    const branchNameMap = new Map(tenantBranches.map((b) => [b.id, b.name]));

    if (branchIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: { page, limit, total: 0 },
      });
    }

    const branchId =
      branchIdParam && Number.isFinite(Number(branchIdParam))
        ? Number(branchIdParam)
        : undefined;

    if (branchId && !branchIds.includes(branchId)) {
      return NextResponse.json(
        { success: false, message: "Branch does not belong to this tenant" },
        { status: 403 }
      );
    }

    const where: Prisma.staffWhereInput = {
      branch_id: branchId ? branchId : { in: branchIds },
      ...(status ? { staff_status: status as any } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
              { phone: { contains: search } },
              { qualification: { contains: search } },
              { specialization: { contains: search } },
              { experience: { contains: search } },
            ],
          }
        : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.staff.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.staff.count({ where }),
    ]);

    const data = items.map((staff) => ({
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
    }));

    return NextResponse.json({
      success: true,
      data,
      meta: { page, limit, total },
    });
  } catch (error) {
    console.error("GET /api/staff error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(req);

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      branch_id,
      name,
      email,
      phone,
      qualification,
      experience,
      specialization,
      salary,
      start_date,
      end_date,
      staff_status,
      staff_title,
      user_id,
    } = body;

    if (!branch_id || !name) {
      return NextResponse.json(
        { success: false, message: "branch_id and name are required" },
        { status: 400 }
      );
    }

    const numericBranchId = Number(branch_id);
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

    const created = await prisma.staff.create({
      data: {
        branch_id: numericBranchId,
        name: String(name).trim(),
        email: email ? String(email).trim() : null,
        phone: phone ? String(phone).trim() : null,
        qualification: qualification ? String(qualification).trim() : null,
        experience: experience ? String(experience).trim() : null,
        specialization: specialization ? String(specialization).trim() : null,
        salary: salary !== undefined && salary !== null ? new Prisma.Decimal(salary) : null,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
        staff_status: staff_status ?? "Active",
        staff_title: staff_title ?? null,
        user_id: user_id !== undefined && user_id !== null ? Number(user_id) : null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Staff created successfully",
        data: {
          id: created.id,
          branch_id: created.branch_id,
          name: created.name,
          email: created.email,
          phone: created.phone,
          qualification: created.qualification,
          experience: created.experience,
          specialization: created.specialization,
          salary: created.salary ? created.salary.toString() : null,
          start_date: created.start_date,
          end_date: created.end_date,
          user_id: created.user_id,
          staff_status: created.staff_status,
          staff_title: created.staff_title,
          created_at: created.created_at,
          modified_at: created.modified_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/staff error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create staff" },
      { status: 500 }
    );
  }
}