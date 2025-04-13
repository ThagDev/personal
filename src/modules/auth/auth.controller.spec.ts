import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailService } from '../mail/mail.service';

import { TokenService } from './token.service';
import { MongoDBModule } from 'src/databases/mongodb.module';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongoDBModule.forRoot(
          process.env.MONGO_URI,
          'pharmacy',
          'MONGO_DB_CONNECTION',
        ),
      ],
      controllers: [AuthController],
      providers: [AuthService, MailService, TokenService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
