import { Module, forwardRef } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationGuard } from 'src/common/middleware/authorization.guard';
import { TokenService } from '../auth/token.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [ProfileController],
  providers: [ProfileService, AuthorizationGuard, TokenService],
  exports: [ProfileService],
})
export class ProfileModule {}
