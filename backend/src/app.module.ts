import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { DisciplinesModule } from './disciplines/disciplines.module';
import { ClassesModule } from './classes/classes.module';
import { ThemesModule } from './themes/themes.module';


@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }),
    AuthModule,
    UsersModule,
    CoursesModule,
    DisciplinesModule,
    ClassesModule,
    ThemesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
