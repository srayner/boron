"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DashboardWidgetProps = {
  title: string;
  className?: string;
  children: React.ReactNode;
};

export default function DashboardWidget({
  title,
  className,
  children,
}: DashboardWidgetProps) {
  return (
    <Card className={cn("h-[300px] w-full flex flex-col", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto">{children}</CardContent>
    </Card>
  );
}
