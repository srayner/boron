import { FC } from "react";
import {
  Printer,
  Cpu,
  Code,
  Globe,
  ClipboardList,
  Settings,
  Lightbulb,
  Wrench,
  FileText,
} from "lucide-react";
import { ProjectType } from "@/types/entities";

const iconMap: Record<ProjectType, FC<React.SVGProps<SVGSVGElement>>> = {
  MAKER: Printer,
  ELECTRONICS: Cpu,
  WEBAPP: Code,
  WEBSITE: Globe,
  GENERAL: ClipboardList,
  AUTOMATION: Settings,
  DESIGN: Lightbulb,
  REPAIR: Wrench,
  WRITING: FileText,
  OTHER: ClipboardList,
};

type ProjectTypeIconProps = {
  type: ProjectType;
  className?: string;
};

export const ProjectTypeIcon: FC<ProjectTypeIconProps> = ({
  type,
  className = "h-4 w-4",
}) => {
  const Icon = iconMap[type] ?? Globe;
  return <Icon className={className} />;
};
