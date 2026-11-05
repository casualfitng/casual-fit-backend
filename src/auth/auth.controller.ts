import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { AccessGuard, type AccessPayload } from "./access.guard";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./current-user.decorator";
import { EmailPasswordDto, ForgotPasswordDto, OAuthDto, RefreshDto, ResetPasswordDto } from "./dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("signup")
  signup(@Body() body: EmailPasswordDto) {
    return this.auth.signup(body.email, body.password);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  login(@Body() body: EmailPasswordDto) {
    return this.auth.login(body.email, body.password);
  }

  @Post("oauth")
  @HttpCode(HttpStatus.OK)
  oauth(@Body() body: OAuthDto) {
    return this.auth.oauthSignIn(body.provider, body.idToken, body.avatarUrl);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  refresh(@Body() body: RefreshDto) {
    return this.auth.refresh(body.refreshToken);
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  logout(@Body() body: RefreshDto) {
    return this.auth.logout(body.refreshToken);
  }

  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.auth.forgotPassword(body.email);
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.auth.resetPassword(body.token, body.password);
  }

  @Get("me")
  @UseGuards(AccessGuard)
  me(@CurrentUser() user: AccessPayload) {
    return this.auth.me(user.sub);
  }
}
