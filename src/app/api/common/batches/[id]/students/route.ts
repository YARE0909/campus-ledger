import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(req: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const batchId = Number(id);

    const body = await req.json();

    const studentId = Number(body.student_id);
    const productId = Number(body.product_id);

    if (!batchId || Number.isNaN(batchId)) {
      return NextResponse.json(
        { success: false, message: "Invalid batch id" },
        { status: 400 },
      );
    }

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: "student_id required" },
        { status: 400 },
      );
    }

    if (body.product_id) {
      const product = await prisma.products.findUnique({
        where: { id: Number(body.product_id) },
      });

      if (!product) {
        return NextResponse.json(
          { success: false, message: "Invalid product_id" },
          { status: 400 },
        );
      }
    }

    const enrollment = await prisma.enrollments.create({
      data: {
        student_id: studentId,
        product_id: body.product_id ? Number(body.product_id) : null,
        start_date: new Date(body.start_date),
        end_date: body.end_date ? new Date(body.end_date) : null,
        status: "Active",
      },
    });
    const enrollmentBatch = await prisma.enrollmentbatches.create({
      data: {
        batch_id: batchId,
        enrollment_id: enrollment.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: { enrollment, enrollmentBatch },
    });
  } catch (error) {
    console.error("Enroll student error", error);

    return NextResponse.json(
      { success: false, message: "Failed to enroll student" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const batchId = Number(id);

    const body = await req.json();
    const studentId = Number(body.student_id);

    const enrollmentBatch = await prisma.enrollmentbatches.findFirst({
      where: {
        batch_id: batchId,
        enrollments: {
          is: {
            student_id: studentId,
          },
        },
      },
      include: {
        enrollments: true,
      },
    });

    if (!enrollmentBatch) {
      return NextResponse.json(
        { success: false, message: "Enrollment not found" },
        { status: 404 },
      );
    }

    await prisma.enrollmentbatches.delete({
      where: { id: enrollmentBatch.id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Unenroll student error", error);

    return NextResponse.json(
      { success: false, message: "Failed to unenroll student" },
      { status: 500 },
    );
  }
}
