import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import S3 from 'aws-sdk/clients/s3';

@Controller('api/s3')
export class S3Controller {
    constructor(){}

    @UseGuards(JwtAuthGuard)
    @Get()
    async getS3(
        @Query('endpoint') endpoint: string,
        @Query('accessKey') accessKeyId: string,
        @Query('secretKey') secretAccessKey: string,        
        @Query('bucketName') Bucket: string, 
        @Query('configXmlPath') configXmlPath: string
    ){
        
        const s3 = new S3({
            endpoint,
            accessKeyId,
            secretAccessKey,
            s3ForcePathStyle: true, // MinIO!
            signatureVersion: 'v4',
        });        

        const params = {
            Bucket
        };

        // getting objects list
        try {
            const data = await s3.listObjectsV2(params).promise();

            const file = data.Contents.find(item => item.Key === configXmlPath);

            if (file) {
                const urlParams = {
                    Bucket: params.Bucket,
                    Key: file.Key,
                    Expires: 60 // URL will be valid for 60 seconds
                };
              
                const url = s3.getSignedUrl('getObject', urlParams);
                return { configXml: url };
            }

            return { error: `Can't find ${configXmlPath} file`};
        } catch (error) {
            return { error: error.message };
        }        

    }
}

