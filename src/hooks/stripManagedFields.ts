export function stripManagedFields<T extends object>(
  data: T | T[],
  fields: string[]
): T | T[] {
  const strip = (record: T): T => {
    const copy = { ...(record as Record<string, unknown>) };
    for (const field of fields) {
      delete copy[field];
    }
    return copy as T;
  };

  return Array.isArray(data) ? data.map(strip) : strip(data);
}