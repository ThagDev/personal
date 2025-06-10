import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { Db } from 'mongodb';
import { PaginationService } from '../../common/pagination/pagination.service';

@Injectable()
export class MenuTreesService {
  constructor(
    @Inject('MONGO_DB_CONNECTION') private db: Db,
    private readonly paginationService: PaginationService,
  ) {}

  async GetMenuParentsService(query: any) {
    try {
      const menuCategoriesDb = this.db.collection('menu_categories');
      const { page, skip, limit, sortField, sort } =
        this.paginationService.paginate(query, 'name');
      const resultDocs = await menuCategoriesDb
        .find({})
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();
      // Chuẩn hóa _id về string cho từng menu
      const result = resultDocs.map((item) => ({
        ...item,
        _id: item._id.toString(),
      }));
      const totalDocuments = await menuCategoriesDb.countDocuments();
      return {
        data: result,
        totalDocuments,
        totalPages: Math.ceil(totalDocuments / limit),
        currentPage: page,
        sortField,
        sortOrder: sort[sortField] === 1 ? 'asc' : 'desc',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
