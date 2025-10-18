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
    // Fetch subscription tiers with counts/sum joined from tenants and billing
    const tiers = await prisma.subscriptionTier.findMany({
      select: {
        id: true,
        name: true,
        student_count_min: true,
        student_count_max: true,
        price_per_student: true,
        billing_cycle: true,
        created_at: true,
        updated_at: true,
        tenants: {
          select: {
            id: true,
            institution_billing: {
              where: { status: 'PAID' },
              select: { total_amount: true },
            },
          },
        },
      },
    });

    // Process active institutions count and total revenue per tier
    const subscriptionTiers = tiers.map((tier) => {
      const active_institutions = tier.tenants.length;
      const total_revenue = tier.tenants.reduce((sum, tenant) => {
        const paidBilling = tenant.institution_billing.reduce(
          (s, billing) => s + (billing.total_amount ?? 0),
          0
        );
        return sum + paidBilling;
      }, 0);

      // Remove tenants from response, add computed fields
      const { tenants, ...rest } = tier;
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
