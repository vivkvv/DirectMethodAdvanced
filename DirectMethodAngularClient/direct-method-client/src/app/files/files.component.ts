import { Component, OnInit } from '@angular/core';
import { S3filesService } from '../services/s3files/s3files.service';
import { Router } from '@angular/router';
import { FilesService } from '../services/s3files/files.service';
// import Uppy from '@uppy/core';
// import AwsS3 from '@uppy/aws-s3';
//import { HttpClient /*, HttpHeaders*/ } from '@angular/common/http';

@Component({
    selector: 'app-files',
    templateUrl: './files.component.html',
    styleUrls: ['./files.component.css'],
})
export class FilesComponent implements OnInit {
    // endpoint: string = 'http://192.168.208.210:9000';
    endpoint: string = 'https://127.0.0.1:9000';
    accessKey: string = 'aF0nBssacKE9P2hRXp0n';
    secretKey: string = 'eot73MGgQaBRnU5CQFjRaeJu0V6HMunJ1NBnT3lI';
    bucketName: string = 'directmethod';
    configXmlPath: string = 'directdescription.xml';
    //languages: string[] = [];
    selectedLanguage!: string;

    constructor(
        private s3filesService: S3filesService,
        private filesService: FilesService,
        private router: Router
    ) {}

    ngOnInit(): void {}

    async onCheckButtonClick() {
        await this.s3filesService.getS3data(
            this.endpoint,
            this.accessKey,
            this.secretKey,
            this.bucketName,
            this.configXmlPath
        );

        // if (this.filesService.parts) {
            //this.s3filesService.languages;
            //this.router.navigate(['/client-topic-list']);
        // }
    }

    getTranslationKeys(): string[] {
        //return Object.keys(this.s3filesService.translations);
        return this.s3filesService.languages;
    }

    async onUseButtonClick() {
        await this.s3filesService.gets3DetailedData(
            this.endpoint,
            this.accessKey,
            this.secretKey,
            this.bucketName,
            this.selectedLanguage
        );
        //this.s3filesService.languages;
        this.router.navigate(['/client-parts-list']);// (['/client-topic-list']);
    }
}
