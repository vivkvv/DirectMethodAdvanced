import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
    Lesson,
    Part,
} from 'src/app/DirectMethodCommonInterface/folderStructure';

@Injectable({
    providedIn: 'root',
})
export class FilesService {
    public parts: Part[] = [];

    constructor(/*private httpClient: HttpClient*/) {}

    flattenLessons() {
        return this.parts.flatMap((part) =>
            part._lessons.map((lesson) => ({
                ...lesson,
                partTitle: part._title,
            }))
        );
    }

    public getNextFile(
        partID: string,
        lessonID: string
    ): {
        nextPartID: string;
        nextLessonID: string;
        nextFileName: string;
        nextTranslationFile: string;
        nextMP3: string;
    } {
        let nextPartID: string = '';
        let nextLessonID: string = '';
        let nextFileName: string = '';
        let nextTranslationFile: string = '';
        let nextMP3: string = '';

        const flattenedLessons = this.flattenLessons();
        const currentIndex = flattenedLessons.findIndex(
            (lesson) =>
                lesson._title === lessonID && lesson.partTitle === partID
        );

        // Return the next lesson, or null if there isn't one
        if (currentIndex >= 0 && currentIndex < flattenedLessons.length - 1) {
            nextPartID = flattenedLessons[currentIndex + 1].partTitle;
            nextLessonID = flattenedLessons[currentIndex + 1]._title;
            nextFileName = flattenedLessons[currentIndex + 1]._fileName;
            nextTranslationFile =
                flattenedLessons[currentIndex + 1]._translationFile;
            nextMP3 = flattenedLessons[currentIndex + 1]._mp3;
        }

        return {
            nextPartID,
            nextLessonID,
            nextFileName,
            nextTranslationFile,
            nextMP3,
        };
    }

    public getPrevFile(
        partID: string,
        lessonID: string
    ): {
        nextPartID: string;
        nextLessonID: string;
        nextFileName: string;
        nextTranslationFile: string;
        nextMP3: string;
    } {
        let nextPartID: string = '';
        let nextLessonID: string = '';
        let nextFileName: string = '';
        let nextTranslationFile: string = '';
        let nextMP3: string = '';

        const flattenedLessons = this.flattenLessons();
        const currentIndex = flattenedLessons.findIndex(
            (lesson) =>
                lesson._title === lessonID && lesson.partTitle === partID
        );

        // Return the next lesson, or null if there isn't one
        if (currentIndex > 0 && currentIndex <= flattenedLessons.length - 1) {
            nextPartID = flattenedLessons[currentIndex - 1].partTitle;
            nextLessonID = flattenedLessons[currentIndex - 1]._title;
            nextFileName = flattenedLessons[currentIndex - 1]._fileName;
            nextTranslationFile =
                flattenedLessons[currentIndex - 1]._translationFile;
            nextMP3 = flattenedLessons[currentIndex - 1]._mp3;
        }

        return {
            nextPartID,
            nextLessonID,
            nextFileName,
            nextTranslationFile,
            nextMP3,
        };
    }

}