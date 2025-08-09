import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { getAllUserPreferences } from "@/services/user-preferences";
import { auth } from "@/auth";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const session = await auth();
  const userId = session?.user.id ?? "";

  console.log("userId: ", userId);

  return await getAllUserPreferences(userId);
});
