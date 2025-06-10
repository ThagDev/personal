import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { MailService } from '../mail/mail.service';

describe('AuthService', () => {
  let service: AuthService;
  let tokenService: TokenService;
  let mailService: MailService;
  let dbMock: any;

  beforeEach(async () => {
    dbMock = {
      collection: jest.fn().mockReturnThis(),
      findOne: jest.fn(),
      updateOne: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: 'MONGO_DB_CONNECTION', useValue: dbMock },
        { provide: TokenService, useValue: { generateAccessToken: jest.fn(), generateRefreshToken: jest.fn() } },
        { provide: MailService, useValue: { sendMail: jest.fn() } },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
    tokenService = module.get<TokenService>(TokenService);
    mailService = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a 6-digit code', () => {
    const code = service.generateCode();
    expect(code).toMatch(/^\d{6}$/);
  });

  // Thêm các test case khác cho các hàm service quan trọng
});
