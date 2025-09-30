// utils/safeArray.ts
export const safeArray = <T>(data: T[] | { [key: string]: any } | undefined | null, key?: string): T[] => {
  if (Array.isArray(data)) return data;
  if (key && data && Array.isArray(data[key])) return data[key];
  return [];
};