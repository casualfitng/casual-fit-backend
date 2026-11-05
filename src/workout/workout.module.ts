import { Module } from "@nestjs/common";
import { AccessGuard } from "../auth/access.guard";
import { AuthModule } from "../auth/auth.module";
import { WorkoutController } from "./workout.controller";
import { WorkoutService } from "./workout.service";

@Module({
  imports: [AuthModule],
  controllers: [WorkoutController],
  providers: [WorkoutService, AccessGuard],
})
export class WorkoutModule {}
