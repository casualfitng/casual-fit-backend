import { Module } from "@nestjs/common";
import { AccessGuard } from "../auth/access.guard";
import { AuthModule } from "../auth/auth.module";
import { PlanModule } from "../plan/plan.module";
import { ProgressController } from "./progress.controller";
import { ProgressService } from "./progress.service";

@Module({
  imports: [AuthModule, PlanModule],
  controllers: [ProgressController],
  providers: [ProgressService, AccessGuard],
})
export class ProgressModule {}
