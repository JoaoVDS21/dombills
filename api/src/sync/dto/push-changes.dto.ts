import { IsNumber, IsObject } from 'class-validator';

export class PushChangesDto {
  @IsNumber()
  lastPulledAt: number;

  @IsObject()
  changes: Record<string, {
    created: Record<string, unknown>[];
    updated: Record<string, unknown>[];
    deleted: string[];
  }>;
}
