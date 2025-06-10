export class Policy {
  name: string; // Tên policy, ví dụ: 'user-management', 'file-access'
  description?: string;
  permissions: string[]; // Danh sách tên quyền liên quan
}
