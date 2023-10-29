import { Component, OnInit } from '@angular/core';
import { Lesson, Part } from '../DirectMethodCommonInterface/folderStructure';
import { S3filesService } from '../services/s3files/s3files.service';

@Component({
    selector: 'app-client-topic-list',
    templateUrl: './client-parts-list.component.html',
    styleUrls: ['./client-parts-list.component.css'],
})
export class ClientPartsListComponent implements OnInit {
    parts: Part[] = [];

    constructor(private s3filesService: S3filesService) {}

    ngOnInit(): void {
        this.makeProperHtml();
    }

    makeProperHtml(): void {
        this.parts = this.s3filesService.parts;
    }      
}
