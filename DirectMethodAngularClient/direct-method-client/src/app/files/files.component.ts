import { Component, OnInit } from '@angular/core';
import { S3filesService } from '../services/s3files/s3files.service';
// import Uppy from '@uppy/core';
// import AwsS3 from '@uppy/aws-s3';
//import { HttpClient /*, HttpHeaders*/ } from '@angular/common/http';

@Component({
    selector: 'app-files',
    templateUrl: './files.component.html',
    styleUrls: ['./files.component.css'],
})
export class FilesComponent implements OnInit {
    endpoint: string = 'http://192.168.208.210:9000';
    accessKey: string = 'aF0nBssacKE9P2hRXp0n';
    secretKey: string = 'eot73MGgQaBRnU5CQFjRaeJu0V6HMunJ1NBnT3lI';
    bucketName: string = 'directmethod';
    configXmlPath: string = 'directdescription.xml';
    languages: string[] = [];

    constructor(private s3filesService: S3filesService) {}

    ngOnInit(): void {}

    async onCheckButtonClick() {
        await this.s3filesService.getS3data(this.endpoint, this.accessKey, this.secretKey, this.bucketName, this.configXmlPath);
        this.s3filesService.languages;
        // const uppy = new Uppy();
        // const self = this;

        // const url = `${this.endpoint}/${this.bucketName}/${this.configXmlPath}`;
        // const headers = new HttpHeaders({
        //     'Authorization': 'Basic ' + btoa(`${this.accessKey}:${this.secretKey}`)
        //   });
        // try {
        //   const configXml = await this.httpClient.get(url, { responseType: 'text' }).toPromise();
        //   return configXml;
        // } catch (error) {
        //   console.error("Could not fetch file from S3", error);
        // }

        // return '';

        // uppy.use(AwsS3, {
        //     companionUrl: this.endpoint,
        //     getUploadParameters(file) {
        //         return {
        //             method: 'POST',
        //             url: `${self.endpoint}/${self.bucketName}/${file.name}`,
        //             fields: {
        //                 accessKey: self.accessKey,
        //                 secretKey: self.secretKey,
        //             },
        //         };
        //     },
        // });

        // uppy.on('upload', (data) => {
        //     console.log('Uploading: ', data);
        // });

        // uppy.on('complete', (result) => {
        //     console.log('Upload complete: ', result);
        // });

        // uppy.on('error', (error) => {
        //     console.log('Error: ', error);
        // });

        // uppy.on('upload-error', (file, error, response) => {
        //     console.error('Upload error: ', error, response);
        // });

        // uppy.on('upload-success', async (file, response) => {
        //     const config = await this.fetchFromS3(
        //         this.bucketName,
        //         this.configXmlPath
        //     );
        //     this.languages = this.parseXML(config);
        // });
    }

    // async fetchFromS3(bucket: string, filePath: string) {
    //     // логика получения файла с bucket и filePath
    //     return 'some strimg';
    // }

    private parseXML(config: string) {
        // логика разбора XML
        return [];
    }
}
