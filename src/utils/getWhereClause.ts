import { filterOptions } from '../constants';
import { Filter } from '../interfaces/Filter';

const getWhereClause = <T>(
  filter: Filter<T>['filter'],
  fields: (keyof T)[],
): Record<string, any> => {
  const whereClause: Partial<Record<keyof T, any>> = {};

  if (filter) {
    filter.forEach((f) => {
      // Ensure valid field names and options
      if (!fields.includes(f.field) || !filterOptions.includes(f.option)) {
        return; // Skip invalid filters
      }
      switch (f.option) {
        case 'eq':
          whereClause[f.field] = f.value;
          break;
        case 'gt':
          whereClause[f.field] = { gt: f.value };
          break;
        case 'lt':
          whereClause[f.field] = { lt: f.value };
          break;
        case 'contains':
          whereClause[f.field] = { contains: f.value };
          break;
        case 'startsWith':
          whereClause[f.field] = { startsWith: f.value };
          break;
      }
    });
  }

  return whereClause;
};

export { getWhereClause };
