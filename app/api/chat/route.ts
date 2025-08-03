import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { sendMessageToGPT } from "@/services/chat";
import { createProject } from "@/services/projects";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();

  let reply = await sendMessageToGPT(body.message);

  try {
    const parsed = JSON.parse(reply);

    if (parsed.command === "createProject" && parsed.params?.name) {
      const project = await createProject({ name: parsed.params.name });
      reply = `Project "${project.name}" created!`;
    }
  } catch {
    // Not JSON or no command — just return GPT’s original reply
  }

  return { reply, status: 200 };
});
