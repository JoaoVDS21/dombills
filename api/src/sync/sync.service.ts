import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { GroupMember } from '../groups/entities/group-member.entity';
import { Group } from '../groups/entities/group.entity';
import { PaymentMethod } from '../payment-methods/entities/payment-method.entity';
import { TransactionSplit } from '../transactions/entities/transaction-split.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { PullResponse, RawRecord, SyncChanges, TableChanges, emptyTable } from './sync.types';

@Injectable()
export class SyncService {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  // ─── PULL ─────────────────────────────────────────────────────────────────

  async pullChanges(userId: string, lastPulledAt: number): Promise<PullResponse> {
    const timestamp = Date.now();
    const since = new Date(lastPulledAt);

    const [groups, groupMembers, categories, paymentMethods, transactions, splits] =
      await Promise.all([
        this.pullGroups(userId, since),
        this.pullGroupMembers(userId, since),
        this.pullCategories(userId, since),
        this.pullPaymentMethods(userId, since),
        this.pullTransactions(userId, since),
        this.pullTransactionSplits(userId, since),
      ]);

    return {
      changes: {
        groups,
        group_members: groupMembers,
        categories,
        payment_methods: paymentMethods,
        transactions,
        transaction_splits: splits,
      },
      timestamp,
    };
  }

  private async pullGroups(userId: string, since: Date): Promise<TableChanges> {
    const memberIds = await this.db
      .getRepository(GroupMember)
      .createQueryBuilder('m')
      .withDeleted()
      .select('m.group_id')
      .where('m.user_id = :userId', { userId })
      .getMany()
      .then((rows) => rows.map((r) => r.groupId));

    if (!memberIds.length) return emptyTable();

    const repo = this.db.getRepository(Group);

    const updated = await repo
      .createQueryBuilder('g')
      .where('g.id IN (:...ids)', { ids: memberIds })
      .andWhere('g.updated_at > :since', { since })
      .getMany()
      .then((rows) => rows.map((g) => this.mapGroup(g)));

    const deleted = await repo
      .createQueryBuilder('g')
      .withDeleted()
      .select('g.id')
      .where('g.id IN (:...ids)', { ids: memberIds })
      .andWhere('g.deleted_at > :since', { since })
      .getMany()
      .then((rows) => rows.map((g) => g.id));

    return { created: [], updated, deleted };
  }

  private async pullGroupMembers(userId: string, since: Date): Promise<TableChanges> {
    const groupIds = await this.db
      .getRepository(GroupMember)
      .createQueryBuilder('m')
      .withDeleted()
      .select('m.group_id')
      .where('m.user_id = :userId', { userId })
      .getMany()
      .then((rows) => rows.map((r) => r.groupId));

    if (!groupIds.length) return emptyTable();

    const repo = this.db.getRepository(GroupMember);

    const updated = await repo
      .createQueryBuilder('m')
      .where('m.group_id IN (:...ids)', { ids: groupIds })
      .andWhere('m.updated_at > :since', { since })
      .getMany()
      .then((rows) => rows.map((m) => this.mapGroupMember(m)));

    const deleted = await repo
      .createQueryBuilder('m')
      .withDeleted()
      .select('m.id')
      .where('m.group_id IN (:...ids)', { ids: groupIds })
      .andWhere('m.deleted_at > :since', { since })
      .getMany()
      .then((rows) => rows.map((m) => m.id));

    return { created: [], updated, deleted };
  }

  private async pullCategories(userId: string, since: Date): Promise<TableChanges> {
    const repo = this.db.getRepository(Category);

    const updated = await repo
      .createQueryBuilder('c')
      .where('(c.user_id = :userId OR c.user_id IS NULL)', { userId })
      .andWhere('c.updated_at > :since', { since })
      .getMany()
      .then((rows) => rows.map((c) => this.mapCategory(c)));

    const deleted = await repo
      .createQueryBuilder('c')
      .withDeleted()
      .select('c.id')
      .where('(c.user_id = :userId OR c.user_id IS NULL)', { userId })
      .andWhere('c.deleted_at > :since', { since })
      .getMany()
      .then((rows) => rows.map((c) => c.id));

    return { created: [], updated, deleted };
  }

  private async pullPaymentMethods(userId: string, since: Date): Promise<TableChanges> {
    const repo = this.db.getRepository(PaymentMethod);

    const updated = await repo
      .createQueryBuilder('p')
      .where('p.user_id = :userId', { userId })
      .andWhere('p.updated_at > :since', { since })
      .getMany()
      .then((rows) => rows.map((p) => this.mapPaymentMethod(p)));

    const deleted = await repo
      .createQueryBuilder('p')
      .withDeleted()
      .select('p.id')
      .where('p.user_id = :userId', { userId })
      .andWhere('p.deleted_at > :since', { since })
      .getMany()
      .then((rows) => rows.map((p) => p.id));

    return { created: [], updated, deleted };
  }

  private async pullTransactions(userId: string, since: Date): Promise<TableChanges> {
    const repo = this.db.getRepository(Transaction);

    const updated = await repo
      .createQueryBuilder('t')
      .innerJoin('t.splits', 's', 's.user_id = :userId AND s.deleted_at IS NULL', { userId })
      .andWhere('t.updated_at > :since', { since })
      .getMany()
      .then((rows) => rows.map((t) => this.mapTransaction(t)));

    const deleted = await repo
      .createQueryBuilder('t')
      .withDeleted()
      .innerJoin(
        TransactionSplit,
        's',
        's.transaction_id = t.id AND s.user_id = :userId',
        { userId },
      )
      .select('t.id')
      .where('t.deleted_at > :since', { since })
      .getMany()
      .then((rows) => rows.map((t) => t.id));

    return { created: [], updated, deleted };
  }

  private async pullTransactionSplits(userId: string, since: Date): Promise<TableChanges> {
    const groupIds = await this.db
      .getRepository(GroupMember)
      .createQueryBuilder('m')
      .withDeleted()
      .select('m.group_id')
      .where('m.user_id = :userId', { userId })
      .getMany()
      .then((rows) => rows.map((r) => r.groupId));

    const repo = this.db.getRepository(TransactionSplit);

    // User sees: their own splits + splits from transactions in their groups
    const qb = repo
      .createQueryBuilder('s')
      .innerJoin(Transaction, 't', 't.id = s.transaction_id AND t.deleted_at IS NULL');

    const whereClause = groupIds.length
      ? '(s.user_id = :userId OR t.group_id IN (:...groupIds))'
      : 's.user_id = :userId';

    const updated = await qb
      .where(whereClause, { userId, groupIds: groupIds.length ? groupIds : [''] })
      .andWhere('s.updated_at > :since', { since })
      .getMany()
      .then((rows) => rows.map((s) => this.mapSplit(s)));

    const deleted = await repo
      .createQueryBuilder('s')
      .withDeleted()
      .select('s.id')
      .where('s.user_id = :userId', { userId })
      .andWhere('s.deleted_at > :since', { since })
      .getMany()
      .then((rows) => rows.map((s) => s.id));

    return { created: [], updated, deleted };
  }

  // ─── PUSH ─────────────────────────────────────────────────────────────────

  async pushChanges(userId: string, changes: SyncChanges): Promise<void> {
    await this.db.transaction(async (em) => {
      if (changes.groups) await this.pushGroups(em, userId, changes.groups);
      if (changes.group_members) await this.pushGroupMembers(em, userId, changes.group_members);
      if (changes.categories) await this.pushCategories(em, userId, changes.categories);
      if (changes.payment_methods) await this.pushPaymentMethods(em, userId, changes.payment_methods);
      if (changes.transactions) await this.pushTransactions(em, userId, changes.transactions);
      if (changes.transaction_splits) await this.pushSplits(em, userId, changes.transaction_splits);
    });
  }

  private async pushGroups(em: EntityManager, userId: string, changes: TableChanges) {
    for (const raw of [...changes.created, ...changes.updated]) {
      await em.save(Group, {
        id: raw['id'] as string,
        name: raw['name'] as string,
        hexColor: raw['hex_color'] as string,
        imagePath: (raw['image_path'] as string | null) ?? null,
        ownerId: (raw['owner_id'] as string) ?? userId,
      });
    }
    for (const id of changes.deleted) {
      await em.softDelete(Group, id);
    }
  }

  private async pushGroupMembers(em: EntityManager, _userId: string, changes: TableChanges) {
    for (const raw of [...changes.created, ...changes.updated]) {
      await em.save(GroupMember, {
        id: raw['id'] as string,
        groupId: raw['group_id'] as string,
        userId: raw['user_id'] as string,
        role: raw['role'] as 'ADMIN' | 'MEMBER',
      });
    }
    for (const id of changes.deleted) {
      await em.softDelete(GroupMember, id);
    }
  }

  private async pushCategories(em: EntityManager, userId: string, changes: TableChanges) {
    for (const raw of [...changes.created, ...changes.updated]) {
      await em.save(Category, {
        id: raw['id'] as string,
        name: raw['name'] as string,
        iconName: raw['icon_name'] as string,
        color: raw['color'] as string,
        userId: (raw['user_id'] as string | null) ?? userId,
      });
    }
    for (const id of changes.deleted) {
      await em.softDelete(Category, id);
    }
  }

  private async pushPaymentMethods(em: EntityManager, userId: string, changes: TableChanges) {
    for (const raw of [...changes.created, ...changes.updated]) {
      await em.save(PaymentMethod, {
        id: raw['id'] as string,
        userId: (raw['user_id'] as string) ?? userId,
        name: raw['name'] as string,
        type: raw['type'] as 'CREDIT' | 'DEBIT' | 'PIX' | 'CASH',
        lastDigits: (raw['last_digits'] as string | null) ?? null,
      });
    }
    for (const id of changes.deleted) {
      await em.softDelete(PaymentMethod, id);
    }
  }

  private async pushTransactions(em: EntityManager, userId: string, changes: TableChanges) {
    for (const raw of [...changes.created, ...changes.updated]) {
      const dueDate = raw['due_date'] as number;
      const date = raw['date'] as number;
      await em.save(Transaction, {
        id: raw['id'] as string,
        description: raw['description'] as string,
        totalAmount: raw['total_amount'] as number,
        type: raw['type'] as 'REVENUE' | 'EXPENSE',
        categoryId: raw['category_id'] as string,
        paymentMethodId: raw['payment_method_id'] as string,
        groupId: (raw['group_id'] as string | null) ?? null,
        createdBy: (raw['created_by'] as string) ?? userId,
        date: new Date(date).toISOString().split('T')[0],
        dueDate: new Date(dueDate).toISOString().split('T')[0],
        status: (raw['status'] as 'PENDING' | 'PAID') ?? 'PENDING',
        parentId: (raw['parent_id'] as string | null) ?? null,
        installmentNumber: (raw['installment_number'] as number) ?? 1,
        totalInstallments: (raw['total_installments'] as number) ?? 1,
        isRecurring: (raw['is_recurring'] as boolean) ?? false,
        frequency: (raw['frequency'] as 'NONE' | 'MONTHLY' | 'WEEKLY') ?? 'NONE',
      });
    }
    for (const id of changes.deleted) {
      await em.softDelete(Transaction, id);
    }
  }

  private async pushSplits(em: EntityManager, _userId: string, changes: TableChanges) {
    for (const raw of [...changes.created, ...changes.updated]) {
      await em.save(TransactionSplit, {
        id: raw['id'] as string,
        transactionId: raw['transaction_id'] as string,
        userId: raw['user_id'] as string,
        shareAmount: raw['share_amount'] as number,
        isPayer: (raw['is_payer'] as boolean) ?? false,
        paidToPayer: (raw['paid_to_payer'] as boolean) ?? false,
      });
    }
    for (const id of changes.deleted) {
      await em.softDelete(TransactionSplit, id);
    }
  }

  // ─── MAPPERS ──────────────────────────────────────────────────────────────

  private mapGroup(g: Group): RawRecord {
    return {
      id: g.id,
      name: g.name,
      hex_color: g.hexColor,
      image_path: g.imagePath ?? null,
      owner_id: g.ownerId,
      updated_at: g.updatedAt.getTime(),
      is_deleted: false,
    };
  }

  private mapGroupMember(m: GroupMember): RawRecord {
    return {
      id: m.id,
      group_id: m.groupId,
      user_id: m.userId,
      role: m.role,
      updated_at: m.updatedAt.getTime(),
      is_deleted: false,
    };
  }

  private mapCategory(c: Category): RawRecord {
    return {
      id: c.id,
      name: c.name,
      icon_name: c.iconName,
      color: c.color,
      user_id: c.userId ?? null,
      updated_at: c.updatedAt.getTime(),
      is_deleted: false,
    };
  }

  private mapPaymentMethod(p: PaymentMethod): RawRecord {
    return {
      id: p.id,
      user_id: p.userId,
      name: p.name,
      type: p.type,
      last_digits: p.lastDigits ?? null,
      updated_at: p.updatedAt.getTime(),
      is_deleted: false,
    };
  }

  private mapTransaction(t: Transaction): RawRecord {
    return {
      id: t.id,
      description: t.description,
      total_amount: Number(t.totalAmount),
      type: t.type,
      category_id: t.categoryId,
      payment_method_id: t.paymentMethodId,
      group_id: t.groupId ?? null,
      created_by: t.createdBy,
      date: new Date(t.date).getTime(),
      due_date: new Date(t.dueDate).getTime(),
      status: t.status,
      parent_id: t.parentId ?? null,
      installment_number: t.installmentNumber,
      total_installments: t.totalInstallments,
      is_recurring: t.isRecurring,
      frequency: t.frequency,
      updated_at: t.updatedAt.getTime(),
      is_deleted: false,
    };
  }

  private mapSplit(s: TransactionSplit): RawRecord {
    return {
      id: s.id,
      transaction_id: s.transactionId,
      user_id: s.userId,
      share_amount: Number(s.shareAmount),
      is_payer: s.isPayer,
      paid_to_payer: s.paidToPayer,
      updated_at: s.updatedAt.getTime(),
      is_deleted: false,
    };
  }
}
