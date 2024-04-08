type Pagination = {
  pagination?: {
    page: number;
    pageSize: number;
  };
};

type OrderOption = 'asc' | 'desc';

type Sort = {
  sort?: {
    field: string;
    order: OrderOption;
  };
};

// filter options: equal, not equal, greater than, less than, includes, starts with
type FilterOption = 'eq' | 'gt' | 'lt' | 'contains' | 'startsWith';

type Filter = {
  filter?: {
    field: string;
    value: string | number;
    option: FilterOption;
  }[];
};

export { Pagination, Sort, Filter, FilterOption, OrderOption };
