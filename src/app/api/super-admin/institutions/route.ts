import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { ApiResponse } from '@/lib/api/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      contact_email,
      phone,
      address,
      subscription_tier_id,
    }: {
      name: string;
      contact_email: string;
      phone?: string;
      address?: string;
      subscription_tier_id: string;
    } = body;

    if (!name || !contact_email || !subscription_tier_id) {
      const response: ApiResponse<null> = {
        status: 400,
        message: 'Required fields: name, contact_email, subscription_tier_id',
        error: true,
        errorMessage: 'Required fields: name, contact_email, subscription_tier_id',
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
        phone: phone ?? '',
        address: address ?? '',
        gst: '', // default or can be extended to accept
        created_at: now,
        updated_at: now,
      },
    });

    // Create default 'Main Branch'
    const mainBranch = await prisma.branches.create({
      data: {
        name: 'Main Branch',
        contact_email,
        phone: phone ?? '',
        address: address ?? '',
        gst: '',
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
    const adminEmailPrefix = contact_email.split('@')[0];
    const adminEmail = `${adminEmailPrefix}.admin@${contact_email.split('@')[1]}`;
    const defaultAdminPassword = 'admin@123';
    const hashedPassword = await bcrypt.hash(defaultAdminPassword, 10);

    const newUser = await prisma.users.create({
      data: {
        tenant_id: newTenant.id,
        name: `${name} Admin`,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
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
      message: 'Tenant, branch, subscription, and default admin user created successfully',
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
    console.error('Error creating tenant:', error);

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
