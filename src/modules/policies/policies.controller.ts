import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PoliciesService } from './policies.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { BaseController } from '../../common/response/base-controller';

@ApiTags('Policy')
@Controller('/api')
export class PoliciesController extends BaseController {
  constructor(private readonly policiesService: PoliciesService) {
    super();
  }

  @Post('/CreatePolicy')
  @ApiOperation({ summary: 'Tạo mới policy' })
  async create(@Body() dto: CreatePolicyDto) {
    const data = await this.policiesService.createPolicy(dto);
    return this.successResponse(data);
  }

  @Get('/GetPolicies')
  @ApiOperation({ summary: 'Lấy danh sách policy' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortField', required: false, type: String })
  @ApiQuery({ name: 'sort', required: false, type: Boolean })
  async findAll(@Query() query: any) {
    const parsedQuery = this.parseQuery(query);
    const data = await this.policiesService.findAll(parsedQuery);
    return this.successResponse(data);
  }

  @Get('/GetPolicy/:id')
  @ApiOperation({ summary: 'Lấy chi tiết policy' })
  async findOne(@Param('id') id: string) {
    const data = await this.policiesService.findById(id);
    return this.successResponse(data);
  }

  @Put('/UpdatePolicy/:id')
  @ApiOperation({ summary: 'Cập nhật policy' })
  async update(@Param('id') id: string, @Body() dto: CreatePolicyDto) {
    const data = await this.policiesService.updateById(id, dto);
    return this.successResponse(data);
  }

  @Delete('/DeletePolicy/:id')
  @ApiOperation({ summary: 'Xóa policy' })
  async remove(@Param('id') id: string) {
    const data = await this.policiesService.deleteById(id);
    return this.successResponse(data);
  }
}
