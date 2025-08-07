export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../../api/_utils/db";
import { users } from "../../../../../../packages/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    const db = getDb();
    const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result[0] });
  } catch (e: any) {
    console.error("Profile fetch error:", e);
    return NextResponse.json({ error: "Failed to fetch profile", details: e.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const body = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    const db = getDb();
    const updateData: any = {};
    
    if (body.displayName !== undefined) updateData.displayName = body.displayName;
    if (body.dob !== undefined) updateData.dob = body.dob ? body.dob.split('T')[0] : null;
    if (body.sex !== undefined) updateData.sex = body.sex;

    const result = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result[0] });
  } catch (e: any) {
    console.error("Profile update error:", e);
    return NextResponse.json({ error: "Failed to update profile", details: e.message }, { status: 500 });
  }
} 