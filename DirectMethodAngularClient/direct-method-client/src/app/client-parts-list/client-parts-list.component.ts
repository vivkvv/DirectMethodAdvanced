import { Component, OnInit } from '@angular/core';
import { Lesson, Part } from '../DirectMethodCommonInterface/folderStructure';
import { S3filesService } from '../services/s3files/s3files.service';
import { FilesService } from '../services/s3files/files.service';

@Component({
    selector: 'client-parts-list',
    templateUrl: './client-parts-list.component.html',
    styleUrls: ['./client-parts-list.component.css'],
})
export class ClientPartsListComponent implements OnInit {
    parts: Part[] = [];

    constructor(private s3filesService: S3filesService, private filesService: FilesService) {}

    ngOnInit(): void {
        this.makeProperHtml();
    }

    makeProperHtml(): void {
        this.parts = this.filesService.parts;
    }      
}
