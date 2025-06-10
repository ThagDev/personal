import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';
import { Policy } from './entities/policy.entity';
import { Permission } from './entities/permission.entity';

@Injectable()
export class RolesPolicyService {
  constructor(@Inject('MONGO_DB_CONNECTION') private db: Db) {}

  async createPermission(permission: Permission) {
    const existing = await this.db
      .collection('permissions')
      .findOne({ name: permission.name });
    if (existing) throw new ConflictException('Permission already exists');
    const { insertedId } = await this.db
      .collection('permissions')
      .insertOne(permission);
    return this.db.collection('permissions').findOne({ _id: insertedId });
  }

  async createPolicy(policy: Policy) {
    const existing = await this.db
      .collection('policies')
      .findOne({ name: policy.name });
    if (existing) throw new ConflictException('Policy already exists');
    const { insertedId } = await this.db
      .collection('policies')
      .insertOne(policy);
    return this.db.collection('policies').findOne({ _id: insertedId });
  }

  async assignPermissionToPolicy(policyId: string, permissionName: string) {
    const policy = await this.db
      .collection('policies')
      .findOne({ _id: new ObjectId(policyId) });
    if (!policy) throw new NotFoundException('Policy not found');
    await this.db
      .collection('policies')
      .updateOne(
        { _id: new ObjectId(policyId) },
        { $addToSet: { permissions: permissionName } },
      );
    return this.db
      .collection('policies')
      .findOne({ _id: new ObjectId(policyId) });
  }

  async assignPermissionsToPolicy(policyId: string, permissions: string[]) {
    const policy = await this.db
      .collection('policies')
      .findOne({ _id: new ObjectId(policyId) });
    if (!policy) throw new NotFoundException('Policy not found');
    await this.db
      .collection('policies')
      .updateOne(
        { _id: new ObjectId(policyId) },
        { $addToSet: { permissions: { $each: permissions } } },
      );
    return this.db
      .collection('policies')
      .findOne({ _id: new ObjectId(policyId) });
  }

  async assignPolicyToRole(roleId: string, policyId: string) {
    const role = await this.db
      .collection('roles')
      .findOne({ _id: new ObjectId(roleId) });
    if (!role) throw new NotFoundException('Role not found');
    await this.db
      .collection('roles')
      .updateOne(
        { _id: new ObjectId(roleId) },
        { $addToSet: { policies: policyId } },
      );
    return this.db.collection('roles').findOne({ _id: new ObjectId(roleId) });
  }

  async assignPermissionToRole(roleId: string, permissionName: string) {
    const role = await this.db
      .collection('roles')
      .findOne({ _id: new ObjectId(roleId) });
    if (!role) throw new NotFoundException('Role not found');
    await this.db
      .collection('roles')
      .updateOne(
        { _id: new ObjectId(roleId) },
        { $addToSet: { permissions: permissionName } },
      );
    return this.db.collection('roles').findOne({ _id: new ObjectId(roleId) });
  }

  async getPermissions() {
    return this.db.collection('permissions').find({}).toArray();
  }

  async getPolicies() {
    return this.db.collection('policies').find({}).toArray();
  }
}
