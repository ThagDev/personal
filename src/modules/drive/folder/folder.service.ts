import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { Model } from 'mongoose';
import { Folder } from '../interfaces/folder.interface';
import { InjectModel } from '@nestjs/mongoose';
@Injectable()
export class FolderService {
  constructor(
    @InjectModel('Folder') private readonly folderModel: Model<Folder>,
    @InjectModel('File') private readonly fileModel: Model<File>,
  ) {}
  async createFolder(createFolderDto: CreateFolderDto, userId: string): Promise<Folder> {
    const { name, parentId } = createFolderDto;
    if (parentId) {
      const parent = await this.folderModel.findOne({ _id: parentId, userId: String(userId) }).lean();
      if (!parent) throw new NotFoundException('Parent folder not found');
    }
    const folder = new this.folderModel({ name, parent: parentId || null, userId: String(userId) });
    return folder.save();
  }

  async getFolderById(id: string, userId: string): Promise<Folder> {
    const folder = await this.folderModel.findOne({ _id: id, userId: String(userId) }).lean();
    if (!folder) throw new NotFoundException('Folder not found');
    return folder;
  }

  async getFolderContents(id: string, userId: string): Promise<{ folders: Folder[]; files: any[] }> {
    await this.getFolderById(id, userId); // Check if folder exists & thuộc user
    const folders = await this.folderModel.find({ parent: id, userId: String(userId) }).lean().exec();
    const files = await this.fileModel.find({ parent: id, userId: String(userId) }).lean().exec();
    return { folders, files };
  }

  async updateFolder(id: string, updateFolderDto: UpdateFolderDto, userId: string): Promise<Folder> {
    const folder = await this.getFolderById(id, userId);
    if (updateFolderDto.name) folder.name = updateFolderDto.name;
    if (
      updateFolderDto.parentId &&
      updateFolderDto.parentId !== folder.parent?.toString()
    ) {
      const parent = await this.folderModel.findOne({ _id: updateFolderDto.parentId, userId: String(userId) }).lean();
      if (!parent) throw new NotFoundException('Parent folder not found');
      folder.parent = updateFolderDto.parentId;
    }
    return folder.save();
  }

  async deleteFolder(id: string, userId: string): Promise<void> {
    // Đệ quy chuyển các folder con và file con vào thùng rác
    const subfolders = await this.folderModel.find({ parent: id, userId: String(userId), isDeleted: false }).lean();
    for (const subfolder of subfolders) {
      await this.deleteFolder(subfolder._id as string, userId);
    }
    // Chuyển file con vào thùng rác
    await this.fileModel.updateMany(
      { parent: id, userId: String(userId), isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );
    // Chuyển folder này vào thùng rác
    await this.folderModel.updateOne(
      { _id: id, userId: String(userId), isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );
  }

  async getRootFolders(userId: string, query?: { page?: number; limit?: number; sortField?: string; sort?: string }) {
    const filter = { parent: null, userId: String(userId) };
    const sortField = query?.sortField || 'createdAt';
    const sortOrder = query?.sort === 'false' ? -1 : 1;
    if (query && (query.page || query.limit)) {
      const page = parseInt(query.page as any, 10) || 1;
      const limit = parseInt(query.limit as any, 10) || 10;
      const skip = (page - 1) * limit;
      const [folders, totalDocuments] = await Promise.all([
        this.folderModel.find(filter).sort({ [sortField]: sortOrder }).skip(skip).limit(limit).lean().exec(),
        this.folderModel.countDocuments(filter),
      ]);
      return {
        folders,
        totalDocuments,
        totalPages: Math.ceil(totalDocuments / limit),
        currentPage: page,
        sortField,
        sortOrder: sortOrder === 1 ? 'asc' : 'desc',
      };
    }
    return this.folderModel.find(filter).sort({ [sortField]: sortOrder }).lean().exec();
  }

  async getTrashedFolders(userId: string) {
    return this.folderModel.find({ userId: String(userId), isDeleted: true }).lean().exec();
  }

  async restoreFolder(id: string, userId: string): Promise<void> {
    // Khôi phục folder này
    await this.folderModel.updateOne(
      { _id: id, userId: String(userId), isDeleted: true },
      { $set: { isDeleted: false, deletedAt: null } }
    );
    // Khôi phục file con
    await this.fileModel.updateMany(
      { parent: id, userId: String(userId), isDeleted: true },
      { $set: { isDeleted: false, deletedAt: null } }
    );
    // Đệ quy khôi phục folder con
    const subfolders = await this.folderModel.find({ parent: id, userId: String(userId), isDeleted: true }).lean();
    for (const subfolder of subfolders) {
      await this.restoreFolder(subfolder._id as string, userId);
    }
  }

  async hardDeleteFolder(id: string, userId: string): Promise<void> {
    // Đệ quy xóa vĩnh viễn folder con
    const subfolders = await this.folderModel.find({ parent: id, userId: String(userId), isDeleted: true }).lean();
    for (const subfolder of subfolders) {
      await this.hardDeleteFolder(subfolder._id as string, userId);
    }
    // Xóa vĩnh viễn file con
    await this.fileModel.deleteMany({ parent: id, userId: String(userId), isDeleted: true });
    // Xóa vĩnh viễn folder này
    await this.folderModel.deleteOne({ _id: id, userId: String(userId), isDeleted: true });
  }
}
