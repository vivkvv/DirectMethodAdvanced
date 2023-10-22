import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class S3filesService {
    private endpoint!: string;
    private accessKey!: string;
    private secretKey!: string;
    private bucketName!: string;
    languages: string[] = [];

    constructor(private httpClient: HttpClient) {}

    async getS3data(
        endpoint: string,
        accessKey: string,
        secretKey: string,
        bucketName: string
    ) {
        Object.assign(this, { endpoint, accessKey, secretKey, bucketName });

        await this.httpClient
            .get(
                `/api/s3?endpoint=${this.endpoint}&accessKey=${this.accessKey}&secretKey=${this.secretKey}&bucketName=${this.bucketName}`
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

    private parse(response: any){
      // languages = ;
      // files = ;
    }
}
