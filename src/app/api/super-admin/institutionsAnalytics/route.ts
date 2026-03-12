import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/api/types";

export async function GET() {
  try {
    const totalInstitutions = await prisma.tenants.count();

    const totalActiveStudents = await prisma.students.count({
      where: { status: "ACTIVE" },
    });

    const activeSubscriptionTiersData =
      await prisma.tenantsubscriptions.findMany({
        distinct: ["tenantsubscriptiontier_id"],
        select: { tenantsubscriptiontier_id: true },
      });

    const activeSubscriptionTiers = activeSubscriptionTiersData.length;

    const revenueResult = await prisma.tenantbilling.aggregate({
      where: { bill_status: "Active" },
      _sum: { bill_total_amount: true },
    });

    const totalRevenue = Number(revenueResult._sum.bill_total_amount ?? 0);

    const monthlyRevenueRaw = await prisma.tenantbilling.groupBy({
      by: ["bill_date"],
      where: { bill_status: "Active" },
      _sum: { bill_total_amount: true },
      orderBy: { bill_date: "asc" },
    });

    const monthMap: Record<string, string> = {
      "01": "Jan","02": "Feb","03": "Mar","04": "Apr","05": "May",
      "06": "Jun","07": "Jul","08": "Aug","09": "Sep","10": "Oct",
      "11": "Nov","12": "Dec",
    };

    const monthlyRevenueData = monthlyRevenueRaw.map((item) => {
      const month = item.bill_date.toISOString().slice(5,7);
      return {
        month: monthMap[month] ?? month,
        revenue: Number(item._sum.bill_total_amount ?? 0),
      };
    });

    const overdueInstitutions = await prisma.tenantbilling.count({
      where: { bill_status: "Overdue" },
    });

    const totalCourses = await prisma.products.count();

    const tenants = await prisma.tenants.findMany({
      orderBy: { created_at: "desc" },
    });

    const institutions = [];

    for (const tenant of tenants) {

      const subscription = await prisma.tenantsubscriptions.findFirst({
        where: { tenant_id: tenant.id },
        orderBy: { created_at: "desc" },
        include: {
          tenantsubscriptiontiers: true,
        },
      });

      const tier = subscription?.tenantsubscriptiontiers;

      const branches = await prisma.branches.findMany({
        where: { tenant_id: tenant.id },
      });

      const branchIds = branches.map((b) => b.id);

      const students = await prisma.students.count({
        where: {
          branch_id: { in: branchIds },
          status: "ACTIVE",
        },
      });

      const courses = await prisma.products.count({
        where: { branch_id: { in: branchIds } },
      });

      const latestBilling = await prisma.tenantbilling.findFirst({
        where: { branch_id: { in: branchIds } },
        orderBy: { bill_date: "desc" },
      });

      institutions.push({
        id: tenant.id,
        name: tenant.name,
        contact_email: tenant.contact_email ?? "",
        phone: tenant.phone ?? "",
        address: tenant.address ?? "",
        subscription_tier: tier?.name ?? "Unknown",
        subscription_tier_id: tier?.id ?? null,
        status: "active",
        active_students: students,
        total_courses: courses,
        monthly_revenue: Number(latestBilling?.bill_total_amount ?? 0),
        created_at: tenant.created_at?.toISOString() ?? "",
        last_payment: latestBilling?.bill_date?.toISOString() ?? null,
        payment_status: latestBilling?.bill_status?.toLowerCase() ?? "pending",
        gst: tenant.gst ?? "",
      });
    }

    const response: ApiResponse<any> = {
      status: 200,
      message: "Institutions dashboard data fetched successfully",
      error: false,
      errorMessage: null,
      data: {
        summary: {
          totalInstitutions,
          totalActiveStudents,
          activeSubscriptionTiers,
          totalRevenue,
          monthlyRevenueData,
          overdueInstitutions,
          totalCourses,
        },
        institutions,
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error fetching institutions dashboard data:", error);

    return NextResponse.json(
      {
        status: 500,
        message: "Internal Server Error",
        error: true,
        errorMessage:
          error instanceof Error ? error.message : "Unknown error",
        data: null,
      },
      { status: 500 }
    );
  }
}