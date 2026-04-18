// app/api/common/courses/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function mapUiStatusToDb(status: string) {
  switch (status) {
    case "ACTIVE":
      return "Published";

    case "INACTIVE":
      return "Archived";

    case "UPCOMING":
      return "Draft";

    case "COMPLETED":
      return "Cancelled";

    default:
      return "Draft";
  }
}

function mapDbStatusToUi(status: string) {
  switch (status) {
    case "Published":
      return "ACTIVE";

    case "Archived":
      return "INACTIVE";

    case "Draft":
      return "UPCOMING";

    case "Cancelled":
      return "COMPLETED";

    default:
      return "ACTIVE";
  }
}

/* GET ALL COURSES */
export async function GET() {
  try {
    const courses = await prisma.products.findMany({
      include: {
        productfees: true,
        staffmappings: {
          include: {
            staff: true,
          },
        },
        enrollments: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const formatted = courses.map((course) => ({
      id: course.id,
      name: course.name,
      description: course.description,
      duration_weeks: course.max_classes || 0,
      fee: Number(course.productfees?.[0]?.fee || 0),
      start_date: course.start_date,
      end_date: course.end_date,
      assigned_teacher:
        course.staffmappings?.[0]?.staff?.id || "",
      teacher_name:
        course.staffmappings?.[0]?.staff?.name || "Unassigned",
      enrolled_students: course.enrollments.length,
      max_capacity: course.comp_classes || 0,
      status: mapDbStatusToUi(course.status || "Draft"),
      created_at: course.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch courses",
      },
      { status: 500 }
    );
  }
}

/* CREATE COURSE */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      branch_id,
      name,
      description,
      duration_weeks,
      fee,
      start_date,
      end_date,
      assigned_teacher,
      batch_id,
      max_capacity,
      status,
    } = body;

    const course = await prisma.products.create({
      data: {
        branch_id: Number(branch_id),
        name,
        description,
        max_classes: Number(duration_weeks),
        comp_classes: Number(max_capacity),
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        status: mapUiStatusToDb(status) as any,
      },
    });

    await prisma.productfees.create({
      data: {
        product_id: course.id,
        fee: Number(fee),
        start_date: new Date(start_date),
        end_date: new Date(end_date),
      },
    });

    if (assigned_teacher && batch_id) {
      await prisma.staffmappings.create({
        data: {
          product_id: course.id,
          batch_id: Number(batch_id),
          staff_id: Number(assigned_teacher),
          created_at: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create course",
      },
      { status: 500 }
    );
  }
}