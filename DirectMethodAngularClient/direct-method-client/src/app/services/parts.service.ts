import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Part } from '../DirectMethodCommonInterface/folderStructure';

@Injectable({
  providedIn: 'root'
})
export class PartsService {

  //private apiUrl = 'http://localhost:3000/api/topics';
  private apiUrl = 'api/topics';

  constructor(private http: HttpClient) { }

   getTopics(): Observable<Part[]> {
     return this.http.get<Part[]>(this.apiUrl);
   }

}
