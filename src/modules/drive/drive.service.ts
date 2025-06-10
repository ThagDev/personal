import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { File } from './interfaces/file.interface';
import { Folder } from './interfaces/folder.interface';

@Injectable()
export class DriveService {
  constructor(
    @InjectModel('File') private readonly fileModel: Model<File>,
    @InjectModel('Folder') private readonly folderModel: Model<Folder>,
  ) {}

  async getContents({
    userId,
    parentId,
    search,
    sortField,
    sortOrder,
    page,
    limit,
  }) {
    const filter: any = { userId };
    if (parentId) filter.parent = parentId;
    else filter.parent = null;
    if (search) filter.name = { $regex: search, $options: 'i' };
    // Folders
    const folderQuery = this.folderModel.find(filter).lean();
    // Files
    const fileQuery = this.fileModel.find(filter).lean();
    // Sort
    const sort: any = {};
    if (sortField) sort[sortField] = sortOrder === 'desc' ? -1 : 1;
    else sort.createdAt = -1;
    folderQuery.sort(sort);
    fileQuery.sort(sort);
    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    folderQuery.skip((pageNum - 1) * limitNum).limit(limitNum);
    fileQuery.skip((pageNum - 1) * limitNum).limit(limitNum);
    // Execute
    const [folders, files, totalFolders, totalFiles] = await Promise.all([
      folderQuery.exec(),
      fileQuery.exec(),
      this.folderModel.countDocuments(filter),
      this.fileModel.countDocuments(filter),
    ]);
    return {
      folders,
      files,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalFolders,
        totalFiles,
      },
    };
  }
}
