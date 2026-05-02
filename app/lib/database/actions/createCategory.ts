import { database } from '../index';
import { Category } from '../models/Category';

type Input = {
  userId: string;
  name: string;
  iconName: string;
  color: string;
};

export async function createCategory(input: Input): Promise<void> {
  await database.write(async () => {
    await database.get<Category>('categories').create((c) => {
      c.name = input.name;
      c.iconName = input.iconName;
      c.color = input.color;
      c.userId = input.userId;
      c.isDeleted = false;
    });
  });
}

export async function softDeleteCategory(id: string): Promise<void> {
  await database.write(async () => {
    const record = await database.get<Category>('categories').find(id);
    await record.update((c) => {
      c.isDeleted = true;
    });
  });
}
