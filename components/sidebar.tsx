"use client";

import { useRecentProjects } from "@/app/context/recent-projects-context";
import {
  Calendar,
  CheckSquare,
  Home,
  Inbox,
  Plus,
  Projector,
  Search,
  Settings,
} from "lucide-react";
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "./ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { ProjectTypeIcon } from "./projects/ProjectTypeIcon";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Due Items",
    url: "/due-items",
    icon: Inbox,
  },
  {
    title: "Chat",
    url: "/chat",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "/search",
    icon: Search,
  },
  {
    title: "Settings",
    url: "/system-settings",
    icon: Settings,
  },
];

const milestoneItems = [
  {
    title: "Due Milestones",
    url: "/milestones?due",
    icon: CheckSquare,
  },
  {
    title: "All Milestones",
    url: "/milestones",
    icon: CheckSquare,
  },
];

const taskItems = [
  {
    title: "Due Tasks",
    url: "/tasks?due",
    icon: CheckSquare,
  },
  {
    title: "All Tasks",
    url: "/tasks",
    icon: CheckSquare,
  },
];

const costItems = [
  {
    title: "All Costs",
    url: "/costs",
    icon: CheckSquare,
  },
];

const SideBar = () => {
  const { recentProjects } = useRecentProjects();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem className="h-[28px]">
            <SidebarMenuButton asChild>
              <Link href="/dashboard">
                <Image alt="logo" src="/boron.png" width={102} height={40} />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator className="mx-0" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="min-h-[296px]">
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupAction>
            <Link href="/projects/add">
              <Plus /> <span className="sr-only">Create Project</span>
            </Link>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {Array.isArray(recentProjects) &&
                recentProjects.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton asChild>
                      <Link href={`/projects/${project.id}`}>
                        <ProjectTypeIcon type={project.type} />
                        <span className="truncate overflow-hidden whitespace-nowrap">
                          {project.name}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              <SidebarMenuItem key="all">
                <SidebarMenuButton asChild>
                  <Link href={"/projects"}>
                    <Projector />
                    <span>Show All Projects</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Milestones</SidebarGroupLabel>
          <SidebarMenu>
            {milestoneItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
                {item.title === "Inbox" && (
                  <SidebarMenuBadge>24</SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Tasks</SidebarGroupLabel>
          <SidebarMenu>
            {taskItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Costs</SidebarGroupLabel>
          <SidebarMenu>
            {costItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default SideBar;
