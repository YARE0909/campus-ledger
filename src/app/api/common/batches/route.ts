import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const branch_id = searchParams.get("branch_id");

  const batches = await prisma.batches.findMany({
    where: branch_id ? { branch_id: Number(branch_id) } : undefined,
    include: {
      enrollmentbatches: true,
    },
  });

  const formatted = batches.map((b) => ({
    id: b.id.toString(),
    name: b.name,
    branchId: b.branch_id.toString(),
    weekdays: b.weekdays,
    startTime: b.start_time,
    endTime: b.end_time,
    maxStudents: b.max_students,
    medium: b.medium,
    status: b.status ?? "Draft",
    enrolledStudents: b.enrollmentbatches.length,
  }));

  return NextResponse.json({
    status: 200,
    data: formatted,
  });
}

export async function POST(req: Request) {
  const body = await req.json();

  const batch = await prisma.batches.create({
    data: {
      name: body.name,
      branch_id: Number(body.branchId),
      weekdays: body.weekdays?.join(","),
      start_time: new Date(`1970-01-01T${body.startTime}`),
      end_time: new Date(`1970-01-01T${body.endTime}`),
      max_students: body.maxStudents,
      medium: body.medium,
      status: "Draft",
    },
  });

  return NextResponse.json({
    status: 201,
    data: batch,
  });
}

export async function PUT(req: Request) {
  const body = await req.json();

  const updated = await prisma.batches.update({
    where: { id: Number(body.id) },
    data: {
      name: body.name,
      branch_id: Number(body.branchId),
      weekdays: body.weekdays?.join(","),
      start_time: new Date(`1970-01-01T${body.startTime}`),
      end_time: new Date(`1970-01-01T${body.endTime}`),
      max_students: body.maxStudents,
      medium: body.medium,
      modified_at: new Date(),
    },
  });

  return NextResponse.json({
    status: 200,
    data: updated,
  });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();

  await prisma.batches.delete({
    where: { id: Number(id) },
  });

  return NextResponse.json({
    status: 200,
  });
}