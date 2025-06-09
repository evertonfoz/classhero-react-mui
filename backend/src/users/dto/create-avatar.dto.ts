// src/users/dto/create-avatar.dto.ts

import { IsEmail } from 'class-validator';

export class CreateAvatarDto {
  @IsEmail()
  email: string;
}
