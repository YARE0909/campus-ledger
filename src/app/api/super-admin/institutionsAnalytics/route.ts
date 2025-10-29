import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/api/types';

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface Summary {
  totalInstitutions: number;
  totalActiveStudents: number;
  activeSubscriptionTiers: number;
  totalRevenue: number;
  monthlyRevenueData: MonthlyRevenue[];
  overdueInstitutions: number;
  totalCourses: number;
}

export interface Institution {
  id: string;
  name: string;
  contact_email: string;
  phone: string;
  address: string;
  subscription_tier: string;
  subscription_tier_id: string;
  status: string;
  active_students: number;
  total_courses: number;
  monthly_revenue: number;
  created_at: string;
  last_payment: string | null;
  payment_status: string;
}

export interface InstitutionsDashboardData {
  summary: Summary;
  institutions: Institution[];
}

export async function GET() {
  try {
    // Total tenants count
    const totalInstitutions = await prisma.tenants.count();

    // Get active students count across all branches
    const totalActiveStudents = await prisma.students.count({
      where: { status: 'ACTIVE' },
    });

    // Count distinct subscription tiers active among tenants (via TenantSubscriptions)
    const activeSubscriptionTiersData = await prisma.tenantSubscriptions.findMany({
      distinct: ['subscriptiontierid'],
      select: { subscriptiontierid: true },
    });
    const activeSubscriptionTiers = activeSubscriptionTiersData.length;

    // Total revenue sum from InstitutionBilling where status = 'PAID'
    const revenueResult = await prisma.institutionBilling.aggregate({
      where: { status: 'PAID' },
      _sum: { total_amount: true },
    });
    const totalRevenue = revenueResult._sum.total_amount ?? 0;

    // Group monthly revenue from InstitutionBilling
    const monthlyRevenueRaw = await prisma.institutionBilling.groupBy({
      by: ['month_year'],
      where: { status: 'PAID' },
      _sum: { total_amount: true },
      orderBy: { month_year: 'asc' },
    });

    const monthMap: Record<string, string> = {
      '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May',
      '06': 'Jun', '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct',
      '11': 'Nov', '12': 'Dec',
    };

    const monthlyRevenueData = monthlyRevenueRaw.map(item => ({
      month: monthMap[item.month_year.slice(5, 7)] || item.month_year,
      revenue: item._sum.total_amount ?? 0,
    }));

    // Count institutions with overdue payments
    const overdueInstitutions = await prisma.institutionBilling.count({
      where: { status: 'OVERDUE' },
    });

    // Total product count (courses)
    const totalCourses = await prisma.products.count();

    // Fetch tenants with subscription tier and related nested data
    const tenants = await prisma.tenants.findMany({
      include: {
        TenantSubscriptions: {
          include: { subscriptiontier: true },
          orderBy: { created_at: 'desc' },
          take: 1, // latest subscription
        },
        Branches: {
          include: {
            Students: {
              where: { status: 'ACTIVE' },
            },
            Products: true,
            InstitutionBilling: {
              orderBy: { month_year: 'desc' },
              take: 1,
              where: { status: { not: 'OVERDUE' } },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const institutions: Institution[] = tenants.map(tenant => {
      // Get latest subscription tier info
      const latestSubscription = tenant.TenantSubscriptions[0];
      const subscriptionTier = latestSubscription?.subscriptiontier;

      // Aggregate active students sum across all branches for tenant
      const activeStudents = tenant.Branches.reduce(
        (sum, branch) => sum + (branch.Students?.length ?? 0),
        0
      );

      // Aggregate total courses (products) across branches
      const totalCoursesCount = tenant.Branches.reduce(
        (sum, branch) => sum + (branch.Products?.length ?? 0),
        0
      );

      // Get latest billing info from all branches, choose latest overall
      const latestBillings = tenant.Branches
        .flatMap(branch => branch.InstitutionBilling)
        .sort((a, b) => (a.month_year < b.month_year ? 1 : -1));
      const latestBilling = latestBillings[0];

      const paymentStatus = latestBilling?.status.toLowerCase() || 'pending';
      const monthlyRevenueForTenant = latestBilling?.total_amount ?? 0;

      return {
        id: tenant.id,
        name: tenant.name,
        contact_email: tenant.contact_email,
        phone: tenant.phone,
        address: tenant.address,
        subscription_tier: subscriptionTier?.name || 'Unknown',
        subscription_tier_id: subscriptionTier?.id || '',
        status: 'active',
        active_students: activeStudents,
        total_courses: totalCoursesCount,
        monthly_revenue: monthlyRevenueForTenant,
        created_at: tenant.created_at.toISOString(),
        last_payment: latestBilling?.month_year || null,
        payment_status: paymentStatus,
        gst: tenant.gst || '',
      };
    });

    const responseData: InstitutionsDashboardData = {
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
    };

    const response: ApiResponse<InstitutionsDashboardData> = {
      status: 200,
      message: 'Institutions dashboard data fetched successfully',
      error: false,
      errorMessage: null,
      data: responseData,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching institutions dashboard data:', error);

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
