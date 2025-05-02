import { NextRequest, NextResponse } from "next/server";
import { handleAppError } from "./error";

export function withErrorHandling<T>(
  handler: (req: NextRequest) => Promise<T>
) {
  return async function (req: NextRequest) {
    try {
      const result = await handler(req);

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
