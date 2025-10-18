import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  // Fetch all data in parallel
  const [
    totalInstitutions,
    totalActiveStudents,
    activeSubscriptionTiersData,
    totalRevenueAgg,
    monthlyRevenueRaw,
    enrollmentStatusRaw,
    institutionsByTierRaw,
    overdueInstitutions,
    totalCourses,
  ] = await Promise.all([
    prisma.tenant.count(),
    prisma.student.count({ where: { status: 'ACTIVE' } }),
    prisma.tenant.findMany({ distinct: ['subscription_tier_id'], select: { subscription_tier_id: true } }),
    prisma.institutionBilling.aggregate({
      where: { status: 'PAID' },
      _sum: { total_amount: true },
    }),
    prisma.institutionBilling.groupBy({
      by: ['month_year'],
      where: { status: 'PAID' },
      _sum: { total_amount: true },
      orderBy: { month_year: 'asc' },
    }),
    prisma.enrollment.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    prisma.tenant.groupBy({
      by: ['subscription_tier_id'],
      _count: { subscription_tier_id: true },
    }),
    prisma.institutionBilling.count({ where: { status: 'OVERDUE' } }),
    prisma.course.count(),
  ]);

  // Process active subscription tiers count
  const activeSubscriptionTiers = activeSubscriptionTiersData.length;

  // Process total revenue sum safely
  const totalRevenue = totalRevenueAgg._sum.total_amount ?? 0;

  // Map month_year to short month names
  const monthsMap: Record<string, string> = {
    '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May',
    '06': 'Jun', '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct',
    '11': 'Nov', '12': 'Dec',
  };

  const monthlyRevenueData = monthlyRevenueRaw.map(d => ({
    month: monthsMap[d.month_year.slice(5,7)] || d.month_year,
    revenue: d._sum.total_amount ?? 0,
  }));

  // Colors per enrollment status
  const colors: Record<string, string> = {
    'ACTIVE': '#6366f1',
    'COMPLETED': '#10b981',
    'DROPPED': '#ef4444',
  };

  const enrollmentStatusData = enrollmentStatusRaw.map(d => ({
    name: d.status.charAt(0).toUpperCase() + d.status.toLowerCase().slice(1),
    value: d._count.status,
    color: colors[d.status.toUpperCase()] ?? '#999',
  }));

  // Fetch tier names for institutionsByTier
  const tierIds = institutionsByTierRaw.map(d => d.subscription_tier_id);
  const tiers = await prisma.subscriptionTier.findMany({
    where: { id: { in: tierIds } },
  });

  const institutionsByTierData = institutionsByTierRaw.map(d => {
    const tier = tiers.find(t => t.id === d.subscription_tier_id);
    return {
      tier: tier?.name ?? 'Unknown',
      count: d._count.subscription_tier_id,
    };
  });

  return NextResponse.json({
    totalInstitutions,
    totalActiveStudents,
    activeSubscriptionTiers,
    totalRevenue,
    monthlyRevenueData,
    enrollmentStatusData,
    institutionsByTierData,
    overdueInstitutions,
    totalCourses,
  });
}
