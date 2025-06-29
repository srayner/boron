import { Separator } from "@/components/ui/separator";
import { Settings } from "lucide-react";

const ProfilePage = () => {
  return (
    <main className="max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-4">
        <Settings className="h-12 w-12 text-primary" />
        <h1 className="text-2xl text-primary font-semibold">User Settings</h1>
      </div>
      <Separator className="my-3" />
    </main>
  );
};

export default ProfilePage;
