import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { AccessPayload } from "./access.guard";

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<{ user: AccessPayload }>();
    return request.user;
  },
);
