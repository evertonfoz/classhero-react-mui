import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

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

  @IsNotEmpty({ message: 'Ordem é obrigatória.' })
  @IsNumberString({}, { message: 'Ordem deve ser um número.' })
  order: string;

  @IsString()
  @IsOptional()
  youtube_pt_url?: string;

  @IsString()
  @IsOptional()
  youtube_en_url?: string;
}
