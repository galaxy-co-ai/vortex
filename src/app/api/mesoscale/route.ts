import { NextResponse } from "next/server";
import { fetchMesoscaleDiscussions } from "@/lib/api/spc";

export const revalidate = 300;

export async function GET() {
  try {
    const data = await fetchMesoscaleDiscussions();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Failed to fetch mesoscale discussions:", error);
    return NextResponse.json(
      { type: "FeatureCollection", features: [] },
      { status: 502 }
    );
  }
}
