export function parseEnumParam<T extends string>(
  value: string | null,
  allowed: readonly T[]
): T | undefined {
  return allowed.includes(value as T) ? (value as T) : undefined;
}
