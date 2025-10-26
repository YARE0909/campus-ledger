import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/api/types";

export interface Branch {
  id: string;
  name: string;
  contact_email?: string | null;
  phone?: string | null;
  address?: string | null;
  gst?: string | null;
  tenant_id: string;
  created_at: Date;
  updated_at: Date;
}

// GET: Fetch all branches for a tenant
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
        { status: 400 }
      );
    }

    const branches = await prisma.branches.findMany({
      where: { tenant_id },
      orderBy: { name: "asc" },
    });

    const response: ApiResponse<Branch[]> = {
      status: 200,
      message: "Branches fetched successfully",
      error: false,
      errorMessage: null,
      data: branches,
    };

    return NextResponse.json(response);
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
      { status: 500 }
    );
  }
}

// POST: Create a new branch
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, tenant_id, contact_email, phone, address, gst } = body;

    if (!name || !tenant_id) {
      return NextResponse.json<ApiResponse<null>>(
        {
          status: 400,
          message: "Missing required fields",
          error: true,
          errorMessage: "Missing required fields",
          data: null,
        },
        { status: 400 }
      );
    }

    const now = new Date();

    const newBranch = await prisma.branches.create({
      data: {
        name,
        tenant_id,
        contact_email: contact_email ?? null,
        phone: phone ?? null,
        address: address ?? null,
        gst: gst ?? null,
        created_at: now,
        updated_at: now,
      },
    });

    return NextResponse.json<ApiResponse<typeof newBranch>>(
      {
        status: 201,
        message: "Branch created successfully",
        error: false,
        errorMessage: null,
        data: newBranch,
      },
      { status: 201 }
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
      { status: 500 }
    );
  }
}

// PUT: Update an existing branch
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...fieldsToUpdate } = body;

    if (!id) {
      return NextResponse.json<ApiResponse<null>>(
        {
          status: 400,
          message: "Branch ID is required",
          error: true,
          errorMessage: "Branch ID is required",
          data: null,
        },
        { status: 400 }
      );
    }

    const existingBranch = await prisma.branches.findUnique({ where: { id } });

    if (!existingBranch) {
      return NextResponse.json<ApiResponse<null>>(
        {
          status: 404,
          message: "Branch not found",
          error: true,
          errorMessage: "Branch not found",
          data: null,
        },
        { status: 404 }
      );
    }

    // Only update fields provided
    const sanitizedData: Record<string, any> = {};
    for (const [key, value] of Object.entries(fieldsToUpdate)) {
      if (value !== undefined) sanitizedData[key] = value ?? null;
    }

    if (Object.keys(sanitizedData).length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        {
          status: 400,
          message: "No valid fields provided for update",
          error: true,
          errorMessage: "No valid fields provided for update",
          data: null,
        },
        { status: 400 }
      );
    }

    sanitizedData.updated_at = new Date();

    const updatedBranch = await prisma.branches.update({
      where: { id },
      data: sanitizedData,
    });

    return NextResponse.json<ApiResponse<typeof updatedBranch>>(
      {
        status: 200,
        message: "Branch updated successfully",
        error: false,
        errorMessage: null,
        data: updatedBranch,
      },
      { status: 200 }
    );
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
      { status: 500 }
    );
  }
}

// DELETE: Delete a branch
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
        { status: 400 }
      );
    }

    const existingBranch = await prisma.branches.findUnique({ where: { id } });

    if (!existingBranch) {
      return NextResponse.json<ApiResponse<null>>(
        {
          status: 404,
          message: "Branch not found",
          error: true,
          errorMessage: "Branch not found",
          data: null,
        },
        { status: 404 }
      );
    }

    await prisma.branches.delete({ where: { id } });

    return NextResponse.json<ApiResponse<null>>(
      {
        status: 200,
        message: "Branch deleted successfully",
        error: false,
        errorMessage: null,
        data: null,
      },
      { status: 200 }
    );
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
      { status: 500 }
    );
  }
}
