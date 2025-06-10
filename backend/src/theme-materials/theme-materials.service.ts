import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateThemeMaterialDto } from './dto/create-theme-material.dto';
import { UpdateThemeMaterialDto } from './dto/update-theme-material.dto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

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

  async create(dto: CreateThemeMaterialDto) {
    const { data, error } = await this.supabase
      .from('theme_materials')
      .insert(dto)
      .select()
      .single();

    if (error) throw new Error('Erro ao criar material');
    return data;
  }

  async findAllByTheme(theme_id: string) {
    const { data, error } = await this.supabase
      .from('theme_materials')
      .select('*')
      .eq('theme_id', theme_id)
      .order('created_at', { ascending: false });

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
