import { apiClient } from "@/lib/server/apiClient";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const data = await apiClient.get(`/api/users/${id}`);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch user" },
      { status: 500 }
    );
  }
}