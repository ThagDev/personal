import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { MailService } from '../mail/mail.service';

import { TokenService } from './token.service';
import { MongoDBModule } from 'src/databases/mongodb.module';

describe('AuthService', () => {
  let service: AuthService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongoDBModule.forRoot(
          process.env.MONGO_URI,
          'pharmacy',
          'MONGO_DB_CONNECTION',
        ),
      ],
      providers: [AuthService, MailService, TokenService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
