// app/api/staff/[id]/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const assignments = await prisma.staffmappings.findMany({
      where: { staff_id: Number(id) },
      include: {
        products: true,
        batches: true,
        staff: true,
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(
      { success: true, data: assignments },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/staff/[id]/courses error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch assigned courses" },
      { status: 500 }
    );
  }
}