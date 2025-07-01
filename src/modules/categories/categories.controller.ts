import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { BaseController } from 'src/common/response/base-controller';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController extends BaseController {
  constructor(private readonly categoriesService: CategoriesService) {
    super();
  }

  @Post('tree')
  @ApiOperation({ summary: 'Tạo mới category dạng cây (tree)' })
  @ApiBody({
    description: 'Dữ liệu category dạng tree. Chỉ truyền parentId (1 cha).',
    schema: {
      example: {
        name: 'Laptop',
        parentId: 'id_cha',
        slug: 'laptop',
        description: 'Danh mục laptop',
        order: 1,
        icon: 'icon-laptop',
      },
    },
  })
  async createTree(@Body() dto: CreateCategoryDto) {
    const data = await this.categoriesService.create({
      ...dto,
      parentIds: undefined,
    });
    return this.successResponse(data);
  }

  @Post('graph')
  @ApiOperation({ summary: 'Tạo mới category dạng graph (nhiều cha)' })
  @ApiBody({
    description:
      'Dữ liệu category dạng graph. Truyền parentIds là mảng các id cha.',
    schema: {
      example: {
        name: 'Thiết bị thông minh',
        parentIds: ['id_cha_1', 'id_cha_2'],
        slug: 'thiet-bi-thong-minh',
        description: 'Danh mục thiết bị thông minh',
        order: 2,
        icon: 'icon-smart',
      },
    },
  })
  async createGraph(@Body() dto: CreateCategoryDto) {
    const data = await this.categoriesService.create({
      ...dto,
      parentId: undefined,
    });
    return this.successResponse(data);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Lấy toàn bộ cây danh mục (tree)' })
  async findAllTree() {
    const data = await this.categoriesService.findAllTree();
    return this.successResponse(data);
  }

  @Get('flat')
  @ApiOperation({ summary: 'Lấy danh sách category phẳng' })
  async findAllFlat() {
    const data = await this.categoriesService.findAllFlat();
    return this.successResponse(data);
  }

  @Get('graph')
  @ApiOperation({ summary: 'Lấy categories theo parentIds (graph)' })
  @ApiQuery({ name: 'parentIds', description: 'Comma-separated parent IDs' })
  async getByParentIds(@Query('parentIds') parentIds: string) {
    const ids = parentIds ? parentIds.split(',').map((id) => id.trim()) : [];
    const data = await this.categoriesService.findByParentIds(ids);
    return this.successResponse(data);
  }

  @Get('graph-children')
  @ApiOperation({ summary: 'Lấy children categories theo parentIds (graph)' })
  @ApiQuery({ name: 'parentIds', description: 'Comma-separated parent IDs' })
  async getByParentIdsGraph(@Query('parentIds') parentIds: string) {
    const ids = parentIds ? parentIds.split(',').map((id) => id.trim()) : [];
    const data = await this.categoriesService.findByParentIdsGraph(ids);
    return this.successResponse(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.categoriesService.findOne(id);
    return this.successResponse(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async update(@Param('id') id: string, @Body() dto: any) {
    const data = await this.categoriesService.update(id, dto);
    return this.successResponse(data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async remove(@Param('id') id: string) {
    const data = await this.categoriesService.remove(id);
    return this.successResponse(data);
  }
}
