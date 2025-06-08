import { prisma } from "@/lib/prisma";

export async function getDueItems(params: {
  search: string;
  pagination: { take: number; skip: number };
  ordering: { [key: string]: "asc" | "desc" };
}) {
  const { take, skip } = params.pagination;
  const like = `%${params.search}%`;

  // Whitelist allowed fields and directions
  const allowedOrderFields = ["dueDate", "name"];
  const allowedDirections = ["asc", "desc"];

  const [orderByField, orderDirection] = Object.entries(params.ordering)[0] ?? [
    "dueDate",
    "asc",
  ];

  const safeOrderBy = allowedOrderFields.includes(orderByField)
    ? orderByField
    : "dueDate";
  const safeOrderDir = allowedDirections.includes(orderDirection.toLowerCase())
    ? orderDirection.toUpperCase()
    : "ASC";

  const safeWhere = `dueDate IS NOT NULL AND status != 'COMPLETED' AND name LIKE ?`;

  // Count total items
  const countSql = `
    SELECT COUNT(*) AS count FROM (
      SELECT id FROM Project WHERE ${safeWhere}
      UNION ALL
      SELECT id FROM Milestone WHERE ${safeWhere}
      UNION ALL
      SELECT id FROM Task WHERE ${safeWhere}
    ) AS all_due_items
  `;

  const countResult = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    countSql,
    like,
    like,
    like
  );

  const totalCount = Number(countResult[0]?.count ?? 0);

  // Build dynamic SQL query string with injected ORDER BY
  const sql = `
    SELECT * FROM (
      SELECT id, 'Project' AS type, status, name, description, dueDate, updatedAt FROM Project WHERE ${safeWhere}
      UNION ALL
      SELECT id, 'Milestone' AS type, status, name, description, dueDate, updatedAt FROM Milestone WHERE ${safeWhere}
      UNION ALL
      SELECT id, 'Task' AS type, status, name, description, dueDate, updatedAt FROM Task WHERE ${safeWhere}
    ) AS all_due_items
    ORDER BY ${safeOrderBy} ${safeOrderDir}
    LIMIT ?
    OFFSET ?
  `;

  const dueItems = await prisma.$queryRawUnsafe(
    sql,
    like,
    like,
    like,
    take,
    skip
  );

  return { dueItems, totalCount };
}
