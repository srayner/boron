import { prisma } from "@/lib/prisma";

type SearchableEntity = "project" | "task" | "milestone" | "cost";

type BaseEntity = {
  id: string;
  name: string;
  description: string;
  updatedDate: Date;
  tags?: string[];
};

export async function updateSearchIndex(
  entityType: SearchableEntity,
  entity: any
) {
  const { id, name, description, updatedAt, tags } = entity;

  const content = [
    description,
    ...(tags?.map((tag: { name: string }) => tag.name) ?? []),
  ]
    .join(" | ")
    .trim();

  await prisma.searchIndex.upsert({
    where: { entityId: id },
    update: {
      title: name,
      content,
      date: updatedAt,
      entityType,
    },
    create: {
      entityId: id,
      entityType,
      title: name,
      content,
      date: updatedAt,
    },
  });
}

export async function deleteSearchIndex(
  entityType: SearchableEntity,
  entityId: string
) {
  await prisma.searchIndex.delete({
    where: { entityType, entityId },
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

  const [results, totalCount] = await Promise.all([
    prisma.searchIndex.findMany({
      where,
      orderBy: ordering,
      take,
      skip,
    }),
    prisma.searchIndex.count({ where }),
  ]);

  return { results, totalCount };
}
