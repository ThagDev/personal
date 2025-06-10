import { PartialType } from '@nestjs/mapped-types';
import { CreateMutipleAuthDto } from './create-mutiple-auth.dto';

export class UpdateMutipleAuthDto extends PartialType(CreateMutipleAuthDto) {}
