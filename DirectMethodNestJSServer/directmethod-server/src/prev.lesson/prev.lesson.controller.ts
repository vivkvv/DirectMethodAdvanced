import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Part } from 'src/DirectMethodCommonInterface/folderStructure';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FilesService } from 'src/files-service/files-service.service';

@Controller('api/prev.lesson')
export class PrevLessonController {
  constructor(private filesService: FilesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getLesson(
    @Query('part') queryPart: string,
    @Query('lesson') queryLesson: string,
  ) {
    const allFolderParts: Part[] = this.filesService.getAllFolderParts();

    const flatLessons = allFolderParts.flatMap((part) =>
      part.lessons.map((lesson) => ({ lesson, part })),
    );

    const currentLessonIndex = flatLessons.findIndex(
      ({ lesson }) => lesson.title === queryLesson,
    );

    if (
      currentLessonIndex > 0 &&
      currentLessonIndex <= flatLessons.length - 1
    ) {
      const nextItem = flatLessons[currentLessonIndex - 1];
      return {
        nextPart: nextItem.part.title,
        nextLesson: nextItem.lesson.title,
      };
    } else {
      return {
        nextPart: flatLessons[flatLessons.length - 1].part.title,
        nextLesson: flatLessons[flatLessons.length - 1].lesson.title,
      };
    }
  }
}
