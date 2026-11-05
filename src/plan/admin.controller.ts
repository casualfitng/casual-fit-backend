import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { IsArray, IsString, MinLength } from "class-validator";
import { AccessGuard, type AccessPayload } from "../auth/access.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { PlanService } from "./plan.service";

class ExerciseBody {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  difficulty!: string;

  @IsArray()
  @IsString({ each: true })
  primaryMuscles!: string[];

  @IsArray()
  @IsString({ each: true })
  equipment!: string[];

  @IsArray()
  @IsString({ each: true })
  instructions!: string[];

  @IsArray()
  @IsString({ each: true })
  mistakes!: string[];
}

class RenameBody {
  @IsString()
  @MinLength(2)
  name!: string;
}

class UpdateExerciseBody {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsArray()
  @IsString({ each: true })
  instructions!: string[];

  @IsArray()
  @IsString({ each: true })
  mistakes!: string[];
}

@Controller("admin")
@UseGuards(AccessGuard)
export class AdminController {
  constructor(private readonly plans: PlanService) {}

  @Get("exercises")
  exercises(@CurrentUser() user: AccessPayload) {
    this.assertOwner(user);
    return this.plans.listExercises();
  }

  @Post("exercises")
  create(@CurrentUser() user: AccessPayload, @Body() body: ExerciseBody) {
    this.assertOwner(user);
    return this.plans.createExercise(body);
  }

  @Patch("exercises/:id")
  update(@CurrentUser() user: AccessPayload, @Param("id") id: string, @Body() body: UpdateExerciseBody) {
    this.assertOwner(user);
    return this.plans.updateExercise(id, body);
  }

  @Delete("exercises/:id")
  remove(@CurrentUser() user: AccessPayload, @Param("id") id: string) {
    this.assertOwner(user);
    return this.plans.deleteExercise(id);
  }

  @Get("programmes")
  programmes(@CurrentUser() user: AccessPayload) {
    this.assertOwner(user);
    return this.plans.listProgrammes();
  }

  @Patch("programmes/:id")
  rename(@CurrentUser() user: AccessPayload, @Param("id") id: string, @Body() body: RenameBody) {
    this.assertOwner(user);
    return this.plans.renameProgramme(id, body.name);
  }

  private assertOwner(user: AccessPayload) {
    if (user.role !== "admin") throw new ForbiddenException("Owner access only.");
  }
}
