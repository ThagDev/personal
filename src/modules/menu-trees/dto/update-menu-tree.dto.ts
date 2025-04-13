import { PartialType } from '@nestjs/swagger';
import { CreateMenuTreeDto } from './create-menu-tree.dto';

export class UpdateMenuTreeDto extends PartialType(CreateMenuTreeDto) {}
