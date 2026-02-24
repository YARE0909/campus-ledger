import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [totalPayments, payments, recentPayments] =
      await Promise.all([
        prisma.payments.count(),

        prisma.payments.findMany({
          include: {
            Invoice: true,
          },
        }),

        prisma.payments.findMany({
          take: 5,
          orderBy: {
            paid_on: "desc",
          },
          include: {
            Invoice: {
              include: {
                Student: true,
                Product: true,
              },
            },
          },
        }),
      ]);

    // total revenue
    let totalRevenue = 0;

    // monthly revenue
    const monthlyRevenue: Record<string, number> = {};

    payments.forEach((p) => {
      const amount = p.Invoice?.amount || 0;
      totalRevenue += amount;

      const month = p.paid_on.toISOString().slice(0, 7);

      monthlyRevenue[month] =
        (monthlyRevenue[month] || 0) + amount;
    });

    return NextResponse.json({
      success: true,
      data: {
        totalPayments,
        totalRevenue,
        monthlyRevenue,
        recentPayments,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch payment stats" },
      { status: 500 }
    );
  }
}