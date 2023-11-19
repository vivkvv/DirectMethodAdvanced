import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
    Lesson,
    Part,
} from 'src/app/DirectMethodCommonInterface/folderStructure';

@Injectable({
    providedIn: 'root',
})
export class FilesService {
    public parts: Part[] = [];

    constructor(/*private httpClient: HttpClient*/) {}
}
