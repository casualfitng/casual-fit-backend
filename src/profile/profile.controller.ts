import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { AccessGuard, type AccessPayload } from "../auth/access.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { SaveProfileDto } from "./dto";
import { ProfileService } from "./profile.service";

@Controller("profile")
@UseGuards(AccessGuard)
export class ProfileController {
  constructor(private readonly profiles: ProfileService) {}

  @Get()
  get(@CurrentUser() user: AccessPayload) {
    return this.profiles.get(user.sub);
  }

  @Put()
  save(@CurrentUser() user: AccessPayload, @Body() body: SaveProfileDto) {
    return this.profiles.save(user.sub, body);
  }

  @Post("avatar")
  @UseInterceptors(
    FileInterceptor("photo", {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadAvatar(
    @CurrentUser() user: AccessPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException("Choose a photo to upload.");
    }
    return this.profiles.saveUploadedAvatar(user.sub, file);
  }

  @Delete("avatar")
  clearAvatar(@CurrentUser() user: AccessPayload) {
    return this.profiles.clearAvatar(user.sub);
  }
}
