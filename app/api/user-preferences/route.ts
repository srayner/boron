import { withErrorHandling } from "@/lib/api/handler";
import { withAuth } from "@/lib/api/with-auth";
import { AppError } from "@/lib/api/error";
import { getAllUserPreferences } from "@/services/user-preferences";

export const GET = withErrorHandling(
  withAuth(async (req, context, session) => {
    if (!session) {
      throw new AppError("Unauthorized", 401);
    }

    const userId = session.user.id ?? "";

    return await getAllUserPreferences(userId);
  })
);
