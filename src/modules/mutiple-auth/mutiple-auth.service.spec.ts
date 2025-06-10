import { Test, TestingModule } from '@nestjs/testing';
import { MutipleAuthService } from './mutiple-auth.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { MailService } from '../mail/mail.service';
import { MutipleAuth } from './entities/mutiple-auth.entity';

describe('MutipleAuthService', () => {
  let service: MutipleAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MutipleAuthService,
        {
          provide: getModelToken(MutipleAuth.name),
          useValue: {}, // mock model
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn(), verify: jest.fn() },
        },
        {
          provide: MailService,
          useValue: { SendEmailNodemailer: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<MutipleAuthService>(MutipleAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateCode', () => {
    it('should return a 6-digit string', () => {
      const code = (service as any).generateCode();
      expect(typeof code).toBe('string');
      expect(code).toHaveLength(6);
      expect(Number.isNaN(Number(code))).toBe(false);
    });
  });

  describe('security', () => {
    it('should hash password with bcrypt', async () => {
      const password = 'test1234';
      const hash = await bcrypt.hash(password, 10);
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(10);
      const valid = await bcrypt.compare(password, hash);
      expect(valid).toBe(true);
    });
  });

  describe('jwt security', () => {
    it('should sign and verify JWT token', async () => {
      const jwtService = new JwtService({
        secret: 'test_secret',
        signOptions: { expiresIn: '1h' },
      });
      const payload = { sub: 'userId', email: 'test@email.com' };
      const token = jwtService.sign(payload);
      expect(typeof token).toBe('string');
      const decoded = jwtService.verify(token, { secret: 'test_secret' });
      expect(decoded.email).toBe(payload.email);
      expect(decoded.sub).toBe(payload.sub);
    });
  });

  // Add more tests for security and logic
});
