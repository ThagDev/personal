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
  ApiResponse,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { success } from 'src/common/response/base-response';


@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('tree')
  @ApiOperation({
    summary: 'Tạo mới category dạng cây (tree)',
    description:
      'Tạo một category mới với duy nhất một cha (parentId). Nếu không truyền parentId sẽ là node gốc.',
  })
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
  @ApiResponse({
    status: 201,
    description: 'Category dạng tree được tạo thành công.',
  })
  createTree(@Body() dto: CreateCategoryDto) {
    // Chỉ nhận parentId (1 cha)
    return this.categoriesService.create({ ...dto, parentIds: undefined });
  }

  @Post('graph')
  @ApiOperation({
    summary: 'Tạo mới category dạng graph (nhiều cha)',
    description:
      'Tạo một category mới với nhiều cha (parentIds là mảng). Có thể truyền nhiều id cha.',
  })
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
  @ApiResponse({
    status: 201,
    description: 'Category dạng graph được tạo thành công.',
  })
  createGraph(@Body() dto: CreateCategoryDto) {
    // Chỉ nhận parentIds (mảng cha)
    return this.categoriesService.create({ ...dto, parentId: undefined });
  }

  @Get('tree')
  @ApiOperation({
    summary: 'Lấy toàn bộ cây danh mục (tree)',
    description: 'Trả về cấu trúc cây lồng nhau của tất cả category.',
  })
  @ApiResponse({ status: 200, description: 'Danh sách category dạng cây.' })
  async findAllTree() {
    const data = await this.categoriesService.findAllTree();
    return success(data);
  }

  @Get('flat')
  @ApiOperation({
    summary: 'Lấy danh sách category phẳng',
    description: 'Trả về tất cả category dạng phẳng (không lồng nhau).',
  })
  @ApiResponse({ status: 200, description: 'Danh sách category phẳng.' })
  async findAllFlat() {
    const data = await this.categoriesService.findAllFlat();
    return success(data);
  }

  @Get('graph')
  @ApiOperation({
    summary: 'Lấy các node con theo nhiều cha (graph)',
    description:
      'Trả về tất cả category có parentId thuộc 1 trong các id truyền vào.',
  })
  @ApiQuery({
    name: 'parentIds',
    required: true,
    description: 'Danh sách id cha, phân tách bằng dấu phẩy',
    example: 'id1,id2',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách node con theo nhiều cha (tree-style).',
  })
  async getByParentIds(@Query('parentIds') parentIds: string) {
    const ids = parentIds ? parentIds.split(',').map((id) => id.trim()) : [];
    return this.categoriesService.findByParentIds(ids);
  }

  @Get('graph-multi')
  @ApiOperation({
    summary: 'Lấy các node con theo nhiều cha (graph tự do)',
    description:
      'Trả về tất cả category có parentIds (mảng) chứa 1 trong các id truyền vào.',
  })
  @ApiQuery({
    name: 'parentIds',
    required: true,
    description: 'Danh sách id cha, phân tách bằng dấu phẩy',
    example: 'id1,id2',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách node con theo nhiều cha (graph-style).',
  })
  async getByParentIdsGraph(@Query('parentIds') parentIds: string) {
    const ids = parentIds ? parentIds.split(',').map((id) => id.trim()) : [];
    return this.categoriesService.findByParentIdsGraph(ids);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết category',
    description: 'Trả về thông tin chi tiết của một category theo id.',
  })
  @ApiParam({ name: 'id', description: 'ID của category' })
  @ApiResponse({ status: 200, description: 'Thông tin chi tiết category.' })
  async findOne(@Param('id') id: string) {
    const data = await this.categoriesService.findOne(id);
    return success(data);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Cập nhật category',
    description:
      'Cập nhật thông tin category theo id. Có thể cập nhật parentId (tree) hoặc parentIds (graph).',
  })
  @ApiParam({ name: 'id', description: 'ID của category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Category được cập nhật thành công.',
  })
  async update(@Param('id') id: string, @Body() dto: any) {
    const data = await this.categoriesService.update(id, dto);
    return success(data);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa category',
    description:
      'Xóa category theo id. Tự động loại bỏ id này khỏi parentIds của các node liên quan (graph-style).',
  })
  @ApiParam({ name: 'id', description: 'ID của category' })
  @ApiResponse({ status: 200, description: 'Category được xóa thành công.' })
  async remove(@Param('id') id: string) {
    const data = await this.categoriesService.remove(id);
    return success(data);
  }
}
