"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SlidersHorizontal } from "lucide-react";
import { UserPreference } from "@/types/entities";
import { translate } from "@/lib/utils";

const ProfilePage = () => {
  const [preferences, setPreferences] = useState<UserPreference[]>([]);

  const edit = (setting: any) => {
    void setting;
  };

  useEffect(() => {
    const fetchPreferences = async () => {
      const res = await fetch("/api/user-preferences");
      const { userPreferences } = await res.json();
      setPreferences(userPreferences);
    };
    fetchPreferences();
  }, []);

  return (
    <main className="max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-4">
        <SlidersHorizontal className="h-12 w-12 text-primary" />
        <h1 className="text-2xl text-primary font-semibold">
          User Preferences
        </h1>
      </div>
      <Separator className="my-3" />
      {preferences.map((preference) => (
        <Card key={preference.key} className="py-4">
          <CardContent>
            <h3 className="text-muted-foreground flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" /> Locale
            </h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-4">
              <dt className="font-medium text-muted-foreground">
                {translate(preference.key)}
              </dt>
              <dd className="text-foreground flex items-center justify-between">
                {preference.value}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => edit(preference)}
                >
                  Edit
                </Button>
              </dd>
            </dl>
          </CardContent>
        </Card>
      ))}
    </main>
  );
};

export default ProfilePage;
