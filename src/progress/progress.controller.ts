import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { AccessGuard, type AccessPayload } from "../auth/access.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { LogWeightDto } from "./dto";
import { ProgressService } from "./progress.service";

@Controller("progress")
@UseGuards(AccessGuard)
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Get()
  summary(@CurrentUser() user: AccessPayload) {
    return this.progress.getSummary(user.sub);
  }

  @Get("weights")
  weights(@CurrentUser() user: AccessPayload, @Query("days") days?: string) {
    const parsed = days ? Number(days) : 90;
    return this.progress.listWeights(user.sub, Number.isFinite(parsed) ? parsed : 90);
  }

  @Post("weight")
  logWeight(@CurrentUser() user: AccessPayload, @Body() body: LogWeightDto) {
    return this.progress.logWeight(user.sub, body);
  }
}
