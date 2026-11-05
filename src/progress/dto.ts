import { IsNumber, IsOptional, IsString, Matches, Max, Min } from "class-validator";

export class LogWeightDto {
  @IsNumber()
  @Min(30)
  @Max(300)
  weightKg!: number;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  loggedOn?: string;
}
