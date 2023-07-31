import { Component, OnInit } from '@angular/core';
import { PartsService } from '../services/parts.service';
import { Lesson, Part } from '../DirectMethodCommonInterface/folderStructure';

function createLessonFromJSON(json: any): Lesson {
    const lesson: Lesson = new Lesson(
        json._title,
        json._fileName,
        json._folderName,
        json._imagesPath,
        json._mp3,
        json._duration
    );
    return lesson;
}

function createPartFromJSON(json: any): Part {
    const lessons = (json._lessons || []).map(createLessonFromJSON);
    const part: Part = new Part(json._title, json._path, json._pdf, lessons);
    return part;
}

@Component({
    selector: 'app-topic-list',
    templateUrl: './parts-list.component.html',
    styleUrls: ['./parts-list.component.css'],
})
export class PartsListComponent implements OnInit {
    parts: Part[] = [];

    constructor(private topicService: PartsService) {}

    ngOnInit(): void {
        this.getTopics();
    }

    getTopics(): void {
        this.topicService.getTopics().subscribe(
            (parts: Part[]) => {
                console.log('Parts:', parts);
                this.parts = parts.map(createPartFromJSON);
            },
            (error: any) => {
                console.error('Failed to load parts:', error);
            }
        );
    }

    formatDuration(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
      }

      formatTotalDuration(part: Part): string {
        const totalSeconds = part.lessons.reduce((sum, lesson) => sum + lesson.duration, 0);
        return this.formatDuration(totalSeconds);
      }      
      
}
