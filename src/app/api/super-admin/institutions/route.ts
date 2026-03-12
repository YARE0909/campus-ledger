import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { ApiResponse } from "@/lib/api/types";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    let data;

    if (id) {
      data = await prisma.tenants.findUnique({
        where: { id: Number(id) },
        include: {
          tenantsubscriptions: {
            include: {
              tenantsubscriptiontiers: true,
            },
          },
        },
      });
    } else {
      data = await prisma.tenants.findMany({
        include: {
          tenantsubscriptions: {
            include: {
              tenantsubscriptiontiers: true,
            },
          },
        },
      });
    }

    const response: ApiResponse<typeof data> = {
      status: 200,
      message: "Tenant(s) retrieved successfully",
      error: false,
      errorMessage: null,
      data,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        status: 500,
        message: "Internal Server Error",
        error: true,
        errorMessage: "Internal Server Error",
        data: null,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      contact_email,
      phone,
      address,
      tenantsubscriptiontier_id,
      gst,
    } = body;

    if (!name || !contact_email || !tenantsubscriptiontier_id) {
      return NextResponse.json(
        {
          status: 400,
          message:
            "Required fields: name, contact_email, tenantsubscriptiontier_id",
          error: true,
          errorMessage:
            "Required fields: name, contact_email, tenantsubscriptiontier_id",
          data: null,
        },
        { status: 400 }
      );
    }

    const now = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    const result = await prisma.$transaction(async (tx: { tenants: { create: (arg0: { data: { name: any; contact_email: any; phone: any; address: any; gst: any; created_at: Date; modified_at: Date; }; }) => any; }; branches: { create: (arg0: { data: { name: string; contact_email: any; phone: any; address: any; gst: string; tenant_id: any; created_at: Date; modified_at: Date; }; }) => any; }; tenantsubscriptions: { create: (arg0: { data: { tenant_id: any; tenantsubscriptiontier_id: number; start_date: Date; end_date: Date; created_at: Date; modified_at: Date; }; }) => any; }; users: { create: (arg0: { data: { tenant_id: any; name: string; email: string; password: string; role: string; is_active: boolean; created_at: Date; modified_at: Date; }; }) => any; }; }) => {
      const tenant = await tx.tenants.create({
        data: {
          name,
          contact_email,
          phone: phone ?? "",
          address: address ?? "",
          gst: gst ?? "",
          created_at: now,
          modified_at: now,
        },
      });

      const branch = await tx.branches.create({
        data: {
          name: "Main Branch",
          contact_email,
          phone: phone ?? "",
          address: address ?? "",
          gst: "",
          tenant_id: tenant.id,
          created_at: now,
          modified_at: now,
        },
      });

      const subscription = await tx.tenantsubscriptions.create({
        data: {
          tenant_id: tenant.id,
          tenantsubscriptiontier_id: Number(tenantsubscriptiontier_id),
          start_date: now,
          end_date: endDate,
          created_at: now,
          modified_at: now,
        },
      });

      const emailParts = contact_email.split("@");
      const adminEmail = `${emailParts[0]}.admin@${emailParts[1]}`;

      const defaultAdminPassword = "admin@123";
      const hashedPassword = await bcrypt.hash(defaultAdminPassword, 10);

      const user = await tx.users.create({
        data: {
          tenant_id: tenant.id,
          name: `${name} Admin`,
          email: adminEmail,
          password: hashedPassword,
          role: "admin",
          is_active: true,
          created_at: now,
          modified_at: now,
        },
      });

      const { password: _, ...userWithoutPassword } = user;

      return {
        tenant,
        branch,
        subscription,
        adminUser: userWithoutPassword,
        defaultAdminPassword,
      };
    });

    const response: ApiResponse<typeof result> = {
      status: 201,
      message:
        "Tenant, branch, subscription, and default admin user created successfully",
      error: false,
      errorMessage: null,
      data: result,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating tenant:", error);

    return NextResponse.json(
      {
        status: 500,
        message: "Internal Server Error",
        error: true,
        errorMessage: "Internal Server Error",
        data: null,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json(
        {
          status: 400,
          message: "Tenant id is required",
          error: true,
          errorMessage: "Tenant id is required",
          data: null,
        },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenants.findUnique({
      where: { id: Number(id) },
    });

    if (!tenant) {
      return NextResponse.json(
        {
          status: 404,
          message: "Tenant not found",
          error: true,
          errorMessage: "Tenant not found",
          data: null,
        },
        { status: 404 }
      );
    }

    const updatedTenant = await prisma.tenants.update({
      where: { id: Number(id) },
      data: {
        name: fields.name ?? tenant.name,
        contact_email: fields.contact_email ?? tenant.contact_email,
        phone: fields.phone ?? tenant.phone,
        address: fields.address ?? tenant.address,
        gst: fields.gst ?? tenant.gst,
        modified_at: new Date(),
      },
    });

    return NextResponse.json({
      status: 200,
      message: "Tenant updated successfully",
      error: false,
      errorMessage: null,
      data: updatedTenant,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        status: 500,
        message: "Internal Server Error",
        error: true,
        errorMessage: "Internal Server Error",
        data: null,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const tenantId = Number(url.searchParams.get("id"));

    if (!tenantId) {
      return NextResponse.json(
        {
          status: 400,
          message: "Tenant id is required",
          error: true,
          errorMessage: "Tenant id is required",
          data: null,
        },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx: { users: { deleteMany: (arg0: { where: { tenant_id: number; }; }) => any; }; branches: { findMany: (arg0: { where: { tenant_id: number; }; select: { id: boolean; }; }) => any; deleteMany: (arg0: { where: { tenant_id: number; }; }) => any; }; tenantbilling: { deleteMany: (arg0: { where: { branch_id: { in: any; }; }; }) => any; }; notifications: { deleteMany: (arg0: { where: { branch_id: { in: any; }; }; }) => any; }; students: { deleteMany: (arg0: { where: { branch_id: { in: any; }; }; }) => any; }; products: { deleteMany: (arg0: { where: { branch_id: { in: any; }; }; }) => any; }; batches: { deleteMany: (arg0: { where: { branch_id: { in: any; }; }; }) => any; }; staff: { deleteMany: (arg0: { where: { branch_id: { in: any; }; }; }) => any; }; tenantsubscriptions: { deleteMany: (arg0: { where: { tenant_id: number; }; }) => any; }; tenants: { delete: (arg0: { where: { id: number; }; }) => any; }; }) => {
      await tx.users.deleteMany({ where: { tenant_id: tenantId } });

      const branches = await tx.branches.findMany({
        where: { tenant_id: tenantId },
        select: { id: true },
      });

      const branchIds = branches.map((b: { id: any; }) => b.id);

      await tx.tenantbilling.deleteMany({
        where: { branch_id: { in: branchIds } },
      });

      await tx.notifications.deleteMany({
        where: { branch_id: { in: branchIds } },
      });

      await tx.students.deleteMany({
        where: { branch_id: { in: branchIds } },
      });

      await tx.products.deleteMany({
        where: { branch_id: { in: branchIds } },
      });

      await tx.batches.deleteMany({
        where: { branch_id: { in: branchIds } },
      });

      await tx.staff.deleteMany({
        where: { branch_id: { in: branchIds } },
      });

      await tx.branches.deleteMany({
        where: { tenant_id: tenantId },
      });

      await tx.tenantsubscriptions.deleteMany({
        where: { tenant_id: tenantId },
      });

      await tx.tenants.delete({
        where: { id: tenantId },
      });
    });

    return NextResponse.json({
      status: 200,
      message: "Tenant and related data deleted successfully",
      error: false,
      errorMessage: null,
      data: { id: tenantId },
    });
  } catch (error) {
    console.error("Error deleting tenant:", error);

    return NextResponse.json(
      {
        status: 500,
        message: "Internal Server Error",
        error: true,
        errorMessage: "Internal Server Error",
        data: null,
      },
      { status: 500 }
    );
  }
}