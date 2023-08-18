import { Injectable } from '@angular/core';
import { FontOptions } from 'src/app/options/font-group/font-group.component';

@Injectable({
    providedIn: 'root',
})
export class OptionsService {
    teacherFont: FontOptions = {
        visibility: true,
        fontFamily: 'Arial',
        fontSize: 28,
        fontColor: '#58BB58',
    };

    teacherTranslatedFont: FontOptions = {
        visibility: true,
        fontFamily: 'Arial',
        fontSize: 16,
        fontColor: '#333333',
    };

    studentFont: FontOptions = {
        visibility: true,
        fontFamily: 'Arial',
        fontSize: 22,
        fontColor: '#58BB58',
    };

    studentTranslatedFont: FontOptions = {
        visibility: true,
        fontFamily: 'Arial',
        fontSize: 12,
        fontColor: '#333333',
    };
}
