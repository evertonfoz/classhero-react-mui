import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
    console.log('Recebido no DTO:', dto);
    console.log('Arquivo recebido:', file?.originalname);


    const bucket = 'classhero_bucket';
    let finalUrl: string;

    if (dto.type === 'pdf' && file) {
      const filename = `${uuidv4()}_${file.originalname}`;

      const { error: uploadError } = await this.supabase.storage
        .from(bucket)
        .upload(`materials/pdfs/${filename}`, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError.message);
        throw new InternalServerErrorException('Erro ao subir PDF');
      }

      const { data: publicUrlData } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(`materials/pdfs/${filename}`);

      finalUrl = publicUrlData?.publicUrl;

      if (!finalUrl) {
        throw new InternalServerErrorException('Erro ao obter URL pública do PDF');
      }

    } else {
      // Outros tipos (text, video, link, quiz, other)
      if (!dto.content) {
        throw new BadRequestException('O campo "content" é obrigatório para esse tipo de material.');
      }
      finalUrl = dto.content;
    }

    // Persistência do material
    const { data, error } = await this.supabase
      .from('theme_materials')
      .insert([
        {
          theme_id: dto.theme_id,
          title: dto.title,
          description: dto.description,
          type: dto.type,
          content: finalUrl,
          order: Number(dto.order), 
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar material:', error.message);
      throw new InternalServerErrorException('Erro ao salvar material');
    }

    return { data };
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

  async update(id: string, dto: UpdateThemeMaterialDto, file?: Express.Multer.File) {
    const bucket = 'classhero_bucket';
    let finalUrl: string | undefined;
    let oldFilePath = '';

    if (file) {
      const { data: existing, error: fetchError } = await this.supabase
        .from('theme_materials')
        .select('content')
        .eq('material_id', id)
        .single();

      if (!fetchError && existing?.content) {
        try {
          const parsed = JSON.parse(existing.content);
          const url = parsed.publicUrl || existing.content;
          oldFilePath = new URL(url).pathname.replace(
            /^\/storage\/v1\/object\/public\/classhero_bucket\//,
            '',
          );
        } catch {
          try {
            oldFilePath = new URL(existing.content).pathname.replace(
              /^\/storage\/v1\/object\/public\/classhero_bucket\//,
              '',
            );
          } catch {}
        }

        if (!dto.type) {
          dto.type = 'pdf';
        }
      }

      const filename = `${uuidv4()}_${file.originalname}`;
      const { error: uploadError } = await this.supabase.storage
        .from(bucket)
        .upload(`materials/pdfs/${filename}`, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        throw new InternalServerErrorException('Erro ao subir PDF');
      }

      const { data: publicUrlData } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(`materials/pdfs/${filename}`);

      finalUrl = publicUrlData?.publicUrl;

      if (!finalUrl) {
        throw new InternalServerErrorException('Erro ao obter URL pública do PDF');
      }

      dto.content = finalUrl;
    }

    const { data, error } = await this.supabase
      .from('theme_materials')
      .update(dto)
      .eq('material_id', id)
      .select()
      .single();

    if (error) throw new NotFoundException('Erro ao atualizar material');

    if (file && oldFilePath) {
      await this.supabase.storage.from(bucket).remove([oldFilePath]);
    }

    return data;
  }

  async remove(id: string) {
    // 1. Buscar material antes de excluir
    const { data: material, error: fetchError } = await this.supabase
      .from('theme_materials')
      .select('content')
      .eq('material_id', id)
      .single();

    if (fetchError || !material) {
      throw new NotFoundException('Material não encontrado');
    }

    // 2. Extrair o path do arquivo (ex: "materials/pdfs/arquivo.pdf")
    let filePath = '';
    try {
      const content = JSON.parse(material.content);
      filePath = new URL(content.publicUrl).pathname.replace(/^\/storage\/v1\/object\/public\/classhero_bucket\//, '');
    } catch (e) {
      console.warn('Erro ao extrair path do conteúdo', e);
    }

    // 3. Remover do banco de dados
    const { error: deleteError } = await this.supabase
      .from('theme_materials')
      .delete()
      .eq('material_id', id);

    if (deleteError) throw new NotFoundException('Erro ao excluir material');

    // 4. Remover do bucket (caso tenha path válido)
    if (filePath) {
      const { error: storageError } = await this.supabase.storage
        .from('classhero_bucket')
        .remove([filePath]);

      if (storageError) {
        console.warn('Arquivo removido do banco mas não do storage:', storageError.message);
      }
    }

    return { message: 'Material excluído com sucesso' };
  }

}

