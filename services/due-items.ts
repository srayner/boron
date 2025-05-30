import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/api/error";
import { MilestoneStatus } from "@/types/entities";
import { processTagsForCreate, processTagsForUpdate } from "@/services/tags";

type DueItemType = "Project" | "Milestone" | "Task";
interface DueItem {
  id: string;
  type: DueItemType;
  name: string;
  dueDate: string;
}

export async function getDueItems(params: {
  search: string;
  pagination: { take: number; skip: number };
  ordering: { [key: string]: "asc" | "desc" };
  statuses?: MilestoneStatus[];
  dueDate?: { lt?: Date; gt?: Date };
}) {
  const { take, skip } = params.pagination;
  const like = `%${params.search}%`;

  // Count query: count total rows from union
  const countResult = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) AS count FROM (
      SELECT id FROM Project WHERE dueDate IS NOT NULL AND name LIKE ${like}
      UNION ALL
      SELECT id FROM Milestone WHERE dueDate IS NOT NULL AND name LIKE ${like}
      UNION ALL
      SELECT id FROM Task WHERE dueDate IS NOT NULL AND name LIKE ${like}
    ) AS all_due_items
  `;

  const totalCount = Number(countResult[0]?.count ?? 0);

  const dueItems = await prisma.$queryRaw<DueItem[]>`
    SELECT * FROM (
      SELECT id, 'Project' AS type, name, description, dueDate, updatedAt FROM Project WHERE dueDate IS NOT NULL AND name LIKE ${like}
      UNION ALL
      SELECT id, 'Milestone' AS type, name, description, dueDate, updatedAt FROM Milestone WHERE dueDate IS NOT NULL AND name LIKE ${like}
      UNION ALL
      SELECT id, 'Task' AS type, name, description, dueDate, updatedAt FROM Task WHERE dueDate IS NOT NULL AND name LIKE ${like}
    ) AS all_due_items
    ORDER BY dueDate DESC
    LIMIT ${take}
    OFFSET ${skip}
  `;

  return { dueItems, totalCount };
}
