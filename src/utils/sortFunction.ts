export const sortFunction = <T extends Record<string, any>>(
  sort: { field: string; order: 'asc' | 'desc' } | undefined,
  data: T[],
) => {
  if (sort) {
    data.sort((a, b) => {
      const fieldA = a[sort.field]; // Use the typed field access
      const fieldB = b[sort.field];
      const order = sort.order === 'asc' ? 1 : -1;

      if (fieldA < fieldB) {
        return -1 * order;
      }
      if (fieldA > fieldB) {
        return 1 * order;
      }
      return 0;
    });
  }
};
