import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/*
GET
/api/common/products
/api/common/products?id=1
/api/common/products?branch_id=1
*/
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const id = url.searchParams.get("id");
    const branchId = url.searchParams.get("branch_id");

    let data;

    if (id) {
      data = await prisma.products.findUnique({
        where: { id: Number(id) },
        include: {
          coursetopics: true,
          productfees: true,
          enrollments: true,
        },
      });
    } else {
      data = await prisma.products.findMany({
        where: branchId ? { branch_id: Number(branchId) } : undefined,
        orderBy: { created_at: "desc" },
        include: {
          coursetopics: true,
          productfees: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET /api/common/products", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

/*
POST
Create product
*/
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || !body.branch_id) {
      return NextResponse.json(
        {
          success: false,
          message: "name and branch_id are required",
        },
        { status: 400 },
      );
    }

    const product = await prisma.products.create({
      data: {
        name: body.name,
        description: body.description ?? null,
        branch_id: Number(body.branch_id),
        max_classes: body.max_classes ?? null,
        comp_classes: body.comp_classes ?? null,
        start_date: body.start_date ? new Date(body.start_date) : null,
        end_date: body.end_date ? new Date(body.end_date) : null,
        status: body.status ?? "Draft",
      },
    });

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("POST /api/common/products", error);

    return NextResponse.json(
      { success: false, message: "Failed to create product" },
      { status: 500 },
    );
  }
}

/*
PUT
Update product
*/
export async function PUT(req: Request) {
  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json(
        {
          success: false,
          message: "id is required",
        },
        { status: 400 },
      );
    }

    const product = await prisma.products.update({
      where: { id: Number(body.id) },
      data: {
        name: body.name,
        description: body.description ?? null,
        branch_id: body.branch_id ? Number(body.branch_id) : undefined,
        max_classes: body.max_classes ?? undefined,
        comp_classes: body.comp_classes ?? undefined,
        start_date: body.start_date ? new Date(body.start_date) : null,
        end_date: body.end_date ? new Date(body.end_date) : null,
        status: body.status ?? undefined,
        modified_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("PUT /api/common/products", error);

    return NextResponse.json(
      { success: false, message: "Failed to update product" },
      { status: 500 },
    );
  }
}

/*
DELETE
*/
export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json(
        {
          success: false,
          message: "id is required",
        },
        { status: 400 },
      );
    }

    await prisma.products.delete({
      where: { id: Number(body.id) },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/common/products", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete product" },
      { status: 500 },
    );
  }
}