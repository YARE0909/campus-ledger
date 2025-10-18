import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tiers = await prisma.subscriptionTier.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(tiers);
  } catch (error) {
    console.error('Failed to fetch subscription tiers:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription tiers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Destructure and validate required fields
    const {
      name,
      student_count_min,
      student_count_max,
      price_per_student,
      billing_cycle,
    }: {
      name: string;
      student_count_min: number;
      student_count_max: number;
      price_per_student: number;
      billing_cycle: string;
    } = body;

    if (
      !name ||
      student_count_min === undefined ||
      student_count_max === undefined ||
      price_per_student === undefined ||
      !billing_cycle
    ) {
      return NextResponse.json(
        { error: 'Missing required subscription tier fields.' },
        { status: 400 }
      );
    }

    const now = new Date();

    // Create subscription tier
    const newTier = await prisma.subscriptionTier.create({
      data: {
        name,
        student_count_min,
        student_count_max,
        price_per_student,
        billing_cycle,
        created_at: now,
        updated_at: now,
      },
    });

    return NextResponse.json(newTier, { status: 201 });
  } catch (error) {
    console.error('Failed to create subscription tier:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}