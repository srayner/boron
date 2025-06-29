import { Separator } from "@/components/ui/separator";
import { User } from "lucide-react";
import UserProfile from "@/components/user/Profile";

const ProfilePage = () => {
  return (
    <main className="max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-4">
        <User className="h-12 w-12 text-primary" />
        <h1 className="text-2xl text-primary font-semibold">User Profile</h1>
      </div>
      <Separator className="my-3" />

      <p className="my-3">User details</p>

      <UserProfile />
    </main>
  );
};

export default ProfilePage;
