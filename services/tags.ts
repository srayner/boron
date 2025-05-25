import { prisma } from "@/lib/prisma";

function normalizeTag(tag: string) {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 _-]/g, "");
}

async function getOrCreateTags(input: string) {
  const rawTags = input.split(",").map(normalizeTag).filter(Boolean);

  const uniqueTags = [...new Set(rawTags)];
  if (uniqueTags.length === 0) return [];

  const existingTags = await prisma.tag.findMany({
    where: { name: { in: uniqueTags } },
  });

  const existingNames = new Set(existingTags.map((t) => t.name));
  const newTags = await prisma.$transaction(
    uniqueTags
      .filter((name) => !existingNames.has(name))
      .map((name) => prisma.tag.create({ data: { name } }))
  );

  return [...existingTags, ...newTags];
}

export async function processTagsForCreate(input: string) {
  const tags = await getOrCreateTags(input);
  return { connect: tags.map((t) => ({ id: t.id })) };
}

export async function processTagsForUpdate(input: string) {
  const tags = await getOrCreateTags(input);
  return { set: tags.map((t) => ({ id: t.id })) };
}
