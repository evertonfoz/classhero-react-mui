import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateThemeMaterialDto {
  @IsEnum(['text', 'video', 'link', 'pdf', 'quiz', 'other'])
  @IsOptional()
  type?: 'text' | 'video' | 'link' | 'pdf' | 'quiz' | 'other';

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  content?: string;
}
