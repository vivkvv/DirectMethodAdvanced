import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoogleDriveFileService {

  constructor(private httpClient: HttpClient) {}

  public async getConfigXML(fileId: string) {
    //return firstValueFrom(this.http.get(fileUrl, { responseType: 'text' }));

    const response: any = await this.httpClient.get(`/api/google-drive/languages?fileId=${fileId}`).toPromise();
    console.log(response);
  }

  public getBinaryFile(fileUrl: string) {
    //return this.http.get(fileUrl, { responseType: 'blob' });
  }
}
