// app/api/course-assignments/[assignmentId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ assignmentId: string }>;
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const { assignmentId } = await params;

    await prisma.staffmappings.delete({
      where: { id: Number(assignmentId) },
    });

    return NextResponse.json(
      { success: true, message: "Assignment removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE assignment error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to remove assignment" },
      { status: 500 }
    );
  }
}