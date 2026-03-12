import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/api/types";
import { Prisma } from "@prisma/client";

function parseDate(value: unknown): Date | undefined {
  if (value instanceof Date && !isNaN(value.getTime())) return value;

  if (typeof value === "string" && value.trim() !== "") {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
  }

  return undefined;
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && !isNaN(value)) return value;

  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (!isNaN(n)) return n;
  }

  return undefined;
}

/**
 * GET: List tiers
 */
export async function GET() {
  try {
    const tiers = await prisma.tenantsubscriptiontiers.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    const response: ApiResponse<typeof tiers> = {
      status: 200,
      message: "Subscription tiers fetched successfully",
      error: false,
      errorMessage: null,
      data: tiers,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        status: 500,
        message: "Failed to fetch subscription tiers",
        error: true,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        data: null,
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Create subscription tier
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const student_count_min = toNumber(body?.student_count_min);
    const student_count_max = toNumber(body?.student_count_max);
    const price = toNumber(body?.price_per_student);
    const billing_cycle =
      typeof body?.billing_cycle === "string" ? body.billing_cycle.trim() : "";

    const start_date = parseDate(body?.start_date);
    const end_date = parseDate(body?.end_date);

    if (
      !name ||
      student_count_min === undefined ||
      student_count_max === undefined ||
      price === undefined ||
      !billing_cycle
    ) {
      return NextResponse.json(
        {
          status: 400,
          message: "Missing required fields",
          error: true,
          errorMessage: "Invalid input",
          data: null,
        },
        { status: 400 }
      );
    }

    if (student_count_min >= student_count_max) {
      return NextResponse.json(
        {
          status: 400,
          message: "student_count_min must be less than student_count_max",
          error: true,
          errorMessage: "Invalid range",
          data: null,
        },
        { status: 400 }
      );
    }

    const newTier = await prisma.tenantsubscriptiontiers.create({
      data: {
        name,
        student_count_min,
        student_count_max,
        billing_cycle,
        price_per_student: new Prisma.Decimal(price),
        start_date,
        end_date,
      },
    });

    const response: ApiResponse<typeof newTier> = {
      status: 201,
      message: "Subscription tier created",
      error: false,
      errorMessage: null,
      data: newTier,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        status: 500,
        message: "Internal Server Error",
        error: true,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        data: null,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT: Update tier
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const id = toNumber(body?.id);

    if (!id) {
      return NextResponse.json(
        {
          status: 400,
          message: "Missing id",
          error: true,
          errorMessage: "Invalid id",
          data: null,
        },
        { status: 400 }
      );
    }

    const existing = await prisma.tenantsubscriptiontiers.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        {
          status: 404,
          message: "Subscription tier not found",
          error: true,
          errorMessage: "Not found",
          data: null,
        },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (body.name) updateData.name = body.name;

    if (body.student_count_min)
      updateData.student_count_min = toNumber(body.student_count_min);

    if (body.student_count_max)
      updateData.student_count_max = toNumber(body.student_count_max);

    if (body.price_per_student)
      updateData.price_per_student = new Prisma.Decimal(
        toNumber(body.price_per_student)!
      );

    if (body.billing_cycle) updateData.billing_cycle = body.billing_cycle;

    const start_date = parseDate(body.start_date);
    const end_date = parseDate(body.end_date);

    if (start_date) updateData.start_date = start_date;
    if (end_date) updateData.end_date = end_date;

    updateData.modified_at = new Date();

    const updated = await prisma.tenantsubscriptiontiers.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      status: 200,
      message: "Subscription tier updated",
      error: false,
      errorMessage: null,
      data: updated,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        status: 500,
        message: "Failed to update subscription tier",
        error: true,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        data: null,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE tier
 */
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const id = toNumber(body?.id);

    if (!id) {
      return NextResponse.json(
        {
          status: 400,
          message: "Missing id",
          error: true,
          errorMessage: "Invalid id",
          data: null,
        },
        { status: 400 }
      );
    }

    await prisma.tenantsubscriptiontiers.delete({
      where: { id },
    });

    return NextResponse.json({
      status: 200,
      message: "Subscription tier deleted",
      error: false,
      errorMessage: null,
      data: null,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        status: 500,
        message: "Failed to delete subscription tier",
        error: true,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        data: null,
      },
      { status: 500 }
    );
  }
}