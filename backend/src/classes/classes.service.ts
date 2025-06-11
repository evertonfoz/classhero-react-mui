import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuid } from 'uuid';
import { SearchClassesDto } from './dto/search-classes.dto';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class-dto';

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

  async findClassById(class_id: string) {
  try {
    // 1. Buscar turma
    const { data: classData, error: classError } = await this.supabase
      .from('classes')
      .select('class_id, code, year, semester')
      .eq('class_id', class_id)
      .single();

    if (classError || !classData) {
      throw new NotFoundException('Turma não encontrada');
    }

    // 2. Buscar disciplinas + professor
    const { data: disciplines, error: disciplinesError } = await this.supabase
      .from('class_disciplines')
      .select(`
        class_discipline_id,
        discipline_id,
        teacher_email,
        disciplines(name),
        users(name)
      `)
      .eq('class_id', class_id);

    if (disciplinesError) {
      console.error('Erro ao buscar disciplinas:', disciplinesError.message);
      throw new InternalServerErrorException('Erro ao buscar disciplinas da turma');
    }

    // 3. Buscar alunos
    const { data: students, error: studentsError } = await this.supabase
      .from('class_users')
      .select('user_email, users(name)')
      .eq('class_id', class_id);

    if (studentsError) {
      console.error('Erro ao buscar alunos:', studentsError.message);
      throw new InternalServerErrorException('Erro ao buscar alunos da turma');
    }

    return {
      data: {
        ...classData,
        disciplines: disciplines.map((d) => ({
          class_discipline_id: d.class_discipline_id,
          discipline_id: d.discipline_id,
          name:
            typeof d.disciplines === 'object' && 'name' in d.disciplines
              ? d.disciplines.name
              : null,
          teacher_email: d.teacher_email,
          teacher_name:
            typeof d.users === 'object' && 'name' in d.users
              ? d.users.name
              : null,
        })),
        students: students.map((s) => ({
          email: s.user_email,
          name:
            typeof s.users === 'object' && 'name' in s.users
              ? s.users.name
              : null,
        })),
      },
    };

  } catch (err) {
    console.error('Erro no findClassById:', err.message);
    throw err;
  }
}

  async updateClass(class_id: string, body: UpdateClassDto) {
    // Atualiza os dados básicos da turma
    const { error: updateError } = await this.supabase
      .from('classes')
      .update({
        code: body.code,
        year: body.year,
        semester: body.semester,
      })
      .eq('class_id', class_id);

    if (updateError) {
      throw new InternalServerErrorException('Erro ao atualizar dados da turma');
    }

    // 🔄 Atualiza disciplinas: remove todas e insere novamente
    const { error: delDiscErr } = await this.supabase
      .from('class_disciplines')
      .delete()
      .eq('class_id', class_id);

    if (delDiscErr) {
      throw new InternalServerErrorException('Erro ao limpar disciplinas da turma');
    }

    const disciplinePayload = body.disciplines.map((d) => ({
      class_id,
      discipline_id: d.discipline_id,
      teacher_email: d.teacher_email,
    }));

    const { error: insertDiscErr } = await this.supabase
      .from('class_disciplines')
      .insert(disciplinePayload);

    if (insertDiscErr) {
      throw new InternalServerErrorException('Erro ao inserir disciplinas atualizadas');
    }

    // 🔄 Atualiza alunos: remove todos e insere novamente
    const { error: delStuErr } = await this.supabase
      .from('class_users')
      .delete()
      .eq('class_id', class_id);

    if (delStuErr) {
      throw new InternalServerErrorException('Erro ao limpar alunos da turma');
    }

    const studentPayload = body.student_emails.map((email) => ({
      class_id,
      user_email: email,
    }));

    const { error: insertStuErr } = await this.supabase
      .from('class_users')
      .insert(studentPayload);

    if (insertStuErr) {
      throw new InternalServerErrorException('Erro ao inserir alunos atualizados');
    }

    return { message: 'Turma atualizada com sucesso' };
  }

  async delete(class_id: string) {
    try {
      // Remove vínculos com disciplinas
      const { error: disciplineError } = await this.supabase
        .from('class_disciplines')
        .delete()
        .eq('class_id', class_id);

      if (disciplineError) {
        throw new InternalServerErrorException('Turma possui disciplinas vinculadas e não pode ser excluída');
      }

      // Remove vínculos com alunos
      const { error: studentsError } = await this.supabase
        .from('class_users')
        .delete()
        .eq('class_id', class_id);

      if (studentsError) {
        throw new InternalServerErrorException('Turma possui alunos vinculados e não pode ser excluída');
      }

      // Remove a turma
      const { error: classError } = await this.supabase
        .from('classes')
        .delete()
        .eq('class_id', class_id);

      if (classError) {
        throw new InternalServerErrorException('Erro ao excluir turma');
      }

      return { message: 'Turma excluída com sucesso' };
    } catch (err) {
      console.error('Erro ao deletar turma:', err.message);
      throw err;
    }
  }


  // generateCode(id: string, expiresAt: Date) {
  //   const cls = this.classes.find((c) => c.class_id === id);
  //   if (!cls) return null;
  //   const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  //   cls.enrollment_code = code;
  //   cls.code_expires_at = expiresAt;
  //   return { code, expires_at: expiresAt };
  // }
}
