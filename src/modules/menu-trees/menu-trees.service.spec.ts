import { Test, TestingModule } from '@nestjs/testing';
import { MenuTreesService } from './menu-trees.service';

describe('MenuTreesService', () => {
  let service: MenuTreesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MenuTreesService],
    }).compile();

    service = module.get<MenuTreesService>(MenuTreesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
