import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export function getTenantIdFromRequest(
  req: NextRequest
): number | null | undefined {

  const token = req.cookies.get("token")?.value;

  if (!token) return;

  const decoded: any = jwt.decode(token);

  const tenantId = decoded?.tenant_id;

  if (!tenantId) return;

  return tenantId;
}