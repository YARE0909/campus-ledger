import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Destructure fields (subscription_tier_id should be a string ObjectId)
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
      subscription_tier_id: string; // Must be string (MongoDB ObjectId)
    } = body;

    if (!name || !contact_email || !subscription_tier_id) {
      return NextResponse.json(
        { error: 'Required fields: name, contact_email, subscription_tier_id' },
        { status: 400 }
      );
    }

    // Ensure subscription_tier_id is a string (casting just in case)
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

    return NextResponse.json(newTenant, { status: 201 });
  } catch (error) {
    console.error('Error creating tenant:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
