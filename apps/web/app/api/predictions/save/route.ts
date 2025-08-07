export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../../api/_utils/db";
import { deathPrediction } from "../../../../../../packages/db/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, predictedDod, baseRemainingYears, adjustedYears, factors } = body;

    if (!userId || !predictedDod) {
      return NextResponse.json({ error: "Missing required fields: userId, predictedDod" }, { status: 400 });
    }

    const db = getDb();
    const result = await db
      .insert(deathPrediction)
      .values({
        userId,
        predictedDod: predictedDod.split("T")[0], // 只保留日期部分
        baseRemainingYears: baseRemainingYears ? baseRemainingYears.toString() : null,
        adjustedYears: adjustedYears ? adjustedYears.toString() : null,
        factors: factors || null,
      } as any)
      .returning();

    return NextResponse.json({
      success: true,
      predictionId: result[0].id,
      data: result[0],
    });

  } catch (e: any) {
    console.error("Prediction save error:", e);
    return NextResponse.json({ error: "Failed to save prediction", details: e.message }, { status: 500 });
  }
} 