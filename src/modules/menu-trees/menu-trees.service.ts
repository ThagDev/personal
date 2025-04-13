import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMenuTreeDto } from './dto/create-menu-tree.dto';
import { UpdateMenuTreeDto } from './dto/update-menu-tree.dto';
import { Db, ObjectId, ReturnDocument } from 'mongodb';

@Injectable()
export class MenuTreesService {
  constructor(@Inject('MONGO_DB_CONNECTION') private db: Db) {}
  // Hàm chuyển name thành slug
  private async generateSlug(name: string): Promise<string> {
    return name
      .trim() // Xóa khoảng trắng đầu và cuối
      .toLowerCase() // Chuyển thành chữ thường
      .normalize('NFD') // Chuyển ký tự có dấu thành ký tự cơ bản
      .replace(/[\u0300-\u036f]/g, '') // Xóa các dấu
      .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
      .replace(/[^a-z0-9-]/g, '') // Loại bỏ ký tự không hợp lệ
      .replace(/-+/g, '-') // Xóa dấu gạch ngang thừa
      .replace(/^-|-$/g, ''); // Xóa dấu gạch ngang ở đầu hoặc cuối
  }
  async Menu_Categories_Service(createMenuTreeDto: CreateMenuTreeDto) {
    try {
      const convertNameToSlug = await this.generateSlug(createMenuTreeDto.name);
      const ObjectBody = {
        name: createMenuTreeDto.name,
        slug: convertNameToSlug,
        description: createMenuTreeDto.description,
        menuChildrens: createMenuTreeDto.menuChildrens,
      };
      const menu_categories_db = this.db.collection('menu_categories');
      const saveMenuTree = await menu_categories_db.insertOne(ObjectBody);
      const result = await menu_categories_db.findOne({
        _id: new ObjectId(saveMenuTree.insertedId),
      });
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async Menu_SubCategories_Service(
    id: string,
    createMenuTreeDto: CreateMenuTreeDto,
  ) {
    try {
      const menu_subcategories = this.db.collection('menu_subcategories');
      const menu_categories_db = this.db.collection('menu_categories');
      const findMenuTree = await menu_categories_db.findOne({
        _id: new ObjectId(id),
      });
      if (!findMenuTree) throw new NotFoundException('id not found');
      const convertNameToSlug = await this.generateSlug(createMenuTreeDto.name);
      const ObjectBody = {
        _id: new ObjectId(),
        name: createMenuTreeDto.name,
        slug: convertNameToSlug,
        description: createMenuTreeDto.description,
        menuChildrens: createMenuTreeDto.menuChildrens,
      };
      await menu_subcategories.insertOne(ObjectBody);
      await menu_categories_db.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $addToSet: { menuChildrens: ObjectBody._id } },
        { returnDocument: ReturnDocument.AFTER },
      );

      return ObjectBody;
    } catch (error) {
      throw new NotFoundException('Id menu parent not found');
    }
  }
  async Menu_ProductGroup_Service(
    id: string,
    createMenuTreeDto: CreateMenuTreeDto,
  ) {
    try {
      const menu_subcategories_db = this.db.collection('menu_subcategories');
      const menu_product_group_db = this.db.collection('menu_product_group');
      const find_id_menu_subcategory = await menu_subcategories_db.findOne({
        _id: new ObjectId(id),
      });
      if (!find_id_menu_subcategory)
        throw new NotFoundException('Id not found');

      const convertNameToSlug = await this.generateSlug(createMenuTreeDto.name);
      const ObjectBody = {
        _id: new ObjectId(),
        name: createMenuTreeDto.name,
        slug: convertNameToSlug,
        description: createMenuTreeDto.description,
        menuChildrens: createMenuTreeDto.menuChildrens,
      };
      await menu_product_group_db.insertOne(ObjectBody);
      await menu_subcategories_db.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $addToSet: { menuChildrens: ObjectBody._id } },
        { returnDocument: ReturnDocument.AFTER },
      );
      return ObjectBody;
    } catch (error) {
      throw new NotFoundException('Id not found');
    }
  }

  async GetMenuParentsService() {
    try {
      const menu_categories_db = this.db.collection('menu_categories');
      const result = await menu_categories_db
        .aggregate([
          {
            $lookup: {
              from: 'menu_subcategories',
              localField: 'menuChildrens',
              foreignField: '_id',
              as: 'menuChildrens',
            },
          },
          {
            $unwind: {
              path: '$menuChildrens', // Tách từng phần tử của menuChildrens
              preserveNullAndEmptyArrays: true, // Giữ lại nếu không có con
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              slug: 1,
              description: 1,
              menuChildrens: 1,
            },
          },
          {
            $lookup: {
              from: 'menu_product_group', // Tên collection menu con cấp 3
              localField: 'menuChildrens.menuChildrens', // Trường trong menu con (cấp 2)
              foreignField: '_id', // Khớp với _id trong menu con
              as: 'menuChildrens.menuChildrens', // Kết quả sẽ là mảng các đối tượng con cấp 3
            },
          },
        ])
        .toArray();

      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async GetMenuParentService(id: string) {
    try {
      const menuTreeDB = await this.db
        .collection('MenuTrees')
        .aggregate([{ $match: { _id: new ObjectId(id) } }])
        .toArray();
      return menuTreeDB;
    } catch (error) {
      throw new NotFoundException('Id menu parent not found');
    }
  }

  async UpdateMenuParentService(
    id: string,
    updateMenuTreeDto: UpdateMenuTreeDto,
  ) {
    try {
      const menu_categories_db = this.db.collection('menu_categories');
      const result = await menu_categories_db.findOneAndUpdate(
        { _id: new ObjectId(id) }, // filter
        { $set: updateMenuTreeDto }, // update
        { returnDocument: ReturnDocument.AFTER }, // options
      );
      return result;
    } catch (error) {
      throw new NotFoundException('Id menu parent not found');
    }
  }

  async DeleteMenuParentService(id: string) {
    try {
      const menu_categories_db = this.db.collection('menu_categories');
      await menu_categories_db.deleteOne({
        _id: new ObjectId(id),
      });
      return {
        message: ' `Delete menu categories success`',
      };
    } catch (error) {
      throw new NotFoundException('Id menu parent not found');
    }
  }
}
