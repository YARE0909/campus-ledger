import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/api/types";

function parseDate(value: unknown): Date | undefined {
  if (value instanceof Date) {
    if (!isNaN(value.getTime())) return value;
    return undefined;
  }
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
 * GET: List minimal tiers (id + name)
 */
export async function GET() {
  try {
    const tiers = await prisma.subscriptionTiers.findMany({
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

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("GET subscription tiers failed:", error);
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
 * POST: Create a new subscription tier
 * Required fields: name, student_count_min, student_count_max, price_per_student, billing_cycle
 * Optional: start_date, end_date
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const student_count_min = toNumber(body?.student_count_min);
    const student_count_max = toNumber(body?.student_count_max);
    const price_per_student = toNumber(body?.price_per_student);
    const billing_cycle = typeof body?.billing_cycle === "string" ? body.billing_cycle.trim() : "";
    const start_date = parseDate(body?.start_date);
    const end_date = parseDate(body?.end_date);

    // Basic validation
    if (!name || student_count_min === undefined || student_count_max === undefined || price_per_student === undefined || !billing_cycle) {
      return NextResponse.json(
        {
          status: 400,
          message: "Missing or invalid required fields. Required: name, student_count_min, student_count_max, price_per_student, billing_cycle",
          error: true,
          errorMessage: "Missing or invalid required fields",
          data: null,
        },
        { status: 400 }
      );
    }

    // Optional sanity checks
    if (student_count_min >= student_count_max) {
      return NextResponse.json(
        {
          status: 400,
          message: "student_count_min must be less than student_count_max",
          error: true,
          errorMessage: "student_count_min >= student_count_max",
          data: null,
        },
        { status: 400 }
      );
    }

    const now = new Date();

    // Build create data only with valid fields
    const createData: any = {
      name,
      student_count_min,
      student_count_max,
      price_per_student,
      billing_cycle,
      created_at: now,
      updated_at: now,
    };

    if (start_date) createData.start_date = start_date;
    if (end_date) createData.end_date = end_date;

    const newTier = await prisma.subscriptionTiers.create({
      data: createData,
    });

    const response: ApiResponse<typeof newTier> = {
      status: 201,
      message: "Subscription tier created successfully",
      error: false,
      errorMessage: null,
      data: newTier,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Failed to create subscription tier:", error);
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
 * PUT: Partial update (only fields provided will be updated)
 * Body must include: id
 * Any other fields will be sanitized and updated.
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const id = typeof body?.id === "string" ? body.id : undefined;

    if (!id) {
      return NextResponse.json(
        {
          status: 400,
          message: "Missing 'id' in request body",
          error: true,
          errorMessage: "Missing 'id'",
          data: null,
        },
        { status: 400 }
      );
    }

    // Ensure record exists (this will not attempt to map dates on read)
    const existing = await prisma.subscriptionTiers.findUnique({ where: { id } });
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

    // Build sanitized update payload
    const sanitized: Record<string, any> = {};
    for (const [k, v] of Object.entries(body)) {
      if (k === "id") continue;
      if (v === undefined || v === null) continue;

      if (k === "start_date" || k === "end_date") {
        const d = parseDate(v);
        if (d) sanitized[k] = d;
        // invalid date -> skip
      } else if (k === "student_count_min" || k === "student_count_max" || k === "price_per_student") {
        const n = toNumber(v);
        if (n !== undefined) sanitized[k] = n;
      } else {
        // keep strings / booleans / other primitives as-is
        sanitized[k] = v;
      }
    }

    if (Object.keys(sanitized).length === 0) {
      return NextResponse.json(
        {
          status: 400,
          message: "No valid fields provided to update",
          error: true,
          errorMessage: "No update fields",
          data: null,
        },
        { status: 400 }
      );
    }

    // always update updated_at
    sanitized.updated_at = new Date();

    const updated = await prisma.subscriptionTiers.update({
      where: { id },
      data: sanitized,
    });

    return NextResponse.json(
      {
        status: 200,
        message: "Subscription tier updated successfully",
        error: false,
        errorMessage: null,
        data: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update subscription tier:", error);
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
 * DELETE: Delete a subscription tier by id
 * Body should include: { id: "..." }
 */
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const id = typeof body?.id === "string" ? body.id : undefined;

    if (!id) {
      return NextResponse.json(
        {
          status: 400,
          message: "Missing 'id' in request body",
          error: true,
          errorMessage: "Missing 'id'",
          data: null,
        },
        { status: 400 }
      );
    }

    const exists = await prisma.subscriptionTiers.findUnique({ where: { id } });
    if (!exists) {
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

    await prisma.subscriptionTiers.delete({ where: { id } });

    return NextResponse.json(
      {
        status: 200,
        message: "Subscription tier deleted successfully",
        error: false,
        errorMessage: null,
        data: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete subscription tier:", error);
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
