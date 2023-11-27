import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { S3Controller } from 'src/s3/s3.controller';

@Controller('api/google-drive')
export class GoogleDriveController {
  constructor() {}

  @UseGuards(JwtAuthGuard)
  @Get('languages')
  async getS3DetailedInfo(@Query('fileId') fileId: string) {
    const url = `https://drive.google.com/uc?export=download&id=${fileId}`;

    // Make the request to Google Drive
    const urlResponse = await fetch(url);
    if (urlResponse.ok) {
      const fileContent = await urlResponse.text();
      const translations =
        S3Controller.getLessonsTranslationLanguages(fileContent);
      return { languages: Object.keys(translations) };
    } else {
      return { error: `Error on parsing ${url} file: ${urlResponse}` };
    }
  }
}
