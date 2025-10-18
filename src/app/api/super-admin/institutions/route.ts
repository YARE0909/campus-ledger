import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

    const subscriptionTierId = subscription_tier_id.toString();

    const newTenant = await prisma.tenant.create({
      data: {
        name,
        contact_email,
        phone: phone ?? '',
        address: address ?? '',
        subscription_tier_id: subscriptionTierId,
      },
    });

    const response: ApiResponse<typeof newTenant> = {
      status: 201,
      message: 'Tenant created successfully',
      error: false,
      errorMessage: null,
      data: newTenant,
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
