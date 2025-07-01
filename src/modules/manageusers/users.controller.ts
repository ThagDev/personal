import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  Put,
  Query,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserWithRolesDto } from './dto/create-user-with-roles.dto';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../../common/response/base-controller';
import {
  AdminOperation,
  PaginationQueries,
} from '../../common/decorators/api.decorator';

@ApiTags('Manage Users')
@Controller('/api')
export class UsersController extends BaseController {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  @AdminOperation('Lấy danh sách user')
  @PaginationQueries()
  @Get('/GetAllUsers')
  async findAllController(@Query() query: any) {
    const parsedQuery = this.parseQuery(query);
    const data = await this.usersService.findAll(parsedQuery);
    return this.successResponse(data);
  }

  @AdminOperation('Lấy thông tin chi tiết user')
  @Get('GetUser/:id')
  async findOneController(@Param('id') id: string) {
    const data = await this.usersService.findById(id);
    return this.successResponse(data);
  }

  @AdminOperation('Cập nhật thông tin user')
  @Put('UpdateUser/:id')
  async UpdateUserController(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const data = await this.usersService.updateById(id, updateUserDto);
    return this.successResponse(data);
  }

  @AdminOperation('Xóa user')
  @Delete('DeleteUser/:id')
  async DeleteUserController(@Param('id') id: string) {
    const data = await this.usersService.deleteById(id);
    return this.successResponse(data);
  }

  @AdminOperation('Gán roles cho user')
  @Post('AssignRolesToUser/:id')
  async assignRolesToUserController(
    @Param('id') id: string,
    @Body() assignRolesDto: AssignRolesDto,
  ) {
    const data = await this.usersService.assignRolesToUser(
      id,
      assignRolesDto.roles,
    );
    return this.successResponse(data);
  }

  @AdminOperation('Tạo user mới')
  @Post('CreateUser')
  async createUserController(@Body() createUserDto: CreateUserDto) {
    const data = await this.usersService.createUserService(createUserDto);
    return this.successResponse(data);
  }

  @AdminOperation('Tạo user mới với roles, gửi email thông tin đăng nhập')
  @Post('CreateUserWithRoles')
  async createUserWithRoles(@Body() dto: CreateUserWithRolesDto) {
    const data = await this.usersService.createUserWithRolesAndSendMail(dto);
    return this.successResponse(data);
  }
}
