import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyCodeDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6, { message: 'O código deve conter exatamente 6 dígitos.' })
  code: string;
}
