import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { markdownToPlainText } from "@/lib/markdown/plain-text";

type SearchableEntity = "project" | "task" | "milestone" | "cost";

// The SearchIndex column that links a row to its record. Each link cascades on
// delete, so removing a record (directly or through its project) removes its row.
const linkTo = {
  project: (id: string) => ({ projectId: id }),
  task: (id: string) => ({ taskId: id }),
  milestone: (id: string) => ({ milestoneId: id }),
  cost: (id: string) => ({ costId: id }),
} satisfies Record<SearchableEntity, (id: string) => Prisma.SearchIndexWhereUniqueInput>;

type IndexedEntity = {
  id: string;
  name: string | null;
  description: string | null;
  updatedAt: Date;
  tags?: { name: string }[];
};

/**
 * Write the search row for a saved record. Call it with the transaction that
 * saved the record, so the row always matches what was saved.
 */
export async function updateSearchIndex(
  db: Prisma.TransactionClient,
  entityType: SearchableEntity,
  entity: IndexedEntity
) {
  const link = linkTo[entityType](entity.id);
  const fields = {
    entityType,
    title: entity.name ?? "",
    content: [
      markdownToPlainText(entity.description),
      ...(entity.tags?.map((tag) => tag.name) ?? []),
    ]
      .filter(Boolean)
      .join(" | "),
    date: entity.updatedAt,
  };

  await db.searchIndex.upsert({
    where: link,
    update: fields,
    create: { ...fields, ...link },
  });
}

export async function find(
  search: string,
  pagination: { take: number; skip: number },
  ordering: { [key: string]: "asc" | "desc" }
) {
  const { take, skip } = pagination;

  const where = {
    AND: [
      {
        OR: [
          { title: { contains: search } },
          { content: { contains: search } },
        ],
      },
    ],
  };

  const [rows, totalCount] = await Promise.all([
    prisma.searchIndex.findMany({
      where,
      orderBy: ordering,
      take,
      skip,
    }),
    prisma.searchIndex.count({ where }),
  ]);

  // Keep the response shape callers (the search page, boron-mcp) rely on.
  const results = rows.map(
    ({ projectId, taskId, milestoneId, costId, ...row }) => ({
      ...row,
      entityId: (projectId ?? taskId ?? milestoneId ?? costId)!,
    })
  );

  return { results, totalCount };
}
