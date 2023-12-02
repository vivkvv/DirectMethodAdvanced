import { Component, OnInit } from '@angular/core';
import { S3filesService } from '../services/s3files/s3files.service';
import { Router } from '@angular/router';
import { FilesService } from '../services/s3files/files.service';
import { GoogleDriveFileService } from '../services/google.drive.files/google.drive.service';
import { MAT_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY } from '@angular/material/select';
// import Uppy from '@uppy/core';
// import AwsS3 from '@uppy/aws-s3';
//import { HttpClient /*, HttpHeaders*/ } from '@angular/common/http';

@Component({
    selector: 'app-files',
    templateUrl: './files.component.html',
    styleUrls: ['./files.component.css'],
})
export class FilesComponent implements OnInit {
    selectedConfiguration: string = '';
    // s3
    // endpoint: string = 'http://192.168.208.210:9000';
    endpoint: string = 'https://127.0.0.1:9000'; // https://storage.googleapis.com
    accessKey: string = 'aF0nBssacKE9P2hRXp0n'; // GOOG1EQDR7WVFU3HHYXLN4Q6ANDZ2KK4CLPYPHYSC2PDAVYPXYWX2KZBDGKCM
    secretKey: string = 'eot73MGgQaBRnU5CQFjRaeJu0V6HMunJ1NBnT3lI'; // msd98kCsZrJRJqF/8N035uDFsHPd8TxvULehkmOv
    bucketName: string = 'directmethod'; // callanmethodproject.appspot.com
    configXmlPath: string = 'directdescription.xml'; // 'directdescription.xml'
    // end of s3

    // google
    //goolgeFolderLink: string = 'https://drive.google.com/drive/folders/1lA3zDxTl-OAJRPu0ty2itKQHAaSuJ7CN?usp=sharing';
    // directdescription.xml
    //googleConfigXmlId: string = 'https://drive.google.com/file/d/1A040nrLM_KF3hYoDsBAiybbCouv0KLqt/view?usp=drive_link';
    googleConfigXmlId: string = '1A040nrLM_KF3hYoDsBAiybbCouv0KLqt';
    // FileList.csv:
    googleFileListPath: string =
        'https://drive.google.com/file/d/1QmZWERLm_1nGUWKvPj46kQ6kkj9XExCm/view?usp=drive_link';

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

    async onGoogleDriveLanguagesCheckButtonClick() {
        // loading xml file
        const xmlString = await this.googleService.getConfigXML(
            this.googleConfigXmlId
        );

        // checking translation languages
    }

    onConfigurationChange(activeConfiguration: string) {
        // const selectElement = event.target as HTMLSelectElement;
        // const selectedKey = selectElement.value;
        const selectedKey = activeConfiguration;//this.selectedConfiguration;

        this.endpoint = this.s3filesService.s3Configurations[selectedKey].endpoint;
        this.accessKey = this.s3filesService.s3Configurations[selectedKey].accessKey;
        this.secretKey = this.s3filesService.s3Configurations[selectedKey].secretKey;
        this.bucketName = this.s3filesService.s3Configurations[selectedKey].bucketName;
        this.configXmlPath = this.s3filesService.s3Configurations[selectedKey].configXmlPath;
        this.selectedLanguage = this.s3filesService.s3Configurations[selectedKey].language;        
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

    async onGoogleDriveUseButtonClick() {}

    get s3ConfigurationKeys(): string[] {
        return Object.keys(this.s3filesService.s3Configurations);
    }

    async OnRemoveButtonClick(){
        const userConfirmed = window.confirm(`Do you want to remove the configuration '${this.selectedConfiguration}'?`);

        if (!userConfirmed) {
            return;
        }

        const addS3result = await this.s3filesService.removeConfiguration(this.selectedConfiguration);

        await this.s3filesService.updateAllS3Configurations();
        //this.onConfigurationChange(newName);

    }

    async OnAddButtonClick() {
        const newName = window.prompt(
            'Please enter a new name for the configuration:'
        );
        if (!newName) {
            return;
        }

        const addS3result = await this.s3filesService.addS3Configuration(
            newName,
            this.endpoint,
            this.bucketName,
            this.accessKey,
            this.secretKey,
            this.configXmlPath,
            this.selectedLanguage
        );

        // ok:
        // - select current
        // - get all
        await this.s3filesService.updateAllS3Configurations();
        this.onConfigurationChange(newName);

        // - set saved before as current

        // error
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
        this.router.navigate(['/client-parts-list']); // (['/client-topic-list']);
    }
}
