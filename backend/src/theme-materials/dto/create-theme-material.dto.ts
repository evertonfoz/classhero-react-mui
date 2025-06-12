import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateThemeMaterialDto {
  @IsUUID()
  @IsNotEmpty()
  theme_id: string;

  @IsEnum(['text', 'video', 'link', 'pdf', 'quiz', 'podcast','other'])
  type: 'text' | 'video' | 'link' | 'pdf' | 'quiz' | 'podcast' | 'other';

  @IsString()
  @IsNotEmpty()
  title: string;

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
