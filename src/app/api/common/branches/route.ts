import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/api/types";

export interface Branch {
  id: number;
  tenant_id: number;
  name: string;
  contact_email: string | null;
  phone: string | null;
  address: string | null;
  gst: string | null;
  created_at: Date | null;
  modified_at: Date | null;
}

/* =========================
   GET: Fetch branches
========================= */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenant_id = searchParams.get("tenant_id");

    if (!tenant_id) {
      return NextResponse.json<ApiResponse<null>>(
        {
          status: 400,
          message: "tenant_id query parameter is required",
          error: true,
          errorMessage: "tenant_id query parameter is required",
          data: null,
        },
        { status: 400 },
      );
    }

    const branches = await prisma.branches.findMany({
      where: { tenant_id: Number(tenant_id) },
      orderBy: { name: "asc" },
    });

    return NextResponse.json<ApiResponse<Branch[]>>({
      status: 200,
      message: "Branches fetched successfully",
      error: false,
      errorMessage: null,
      data: branches,
    });
  } catch (error) {
    console.error("Failed to fetch branches:", error);

    return NextResponse.json<ApiResponse<null>>(
      {
        status: 500,
        message: "Failed to fetch branches",
        error: true,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        data: null,
      },
      { status: 500 },
    );
  }
}

/* =========================
   POST: Create branch
========================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, tenant_id, contact_email, phone, address, gst } = body;

    if (!name || !tenant_id) {
      return NextResponse.json<ApiResponse<null>>(
        {
          status: 400,
          message: "name and tenant_id are required",
          error: true,
          errorMessage: "Missing required fields",
          data: null,
        },
        { status: 400 },
      );
    }

    const branch = await prisma.branches.create({
      data: {
        name,
        tenant_id: Number(tenant_id),
        contact_email: contact_email ?? null,
        phone: phone ?? null,
        address: address ?? null,
        gst: gst ?? null,
      },
    });

    return NextResponse.json<ApiResponse<typeof branch>>(
      {
        status: 201,
        message: "Branch created successfully",
        error: false,
        errorMessage: null,
        data: branch,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create branch:", error);

    return NextResponse.json<ApiResponse<null>>(
      {
        status: 500,
        message: "Failed to create branch",
        error: true,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        data: null,
      },
      { status: 500 },
    );
  }
}

/* =========================
   PUT: Update branch
========================= */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json<ApiResponse<null>>(
        {
          status: 400,
          message: "Branch ID is required",
          error: true,
          errorMessage: "Branch ID is required",
          data: null,
        },
        { status: 400 },
      );
    }

    const branch = await prisma.branches.findUnique({
      where: { id: Number(id) },
    });

    if (!branch) {
      return NextResponse.json<ApiResponse<null>>(
        {
          status: 404,
          message: "Branch not found",
          error: true,
          errorMessage: "Branch not found",
          data: null,
        },
        { status: 404 },
      );
    }

    const updateData: Record<string, any> = {};

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updateData[key] = value ?? null;
    }

    updateData.modified_at = new Date();

    const updatedBranch = await prisma.branches.update({
      where: { id: Number(id) },
      data: updateData,
    });

    return NextResponse.json<ApiResponse<typeof updatedBranch>>({
      status: 200,
      message: "Branch updated successfully",
      error: false,
      errorMessage: null,
      data: updatedBranch,
    });
  } catch (error) {
    console.error("Failed to update branch:", error);

    return NextResponse.json<ApiResponse<null>>(
      {
        status: 500,
        message: "Failed to update branch",
        error: true,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        data: null,
      },
      { status: 500 },
    );
  }
}

/* =========================
   DELETE: Delete branch
========================= */
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json<ApiResponse<null>>(
        {
          status: 400,
          message: "Branch ID is required",
          error: true,
          errorMessage: "Branch ID is required",
          data: null,
        },
        { status: 400 },
      );
    }

    const branch = await prisma.branches.findUnique({
      where: { id: Number(id) },
    });

    if (!branch) {
      return NextResponse.json<ApiResponse<null>>(
        {
          status: 404,
          message: "Branch not found",
          error: true,
          errorMessage: "Branch not found",
          data: null,
        },
        { status: 404 },
      );
    }

    await prisma.branches.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json<ApiResponse<null>>({
      status: 200,
      message: "Branch deleted successfully",
      error: false,
      errorMessage: null,
      data: null,
    });
  } catch (error) {
    console.error("Failed to delete branch:", error);

    return NextResponse.json<ApiResponse<null>>(
      {
        status: 500,
        message: "Failed to delete branch",
        error: true,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        data: null,
      },
      { status: 500 },
    );
  }
}