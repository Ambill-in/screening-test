export function stripManagedFields<T extends object>(
  data: T | T[],
  fields: string[],
): T | T[] {
  const strip = (item: T): T => {
    const result = { ...item };

    for (const field of fields) {
      delete (result as Record<string, unknown>)[field];
    }

    return result;
  };

  return Array.isArray(data) ? data.map(strip) : strip(data);
}
