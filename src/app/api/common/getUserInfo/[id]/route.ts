import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/api/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params;

  try {
    if (!userId) {
      const response: ApiResponse<null> = {
        status: 400,
        message: 'User ID is required',
        error: true,
        errorMessage: 'Missing user ID',
        data: null,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        Tenant: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      const response: ApiResponse<null> = {
        status: 404,
        message: 'User not found',
        error: true,
        errorMessage: 'No user found for the given ID',
        data: null,
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<typeof user> = {
      status: 200,
      message: 'User fetched successfully',
      error: false,
      errorMessage: null,
      data: user,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching user:', error);
    const response: ApiResponse<null> = {
      status: 500,
      message: 'Internal Server Error',
      error: true,
      errorMessage: 'Failed to fetch user',
      data: null,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
