type Pagination = {
  pagination?: {
    page: number;
    pageSize: number;
  };
};

type Sort = {
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
};

// filter options: equal, not equal, greater than, less than, includes, starts with
type FilterOptions = 'eq' | 'gt' | 'lt' | 'contains' | 'startsWith';

type Filter = {
  filter?: {
    field: string;
    value: string | number;
    option: FilterOptions;
  }[];
};

export { Pagination, Sort, Filter, FilterOptions };
