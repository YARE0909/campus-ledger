import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type ApiResponse<T> = {
  status: number;
  message: string;
  error: boolean;
  errorMessage: string | null;
  data: T | null;
};

export interface SubscriptionTier {
  id: string;
  name: string;
}

export interface SubscriptionTierFull {
  id: string;
  name: string;
  student_count_min: number;
  student_count_max: number;
  price_per_student: number;
  billing_cycle: string;
  created_at: Date;
  updated_at: Date;
}

// GET: Fetch all subscription tiers (id and name)
export async function GET() {
  try {
    const tiers = await prisma.subscriptionTiers.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });

    const response: ApiResponse<SubscriptionTier[]> = {
      status: 200,
      message: 'Subscription tiers fetched successfully',
      error: false,
      errorMessage: null,
      data: tiers,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch subscription tiers:', error);

    const response: ApiResponse<null> = {
      status: 500,
      message: 'Failed to fetch subscription tiers',
      error: true,
      errorMessage: 'Failed to fetch subscription tiers',
      data: null,
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// POST: Create a new subscription tier
export async function POST(request: Request) {
  try {
    const body = await request.json();

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
      const response: ApiResponse<null> = {
        status: 400,
        message: 'Missing required subscription tier fields',
        error: true,
        errorMessage: 'Missing required subscription tier fields',
        data: null,
      };

      return NextResponse.json(response, { status: 400 });
    }

    const now = new Date();

    const newTier = await prisma.subscriptionTiers.create({
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

    const response: ApiResponse<typeof newTier> = {
      status: 201,
      message: 'Subscription tier created successfully',
      error: false,
      errorMessage: null,
      data: newTier,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Failed to create subscription tier:', error);

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
