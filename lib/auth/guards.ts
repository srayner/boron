import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export async function requireAuth() {
  const session = await auth();
  if (!session) redirect("/auth/login");
  return session;
}

export async function requireGuest() {
  const session = await auth();
  if (session) redirect(DEFAULT_LOGIN_REDIRECT);
}
