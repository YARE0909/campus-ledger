// app/api/common/staff/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { getTenantIdFromRequest } from "@/lib/auth/tenant";

function toInt(value: string | null, fallback: number) {
  const n = value ? Number(value) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function generateTemporaryPassword(length = 10) {
  return randomBytes(Math.ceil(length / 2)).toString("hex").slice(0, length);
}

function generateDefaultTutorPassword(institutionName: string) {
  const cleanInstitutionName = institutionName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  return `tutor@${cleanInstitutionName || "institute"}123`;
}

async function getTenantInstitutionName(tenantId: number) {
  const tenant = await prisma.tenants.findUnique({
    where: { id: tenantId },
    select: { name: true },
  });

  return tenant?.name?.trim() || "institute";
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
        { status: 403 },
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
    console.error("GET /api/common/staff error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch staff" },
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
      qualification,
      experience,
      specialization,
      salary,
      start_date,
      end_date,
      staff_status,
      staff_title,
      password,
    } = body;

    if (!branch_id || !name || !email) {
      return NextResponse.json(
        { success: false, message: "branch_id, name and email are required" },
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

    const normalizedEmail = normalizeEmail(String(email));

    const existingUser = await prisma.users.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "A user with this email already exists" },
        { status: 409 },
      );
    }

    let rawPassword: string;

    if (typeof password === "string" && password.trim()) {
      rawPassword = password.trim();
    } else {
      const institutionName = await getTenantInstitutionName(tenantId);
      rawPassword = generateDefaultTutorPassword(institutionName);
    }

    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const result = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.users.create({
        data: {
          tenant_id: tenantId,
          name: String(name).trim(),
          email: normalizedEmail,
          password: hashedPassword,
          role: "tutor",
          is_active: true,
        },
      });

      const createdStaff = await tx.staff.create({
        data: {
          branch_id: numericBranchId,
          name: String(name).trim(),
          email: normalizedEmail,
          phone: phone ? String(phone).trim() : null,
          qualification: qualification ? String(qualification).trim() : null,
          experience: experience ? String(experience).trim() : null,
          specialization: specialization ? String(specialization).trim() : null,
          salary:
            salary !== undefined &&
            salary !== null &&
            String(salary).trim() !== ""
              ? new Prisma.Decimal(salary)
              : null,
          start_date: start_date ? new Date(start_date) : null,
          end_date: end_date ? new Date(end_date) : null,
          staff_status: staff_status ?? "Active",
          staff_title: staff_title ?? null,
          user_id: createdUser.id,
        },
      });

      return { createdUser, createdStaff };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Staff created successfully",
        data: {
          id: result.createdStaff.id,
          branch_id: result.createdStaff.branch_id,
          name: result.createdStaff.name,
          email: result.createdStaff.email,
          phone: result.createdStaff.phone,
          qualification: result.createdStaff.qualification,
          experience: result.createdStaff.experience,
          specialization: result.createdStaff.specialization,
          salary: result.createdStaff.salary
            ? result.createdStaff.salary.toString()
            : null,
          start_date: result.createdStaff.start_date,
          end_date: result.createdStaff.end_date,
          user_id: result.createdStaff.user_id,
          staff_status: result.createdStaff.staff_status,
          staff_title: result.createdStaff.staff_title,
          created_at: result.createdStaff.created_at,
          modified_at: result.createdStaff.modified_at,
          login_user: {
            id: result.createdUser.id,
            email: result.createdUser.email,
            role: result.createdUser.role,
          },
          temporary_password: password ? null : rawPassword,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/common/staff error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create staff" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
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
      id,
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
      password,
    } = body;

    const staffId = Number(id);
    if (!Number.isFinite(staffId)) {
      return NextResponse.json(
        { success: false, message: "Invalid staff id" },
        { status: 400 },
      );
    }

    const existingStaff = await prisma.staff.findFirst({
      where: {
        id: staffId,
      },
      select: {
        id: true,
        branch_id: true,
        user_id: true,
      },
    });

    if (!existingStaff) {
      return NextResponse.json(
        { success: false, message: "Staff not found" },
        { status: 404 },
      );
    }

    const existingBranch = await prisma.branches.findFirst({
      where: {
        id: existingStaff.branch_id,
        tenant_id: tenantId,
      },
      select: { id: true },
    });

    if (!existingBranch) {
      return NextResponse.json(
        { success: false, message: "Staff does not belong to this tenant" },
        { status: 403 },
      );
    }

    let numericBranchId = existingStaff.branch_id;

    if (branch_id !== undefined) {
      numericBranchId = Number(branch_id);
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
    }

    const normalizedEmail = email ? normalizeEmail(String(email)) : undefined;

    const updated = await prisma.$transaction(async (tx) => {
      const staffUpdate = await tx.staff.update({
        where: { id: staffId },
        data: {
          ...(branch_id !== undefined ? { branch_id: numericBranchId } : {}),
          ...(name !== undefined ? { name: String(name).trim() } : {}),
          ...(email !== undefined ? { email: normalizedEmail } : {}),
          ...(phone !== undefined
            ? { phone: phone ? String(phone).trim() : null }
            : {}),
          ...(qualification !== undefined
            ? {
                qualification: qualification
                  ? String(qualification).trim()
                  : null,
              }
            : {}),
          ...(experience !== undefined
            ? { experience: experience ? String(experience).trim() : null }
            : {}),
          ...(specialization !== undefined
            ? {
                specialization: specialization
                  ? String(specialization).trim()
                  : null,
              }
            : {}),
          ...(salary !== undefined
            ? {
                salary:
                  salary !== null && String(salary).trim() !== ""
                    ? new Prisma.Decimal(salary)
                    : null,
              }
            : {}),
          ...(start_date !== undefined
            ? { start_date: start_date ? new Date(start_date) : null }
            : {}),
          ...(end_date !== undefined
            ? { end_date: end_date ? new Date(end_date) : null }
            : {}),
          ...(staff_status !== undefined ? { staff_status } : {}),
          ...(staff_title !== undefined ? { staff_title } : {}),
          modified_at: new Date(),
        },
      });

      if (staffUpdate.user_id) {
        const userUpdateData: Record<string, any> = {};

        if (name !== undefined) userUpdateData.name = String(name).trim();
        if (email !== undefined) userUpdateData.email = normalizedEmail;
        if (password !== undefined && String(password).trim()) {
          userUpdateData.password = await bcrypt.hash(
            String(password).trim(),
            10,
          );
        }

        if (Object.keys(userUpdateData).length > 0) {
          await tx.users.update({
            where: { id: staffUpdate.user_id },
            data: userUpdateData,
          });
        }
      }

      return staffUpdate;
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
    console.error("PUT /api/common/staff error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update staff" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(req);

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const staffId = Number(body.id);

    if (!Number.isFinite(staffId)) {
      return NextResponse.json(
        { success: false, message: "Invalid staff id" },
        { status: 400 },
      );
    }

    const existingStaff = await prisma.staff.findFirst({
      where: {
        id: staffId,
      },
      select: {
        id: true,
        branch_id: true,
        user_id: true,
      },
    });

    if (!existingStaff) {
      return NextResponse.json(
        { success: false, message: "Staff not found" },
        { status: 404 },
      );
    }

    const existingBranch = await prisma.branches.findFirst({
      where: {
        id: existingStaff.branch_id,
        tenant_id: tenantId,
      },
      select: { id: true },
    });

    if (!existingBranch) {
      return NextResponse.json(
        { success: false, message: "Staff does not belong to this tenant" },
        { status: 403 },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.staff.delete({ where: { id: staffId } });

      if (existingStaff.user_id) {
        await tx.users.delete({ where: { id: existingStaff.user_id } });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Staff deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/common/staff error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete staff" },
      { status: 500 },
    );
  }
}