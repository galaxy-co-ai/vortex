import { NextResponse } from "next/server";
import { fetchDay1Outlook } from "@/lib/api/spc";

export const revalidate = 900;

export async function GET() {
  try {
    const data = await fetchDay1Outlook();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "s-maxage=900, stale-while-revalidate=1800",
      },
    });
  } catch (error) {
    console.error("Failed to fetch SPC outlooks:", error);
    return NextResponse.json(
      { type: "FeatureCollection", features: [] },
      { status: 502 }
    );
  }
}
