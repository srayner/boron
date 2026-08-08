import { withErrorHandling } from "@/lib/api/handler";
import { withAuth } from "@/lib/api/with-auth";
import { getAllUserPreferences } from "@/services/user-preferences";

export const GET = withErrorHandling(
  withAuth(async (req, context, session) => {
    const userId = session.user.id ?? "";

    return await getAllUserPreferences(userId);
  })
);
