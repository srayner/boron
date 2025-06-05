import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRecentProjects } from "@/app/context/recent-projects-context";
import { DeleteInfo, DeletableType } from "@/types/ui";

interface UseDeleteEntityOptions {
  refresh: () => void;
  redirectTo?: string;
  currentEntityType?: DeletableType;
}

export function useDeleteEntity({
  refresh,
  redirectTo,
  currentEntityType,
}: UseDeleteEntityOptions) {
  const [deleteInfo, setDeleteInfo] = useState<DeleteInfo | null>(null);
  const { refreshRecentProjects } = useRecentProjects();
  const router = useRouter();

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteInfo) return;

    const apiMap: Record<DeletableType, string> = {
      project: "projects",
      task: "tasks",
      milestone: "milestones",
      cost: "costs",
    };

    const endpoint = apiMap[deleteInfo.type];
    const url = `/api/${endpoint}/${deleteInfo.item.id}`;

    await fetch(url, { method: "DELETE" });

    setDeleteInfo(null);
    refreshRecentProjects();

    if (
      redirectTo &&
      currentEntityType &&
      currentEntityType === deleteInfo.type
    ) {
      router.push(redirectTo);
    } else {
      refresh();
    }
  }, [
    deleteInfo,
    refreshRecentProjects,
    refresh,
    redirectTo,
    currentEntityType,
    router,
  ]);

  return { deleteInfo, setDeleteInfo, handleConfirmDelete };
}
