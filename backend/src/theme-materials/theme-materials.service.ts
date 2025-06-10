import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateThemeMaterialDto } from './dto/create-theme-material.dto';
import { UpdateThemeMaterialDto } from './dto/update-theme-material.dto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid'; // ✅ correto

@Injectable()
export class ThemeMaterialsService {
  private supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL or Key is not defined');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async create(dto: CreateThemeMaterialDto, file?: Express.Multer.File) {
    let finalUrl;
    const bucket = 'classhero_bucket';

    if (dto.type === 'pdf' && file) {
      const filename = `${uuidv4()}_${file.originalname}`;
      const { error: uploadError } = await this.supabase.storage
        .from(bucket)
        .upload(`materials/pdfs/${filename}`, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false,
                });

      if (uploadError){ 
        console.error('Erro no upload:', uploadError.message);
        throw new InternalServerErrorException('Erro ao subir PDF');
      }

       const { data: publicUrlData } = this.supabase.storage
                .from(bucket)
                .getPublicUrl(`materials/pdfs/${filename}`);

      finalUrl = publicUrlData;

    }

    const { data, error } = await this.supabase.from('theme_materials').insert([
      {
        theme_id: dto.theme_id,
        type: dto.type,
        title: dto.title,
        description: dto.description,
        content: finalUrl,
      },
    ]);

    if (error) throw new InternalServerErrorException('Erro ao criar material');

    return { data };
  }


  async findAllByTheme(theme_id: string) {
    const { data, error } = await this.supabase
      .from('theme_materials')
      .select('*')
      .eq('theme_id', theme_id)
      .order('created_at', { ascending: false });

    console.log('Dados dos materiais:', data);

    if (error) throw new Error('Erro ao buscar materiais');
    return data;
  }

  async update(id: string, dto: UpdateThemeMaterialDto) {
    const { data, error } = await this.supabase
      .from('theme_materials')
      .update(dto)
      .eq('material_id', id)
      .select()
      .single();

    if (error) throw new NotFoundException('Erro ao atualizar material');
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabase
      .from('theme_materials')
      .delete()
      .eq('material_id', id);

    if (error) throw new NotFoundException('Erro ao excluir material');
    return { message: 'Material excluído com sucesso' };
  }
}

