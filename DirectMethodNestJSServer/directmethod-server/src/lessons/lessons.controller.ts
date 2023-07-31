import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FilesService } from 'src/files-service/files-service.service';
import path from 'path';
import fs from 'fs';
import { Response } from 'express';
import { Lesson, Part } from 'src/DirectMethodCommonInterface/folderStructure';

@Controller('api/lessons')
export class LessonsController {
  constructor(private filesService: FilesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getLesson(
    @Query('part') queryPart: string,
    @Query('lesson') queryLesson: string,
    @Res() response: Response,
  ) {
    try {
      const allFolderParts: Part[] = this.filesService.getAllFolderParts();
      const folderPart: Part = allFolderParts.find(
        (part) => part.title == queryPart,
      );
      const lessonPart: Lesson = folderPart.lessons.find(
        (lesson) => lesson.title == queryLesson,
      );

      if (lessonPart) {
        const sourceFilePath = path.join(
          lessonPart.folderName,
          lessonPart.fileName,
        );

        const translationFilePath = sourceFilePath.replace(
          'Sources',
          'Translations/ru',
        );

        const lesson_xml = await this.getFileContent(sourceFilePath);
        const translation_xml = await this.getFileContent(translationFilePath);
        const audio_link = lessonPart.mp3;

        response.setHeader('Cache-Control', 'public, max-age=86400');
        return response.send({ lesson_xml, translation_xml, audio_link });
      }
    } catch (e) {
      return response.status(404).send({ error: e.message });
    }

    return response.status(404).send({ error: 'Lesson not found' });
  }

  private async getFileContent(fileName: string) {
    try {
      const lesson_xml = await fs.promises.readFile(fileName, 'utf-8');
      return lesson_xml;
    } catch (err) {
      console.error(`Error reading file from disk: ${err}`);
    }
  }
}
