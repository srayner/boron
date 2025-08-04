import { prisma } from "@/lib/prisma";
import { z, ZodType } from "zod";

const validationSchemas: Record<string, ZodType<any>> = {
  currencySymbol: z.string().min(1).max(3),
};

const validateSystemSetting = (key: string, value: unknown) => {
  const schema = validationSchemas[key];
  if (!schema) throw new Error(`Invalid system setting key: ${key}`);
  const result = schema.safeParse(value);
  if (!result.success) throw new Error(`Invalid value for ${key}`);
};

export const createSystemSetting = async (data: any) => {
  const validated = await validateSystemSetting(data.key, data.value);

  const newSystemSetting = await prisma.systemSetting.create({
    data: {
      key: data.key,
      value: data.value,
    },
  });

  return newSystemSetting;
};

export const updateSystemSetting = async (id: string, data: any) => {
  validateSystemSetting(data.key, data.value);

  const updatedSystemSetting = await prisma.systemSetting.update({
    where: { id },
    data: {
      value: data.value,
    },
  });

  return updatedSystemSetting;
};

export async function getAllSystemSettings() {
  const systemSettings = await prisma.systemSetting.findMany();

  return { systemSettings };
}
