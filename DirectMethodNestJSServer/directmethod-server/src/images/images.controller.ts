import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FilesService } from 'src/files-service/files-service.service';
import { Response } from 'express';

@Controller('api/images')
export class ImagesController {
  constructor(private filesService: FilesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getLesson(
    @Query('part') queryPart: string,
    @Query('lesson') queryLesson: string,
    @Query('image') queryImage: string,
    @Res() res: Response,
  ) {
    try {
      const imageBuffer = await this.filesService.getImage(
        queryPart,
        queryLesson,
        queryImage,
      );

      res.set('Content-Type', 'image/jpeg');
      res.send(imageBuffer);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: err.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
