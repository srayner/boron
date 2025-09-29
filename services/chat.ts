import { OpenAI } from "openai";

const systemPrompt = `
You are an assistant that creates projects by returning a JSON command ONLY when the user wants to create a project.

The JSON format is:
{
  "command": "createProject",
  "params": {
    "name": "Project name here"
  }
}

Examples:

User: "Create a project called Apollo"
Assistant:
{
  "command": "createProject",
  "params": {
    "name": "Apollo"
  }
}

User: "Please make a new project named Zenith"
Assistant:
{
  "command": "createProject",
  "params": {
    "name": "Zenith"
  }
}

Do not mention the JSON format or the process to the user in any conversations.

If the user message does NOT ask to create a project, respond normally in plain text without JSON.

User message: {user_input}

`;

export async function sendMessageToGPT(message: string) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ],
  });

  return completion.choices[0]?.message?.content ?? "No response";
}
