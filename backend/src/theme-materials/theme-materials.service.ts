import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateThemeMaterialDto } from './dto/create-theme-material.dto';
import { UpdateThemeMaterialDto } from './dto/update-theme-material.dto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const FormData = require('form-data');



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
    const bucket = 'classhero_bucket';
    let finalUrl: string;

    // 1. Upload do arquivo para o caminho correto
    let uploadPath = '';
    if ((dto.type === 'quiz' || dto.type === 'pdf') && file) {
      if (dto.type === 'quiz') {
        uploadPath = `materials/quizzes/${uuidv4()}_${file.originalname}`;
      } else {
        uploadPath = `materials/pdfs/${uuidv4()}_${file.originalname}`;
      }
      console.log('📁 Caminho do upload:', uploadPath);

    } else if ((dto.type === 'pdf' || dto.type === 'quiz') && !file) {
      throw new BadRequestException('Arquivo PDF obrigatório para materiais do tipo PDF ou Quiz.');
    }


    if ((dto.type === 'pdf' || dto.type === 'quiz') && file) {
      const { error: uploadError } = await this.supabase.storage
        .from(bucket)
        .upload(uploadPath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        console.error('Erro no upload do arquivo:', file.originalname, uploadError.message);
        throw new InternalServerErrorException('Erro ao subir arquivo');
      }


      const { data: publicUrlData } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(uploadPath);

      finalUrl = publicUrlData?.publicUrl;

      if (!finalUrl) {
        throw new InternalServerErrorException('Erro ao obter URL pública do arquivo');
      }
    } else {
      if (!dto.content) {
        throw new BadRequestException('O campo "content" é obrigatório para esse tipo de material.');
      }
      finalUrl = dto.content;
    }

    // 2. Cria o material (usa título e descrição temporários para quiz, irá sobrescrever depois)
    let title = '';
    let description = '';
    let questionsFromQuiz = [];

    // Se for quiz, gera as questões chamando o endpoint Python
    if (dto.type === 'quiz' && file) {
      console.log('📤 Enviando arquivo para gerar quiz', file.originalname);
      const formData = new FormData();
      formData.append('file', file.buffer, file.originalname);

      try {
        const response = await axios.post(
          'http://curator:8000/generate-quiz',
          formData,
          { headers: formData.getHeaders() }
        );
        console.log('✅ Quiz gerado com sucesso:', {
          title: response.data.title,
          qtd_questoes: response.data.questions?.length
        });
        title = response.data.title;
        description = response.data.description;
        questionsFromQuiz = response.data.questions;
      } catch (error) {
        console.error('Erro ao gerar quiz via Python:', error.message);
        throw new InternalServerErrorException('Erro ao gerar quiz automaticamente');
      }
    }


    // Agora salva o material (com título e descrição gerados do quiz, se quiz)
    const { data: material, error } = await this.supabase
      .from('theme_materials')
      .insert([
        {
          theme_id: dto.theme_id,
          title: title,
          description: description,
          type: dto.type,
          content: finalUrl,
          order: Number(dto.order),
          youtube_pt_url: dto.youtube_pt_url,
          youtube_en_url: dto.youtube_en_url,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar material:', error.message);
      throw new InternalServerErrorException('Erro ao salvar material');
    }

    // 3. Insere as questões, caso seja quiz
    if (dto.type === 'quiz' && questionsFromQuiz.length) {
      console.log(`📝 Inserindo ${questionsFromQuiz.length} questões no banco`);
      // Cada questão vai como está, exceto material_id e campos default
      const questionsToInsert = questionsFromQuiz.map((q: any) => ({
        material_id: material.material_id,
        type: q.type,
        level: q.level,
        question: q.question,
        options: q.options ? JSON.stringify(q.options) : null,
        correct_answers: q.correct_answers ? JSON.stringify(q.correct_answers) : null,
        guidance_on_error: q.guidance_on_error,
        guidance_on_success: q.guidance_on_success,
        times_used: q.times_used ?? 0,
        status: q.status ?? 'draft',
        extra: q.extra ? JSON.stringify(q.extra) : null,
        // question_id, created_at, updated_at são automáticos
      }));

      const { error: questionError } = await this.supabase
        .from('quiz_questions')
        .insert(questionsToInsert);

      if (questionError) {
        console.error('Erro ao salvar questões do quiz:', questionError.message);
        throw new InternalServerErrorException('Erro ao salvar questões do quiz');
      }
    }
    console.log('🎉 Material criado com sucesso:', { id: material.material_id, type: dto.type });


    return { data: material };
  }


  async findAllByTheme(theme_id: string) {
    const { data, error } = await this.supabase
      .from('theme_materials')
      .select('*')
      .eq('theme_id', theme_id)
      .order('order', { ascending: true });

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
          } catch { }
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
      .update({
        title: dto.title,
        description: dto.description,
        type: dto.type,
        content: dto.content,
        order: Number(dto.order),
        youtube_pt_url: dto.youtube_pt_url,
        youtube_en_url: dto.youtube_en_url,
      })
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
    const { data: material, error: fetchError } = await this.supabase
      .from('theme_materials')
      .select('content')
      .eq('material_id', id)
      .single();

    if (fetchError || !material) {
      throw new NotFoundException('Material não encontrado');
    }

    let filePath = '';
    try {
      filePath = new URL(material.content).pathname.replace(
        /^\/storage\/v1\/object\/public\/classhero_bucket\//,
        '',
      );
    } catch (e) {
      console.warn('Erro ao extrair path direto do conteúdo', e);
    }

    const { error: deleteError } = await this.supabase
      .from('theme_materials')
      .delete()
      .eq('material_id', id);

    if (deleteError) throw new NotFoundException('Erro ao excluir material');

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
