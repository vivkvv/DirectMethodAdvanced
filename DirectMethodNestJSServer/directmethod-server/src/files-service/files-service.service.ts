import { Injectable, OnModuleInit } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { Lesson, Part } from '../DirectMethodCommonInterface/folderStructure';

export class MP3File {
  public get url(): string {
    return this._url;
  }
  public set url(value: string) {
    this._url = value;
  }
  constructor(private _name: string, private _url: string) {}
}

@Injectable()
export class FilesService implements OnModuleInit {
  private static rootFolderName = path.resolve(
    __dirname,
    '../../../',
    'public',
    'data',
    'Sources',
  );

  private allFolderParts: Part[];

  async onModuleInit() {
    return;
  }

  private getSubDirs = (folderName) => {
    const files = fs.readdirSync(folderName, { withFileTypes: true });
    const directories = files
      .filter((file) => file.isDirectory())
      .map((file) => file.name);
    return directories;
  };

  public async getImage(
    part: string,
    lesson: string,
    image: string,
  ): Promise<Buffer> {
    const imagePath = path.join(
      FilesService.rootFolderName,
      part,
      lesson,
      image,
    );

    try {
      const image = await fs.promises.readFile(imagePath);
      return image;
    } catch (err) {
      throw new Error('Failed to read image');
    }
  }

  private getAllParts = () => {
    const parts: Part[] = [];
    const partFolders = this.getSubDirs(FilesService.rootFolderName);
    partFolders.forEach((partName) => {
      const partPath = path.join(FilesService.rootFolderName, partName);
      const rootFiles = fs.readdirSync(partPath, { withFileTypes: true });
      const pdfFile = rootFiles.find(
        (file) => path.extname(file.name) === '.pdf',
      ).name;

      const lessons: Lesson[] = [];

      const lessonFolders = this.getSubDirs(partPath);
      lessonFolders.forEach(async (folder) => {
        const lessonFolder = path.join(partPath, folder);
        const lessonFiles = fs.readdirSync(lessonFolder, {
          withFileTypes: true,
        });
        const lessonFileName = lessonFiles.find(
          (file) => file.isFile() === true,
        ).name;
        const imagesFolder = lessonFiles.find((file) => file.isDirectory());

        const lesson = new Lesson(
          path.parse(lessonFileName).name,
          lessonFileName,
          lessonFolder,
          imagesFolder?.name,
          '', //firstMp3File,
          0, //duration,
          ''
        );

        lessons.push(lesson);
      });

      parts.push(new Part(partName, partPath, pdfFile, '', lessons));
    });

    return parts;
  };

  public getAllFolderParts(): Part[] {
    return this.allFolderParts;
  }
}
