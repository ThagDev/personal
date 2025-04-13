export class PaginationDto {
  page: number; // Không bắt buộc và phải là số

  limit: number; // Không bắt buộc và phải là số

  sortField: string; // Không bắt buộc và là chuỗi

  sort: boolean; // Không bắt buộc và phải là boolean (true/false)
}
