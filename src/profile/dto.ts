import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import {
  activityLevels,
  cuisines,
  equipmentOptions,
  experiences,
  genders,
  goals,
  locations,
  restrictions,
  weekDays,
} from "../lib/targets";

export class SaveProfileDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name!: string;

  @Type(() => Number)
  @IsInt()
  @Min(16)
  @Max(100)
  age!: number;

  @IsIn(genders)
  gender!: (typeof genders)[number];

  @Type(() => Number)
  @IsInt()
  @Min(120)
  @Max(230)
  heightCm!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(30)
  @Max(300)
  weightKg!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(30)
  @Max(300)
  goalWeightKg!: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsIn(goals, { each: true })
  goals!: string[];

  @IsIn(experiences)
  experience!: (typeof experiences)[number];

  @IsIn(locations)
  location!: (typeof locations)[number];

  @IsArray()
  @IsIn(equipmentOptions, { each: true })
  equipment!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsIn(weekDays, { each: true })
  trainingDays!: string[];

  @IsIn(activityLevels)
  activityLevel!: (typeof activityLevels)[number];

  @IsArray()
  @ArrayMinSize(1)
  @IsIn(cuisines, { each: true })
  cuisines!: string[];

  @IsArray()
  @IsIn(restrictions, { each: true })
  restrictions!: string[];
}
