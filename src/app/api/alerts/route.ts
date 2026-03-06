import { NextResponse } from "next/server";
import { fetchActiveAlerts } from "@/lib/api/nws";

export const revalidate = 30;

export async function GET() {
  try {
    const data = await fetchActiveAlerts();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Failed to fetch NWS alerts:", error);
    return NextResponse.json(
      { type: "FeatureCollection", features: [] },
      { status: 502 }
    );
  }
}
