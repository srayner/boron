import { timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { AppError } from "@/lib/api/error";

function isValidApiKey(header: string | null): boolean {
  if (!header?.startsWith("Bearer ")) return false;

  const expected = process.env.BORON_API_KEY;
  if (!expected) return false;

  const provided = Buffer.from(header.slice(7));
  const expectedBuf = Buffer.from(expected);
  if (provided.length !== expectedBuf.length) return false;

  return timingSafeEqual(provided, expectedBuf);
}

export function withAuth<T, C>(
  handler: (
    req: NextRequest,
    context: C,
    session: Session | null
  ) => Promise<T>
) {
  return async function (req: NextRequest, context: C): Promise<T> {
    if (isValidApiKey(req.headers.get("authorization"))) {
      return handler(req, context, null);
    }

    const session = await auth();

    if (!session) {
      throw new AppError("Unauthorized", 401);
    }

    return handler(req, context, session);
  };
}
