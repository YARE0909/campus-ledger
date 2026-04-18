// app/api/courses/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const course = await prisma.products.findUnique({
      where: { id: Number(id) },
      include: {
        coursetopics: true,
        staffmappings: {
          include: {
            staff: true,
            batches: true,
          },
        },
        enrollments: true,
        productfees: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: course }, { status: 200 });
  } catch (error) {
    console.error("GET /api/courses/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.products.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.products.update({
      where: { id: Number(id) },
      data: {
        branch_id:
          body.branch_id !== undefined ? Number(body.branch_id) : undefined,
        name: body.name,
        description: body.description ?? undefined,
        max_classes:
          body.max_classes !== undefined ? Number(body.max_classes) : undefined,
        comp_classes:
          body.comp_classes !== undefined ? Number(body.comp_classes) : undefined,
        start_date: body.start_date ? new Date(body.start_date) : undefined,
        end_date: body.end_date ? new Date(body.end_date) : undefined,
        status: body.status ?? undefined,
        modified_at: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/courses/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update course" },
      { status: 500 }
    );
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    await prisma.products.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(
      { success: true, message: "Course deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/courses/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete course" },
      { status: 500 }
    );
  }
}