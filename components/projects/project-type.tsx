import { FC } from "react";
import { ProjectType } from "@/types/entities";
import {
  Printer,
  Cpu,
  Code,
  Globe,
  ClipboardList,
  Wrench,
  FileText,
  Settings,
  Lightbulb,
} from "lucide-react";

const getIconForProjectType = (type: ProjectType) => {
  switch (type) {
    case "MAKER":
      return <Printer />;
    case "ELECTRONICS":
      return <Cpu />;
    case "WEBAPP":
      return <Code />;
    case "WEBSITE":
      return <Globe />;
    case "GENERAL":
      return <ClipboardList />;
    case "AUTOMATION":
      return <Settings />;
    case "DESIGN":
      return <Lightbulb />;
    case "REPAIR":
      return <Wrench />;
    case "WRITING":
      return <FileText />;
    default:
      return <Globe />;
  }
};

export const ProjectNameWithIcon: FC<{ name: string; type: ProjectType }> = ({
  name,
  type,
}) => {
  return (
    <div className="flex items-center space-x-2">
      {getIconForProjectType(type)}
      <span>{name}</span>
    </div>
  );
};

export const ProjectTypeWithIcon: FC<{ type: ProjectType }> = ({ type }) => {
  const formatProjectTypeName = (type: ProjectType) => {
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  return (
    <div className="flex items-center space-x-2 gap-2">
      {getIconForProjectType(type)}
      {formatProjectTypeName(type)}
    </div>
  );
};
