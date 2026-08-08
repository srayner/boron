import type { NextRequest } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { AppError } from "@/lib/api/error";

export function withAuth<T, C>(
  handler: (req: NextRequest, context: C, session: Session) => Promise<T>
) {
  return async function (req: NextRequest, context: C): Promise<T> {
    const session = await auth();

    if (!session) {
      throw new AppError("Unauthorized", 401);
    }

    return handler(req, context, session);
  };
}
