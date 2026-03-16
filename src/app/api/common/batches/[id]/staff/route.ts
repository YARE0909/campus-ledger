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

    const staffId = Number(body.staff_id);
    const productId = body.product_id ? Number(body.product_id) : null;

    if (!batchId || Number.isNaN(batchId)) {
      return NextResponse.json(
        { success: false, message: "Invalid batch id" },
        { status: 400 },
      );
    }

    if (!staffId || Number.isNaN(staffId)) {
      return NextResponse.json(
        { success: false, message: "staff_id is required" },
        { status: 400 },
      );
    }

    const existing = await prisma.staffmappings.findFirst({
      where: {
        batch_id: batchId,
        staff_id: staffId,
        ...(productId ? { product_id: productId } : {}),
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: true, data: existing, message: "Staff already assigned" },
        { status: 200 },
      );
    }

    const mapping = await prisma.staffmappings.create({
      data: {
        batch_id: batchId,
        staff_id: staffId,
        product_id: productId,
        created_at: new Date(),
      },
      include: {
        staff: true,
        batches: true,
        products: true,
      },
    });

    return NextResponse.json({ success: true, data: mapping }, { status: 201 });
  } catch (error) {
    console.error("POST /api/common/batches/[id]/staff", error);
    return NextResponse.json(
      { success: false, message: "Failed to assign staff" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const batchId = Number(id);
    const body = await req.json();

    const staffId = Number(body.staff_id);

    if (!batchId || Number.isNaN(batchId)) {
      return NextResponse.json(
        { success: false, message: "Invalid batch id" },
        { status: 400 },
      );
    }

    if (!staffId || Number.isNaN(staffId)) {
      return NextResponse.json(
        { success: false, message: "staff_id is required" },
        { status: 400 },
      );
    }

    const deleted = await prisma.staffmappings.deleteMany({
      where: {
        batch_id: batchId,
        staff_id: staffId,
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleted.count,
    });
  } catch (error) {
    console.error("DELETE /api/common/batches/[id]/staff", error);
    return NextResponse.json(
      { success: false, message: "Failed to unassign staff" },
      { status: 500 },
    );
  }
}