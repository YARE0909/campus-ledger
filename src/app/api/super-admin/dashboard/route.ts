import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/api/types';

export async function GET() {
  try {
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
      prisma.tenants.count(),
      prisma.students.count({ where: { status: 'ACTIVE' } }),
      prisma.tenantSubscriptions.findMany({
        distinct: ['subscriptiontierid'],
        select: { subscriptiontierid: true },
      }),
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
      prisma.enrollments.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.tenantSubscriptions.groupBy({
        by: ['subscriptiontierid'],
        _count: { subscriptiontierid: true },
      }),
      prisma.institutionBilling.count({ where: { status: 'OVERDUE' } }),
      prisma.products.count(),
    ]);

    const activeSubscriptionTiers = activeSubscriptionTiersData.length;
    const totalRevenue = totalRevenueAgg._sum.total_amount ?? 0;

    const monthsMap: Record<string, string> = {
      '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May',
      '06': 'Jun', '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct',
      '11': 'Nov', '12': 'Dec',
    };

    const monthlyRevenueData = monthlyRevenueRaw.map(d => ({
      month: monthsMap[d.month_year.slice(5,7)] || d.month_year,
      revenue: d._sum.total_amount ?? 0,
    }));

    const colors: Record<string, string> = {
      'ACTIVE': '#6366f1',
      'COMPLETED': '#10b981',
      'QUIT': '#ef4444',
    };

    const enrollmentStatusData = enrollmentStatusRaw.map(d => ({
      name: d.status.charAt(0).toUpperCase() + d.status.toLowerCase().slice(1),
      value: d._count.status,
      color: colors[d.status.toUpperCase()] ?? '#999',
    }));

    const tierIds = institutionsByTierRaw.map(d => d.subscriptiontierid);
    const tiers = await prisma.subscriptionTiers.findMany({
      where: { id: { in: tierIds } },
    });

    const institutionsByTierData = institutionsByTierRaw.map(d => {
      const tier = tiers.find(t => t.id === d.subscriptiontierid);
      return {
        tier: tier?.name ?? 'Unknown',
        count: d._count.subscriptiontierid,
      };
    });

    const responseData = {
      totalInstitutions,
      totalActiveStudents,
      activeSubscriptionTiers,
      totalRevenue,
      monthlyRevenueData,
      enrollmentStatusData,
      institutionsByTierData,
      overdueInstitutions,
      totalCourses,
    };

    const response: ApiResponse<typeof responseData> = {
      status: 200,
      message: 'Dashboard data fetched successfully',
      error: false,
      errorMessage: null,
      data: responseData,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    const response: ApiResponse<null> = {
      status: 500,
      message: 'Internal Server Error',
      error: true,
      errorMessage: 'Internal Server Error',
      data: null,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
