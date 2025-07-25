import { getDb } from "../_utils/db";
import { deathPrediction } from "../../../packages/db/schema";

export const config = { runtime: "nodejs" };

interface SavePredictionRequest {
  user_id: string;
  predicted_dod: string;
  base_remaining_years: number;
  adjusted_years?: number;
  factors?: any;
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body: SavePredictionRequest = await request.json();
    const { user_id, predicted_dod, base_remaining_years, adjusted_years, factors } = body;

    if (!user_id || !predicted_dod || base_remaining_years === undefined) {
      return new Response("Missing required fields: user_id, predicted_dod, base_remaining_years", { status: 400 });
    }

    const db = getDb();

    const result = await db
      .insert(deathPrediction)
      .values({
        userId: user_id,
        predictedDod: new Date(predicted_dod).toISOString().split('T')[0],
        baseRemainingYears: base_remaining_years.toString(),
        adjustedYears: adjusted_years?.toString(),
        factors: factors || {},
      })
      .returning();

    return new Response(JSON.stringify({ 
      success: true, 
      prediction: result[0] 
    }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });

  } catch (error) {
    console.error("Prediction save error:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to save prediction",
      details: error.message 
    }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
} 