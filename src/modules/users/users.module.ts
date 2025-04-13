import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { TokenService } from '../auth/token.service';
import { RolesGuard } from '../../common/middleware/roles.guard';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PaginationService, TokenService, RolesGuard],
})
export class UsersModule {}
