export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../../api/_utils/db";
import { legacyVault } from "../../../../../../packages/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    const db = getDb();
    const items = await db
      .select()
      .from(legacyVault)
      .where(eq(legacyVault.userId, userId));

    return NextResponse.json({ success: true, data: items });

  } catch (e: any) {
    console.error("Vault list error:", e);
    return NextResponse.json({ error: "Failed to load vault list", details: e.message }, { status: 500 });
  }
} 