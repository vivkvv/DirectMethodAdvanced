import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
    Lesson,
    Part,
} from 'src/app/DirectMethodCommonInterface/folderStructure';

@Injectable({
    providedIn: 'root',
})
export class S3filesService {
    private endpoint!: string;
    private accessKey!: string;
    private secretKey!: string;
    private bucketName!: string;
    private configXmlPath!: string;
    languages: string[] = [];

    constructor(private httpClient: HttpClient) {}

    async getS3data(
        endpoint: string,
        accessKey: string,
        secretKey: string,
        bucketName: string,
        configXmlPath: string
    ) {
        Object.assign(this, {
            endpoint,
            accessKey,
            secretKey,
            bucketName,
            configXmlPath,
        });

        await this.httpClient
            .get(
                `/api/s3?endpoint=${this.endpoint}&accessKey=${this.accessKey}&secretKey=${this.secretKey}&bucketName=${this.bucketName}&configXmlPath=${this.configXmlPath}`
            )
            .subscribe({
                next: async (response: any) => {
                    try {
                        await this.parse(response);
                    } catch (error) {
                        console.error(error);
                    } finally {
                        // this.loadingService.setLoading(false);
                    }
                },
            });
    }

    private async parse(response: any) {
        if ('configXml' in response) {
            const url = response.configXml;

            const urlResponse = await fetch(url);
            if (urlResponse.ok) {
                const fileContent = await urlResponse.text();
                // prepare html with fileContent
                const { audioBase, sourceBase, translations, parts } =
                    this.parseLessonsXML(fileContent);
                console.log(parts);
            } else {
                console.log(urlResponse);
            }
        } else if ('error' in response) {
            console.log(response.error);
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

    private parseLessonsXML(fileContent: string): {
        audioBase: string;
        sourceBase: string;
        translations: { [key: string]: string };
        parts: Part[];
    } {
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(fileContent, 'text/xml');

        let audioBase = '';
        let sourceBase = '';

        let config = xmlDoc.getElementsByTagName('Config')[0];
        if (config) {
            audioBase =
                config.getElementsByTagName('AudioBase')[0]?.textContent || '';
            sourceBase =
                config.getElementsByTagName('SourceBase')[0]?.textContent || '';
        }

        let translations: { [key: string]: string } = {};

        let translationsNode = xmlDoc.getElementsByTagName('Translations')[0];
        if (translationsNode) {
            let languageNodes =
                translationsNode.getElementsByTagName('Language');
            for (let i = 0; i < languageNodes.length; i++) {
                let langNode = languageNodes[i];
                let code = langNode.getAttribute('code');
                let value = langNode.textContent || '';
                if (code) {
                    translations[code] = value;
                }
            }
        }

        let parts: Part[] = [];

        let xmlParts = xmlDoc.getElementsByTagName('Parts')[0];

        // Iterate through each <Level> element
        let levels = xmlParts.getElementsByTagName('Level');
        for (let i = 0; i < levels.length; i++) {
            let level = levels[i];

            let lessons: Lesson[] = [];

            // Iterate through each <Lesson> element within <Level>
            let lessonElements = level.getElementsByTagName('Lesson');
            for (let j = 0; j < lessonElements.length; j++) {
                let lessonElement = lessonElements[j];

                let audioAttr = lessonElement.getAttribute('audio') || '';
                let title = audioAttr.replace('.mp3', '');
                let audioSource = lessonElement.getAttribute('source') || '';
                const { fileName, folderPath } =
                    this.extractPathInfo(audioSource);

                let lesson = new Lesson(
                    title,
                    fileName, // fileName (populate this as needed)
                    folderPath, // folderName (populate this as needed)
                    folderPath, // imagesPath (populate this as needed)
                    audioAttr, // mp3
                    0 // duration (populate this as needed)
                );

                lessons.push(lesson);
            }

            let part = new Part(
                level.getAttribute('levelID') || '', // title
                level.getAttribute('sourceBasePath') || '', // path
                level.getAttribute('pdf') || '', // pdf
                lessons // lessons
            );

            parts.push(part);
        }

        return { audioBase, sourceBase, translations, parts };
    }
}
