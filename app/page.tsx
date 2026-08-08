import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

const HomePage = async () => {
  const session = await auth();
  redirect(session ? DEFAULT_LOGIN_REDIRECT : "/auth/login");
};

export default HomePage;
