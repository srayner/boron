import { NextRequest, NextResponse } from "next/server";
import { handleAppError } from "./error";
import { Context } from "@/types/api";

export function withErrorHandling<T>(
  handler: (req: NextRequest, context: Context) => Promise<T>
) {
  return async function (req: NextRequest, context: Context) {
    try {
      const result = await handler(req, context);

      if (result && typeof result === "object" && "status" in result) {
        const { status, ...data } = result as any;
        return NextResponse.json(data, { status });
      }

      return NextResponse.json(result);
    } catch (err) {
      return handleAppError(err);
    }
  };
}
