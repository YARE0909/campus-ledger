import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import timeToDate from "@/lib/timeToDate";

/* ---------------- GET ---------------- */

export async function GET() {
  try {
    const batches = await prisma.batches.findMany({
      include: {
        branches: true,

        staffmappings: {
          include: {
            staff: true,
          },
        },

        enrollmentbatches: {
          include: {
            enrollments: {
              include: {
                students: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: batches });
  } catch (error) {
    return NextResponse.json({ success: false, error });
  }
}

/* ---------------- POST ---------------- */

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const batch = await prisma.batches.create({
      data: {
        name: body.name,
        branch_id: body.branch_id,
        weekdays: body.weekdays,
        start_time: timeToDate(body.start_time),
        end_time: timeToDate(body.end_time),
        max_students: body.max_students,
        medium: body.medium,
        status: body.status,
      },
    });

    return NextResponse.json({ success: true, data: batch });
  } catch (error) {
    return NextResponse.json({ success: false, error });
  }
}
/* ---------------- PUT ---------------- */

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const batch = await prisma.batches.update({
      where: { id: Number(body.id) },
      data: {
        name: body.name,
        branch_id: body.branch_id,
        weekdays: body.weekdays,
        start_time: timeToDate(body.start_time),
        end_time: timeToDate(body.end_time),
        max_students: body.max_students,
        medium: body.medium,
        status: body.status,
      },
    });

    return NextResponse.json({ success: true, data: batch });
  } catch (error) {
    return NextResponse.json({ success: false, error });
  }
}