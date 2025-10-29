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
      data = await prisma.tenants.findUnique({ where: { id } });
    } else {
      data = await prisma.tenants.findMany();
    }
    const response: ApiResponse<typeof data> = {
      status: 200,
      message: "Tenant(s) retrieved successfully",
      error: false,
      errorMessage: null,
      data,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const response: ApiResponse<null> = {
      status: 500,
      message: "Internal Server Error",
      error: true,
      errorMessage: "Internal Server Error",
      data: null,
    };
    return NextResponse.json(response, { status: 500 });
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
      subscription_tier_id,
      gst
    }: {
      name: string;
      contact_email: string;
      phone?: string;
      address?: string;
      subscription_tier_id: string;
      gst: string
    } = body;

    if (!name || !contact_email || !subscription_tier_id) {
      const response: ApiResponse<null> = {
        status: 400,
        message: "Required fields: name, contact_email, subscription_tier_id",
        error: true,
        errorMessage:
          "Required fields: name, contact_email, subscription_tier_id",
        data: null,
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Create tenant
    const now = new Date();
    const newTenant = await prisma.tenants.create({
      data: {
        name,
        contact_email,
        phone: phone ?? "",
        address: address ?? "",
        gst: gst ?? "", // default or can be extended to accept
        created_at: now,
        updated_at: now,
      },
    });

    // Create default 'Main Branch'
    const mainBranch = await prisma.branches.create({
      data: {
        name: "Main Branch",
        contact_email,
        phone: phone ?? "",
        address: address ?? "",
        gst: "",
        tenant_id: newTenant.id,
        created_at: now,
        updated_at: now,
      },
    });

    // Create TenantSubscription linking tenant to SubscriptionTier
    const newTenantSubscription = await prisma.tenantSubscriptions.create({
      data: {
        tenantsId: newTenant.id,
        subscriptiontierid: subscription_tier_id,
        start_date: now,
        end_date: new Date(now.setFullYear(now.getFullYear() + 1)), // 1-year subscription
        created_at: now,
        updated_at: now,
      },
    });

    // Create default admin user for tenant with unique email and default password 'admin@123'
    // Generate unique email for admin - here using contact_email prefix + admin@tenant
    const adminEmailPrefix = contact_email.split("@")[0];
    const adminEmail = `${adminEmailPrefix}.admin@${
      contact_email.split("@")[1]
    }`;
    const defaultAdminPassword = "admin@123";
    const hashedPassword = await bcrypt.hash(defaultAdminPassword, 10);

    const newUser = await prisma.users.create({
      data: {
        tenant_id: newTenant.id,
        name: `${name} Admin`,
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;

    const response: ApiResponse<{
      tenant: typeof newTenant;
      branch: typeof mainBranch;
      subscription: typeof newTenantSubscription;
      adminUser: typeof userWithoutPassword;
      defaultAdminPassword: string; // returning so frontend can show initial credentials
    }> = {
      status: 201,
      message:
        "Tenant, branch, subscription, and default admin user created successfully",
      error: false,
      errorMessage: null,
      data: {
        tenant: newTenant,
        branch: mainBranch,
        subscription: newTenantSubscription,
        adminUser: userWithoutPassword,
        defaultAdminPassword,
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating tenant:", error);

    const response: ApiResponse<null> = {
      status: 500,
      message: "Internal Server Error",
      error: true,
      errorMessage: "Internal Server Error",
      data: null,
    };

    return NextResponse.json(response, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...fieldsToUpdate } = body;
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
    // Fetch existing tenant to fill gaps for omitted fields
    const existingTenant = await prisma.tenants.findUnique({ where: { id } });
    if (!existingTenant) {
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

    // Prepare update data, fallback to old value if not passed
    const updateData = {
      name: fieldsToUpdate.name ?? existingTenant.name,
      contact_email:
        fieldsToUpdate.contact_email ?? existingTenant.contact_email,
      phone: fieldsToUpdate.phone ?? existingTenant.phone,
      address: fieldsToUpdate.address ?? existingTenant.address,
      gst: fieldsToUpdate.gst ?? existingTenant.gst,
      updated_at: new Date(),
    };
    const updatedTenant = await prisma.tenants.update({
      where: { id },
      data: updateData,
    });

    const response: ApiResponse<typeof updatedTenant> = {
      status: 200,
      message: "Tenant updated successfully",
      error: false,
      errorMessage: null,
      data: updatedTenant,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const response: ApiResponse<null> = {
      status: 500,
      message: "Internal Server Error",
      error: true,
      errorMessage: "Internal Server Error",
      data: null,
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE: Delete tenant (by id from query param)
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const tenantId = url.searchParams.get("id");
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

    // Delete dependent records in correct order to avoid FK errors

    // 1. Delete Notifications created by Users belonging to tenant
    await prisma.notifications.deleteMany({
      where: {
        created_by: {
          in: (
            await prisma.users.findMany({
              where: { tenant_id: tenantId },
              select: { id: true },
            })
          ).map((u) => u.id),
        },
      },
    });

    // 2. Delete Users belonging to the tenant
    await prisma.users.deleteMany({ where: { tenant_id: tenantId } });

    // 3. Find Branches belonging to tenant
    const branches = await prisma.branches.findMany({
      where: { tenant_id: tenantId },
      select: { id: true },
    });
    const branchIds = branches.map((b) => b.id);

    // 4. For each branch, delete dependent records

    // Batches under branches
    const batchIds = (
      await prisma.batches.findMany({
        where: { branch_id: { in: branchIds } },
        select: { id: true },
      })
    ).map((b) => b.id);

    // Delete Attendances related to Batches
    await prisma.attendance.deleteMany({
      where: {
        batch_id: { in: batchIds },
      },
    });

    // Delete EnrollmentBatches related to Batches
    await prisma.enrollmentBatches.deleteMany({
      where: {
        batch_id: { in: batchIds },
      },
    });

    // Delete Batches
    await prisma.batches.deleteMany({
      where: { branch_id: { in: branchIds } },
    });

    // Enrollments under products/students in branches, delete dependent data first

    // Get Products under branches
    const productIds = (
      await prisma.products.findMany({
        where: { branch_id: { in: branchIds } },
        select: { id: true },
      })
    ).map((p) => p.id);

    // Get Students under branches
    const studentIds = (
      await prisma.students.findMany({
        where: { branch_id: { in: branchIds } },
        select: { id: true },
      })
    ).map((s) => s.id);

    // Get Enrollments related to these products and students
    const enrollmentIds = (
      await prisma.enrollments.findMany({
        where: {
          product_id: { in: productIds },
          student_id: { in: studentIds },
        },
        select: { id: true },
      })
    ).map((e) => e.id);

    // Delete Attendance related to Enrollments
    await prisma.attendance.deleteMany({
      where: {
        enrollment_id: { in: enrollmentIds },
      },
    });

    // Delete Performance related to Enrollments or Tenant
    await prisma.performance.deleteMany({
      where: {
        OR: [{ enrollment_id: { in: enrollmentIds } }, { tenant_id: tenantId }],
      },
    });

    // Delete EnrollmentPaymentDetails related to Enrollments
    await prisma.enrollmentPaymentDetails.deleteMany({
      where: {
        enrollment_id: { in: enrollmentIds },
      },
    });

    // Delete Enrollments
    await prisma.enrollments.deleteMany({
      where: {
        id: { in: enrollmentIds },
      },
    });

    // Delete Students under branches
    await prisma.students.deleteMany({
      where: { branch_id: { in: branchIds } },
    });

    // Delete Products under branches and dependent data

    // Delete ProductFees under products
    await prisma.productFees.deleteMany({
      where: { product_id: { in: productIds } },
    });

    await prisma.products.deleteMany({
      where: { branch_id: { in: branchIds } },
    });

    // Delete Staff under branches and related data

    // Get Staff under branches
    const staffIds = (
      await prisma.staff.findMany({
        where: { branch_id: { in: branchIds } },
        select: { id: true },
      })
    ).map((s) => s.id);

    // Delete StaffMappings related to staff
    await prisma.staffMappings.deleteMany({
      where: {
        staff_id: { in: staffIds },
      },
    });

    // Delete Attendance marked by Staff
    await prisma.attendance.deleteMany({
      where: {
        marked_by: { in: staffIds },
      },
    });

    // Delete Performance evaluated by Staff
    await prisma.performance.deleteMany({
      where: {
        evaluated_by: { in: staffIds },
      },
    });

    // Delete Staff
    await prisma.staff.deleteMany({
      where: { branch_id: { in: branchIds } },
    });

    // Delete Invoices under branches
    const invoiceIds = (
      await prisma.invoices.findMany({
        where: {
          branch_id: { in: branchIds },
          student_id: { in: studentIds },
          product_id: { in: productIds },
        },
        select: { id: true },
      })
    ).map((i) => i.id);

    // Delete Payments related to invoices
    await prisma.payments.deleteMany({
      where: { invoice_id: { in: invoiceIds } },
    });

    // Delete Invoices
    await prisma.invoices.deleteMany({
      where: { id: { in: invoiceIds } },
    });

    // Delete InstitutionBilling related to branches
    await prisma.institutionBilling.deleteMany({
      where: { branch_id: { in: branchIds } },
    });

    // Delete Notifications related to branches
    await prisma.notifications.deleteMany({
      where: { branch_id: { in: branchIds } },
    });

    // Delete TenantSubscriptions related to tenant
    await prisma.tenantSubscriptions.deleteMany({
      where: { tenantsId: tenantId },
    });

    // Delete Branches
    await prisma.branches.deleteMany({
      where: { tenant_id: tenantId },
    });

    // Finally, delete the tenant itself
    const deletedTenant = await prisma.tenants.delete({
      where: { id: tenantId },
    });

    const response: ApiResponse<typeof deletedTenant> = {
      status: 200,
      message: "Tenant and all related data deleted successfully",
      error: false,
      errorMessage: null,
      data: deletedTenant,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error deleting tenant:", error);
    const response: ApiResponse<null> = {
      status: 500,
      message: "Internal Server Error",
      error: true,
      errorMessage: "Internal Server Error",
      data: null,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
