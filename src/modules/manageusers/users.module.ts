import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PaginationService } from '../../common/pagination/pagination.service';
import { TokenService } from '../auth/token.service';
import { RolesGuard } from '../../common/middleware/roles.guard';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [UsersController],
  providers: [UsersService, PaginationService, TokenService, RolesGuard],
})
export class UsersModule {}
