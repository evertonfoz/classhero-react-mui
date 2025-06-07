import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

interface Class {
  class_id: string;
  code: string;
  year: number;
  semester: number;
  disciplines: { discipline_id: string; teacher_email?: string | null }[];
  student_emails: string[];
  enrollment_code?: string;
  code_expires_at?: Date;
}

@Injectable()
export class ClassesService {
  private classes: Class[] = [];

  findAll() {
    return this.classes;
  }

  findOne(id: string) {
    return this.classes.find((c) => c.class_id === id);
  }

  create(data: Omit<Class, 'class_id'>) {
    const created: Class = { class_id: uuid(), ...data };
    this.classes.push(created);
    return created;
  }

  update(id: string, data: Omit<Class, 'class_id'>) {
    const idx = this.classes.findIndex((c) => c.class_id === id);
    if (idx >= 0) {
      this.classes[idx] = { class_id: id, ...data };
      return this.classes[idx];
    }
    return null;
  }

  remove(id: string) {
    const idx = this.classes.findIndex((c) => c.class_id === id);
    if (idx >= 0) {
      this.classes.splice(idx, 1);
      return true;
    }
    return false;
  }

  generateCode(id: string, expiresAt: Date) {
    const cls = this.classes.find((c) => c.class_id === id);
    if (!cls) return null;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    cls.enrollment_code = code;
    cls.code_expires_at = expiresAt;
    return { code, expires_at: expiresAt };
  }
}
