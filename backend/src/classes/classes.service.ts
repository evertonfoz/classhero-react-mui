import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuid } from 'uuid';
import { SearchClassesDto } from './dto/search-classes.dto';
import { CreateClassDto } from './dto/create-class.dto';

@Injectable()
export class ClassesService {
  private supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL or Key is not defined');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async getAll({ page, limit, search }: SearchClassesDto) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = this.supabase
      .from('classes')
      .select('*', { count: 'exact' })
      .order('code', { ascending: true })
      .range(from, to);

    if (search) {
      query = query.ilike('code', `%${search}%`);
    }

    const { data, count, error } = await query;

    if (error) throw new Error(error.message);

    return {
      data,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  async createClassWithLinks(dto: CreateClassDto) {
    try {
      // 1. Inserir a turma
      const { code, year, semester, disciplines, student_emails } = dto;

      console.log('disciplines', disciplines);
      console.log('student_emails', student_emails);


      const { data: classData, error: insertError } = await this.supabase
        .from('classes')
        .insert({ code, year, semester })
        .select('class_id')
        .single();

      if (insertError) {
        console.error('Erro ao criar turma:', insertError.message);
        throw new InternalServerErrorException('Erro ao criar turma');
      }

      const class_id = classData.class_id;

      // 2. Associar disciplinas com professor
      if (disciplines && disciplines.length > 0) {
        const disciplineEntries = disciplines.map((d) => ({
          class_id,
          discipline_id: d.discipline_id,
          teacher_email: d.teacher_email || null,
        }));

        console.log('disciplineEntries', disciplineEntries);

        const { error: disciplineError } = await this.supabase
          .from('class_disciplines')
          .insert(disciplineEntries);

        if (disciplineError) {
          console.error('Erro ao associar disciplinas:', disciplineError.message);
          throw new InternalServerErrorException('Erro ao associar disciplinas à turma');
        }
      }

      // 3. Associar estudantes
      if (student_emails && student_emails.length > 0) {
        const studentEntries = student_emails.map((email) => ({
          class_id,
          user_email: email,
        }));

                console.log('studentEntries', studentEntries);

        const { error: studentError } = await this.supabase
          .from('class_users')
          .insert(studentEntries);

        if (studentError) {
          console.error('Erro ao associar estudantes:', studentError.message);
          throw new InternalServerErrorException('Erro ao associar estudantes à turma');
        }
      }

      return { message: 'Turma criada com sucesso', class_id };
    } catch (err) {
      console.error('Erro no createClassWithLinks:', err.message);
      throw new InternalServerErrorException('Erro ao criar turma');
    }
  }
  // findOne(id: string) {
  //   return this.classes.find((c) => c.class_id === id);
  // }


  // update(id: string, data: Omit<Class, 'class_id'>) {
  //   const idx = this.classes.findIndex((c) => c.class_id === id);
  //   if (idx >= 0) {
  //     this.classes[idx] = { class_id: id, ...data };
  //     return this.classes[idx];
  //   }
  //   return null;
  // }

  // remove(id: string) {
  //   const idx = this.classes.findIndex((c) => c.class_id === id);
  //   if (idx >= 0) {
  //     this.classes.splice(idx, 1);
  //     return true;
  //   }
  //   return false;
  // }

  // generateCode(id: string, expiresAt: Date) {
  //   const cls = this.classes.find((c) => c.class_id === id);
  //   if (!cls) return null;
  //   const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  //   cls.enrollment_code = code;
  //   cls.code_expires_at = expiresAt;
  //   return { code, expires_at: expiresAt };
  // }
}
