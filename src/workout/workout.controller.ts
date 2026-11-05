import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AccessGuard, type AccessPayload } from "../auth/access.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import {
  SkipExerciseDto,
  StartWorkoutDto,
  SyncWorkoutDto,
  UpdateSetDto,
  UpdateWorkoutDto,
} from "./dto";
import { WorkoutService } from "./workout.service";

@Controller("workouts")
@UseGuards(AccessGuard)
export class WorkoutController {
  constructor(private readonly workouts: WorkoutService) {}

  @Post("start")
  start(@CurrentUser() user: AccessPayload, @Body() body: StartWorkoutDto) {
    return this.workouts.start(user.sub, body);
  }

  @Post("sync")
  sync(@CurrentUser() user: AccessPayload, @Body() body: SyncWorkoutDto) {
    return this.workouts.sync(user.sub, body);
  }

  @Get("active")
  active(@CurrentUser() user: AccessPayload) {
    return this.workouts.getActive(user.sub);
  }

  @Get()
  history(@CurrentUser() user: AccessPayload, @Query("limit", new ParseIntPipe({ optional: true })) limit?: number) {
    return this.workouts.listHistory(user.sub, limit ?? 20);
  }

  @Get(":id")
  one(@CurrentUser() user: AccessPayload, @Param("id") id: string) {
    return this.workouts.getSession(user.sub, id);
  }

  @Patch(":id")
  update(@CurrentUser() user: AccessPayload, @Param("id") id: string, @Body() body: UpdateWorkoutDto) {
    return this.workouts.updateSession(user.sub, id, body.gymMode);
  }

  @Patch(":id/exercises/:exerciseId/sets/:setNumber")
  updateSet(
    @CurrentUser() user: AccessPayload,
    @Param("id") id: string,
    @Param("exerciseId") exerciseId: string,
    @Param("setNumber", ParseIntPipe) setNumber: number,
    @Body() body: UpdateSetDto,
  ) {
    return this.workouts.updateSet(user.sub, id, exerciseId, setNumber, body);
  }

  @Post(":id/exercises/:exerciseId/skip")
  skip(
    @CurrentUser() user: AccessPayload,
    @Param("id") id: string,
    @Param("exerciseId") exerciseId: string,
    @Body() body: SkipExerciseDto,
  ) {
    return this.workouts.skipExercise(user.sub, id, exerciseId, body);
  }

  @Post(":id/complete")
  complete(@CurrentUser() user: AccessPayload, @Param("id") id: string) {
    return this.workouts.complete(user.sub, id);
  }

  @Post(":id/abandon")
  abandon(@CurrentUser() user: AccessPayload, @Param("id") id: string) {
    return this.workouts.abandon(user.sub, id);
  }
}
