import { apiClient } from "@/lib/server/apiClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const data = await apiClient.post("/api/auth/register", body);

    return NextResponse.json(data);
  } catch (error: any) {
    console.log({ error });
    return NextResponse.json(
      { message: error.message || "Registration failed" },
      { status: 500 },
    );
  }
}
