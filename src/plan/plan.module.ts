import { Module } from "@nestjs/common";
import { AccessGuard } from "../auth/access.guard";
import { AuthModule } from "../auth/auth.module";
import { AdminController } from "./admin.controller";
import { PlanController } from "./plan.controller";
import { PlanService } from "./plan.service";

@Module({
  imports: [AuthModule],
  controllers: [PlanController, AdminController],
  providers: [PlanService, AccessGuard],
  exports: [PlanService],
})
export class PlanModule {}
