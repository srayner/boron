import { auth } from "@/auth";
import { translate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export default async function UserProfile() {
  const session = await auth();

  if (!session?.user) return null;

  console.log(session);

  return (
    <Card className="py-4">
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="font-medium text-muted-foreground">Name:</dt>
          <dd className="text-foreground">{session.user.name}</dd>
          <dt className="font-medium text-muted-foreground">Email:</dt>
          <dd className="text-foreground">{session.user.email}</dd>
          <dt className="font-medium text-muted-foreground">Role:</dt>
          <dd className="text-foreground">{translate(session.user.role)}</dd>
        </dl>
      </CardContent>
    </Card>
  );
}
