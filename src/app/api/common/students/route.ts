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
        { status: 401 },
      );
    }

    const { searchParams } = req.nextUrl;
    const search = (searchParams.get("search") || "").trim();
    const status = searchParams.get("status") || undefined;
    const branchIdParam = searchParams.get("branchId");
    const page = Math.max(1, toInt(searchParams.get("page"), 1));
    const limit = Math.min(
      100,
      Math.max(1, toInt(searchParams.get("limit"), 20)),
    );
    const skip = (page - 1) * limit;

    const tenantBranches = await prisma.branches.findMany({
      where: { tenant_id: tenantId },
      select: { id: true },
    });

    const branchIds = tenantBranches.map((b) => b.id);

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
        { status: 403 },
      );
    }

    const where: Prisma.studentsWhereInput = {
      branch_id: branchId ? branchId : { in: branchIds },
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
              { phone: { contains: search } },
              { parent_guardian_name: { contains: search } },
              { parent_guardian_contact: { contains: search } },
            ],
          }
        : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.students.findMany({
        where,
        include: {
          branches: {
            select: {
              id: true,
              name: true,
            },
          },
          enrollments: {
            select: {
              id: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.students.count({ where }),
    ]);

    const data = items.map((student) => ({
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
      enrollment_count: student.enrollments.length,
    }));

    return NextResponse.json({
      success: true,
      data,
      meta: { page, limit, total },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch students" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(req);

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();

    const {
      branch_id,
      name,
      email,
      phone,
      address,
      parent_guardian_name,
      parent_guardian_contact,
      parent_guardian_email,
      status,
    } = body;

    if (
      !branch_id ||
      !name ||
      !phone ||
      !address ||
      !parent_guardian_name ||
      !parent_guardian_contact
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "branch_id, name, phone, address, parent_guardian_name and parent_guardian_contact are required",
        },
        { status: 400 },
      );
    }

    const numericBranchId = Number(branch_id);
    if (!Number.isFinite(numericBranchId)) {
      return NextResponse.json(
        { success: false, message: "Invalid branch_id" },
        { status: 400 },
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
        { status: 403 },
      );
    }

    const created = await prisma.students.create({
      data: {
        branch_id: numericBranchId,
        name: String(name).trim(),
        email: email ? String(email).trim() : null,
        phone: String(phone).trim(),
        address: String(address).trim(),
        parent_guardian_name: String(parent_guardian_name).trim(),
        parent_guardian_contact: String(parent_guardian_contact).trim(),
        parent_guardian_email: parent_guardian_email
          ? String(parent_guardian_email).trim()
          : null,
        status: status ? String(status).trim() : "ACTIVE",
      },
      include: {
        branches: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Student created successfully",
        data: {
          id: created.id,
          branch_id: created.branch_id,
          branch_name: created.branches.name,
          name: created.name,
          email: created.email,
          phone: created.phone,
          address: created.address,
          parent_guardian_name: created.parent_guardian_name,
          parent_guardian_contact: created.parent_guardian_contact,
          parent_guardian_email: created.parent_guardian_email,
          status: created.status,
          created_at: created.created_at,
          modified_at: created.modified_at,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/students error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create student" },
      { status: 500 },
    );
  }
}
