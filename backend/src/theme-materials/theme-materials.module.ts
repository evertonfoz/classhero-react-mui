import { Module } from "@nestjs/common";
import { ThemeMaterialsController } from "./theme-materials.controller";
import { ThemeMaterialsService } from "./theme-materials.service";

@Module({
  controllers: [ThemeMaterialsController],
  providers: [ThemeMaterialsService],
})
export class ThemeMaterialsModule {}
