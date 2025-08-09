"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { translate } from "@/lib/utils";
import { SystemSetting } from "@/types/entities";
import { SystemSettingEditModal } from "@/components/systemSettings/SystemSetinngEditModal";

export default function ProjectPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);

  const edit = (setting: any) => {};

  useEffect(() => {
    const fetchSettings = async () => {
      const res = await fetch("/api/system-settings");
      const { systemSettings } = await res.json();
      setSettings(systemSettings);
    };
    fetchSettings();
  }, []);

  return (
    <main className="p-4">
      <h1 className="text-2xl text-primary font-semibold mb-6">
        System Settings
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settings.map((setting) => (
          <Card key={setting.key} className="py-4">
            <CardContent>
              <h3 className="text-muted-foreground flex items-center gap-2">
                <SettingsIcon className="w-4 h-4" /> General
              </h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-4">
                <dt className="font-medium text-muted-foreground">
                  {translate(setting.key)}
                </dt>
                <dd className="text-foreground flex items-center justify-between">
                  {setting.value}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => edit(setting)}
                  >
                    Edit
                  </Button>
                </dd>
              </dl>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
