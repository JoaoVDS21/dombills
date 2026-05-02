import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { PushChangesDto } from './dto/push-changes.dto';
import { SyncService } from './sync.service';

@UseGuards(JwtAuthGuard)
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('pull')
  pull(
    @Request() req: { user: User },
    @Query('lastPulledAt') lastPulledAt = '0',
  ) {
    return this.syncService.pullChanges(req.user.id, Number(lastPulledAt));
  }

  @Post('push')
  async push(@Request() req: { user: User }, @Body() dto: PushChangesDto) {
    await this.syncService.pushChanges(req.user.id, dto.changes);
    return { ok: true };
  }
}
