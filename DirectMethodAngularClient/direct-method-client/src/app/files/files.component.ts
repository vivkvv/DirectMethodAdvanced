import { Component, OnInit } from '@angular/core';
import { S3filesService } from '../services/s3files/s3files.service';
import { Router } from '@angular/router';
import { FilesService } from '../services/s3files/files.service';
import { GoogleDriveFileService } from '../services/google.drive.files/google.drive.service';
// import Uppy from '@uppy/core';
// import AwsS3 from '@uppy/aws-s3';
//import { HttpClient /*, HttpHeaders*/ } from '@angular/common/http';

@Component({
    selector: 'app-files',
    templateUrl: './files.component.html',
    styleUrls: ['./files.component.css'],
})
export class FilesComponent implements OnInit {
    // s3
    // endpoint: string = 'http://192.168.208.210:9000';
    endpoint: string = 'https://127.0.0.1:9000';
    accessKey: string = 'aF0nBssacKE9P2hRXp0n';
    secretKey: string = 'eot73MGgQaBRnU5CQFjRaeJu0V6HMunJ1NBnT3lI';
    bucketName: string = 'directmethod';
    configXmlPath: string = 'directdescription.xml';
    // end of s3

    // google     
    //goolgeFolderLink: string = 'https://drive.google.com/drive/folders/1lA3zDxTl-OAJRPu0ty2itKQHAaSuJ7CN?usp=sharing';  
    // directdescription.xml
    //googleConfigXmlId: string = 'https://drive.google.com/file/d/1A040nrLM_KF3hYoDsBAiybbCouv0KLqt/view?usp=drive_link';
    googleConfigXmlId: string = '1A040nrLM_KF3hYoDsBAiybbCouv0KLqt';
    // FileList.csv:
    googleFileListPath: string = 'https://drive.google.com/file/d/1QmZWERLm_1nGUWKvPj46kQ6kkj9XExCm/view?usp=drive_link';


    //languages: string[] = [];
    selectedLanguage!: string;


    // 

    constructor(
        private s3filesService: S3filesService,
        private filesService: FilesService,
        private googleService: GoogleDriveFileService,
        private router: Router
    ) {}

    ngOnInit(): void {}

    async onGoogleDriveLanguagesCheckButtonClick(){
        // loading xml file
        const xmlString = await this.googleService.getConfigXML(this.googleConfigXmlId);
  


        // checking translation languages
    }

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

    async onGoogleDriveUseButtonClick(){

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
