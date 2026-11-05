import { Transform } from "class-transformer";
import { IsEmail, IsIn, IsOptional, IsString, IsUrl, MaxLength, MinLength } from "class-validator";

export class EmailPasswordDto {
  @Transform(({ value }) => String(value).trim().toLowerCase())
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class RefreshDto {
  @IsString()
  @MinLength(20)
  refreshToken!: string;
}

export class ForgotPasswordDto {
  @Transform(({ value }) => String(value).trim().toLowerCase())
  @IsEmail()
  email!: string;
}

export class OAuthDto {
  @IsIn(["google", "apple"])
  provider!: "google" | "apple";

  @IsString()
  @MinLength(20)
  idToken!: string;

  /** Google profile photo URL from the native SDK (optional). */
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  avatarUrl?: string;
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(20)
  token!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
