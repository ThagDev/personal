import { Permission } from './permission.entity';
import { Policy } from './policy.entity';

export class Role {
  name: string; // Tên vai trò
  description?: string;
  permissions: Permission[]; // Danh sách quyền trực tiếp
  policies: Policy[]; // Danh sách policy mà role này có
}
