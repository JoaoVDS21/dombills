import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  findForUser(userId: string): Promise<Category[]> {
    return this.repo.find({
      where: [{ userId }, { userId: IsNull() }],
      order: { name: 'ASC' },
    });
  }

  findById(id: string): Promise<Category | null> {
    return this.repo.findOneBy({ id });
  }

  create(data: Partial<Category>): Promise<Category> {
    return this.repo.save(this.repo.create(data));
  }

  save(category: Category): Promise<Category> {
    return this.repo.save(category);
  }

  softDelete(id: string) {
    return this.repo.softDelete(id);
  }
}
