import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserWithRolesDto } from './dto/create-user-with-roles.dto';
import {
  ApiBearerAuth,
  ApiQuery,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { RolesGuard } from '../../common/middleware/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { AuthorizationGuard } from 'src/common/middleware/authorization.guard';
import { success } from '../../common/response/base-response';

@ApiTags('Manage Users')
@Controller('/api')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cập nhật thông tin profile của user đang đăng nhập',
    description:
      'Cập nhật các trường thông tin cá nhân cho user hiện tại. Yêu cầu access token.',
  })
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Lấy danh sách user',
    description:
      'Chỉ admin mới có quyền lấy danh sách user. Hỗ trợ phân trang, sắp xếp.',
  })
  @Get('/GetAllUsers')
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'sortField',
    required: false,
    type: String,
    description: 'Field to sort by',
    example: 'username',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: Boolean,
    description: 'Sort order: true for ascending, false for descending',
    example: true,
  })
  async findAllController(@Query() query: any) {
    // Ép kiểu page, limit về số nguyên nếu có
    if (query.page !== undefined) query.page = parseInt(query.page, 10);
    if (query.limit !== undefined) query.limit = parseInt(query.limit, 10);
    const data = await this.usersService.findAllService(query);
    return success(data);
  }
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết user',
    description:
      'Chỉ admin mới có quyền lấy thông tin chi tiết của user theo id.',
  })
  @Get('GetUser/:id')
  async findOneController(@Param('id') id: string) {
    const data = await this.usersService.findOneService(id);
    return success(data);
  }
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Cập nhật thông tin user',
    description: 'Chỉ admin mới có quyền cập nhật thông tin user theo id.',
  })
  @Put('UpdateUser/:id')
  async UpdateUserController(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const data = await this.usersService.UpdateUserService(id, updateUserDto);
    return success(data);
  }
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Xoá user',
    description: 'Chỉ admin mới có quyền xoá user theo id.',
  })
  @Delete('DeleteUser/:id')
  async DeleteUserController(@Param('id') id: string) {
    const data = await this.usersService.DeleteUserService(id);
    return success(data);
  }
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Gán roles cho user',
    description:
      'Chỉ admin mới có quyền gán danh sách role cho user. Truyền mảng tên role vào body.',
  })
  @Put('AssignRolesToUser/:id')
  async assignRolesToUserController(
    @Param('id') id: string,
    @Body() assignRolesDto: AssignRolesDto,
  ) {
    const data = await this.usersService.assignRolesToUser(id, assignRolesDto.roles);
    return success(data);
  }
  @Roles('admin')
  @UseGuards(AuthorizationGuard, RolesGuard)
  @ApiOperation({
    summary: 'Tạo user mới',
    description:
      'Chỉ admin mới có quyền tạo user mới. Password sẽ được hash, không trả về password trong response.',
  })
  @Post('CreateUser')
  async createUserController(@Body() createUserDto: CreateUserDto) {
    const data = await this.usersService.createUserService(createUserDto);
    return success(data);
  }
  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(RolesGuard)
  @Post('/create-user-with-roles')
  @ApiOperation({ summary: 'Tạo user mới với roles, gửi email thông tin đăng nhập' })
  async createUserWithRoles(@Body() dto: CreateUserWithRolesDto) {
    const data = await this.usersService.createUserWithRolesAndSendMail(dto);
    return success(data);
  }
}
