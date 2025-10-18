import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '1h'; // or your preferred expiration

export async function POST(request: Request) {
  try {
    const { email, password }: { email: string; password: string } = await request.json();

    if (!email || !password) {
      return NextResponse.json({
        status: 400,
        message: "Email and password required",
        error: true,
        errorMessage: "Email and password required",
        data: null,
      }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({
        status: 401,
        message: "Invalid email or password",
        error: true,
        errorMessage: "Invalid email or password",
        data: null,
      }, { status: 401 });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({
        status: 401,
        message: "Invalid email or password",
        error: true,
        errorMessage: "Invalid email or password",
        data: null,
      }, { status: 401 });
    }

    // Create JWT payload
    const payload = {
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return NextResponse.json({
      status: 200,
      message: "Login successful",
      error: false,
      errorMessage: null,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      status: 500,
      message: "Internal Server Error",
      error: true,
      errorMessage: "Internal Server Error",
      data: null,
    }, { status: 500 });
  }
}
