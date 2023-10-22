import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';
import { Lesson, Part } from '../DirectMethodCommonInterface/folderStructure';
import serviceAccount from '../../directmethodstorage-firebase-adminsdk.json';

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

  //private firebaseApp: admin.app.App;
  //private fileList: MP3File[] = [];
  private allFolderParts: Part[];

  async onModuleInit() {
    this.allFolderParts = this.getAllParts();

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      storageBucket: 'directmethodstorage.appspot.com',
    });

    const bucket = admin.storage().bucket();
    const [files] = await bucket.getFiles();

    for (const file of files) {
      const fileName = path.basename(file.name);
      const isFolder = file.name.endsWith('/');
      if (!isFolder && path.extname(fileName) === '.mp3') {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 20);

        const config = {
          action: 'read' as const,
          expires: date,
        };

        const url = await file.getSignedUrl(config);
        //this.fileList.push(new MP3File(file.name, url[0]));

        const partName = file.name.split('/')[0];
        const lessonName = file.name.split('/')[1];
        const part: Part = this.allFolderParts.filter(
          (part) => part.title === partName,
        )[0];
        const lesson: Lesson = part?.lessons.filter(
          (lesson) => lesson.title === lessonName,
        )[0];
        if (lesson) {
          lesson.mp3 = url[0];
        }
      }
    }
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
        );

        lessons.push(lesson);
      });

      parts.push(new Part(partName, partPath, pdfFile, lessons));
    });

    return parts;
  };

  public getAllFolderParts(): Part[] {
    return this.allFolderParts;
  }
}
