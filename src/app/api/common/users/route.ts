import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { ApiResponse } from '@/lib/api/types';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const tenantId = url.searchParams.get('tenantId');

    const users = await prisma.user.findMany({
      where: tenantId ? { tenant_id: tenantId } : undefined,
      select: {
        id: true,
        tenant_id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    const response: ApiResponse<typeof users> = {
      status: 200,
      message: 'Users fetched successfully',
      error: false,
      errorMessage: null,
      data: users,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching users:', error);
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenant_id, name, email, password, role, is_active } = body;

    // Validate: Super admin doesn't require tenant_id, but other roles do
    if (role !== 'super_admin' && !tenant_id) {
      const response: ApiResponse<null> = {
        status: 400,
        message: 'tenant_id is required for non-super admin users',
        error: true,
        errorMessage: 'tenant_id is required for non-super admin users',
        data: null,
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validate other required fields
    if (!name || !email || !password || !role) {
      const response: ApiResponse<null> = {
        status: 400,
        message: 'name, email, password, and role are required',
        error: true,
        errorMessage: 'name, email, password, and role are required',
        data: null,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date();

    const newUser = await prisma.user.create({
      data: {
        tenant_id: role === 'super_admin' ? undefined : tenant_id, // Set to undefined for super_admin
        name,
        email,
        password: hashedPassword,
        role,
        is_active: is_active ?? true,
        created_at: now,
        updated_at: now,
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;

    const response: ApiResponse<typeof userWithoutPassword> = {
      status: 201,
      message: 'User created successfully',
      error: false,
      errorMessage: null,
      data: userWithoutPassword,
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
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

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, email, password, role, is_active } = body;

    if (!id) {
      const response: ApiResponse<null> = {
        status: 400,
        message: 'User ID is required for update',
        error: true,
        errorMessage: 'User ID is required for update',
        data: null,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const updateData: any = {
      updated_at: new Date(),
    };
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (typeof is_active === 'boolean') updateData.is_active = is_active;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    const { password: _, ...userWithoutPassword } = updatedUser;

    const response: ApiResponse<typeof userWithoutPassword> = {
      status: 200,
      message: 'User updated successfully',
      error: false,
      errorMessage: null,
      data: userWithoutPassword,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating user:', error);
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

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      const response: ApiResponse<null> = {
        status: 400,
        message: 'User ID is required for delete',
        error: true,
        errorMessage: 'User ID is required for delete',
        data: null,
      };
      return NextResponse.json(response, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });

    const response: ApiResponse<null> = {
      status: 200,
      message: 'User deleted successfully',
      error: false,
      errorMessage: null,
      data: null,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error deleting user:', error);
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
