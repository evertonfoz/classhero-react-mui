import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateUserInfoDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  is_a_teacher?: boolean;

  @IsBoolean()
  @IsOptional()
  is_a_admin?: boolean;

  @IsBoolean()
  @IsOptional()
  is_a_student?: boolean;

  @IsBoolean()
  @IsOptional()
  is_validated?: boolean;
}
