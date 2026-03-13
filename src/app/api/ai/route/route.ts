import { NextResponse } from "next/server";
import { getRoute } from "@/ai/flows/routing-flow";
import { GetRouteInputSchema } from "@/ai/schemas/routing-schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = GetRouteInputSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const result = await getRoute(parsed.data);
    return NextResponse.json(result);
  } catch (error: any) {
    const message = error?.message || "Route calculation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
