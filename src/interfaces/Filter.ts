import { Request } from 'express';

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

type Filter<T> = {
  filter?: {
    field: keyof T;
    value: string | number;
    option: FilterOption;
  }[];
};

type Query<T> = Filter<T> & Sort & Pagination;

interface QueryRequest<T> extends Request {
  body: {
    query: Query<T>;
  };
}

export {
  Pagination,
  Sort,
  Filter,
  FilterOption,
  OrderOption,
  Query,
  QueryRequest,
};
