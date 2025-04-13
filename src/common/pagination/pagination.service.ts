// src/common/services/pagination.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class PaginationService {
  paginate(
    query: any,
    defaultSortField: string = 'username',
  ): {
    page: number;
    skip: number;
    limit: number;
    sortField: string;
    sort: { [field: string]: 1 | -1 };
  } {
    const page = query.page;

    const limit = query.limit || 10;
    const sortField = query.sortField || defaultSortField;
    const sortOrder = query.sort === 'false' ? -1 : 1;
    const skip = (page - 1) * limit;

    return {
      page,
      skip,
      limit,
      sortField,
      sort: { [sortField]: sortOrder },
    };
  }
}
