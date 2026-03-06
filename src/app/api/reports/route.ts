import { NextResponse } from "next/server";
import { fetchStormReports } from "@/lib/api/iem";

export const revalidate = 300;

export async function GET() {
  try {
    const data = await fetchStormReports();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Failed to fetch storm reports:", error);
    return NextResponse.json(
      { type: "FeatureCollection", features: [] },
      { status: 502 }
    );
  }
}
