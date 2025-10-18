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
    // Total institutions count
    const totalInstitutions = await prisma.tenant.count();

    // Active students count (status = 'ACTIVE')
    const totalActiveStudents = await prisma.student.count({
      where: { status: 'ACTIVE' },
    });

    // Count distinct subscription tiers active among tenants
    const subscriptionTiers = await prisma.tenant.findMany({
      distinct: ['subscription_tier_id'],
      select: { subscription_tier_id: true },
    });
    const activeSubscriptionTiers = subscriptionTiers.length;

    // Sum of total_amount from institution_billing where status = 'PAID'
    const revenueResult = await prisma.institutionBilling.aggregate({
      where: { status: 'PAID' },
      _sum: { total_amount: true },
    });
    const totalRevenue = revenueResult._sum.total_amount ?? 0;

    // Aggregate monthly revenue grouped by month_year (status = 'PAID')
    const monthlyRevenueRaw = await prisma.institutionBilling.groupBy({
      by: ['month_year'],
      where: { status: 'PAID' },
      _sum: { total_amount: true },
      orderBy: { month_year: 'asc' },
    });

    // Map month key e.g. '2025-10' to short month name
    const monthMap: Record<string, string> = {
      '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May',
      '06': 'Jun', '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct',
      '11': 'Nov', '12': 'Dec',
    };

    const monthlyRevenueData = monthlyRevenueRaw.map((item) => ({
      month: monthMap[item.month_year.slice(5, 7)] || item.month_year,
      revenue: item._sum.total_amount ?? 0,
    }));

    // Count institutions with overdue payments
    const overdueInstitutions = await prisma.institutionBilling.count({
      where: { status: 'OVERDUE' },
    });

    // Total courses count
    const totalCourses = await prisma.course.count();

    // Fetch tenants with required related data
    const tenants = await prisma.tenant.findMany({
      include: {
        subscriptionTier: true,
        students: { where: { status: 'ACTIVE' } },
        courses: true,
        institution_billing: {
          orderBy: { month_year: 'desc' },
          take: 1,
          where: { status: { not: 'OVERDUE' } },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Format tenant data for frontend
    const institutions = tenants.map((tenant) => {
      const latestBilling = tenant.institution_billing[0];
      const paymentStatus = latestBilling?.status.toLowerCase() || 'pending';
      const activeStudents = tenant.students.length;
      const totalCoursesCount = tenant.courses.length;
      const monthlyRevenueForTenant = latestBilling?.total_amount ?? 0;

      return {
        id: tenant.id,
        name: tenant.name,
        contact_email: tenant.contact_email,
        phone: tenant.phone,
        address: tenant.address,
        subscription_tier: tenant.subscriptionTier?.name || 'Unknown',
        subscription_tier_id: tenant.subscription_tier_id,
        status: 'active',
        active_students: activeStudents,
        total_courses: totalCoursesCount,
        monthly_revenue: monthlyRevenueForTenant,
        created_at: tenant.created_at.toISOString(),
        last_payment: latestBilling?.month_year || null,
        payment_status: paymentStatus,
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
