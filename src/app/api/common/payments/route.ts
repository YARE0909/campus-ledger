import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/payments
export async function GET() {
  try {
    const payments = await prisma.payments.findMany({
      orderBy: {
        paid_on: "desc",
      },
      include: {
        Invoice: {
          include: {
            Student: true,
            Product: true,
            Branch: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch payments",
      },
      { status: 500 }
    );
  }
}