import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { IsString, MinLength } from "class-validator";
import { AccessGuard, type AccessPayload } from "../auth/access.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { PlanService } from "./plan.service";

class AssignPlanDto {
  @IsString()
  @MinLength(3)
  slug!: string;
}

@Controller()
@UseGuards(AccessGuard)
export class PlanController {
  constructor(private readonly plans: PlanService) {}

  @Get("plan")
  plan(@CurrentUser() user: AccessPayload) {
    return this.plans.getPlan(user.sub);
  }

  @Get("programmes")
  programmes() {
    return this.plans.listProgrammes();
  }

  @Post("plan")
  assign(@CurrentUser() user: AccessPayload, @Body() body: AssignPlanDto) {
    return this.plans.assignSlug(user.sub, body.slug);
  }

  @Get("exercises")
  exercises() {
    return this.plans.listExercises();
  }

  @Get("exercises/:id")
  exercise(@Param("id") id: string) {
    return this.plans.getExercise(id);
  }
}
