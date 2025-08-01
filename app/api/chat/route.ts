import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { sendMessageToGPT } from "@/services/chat";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const reply = await sendMessageToGPT(body.message);
  return { reply, status: 200 };
});
