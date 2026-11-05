import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

export class StartWorkoutDto {
  @IsUUID()
  planDayId!: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  clientId?: string;
}

export class UpdateWorkoutDto {
  @IsOptional()
  @IsBoolean()
  gymMode?: boolean;
}

export class UpdateSetDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(500)
  weightKg?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(200)
  reps?: number | null;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}

export class SkipExerciseDto {
  @IsString()
  @MinLength(2)
  reason!: string;

  @IsOptional()
  @IsUUID()
  replaceExerciseId?: string;
}

class SyncSetDto {
  @IsInt()
  @Min(1)
  setNumber!: number;

  @IsOptional()
  @IsNumber()
  weightKg?: number | null;

  @IsOptional()
  @IsInt()
  reps?: number | null;

  @IsBoolean()
  completed!: boolean;
}

class SyncExerciseDto {
  @IsUUID()
  exerciseId!: string;

  @IsInt()
  position!: number;

  @IsInt()
  targetSets!: number;

  @IsInt()
  repsMin!: number;

  @IsInt()
  repsMax!: number;

  @IsInt()
  restSeconds!: number;

  @IsString()
  repUnit!: string;

  @IsBoolean()
  skipped!: boolean;

  @IsOptional()
  @IsString()
  skipReason?: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncSetDto)
  sets!: SyncSetDto[];
}

export class SyncWorkoutDto {
  @IsString()
  @MinLength(8)
  clientId!: string;

  @IsUUID()
  planDayId!: string;

  @IsString()
  weekday!: string;

  @IsString()
  title!: string;

  @IsBoolean()
  gymMode!: boolean;

  @IsString()
  status!: "in_progress" | "completed" | "abandoned";

  @IsString()
  startedAt!: string;

  @IsOptional()
  @IsString()
  completedAt?: string | null;

  @IsOptional()
  @IsInt()
  durationSeconds?: number | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncExerciseDto)
  exercises!: SyncExerciseDto[];
}
