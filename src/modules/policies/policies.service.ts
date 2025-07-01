import { Inject, Injectable } from '@nestjs/common';
import { BaseService } from '../../common/services/base.service';
import { PaginationService } from '../../common/pagination/pagination.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { Db } from 'mongodb';

@Injectable()
export class PoliciesService extends BaseService {
  protected collectionName = 'policies';

  constructor(
    @Inject('MONGO_DB_CONNECTION') db: Db,
    paginationService: PaginationService,
  ) {
    super(db, paginationService);
  }

  async createPolicy(dto: CreatePolicyDto) {
    return this.create(dto);
  }
}
