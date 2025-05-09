import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CalendarIcon,
  DollarSignIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";

export default function ProjectDetail() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-orange-700">
            Project Alpha
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className="bg-orange-100 text-orange-700">
              Infrastructure
            </Badge>
            <span className="text-sm text-muted-foreground">
              Last activity: 2 days ago
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <PencilIcon className="w-4 h-4 mr-1" /> Edit
          </Button>
          <Button variant="destructive" size="sm">
            <Trash2Icon className="w-4 h-4 mr-1" /> Delete
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="py-4">
            <h3 className="text-sm text-muted-foreground mb-1">Description</h3>
            <p>Migration of legacy systems to cloud infrastructure.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <h3 className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" /> Dates
            </h3>
            <p>
              Start: Jan 2024
              <br />
              End: Dec 2024
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <h3 className="text-sm text-muted-foreground mb-1">Completion</h3>
            <p>67%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <h3 className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
              <DollarSignIcon className="w-4 h-4" /> Actual Cost
            </h3>
            <p>$24,000</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for sub-sections */}
      <Tabs defaultValue="tasks" className="mt-8">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks">
          {/* Task list placeholder */}
          <div className="mt-4 text-sm text-muted-foreground">
            List of tasks goes here...
          </div>
        </TabsContent>
        <TabsContent value="milestones">
          <div className="mt-4 text-sm text-muted-foreground">
            Milestones go here...
          </div>
        </TabsContent>
        <TabsContent value="costs">
          <div className="mt-4 text-sm text-muted-foreground">
            Cost breakdown goes here...
          </div>
        </TabsContent>
        <TabsContent value="relationships">
          <div className="mt-4 text-sm text-muted-foreground">
            Task relationships go here...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
