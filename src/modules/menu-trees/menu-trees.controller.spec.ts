import { Test, TestingModule } from '@nestjs/testing';
import { MenuTreesController } from './menu-trees.controller';
import { MenuTreesService } from './menu-trees.service';

describe('MenuTreesController', () => {
  let controller: MenuTreesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuTreesController],
      providers: [MenuTreesService],
    }).compile();

    controller = module.get<MenuTreesController>(MenuTreesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
