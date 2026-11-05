import { Module } from "@nestjs/common";
import { AccessGuard } from "../auth/access.guard";
import { AuthModule } from "../auth/auth.module";
import { PlanModule } from "../plan/plan.module";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";

@Module({
  imports: [AuthModule, PlanModule],
  controllers: [ProfileController],
  providers: [ProfileService, AccessGuard],
})
export class ProfileModule {}
