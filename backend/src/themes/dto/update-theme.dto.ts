import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateThemeDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  class_discipline_id?: string;
}
