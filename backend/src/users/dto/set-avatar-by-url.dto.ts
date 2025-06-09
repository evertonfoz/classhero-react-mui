// src/users/dto/set-avatar-by-url.dto.ts
import { IsEmail, IsNotEmpty, IsUrl } from 'class-validator';

export class SetAvatarByUrlDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsUrl()
  avatar_url: string;
}
