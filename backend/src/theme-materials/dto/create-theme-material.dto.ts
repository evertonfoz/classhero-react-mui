import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateThemeMaterialDto {
  @IsUUID()
  @IsNotEmpty()
  theme_id: string;

  @IsEnum(['text', 'video', 'link', 'pdf', 'quiz', 'other'])
  type: 'text' | 'video' | 'link' | 'pdf' | 'quiz' | 'other';

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  content?: string;
}
