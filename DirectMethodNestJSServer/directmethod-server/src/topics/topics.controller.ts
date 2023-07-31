import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Part } from '../DirectMethodCommonInterface/folderStructure';
import { FilesService } from '../files-service/files-service.service';

@Controller('api/topics')
export class TopicsController {
  constructor(private filesService: FilesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(): Part[] {
    return this.filesService.getAllFolderParts();
  }
}
