// app/api/courses/[id]/staff/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const courseId = Number(id);

    const assignments = await prisma.staffmappings.findMany({
      where: { product_id: courseId },
      include: {
        staff: true,
        batches: true,
        products: true,
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(
      { success: true, data: assignments },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/courses/[id]/staff error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch staff assignments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const courseId = Number(id);
    const body = await request.json();

    const { staff_id, batch_id, staff_ids } = body;

    if (!batch_id) {
      return NextResponse.json(
        { success: false, message: "batch_id is required" },
        { status: 400 }
      );
    }

    const course = await prisma.products.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    const batch = await prisma.batches.findUnique({
      where: { id: Number(batch_id) },
    });

    if (!batch) {
      return NextResponse.json(
        { success: false, message: "Batch not found" },
        { status: 404 }
      );
    }

    const staffIds: number[] = Array.isArray(staff_ids)
      ? staff_ids.map((s: any) => Number(s))
      : staff_id
        ? [Number(staff_id)]
        : [];

    if (staffIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "staff_id or staff_ids is required" },
        { status: 400 }
      );
    }

    const results = await prisma.$transaction(
      staffIds.map((sid) =>
        prisma.staffmappings.create({
          data: {
            batch_id: Number(batch_id),
            product_id: courseId,
            staff_id: sid,
            created_at: new Date(),
            modified_at: new Date(),
          },
        })
      )
    );

    return NextResponse.json(
      { success: true, data: results },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/courses/[id]/staff error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to assign staff" },
      { status: 500 }
    );
  }
}