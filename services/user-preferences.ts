import { prisma } from "@/lib/prisma";
import { z, ZodType } from "zod";

const validationSchemas: Record<string, ZodType<any>> = {
  dateFormat: z.string().min(1),
};

const validateUserPreference = (key: string, value: unknown) => {
  const schema = validationSchemas[key];
  if (!schema) throw new Error(`Invalid system setting key: ${key}`);
  const result = schema.safeParse(value);
  if (!result.success) throw new Error(`Invalid value for ${key}`);
  return true;
};

export const updateUserPreference = async (id: string, data: any) => {
  validateUserPreference(data.key, data.value);

  const updatedUserPreference = await prisma.userPreference.update({
    where: { id },
    data: {
      value: data.value,
    },
  });

  return updatedUserPreference;
};

export async function getAllUserPreferences(userId: string) {
  const userPreferences = await prisma.userPreference.findMany({
    where: { userId },
  });

  return { userPreferences };
}
