export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../../api/_utils/db";
import { users } from "../../../../../../packages/db/schema";
import { eq } from "drizzle-orm";

interface SyncUserRequest {
  id: string;
  email: string;
  display_name?: string;
  dob?: string;
  sex?: "male" | "female";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SyncUserRequest;
    const { id, email, display_name, dob, sex } = body;
    if (!id || !email) {
      return NextResponse.json({ error: "Missing id or email" }, { status: 400 });
    }
    const db = getDb();
    const result = await db
      .insert(users)
      .values({
        id,
        email,
        displayName: display_name,
        dob: dob ? dob.split("T")[0] : null,
        sex,
      } as any)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email,
          displayName: display_name,
          dob: dob ? dob.split("T")[0] : null,
          sex,
        } as any,
      })
      .returning();
    return NextResponse.json({ success: true, user: result[0] });
  } catch (e: any) {
    console.error("User sync error", e);
    return NextResponse.json({ error: "Failed to sync user", details: e.message }, { status: 500 });
  }
} 