import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PoliciesService } from './policies.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { success } from '../../common/response/base-response';

@ApiTags('Policy')
@Controller('/api')
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  @Post('/CreatePolicy')
  @ApiOperation({
    summary: 'Tạo mới policy',
    description:
      'Tạo một policy mới cho hệ thống. Truyền thông tin policy qua body.',
  })
  create(@Body() dto: CreatePolicyDto) {
    const data = this.policiesService.createPolicy(dto);
    return success(data);
  }

  @ApiQuery({ name: 'sortField', required: false, type: String, description: 'Field to sort by', example: 'name' })
  @ApiQuery({ name: 'sort', required: false, type: Boolean, description: 'Sort order: true for ascending, false for descending', example: true })
  @Get('/GetPolicies')
  @ApiOperation({
    summary: 'Lấy danh sách policy',
    description: 'Lấy toàn bộ danh sách policy trong hệ thống, hỗ trợ phân trang và sắp xếp.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 10 })
  async findAll(@Query() query: any) {
    const data = await this.policiesService.findAll(query);
    return success(data);
  }

  @Get('/GetPolicy/:id')
  @ApiOperation({
    summary: 'Lấy chi tiết policy',
    description: 'Lấy thông tin chi tiết của một policy theo id.',
  })
  findOne(@Param('id') id: string) {
    const data = this.policiesService.findOne(id);
    return success(data);
  }

  @Put('/UpdatePolicy/:id')
  @ApiOperation({
    summary: 'Cập nhật policy',
    description: 'Cập nhật thông tin một policy theo id.',
  })
  update(@Param('id') id: string, @Body() dto: CreatePolicyDto) {
    const data = this.policiesService.update(id, dto);
    return success(data);
  }

  @Delete('/DeletePolicy/:id')
  @ApiOperation({
    summary: 'Xoá policy',
    description: 'Xoá một policy khỏi hệ thống theo id.',
  })
  remove(@Param('id') id: string) {
    const data = this.policiesService.remove(id);
    return success(data);
  }
}
