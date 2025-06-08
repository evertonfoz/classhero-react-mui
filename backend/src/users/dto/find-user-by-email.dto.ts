// src/users/dto/find-user-by-email.dto.ts
import { IsEmail, IsNotEmpty } from 'class-validator';

export class FindUserByEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
