import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type ApiResponse<T> = {
  status: number;
  message: string;
  error: boolean;
  errorMessage: string | null;
  data: T | null;
};

export interface SubscriptionTierAnalytics {
  id: string;
  name: string;
  student_count_min: number;
  student_count_max: number;
  price_per_student: number;
  billing_cycle: string;
  created_at: Date;
  updated_at: Date;
  active_institutions: number;
  total_revenue: number;
}

export interface SubscriptionTiersAnalyticsData {
  subscriptionTiers: SubscriptionTierAnalytics[];
}

export async function GET() {
  try {
    // Fetch subscription tiers with tenant subscriptions and revenue
    const tiers = await prisma.subscriptionTiers.findMany({
      include: {
        TenantSubscriptions: {
          include: {
            Tenants: {
              select: {
                id: true,
              },
            },
          },
        },
        InstitutionBilling: {
          where: { status: 'PAID' },
          select: { total_amount: true },
        },
      },
    });

    // Process active institutions count and revenue
    const subscriptionTiers = tiers.map((tier) => {
      // Active institutions count (count unique tenants linked via TenantSubscriptions)
      const active_institutions = new Set(
        tier.TenantSubscriptions.map((ts) => ts.tenantsId)
      ).size;

      // Sum total_amount from institution billings linked to this tier
      const total_revenue = tier.InstitutionBilling.reduce(
        (sum, billing) => sum + (billing.total_amount ?? 0),
        0
      );

      const {
        TenantSubscriptions,
        InstitutionBilling,
        ...rest
      } = tier;

      return {
        ...rest,
        active_institutions,
        total_revenue,
      };
    });

    const responseData: SubscriptionTiersAnalyticsData = {
      subscriptionTiers,
    };

    const response: ApiResponse<SubscriptionTiersAnalyticsData> = {
      status: 200,
      message: 'Subscription tiers analytics fetched successfully',
      error: false,
      errorMessage: null,
      data: responseData,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch subscription tiers analytics', error);

    const response: ApiResponse<null> = {
      status: 500,
      message: 'Failed to fetch subscription tiers analytics',
      error: true,
      errorMessage: 'Failed to fetch subscription tiers analytics',
      data: null,
    };

    return NextResponse.json(response, { status: 500 });
  }
}
