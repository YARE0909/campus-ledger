import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/api/types";

export interface SubscriptionTierAnalytics {
  id: number;
  name: string;
  student_count_min: number;
  student_count_max: number;
  price_per_student: number;
  billing_cycle: string;
  created_at: Date | null;
  modified_at: Date | null;
  active_institutions: number;
  total_revenue: number;
}

export interface SubscriptionTiersAnalyticsData {
  subscriptionTiers: SubscriptionTierAnalytics[];
}

export async function GET() {
  try {
    const tiers = await prisma.tenantsubscriptiontiers.findMany({
      include: {
        tenantsubscriptions: {
          select: { tenant_id: true },
        },
        tenantbilling: {
          where: { bill_status: "Active" },
          select: { bill_total_amount: true },
        },
      },
    });

    const subscriptionTiers: SubscriptionTierAnalytics[] = tiers.map((tier) => {
      const active_institutions = new Set(
        tier.tenantsubscriptions.map((ts) => ts.tenant_id)
      ).size;

      const total_revenue = tier.tenantbilling.reduce(
        (sum, billing) => sum + Number(billing.bill_total_amount ?? 0),
        0
      );

      return {
        id: tier.id,
        name: tier.name,
        student_count_min: tier.student_count_min,
        student_count_max: tier.student_count_max,
        price_per_student: Number(tier.price_per_student),
        billing_cycle: tier.billing_cycle,
        created_at: tier.created_at,
        modified_at: tier.modified_at,
        active_institutions,
        total_revenue,
      };
    });

    const responseData: SubscriptionTiersAnalyticsData = {
      subscriptionTiers,
    };

    const response: ApiResponse<SubscriptionTiersAnalyticsData> = {
      status: 200,
      message: "Subscription tiers analytics fetched successfully",
      error: false,
      errorMessage: null,
      data: responseData,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch subscription tiers analytics", error);

    return NextResponse.json(
      {
        status: 500,
        message: "Failed to fetch subscription tiers analytics",
        error: true,
        errorMessage:
          error instanceof Error ? error.message : "Unknown error",
        data: null,
      },
      { status: 500 }
    );
  }
}