import { NextResponse } from "next/server";
import { fetchTornadoProbability } from "@/lib/api/spc";

export const revalidate = 900;

export async function GET() {
  try {
    const data = await fetchTornadoProbability();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "s-maxage=900, stale-while-revalidate=1800",
      },
    });
  } catch (error) {
    console.error("Failed to fetch tornado probability:", error);
    return NextResponse.json(
      { type: "FeatureCollection", features: [] },
      { status: 502 }
    );
  }
}
