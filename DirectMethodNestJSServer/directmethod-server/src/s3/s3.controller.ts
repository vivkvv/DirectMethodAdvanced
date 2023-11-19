import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import S3 from 'aws-sdk/clients/s3';
import * as path from 'path';
import { Lesson, Part } from 'src/DirectMethodCommonInterface/folderStructure';
import { XMLValidator, XMLParser } from 'fast-xml-parser';

@Controller('api/s3')
export class S3Controller {
  constructor() {}

  @UseGuards(JwtAuthGuard)
  @Get('detailed')
  async getS3DetailedInfo(
    @Query('endpoint') endpoint: string,
    @Query('accessKey') accessKeyId: string,
    @Query('secretKey') secretAccessKey: string,
    @Query('bucketName') Bucket: string,
    @Query('configXmlPath') configXmlPath: string,
    @Query('language') language: string,
  ) {
    const result = await this.getConfigFile(
      endpoint,
      accessKeyId,
      secretAccessKey,
      Bucket,
      configXmlPath,
      true, // s3ForcePathStyle: true, // MinIO!
      'v4',
    );

    if ('configXml' in result) {
      const url: string = result.configXml as string;

      const urlResponse = await fetch(url);
      if (urlResponse.ok) {
        const fileContent = await urlResponse.text();
        let parts: Part[] = await this.parseLessonsXML(
          fileContent,
          endpoint,
          accessKeyId,
          secretAccessKey,
          Bucket,
          language,
          true,
          'v4',
        );
        return parts;
      } else {
        return { error: `Error on parsing ${url} file: ${urlResponse}` };
      }
    } else {
      return result;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getS3(
    @Query('endpoint') endpoint: string,
    @Query('accessKey') accessKeyId: string,
    @Query('secretKey') secretAccessKey: string,
    @Query('bucketName') Bucket: string,
    @Query('configXmlPath') configXmlPath: string,
  ) {
    const result = await this.getConfigFile(
      endpoint,
      accessKeyId,
      secretAccessKey,
      Bucket,
      configXmlPath,
      true, // s3ForcePathStyle: true, // MinIO!
      'v4',
    );
    if ('configXml' in result) {
      const url: string = result.configXml as string;

      const urlResponse = await fetch(url);
      if (urlResponse.ok) {
        const fileContent = await urlResponse.text();
        const translations = this.getLessonsTranslationLanguages(fileContent);
        return { languages: Object.keys(translations) };
      } else {
        return { error: `Error on parsing ${url} file: ${urlResponse}` };
      }
    } else {
      return result;
    }
  }

  private async getConfigFile(
    endpoint: string,
    accessKeyId: string,
    secretAccessKey: string,
    Bucket: string,
    configXmlPath: string,
    s3ForcePathStyle: boolean,
    signatureVersion: string,
  ) {
    const s3 = new S3({
      endpoint,
      accessKeyId,
      secretAccessKey,
      s3ForcePathStyle,
      signatureVersion,
    });

    const params = {
      Bucket,
    };

    try {
      // getting objects list
      const data = await s3.listObjectsV2(params).promise();

      const file = data.Contents.find((item) => item.Key === configXmlPath);

      if (file) {
        const urlParams = {
          Bucket: params.Bucket,
          Key: file.Key,
          Expires: 60, // URL will be valid for 60 seconds
        };

        const url = s3.getSignedUrl('getObject', urlParams);
        return { configXml: url };
      }

      return { error: `Can't find ${configXmlPath} file` };
    } catch (error) {
      return { error: error.message };
    }
  }

  private extractPathInfo(sourceFile: string): {
    fileName: string;
    folderPath: string;
  } {
    const parts = sourceFile.split('/');
    const fileName = parts.pop() || '';
    const folderPath = parts.join('/');
    return { fileName, folderPath };
  }

  private getLessonsTranslationLanguages(fileContent: string) {
    const validationResult = XMLValidator.validate(fileContent);
    if (validationResult !== true) {
      throw new Error('Invalid XML content: ' + validationResult.err.msg);
    }

    let translations = {};

    const parserOptions = {
      ignoreAttributes: false, // Set to false to include attributes
      attributeNamePrefix: '@_', // Prefix for attributes
    };
    const parser = new XMLParser(parserOptions);

    const jsonObj = parser.parse(fileContent);

    const description = jsonObj.Description;
    if (!description) {
      throw new Error('Invalid XML content: There is no descripion');
    }

    if (description.Translations && description.Translations.Language) {
      const languages = description.Translations.Language;
      languages.forEach((lang) => {
        const code = lang['@_code']; // Assuming '@_code' is the attribute name
        const value = lang['#text'] || ''; // Assuming text content is stored here
        if (code) {
          translations[code] = value;
        }
      });
    }

    return translations;
  }

  private async parseLessonsXML(
    fileContent: string,
    endpoint: string,
    accessKeyId: string,
    secretAccessKey: string,
    Bucket: string,
    language: string,
    s3ForcePathStyle: boolean,
    signatureVersion: string,
  ) {
    const validationResult = XMLValidator.validate(fileContent);
    if (validationResult !== true) {
      throw new Error('Invalid XML content: ' + validationResult.err.msg);
    }

    const s3 = new S3({
      endpoint,
      accessKeyId,
      secretAccessKey,
      s3ForcePathStyle,
      signatureVersion,
    });

    const params = {
      Bucket,
    };

    const data = await s3.listObjectsV2(params).promise();
    const files = data.Contents;

    let translations = {};

    const parserOptions = {
      ignoreAttributes: false, // Set to false to include attributes
      attributeNamePrefix: '@_', // Prefix for attributes
    };
    const parser = new XMLParser(parserOptions);

    const jsonObj = parser.parse(fileContent);

    const description = jsonObj.Description;
    if (!description) {
      throw new Error('Invalid XML content: There is no descripion');
    }

    let translationPath: string = '';
    if (description.Translations && description.Translations.Language) {
      const languages = description.Translations.Language;
      languages.forEach((lang) => {
        const code = lang['@_code']; // Assuming '@_code' is the attribute name
        const value = lang['#text'] || ''; // Assuming text content is stored here
        if (code) {
          translations[code] = value;
        }
      });

      if (translations.hasOwnProperty(language)) {
        translationPath = translations[language];
      }
    }

    let audioBase: string = '';
    let sourceBase: string = '';
    let parts: Part[] = [];

    let config = description.Config;
    if (config) {
      audioBase = config.AudioBase;
      sourceBase = config.SourceBase;
    }

    parts = [];

    let xmlParts = description.Parts;

    // Iterate through each <Level> element
    let levels = xmlParts.Level;
    for (let i = 0; i < levels.length; i++) {
      let level = levels[i];
      const levelID = level['@_levelID'];
      const levelSourceBasePath = level['@_sourceBasePath'];
      const levelPdf = level['@_pdf'];

      let urlPdf = '';
      if(levelPdf){
        const pdfFileName = path.join(sourceBase, levelSourceBasePath, levelPdf);
        urlPdf = this.getS3UrlFile(s3, params, files, pdfFileName);        
      }

      let lessons: Lesson[] = [];

      // Iterate through each <Lesson> element within <Level>
      let lessonElements = level.Lesson;
      for (let j = 0; j < lessonElements.length; j++) {
        let lessonElement = lessonElements[j];

        let audioAttr = lessonElement['@_audio'];
        let title = audioAttr.replace('.mp3', '');
        let xmlSource = lessonElement['@_source'];
        const { fileName, folderPath } = this.extractPathInfo(xmlSource);

        const desiredFileName = path.join(audioBase, levelID, audioAttr);
        const mp3Url = this.getS3UrlFile(s3, params, files, desiredFileName);

        const lessonFileName = path.join(
          sourceBase,
          levelSourceBasePath,
          xmlSource,
        );

        const xmlFileName = this.getS3UrlFile(
          s3,
          params,
          files,
          lessonFileName,
        );

        const translationFileName = path.join(translationPath, levelSourceBasePath, xmlSource);
        const xmlTranslationUrl = this.getS3UrlFile(s3, params, files, translationFileName);

        let lesson = new Lesson(
          title,
          xmlFileName, // fileName (populate this as needed)
          folderPath, // folderName (populate this as needed)
          folderPath, // imagesPath (populate this as needed)
          mp3Url, //audioAttr, // mp3
          0, // duration (populate this as needed)
          xmlTranslationUrl
        );

        lessons.push(lesson);
      }

      let part = new Part(
        levelID || '', // title
        levelSourceBasePath || '', // path
        levelPdf || '', // pdf
        urlPdf,
        lessons, // lessons
      );
      parts.push(part);
    }

    return parts;
  }

  private getS3UrlFile(s3: any, params: any, files: any, fileName) {
    for (const key in files) {
      const file = files[key];
      if (path.normalize(file.Key) === path.normalize(fileName)) {
        const urlParams = {
          Bucket: params.Bucket,
          Key: file.Key,
          Expires: 60 * 60 * 24,
        };
        return s3.getSignedUrl('getObject', urlParams);
      }
    }
    return '';
  }
}
