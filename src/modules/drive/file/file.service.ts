import {
  Injectable,
  NotFoundException,
  Inject,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { File } from '../../drive/interfaces/file.interface';
import { Folder } from '../../drive/interfaces/folder.interface';
import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';

@Injectable()
export class FileService {
  constructor(
    @InjectModel('File') private readonly fileModel: Model<File>,
    @InjectModel('Folder') private readonly folderModel: Model<Folder>,
    @Inject('MONGO_DB_CONNECTION_GridFSBucket')
    private readonly gridFSBucket: GridFSBucket,
  ) {}

  async create(createFileDto: CreateFileDto, userId: string): Promise<File> {
    const { name, parentId, path, mimeType, size } = createFileDto;
    let parent = null;
    if (parentId) {
      parent = await this.folderModel.findOne({ _id: parentId, userId });
      if (!parent) throw new NotFoundException('Parent folder not found');
    }
    const file = new this.fileModel({
      name,
      parent: parentId || null,
      path,
      mimeType,
      size,
      userId,
    });
    return file.save();
  }

  async findAll(
    userId: string,
    query?: {
      page?: number;
      limit?: number;
      sortField?: string;
      sort?: string;
    },
  ) {
    const filter = { userId };
    const sortField = query?.sortField || 'createdAt';
    const sortOrder = query?.sort === 'false' ? -1 : 1;
    if (query && (query.page || query.limit)) {
      const page = parseInt(query.page as any, 10) || 1;
      const limit = parseInt(query.limit as any, 10) || 10;
      const skip = (page - 1) * limit;
      const [files, totalDocuments] = await Promise.all([
        this.fileModel
          .find(filter)
          .sort({ [sortField]: sortOrder })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        this.fileModel.countDocuments(filter),
      ]);
      return {
        files,
        totalDocuments,
        totalPages: Math.ceil(totalDocuments / limit),
        currentPage: page,
        sortField,
        sortOrder: sortOrder === 1 ? 'asc' : 'desc',
      };
    }
    return this.fileModel
      .find(filter)
      .sort({ [sortField]: sortOrder })
      .lean()
      .exec();
  }

  async findOne(id: string, userId: string): Promise<File> {
    const file = await this.fileModel.findOne({ _id: id, userId }).lean();
    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  async update(
    id: string,
    updateFileDto: UpdateFileDto,
    userId: string,
  ): Promise<File> {
    if (updateFileDto.parentId) {
      const parent = await this.folderModel
        .findOne({ _id: updateFileDto.parentId, userId })
        .lean();
      if (!parent) throw new NotFoundException('Parent folder not found');
    }
    const result = await this.fileModel.updateOne(
      { _id: id, userId },
      { $set: updateFileDto },
    );
    if (result.matchedCount === 0)
      throw new NotFoundException('File not found');
    return this.fileModel.findOne({ _id: id, userId }).lean();
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.fileModel.updateOne(
      { _id: id, userId, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } },
    );
    if (result.matchedCount === 0)
      throw new NotFoundException('File not found');
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    userId: string,
    req: any,
  ) {
    if (!files || files.length === 0) {
      throw new Error('No files uploaded');
    }
    const host = req.headers['host'];
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const results = await Promise.all(
      files.map(async (file) => {
        try {
          const readableStream = Readable.from(file.buffer);
          const uploadStream = this.gridFSBucket.openUploadStream(
            file.originalname,
            {
              contentType: file.mimetype,
              metadata: {
                userId,
                originalname: file.originalname,
                size: file.size,
                uploadedAt: new Date(),
              },
            },
          );
          await new Promise((resolve, reject) => {
            readableStream
              .pipe(uploadStream)
              .on('finish', resolve)
              .on('error', reject);
          });
          // Tạo url nếu là file ảnh
          const isImage = file.mimetype.startsWith('image/');
          const url = isImage
            ? `${protocol}://${host}/uploads/image/${uploadStream.id}`
            : undefined;
          // Đảm bảo tạo bản ghi file root (parent: null) trong collection File
          await this.fileModel.create({
            name: file.originalname,
            parent: null, // luôn là file root nếu upload-multi không truyền parentId
            path: `/uploads/${file.originalname}`,
            mimeType: file.mimetype,
            size: file.size,
            userId,
            url,
          });
          return {
            fileId: uploadStream.id.toString(),
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            userId,
            url,
          };
        } catch (err) {
          return {
            fileId: null,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            userId,
            error: err?.message || 'Unknown error',
          };
        }
      }),
    );
    return {
      message: 'Upload thành công',
      files: results,
    };
  }

  async downloadFile(id: string, userId: string, res: any) {
    try {
      const objectId = typeof id === 'string' ? new ObjectId(id) : id;
      // Tìm file trong GridFS, kiểm tra userId
      const file = await this.gridFSBucket
        .find({ _id: objectId, 'metadata.userId': userId })
        .next();
      if (!file)
        throw new ForbiddenException('File not found or access denied');
      res.setHeader(
        'Content-Type',
        file.contentType || 'application/octet-stream',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${file.filename}"`,
      );
      const downloadStream = this.gridFSBucket.openDownloadStream(objectId);
      downloadStream.pipe(res).on('error', (error: any) => {
        throw new InternalServerErrorException({
          message: 'File download failed',
          error: error,
        });
      });
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Invalid file ID or access denied',
        error: error,
      });
    }
  }

  async searchFileByName(name: string, userId: string) {
    if (!name) return [];
    // Tìm kiếm không phân biệt hoa thường, chỉ trả về file của user
    return this.fileModel
      .find({
        userId,
        name: { $regex: name, $options: 'i' },
      })
      .exec();
  }

  async getFileMetadata(id: string, userId: string) {
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    const file = await this.gridFSBucket
      .find({ _id: objectId, 'metadata.userId': userId })
      .next();
    if (!file) throw new ForbiddenException('File not found or access denied');
    // Trả về metadata, không trả về nội dung file
    return {
      _id: file._id,
      filename: file.filename,
      length: file.length,
      chunkSize: file.chunkSize,
      uploadDate: file.uploadDate,
      contentType: file.contentType,
      metadata: file.metadata,
    };
  }

  async getFilesInFolder(folderId: string, userId: string) {
    return this.fileModel.find({ parent: folderId, userId }).exec();
  }

  async getRootFiles(
    userId: string,
    query?: {
      page?: number;
      limit?: number;
      sortField?: string;
      sort?: string;
    },
  ) {
    // console.log('FileService.getRootFiles userId:', userId, 'query:', query);
    const filter = { parent: null, userId: String(userId) };
    const sortField = query?.sortField || 'createdAt';
    const sortOrder = query?.sort === 'false' ? -1 : 1;
    try {
      if (query && (query.page || query.limit)) {
        const page = parseInt(query.page as any, 10) || 1;
        const limit = parseInt(query.limit as any, 10) || 10;
        const skip = (page - 1) * limit;
        const [files, totalDocuments] = await Promise.all([
          this.fileModel
            .find(filter)
            .sort({ [sortField]: sortOrder })
            .skip(skip)
            .limit(limit)
            .exec(),
          this.fileModel.countDocuments(filter),
        ]);
        return {
          files,
          totalDocuments,
          totalPages: Math.ceil(totalDocuments / limit),
          currentPage: page,
          sortField,
          sortOrder: sortOrder === 1 ? 'asc' : 'desc',
        };
      }
      return this.fileModel
        .find(filter)
        .sort({ [sortField]: sortOrder })
        .exec();
    } catch (err) {
      console.error('FileService.getRootFiles error:', err);
      throw err;
    }
  }

  async getTrashedFiles(userId: string) {
    return this.fileModel.find({ userId, isDeleted: true }).lean().exec();
  }

  async restoreFile(id: string, userId: string): Promise<void> {
    const result = await this.fileModel.updateOne(
      { _id: id, userId, isDeleted: true },
      { $set: { isDeleted: false, deletedAt: null } },
    );
    if (result.matchedCount === 0)
      throw new NotFoundException('File not found in trash');
  }

  async hardDeleteFile(id: string, userId: string): Promise<void> {
    const result = await this.fileModel.deleteOne({
      _id: id,
      userId,
      isDeleted: true,
    });
    if (result.deletedCount === 0)
      throw new NotFoundException('File not found in trash');
  }
}
