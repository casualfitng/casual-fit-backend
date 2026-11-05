import { Controller, Get, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { DbModule } from "./db/db.module";
import { PlanModule } from "./plan/plan.module";
import { ProfileModule } from "./profile/profile.module";
import { ProgressModule } from "./progress/progress.module";
import { WorkoutModule } from "./workout/workout.module";

@Controller()
class HealthController {
  @Get("health")
  health() {
    return { ok: true };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule,
    AuthModule,
    PlanModule,
    ProfileModule,
    ProgressModule,
    WorkoutModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
