import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupMember } from './entities/group-member.entity';
import { Group } from './entities/group.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groups: Repository<Group>,
    @InjectRepository(GroupMember)
    private readonly members: Repository<GroupMember>,
  ) {}

  findByUser(userId: string): Promise<Group[]> {
    return this.groups
      .createQueryBuilder('g')
      .innerJoin('g.members', 'm', 'm.user_id = :userId AND m.deleted_at IS NULL', { userId })
      .where('g.deleted_at IS NULL')
      .getMany();
  }

  findById(id: string): Promise<Group | null> {
    return this.groups.findOne({ where: { id }, relations: ['members'] });
  }

  create(data: Partial<Group>): Promise<Group> {
    return this.groups.save(this.groups.create(data));
  }

  save(group: Group): Promise<Group> {
    return this.groups.save(group);
  }

  addMember(data: Partial<GroupMember>): Promise<GroupMember> {
    return this.members.save(this.members.create(data));
  }

  findMembers(groupId: string): Promise<GroupMember[]> {
    return this.members.find({ where: { groupId } });
  }
}
