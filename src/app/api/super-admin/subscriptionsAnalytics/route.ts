import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    // Mock monthly revenue trend data can be augmented or fetched similarly here,
    // or you can keep your frontend mock for now.

    return NextResponse.json({ subscriptionTiers });
  } catch (error) {
    console.error('Failed to fetch subscription tiers analytics', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription tiers analytics' },
      { status: 500 }
    );
  }
}
