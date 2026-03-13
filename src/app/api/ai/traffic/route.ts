import { NextResponse } from "next/server";
import { analyzeTraffic } from "@/ai/flows/traffic-flow";
import { TrafficAnalysisInputSchema } from "@/ai/schemas/traffic-schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = TrafficAnalysisInputSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const result = await analyzeTraffic(parsed.data);
    return NextResponse.json(result);
  } catch (error: any) {
    const message = error?.message || "AI analysis failed";
    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 },
    );
  }
}
