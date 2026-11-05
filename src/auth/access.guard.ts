import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";

export type AccessPayload = {
  sub: string;
  email: string;
  role: "user" | "admin";
};

@Injectable()
export class AccessGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request & { user?: AccessPayload }>();
    const header = request.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Sign in again.");
    }
    try {
      request.user = await this.jwt.verifyAsync<AccessPayload>(header.slice(7), {
        secret: this.config.getOrThrow<string>("ACCESS_TOKEN_SECRET"),
      });
      return true;
    } catch {
      throw new UnauthorizedException("Sign in again.");
    }
  }
}
