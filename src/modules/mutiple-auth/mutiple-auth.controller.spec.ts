import { Test, TestingModule } from '@nestjs/testing';
import { MutipleAuthController } from './mutiple-auth.controller';
import { MutipleAuthService } from './mutiple-auth.service';

describe('MutipleAuthController', () => {
  let controller: MutipleAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MutipleAuthController],
      providers: [MutipleAuthService],
    }).compile();

    controller = module.get<MutipleAuthController>(MutipleAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
