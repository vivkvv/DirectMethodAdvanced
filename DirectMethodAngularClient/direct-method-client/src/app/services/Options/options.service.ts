import { Injectable } from '@angular/core';
import { FontOptions } from 'src/app/options/font-group/font-group.component';

export class DigitalStudent {
    use!: boolean;
    amount!: number;
    realStudentOrder!: number;
}

export class OnRealStudentAnswer {
    use!: boolean;
    playSignal!: boolean;
    openSpeechRecognitionDialog!: boolean;
    closeSpeechRecognitionDialog!: boolean;
    useEvaluation!: boolean;
    maximumAttempts!: number;
    maximumError!: number;
}

export class ContinuousLessonOptions {
    pauseBeforePhrase!: number;
    pauseAfterPhrase!: number;
    digitalStudent!: DigitalStudent;
    onRealStudentAnswer!: OnRealStudentAnswer;
}

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

    continuousLessonOptions: ContinuousLessonOptions = {
        pauseBeforePhrase:  0.5,
        pauseAfterPhrase: 0.5,
        
        digitalStudent: {
            use: false,
            amount: 0,
            realStudentOrder: 0
        },

        onRealStudentAnswer: {
            use: false,
            playSignal: false,
            openSpeechRecognitionDialog: true,
            closeSpeechRecognitionDialog: true,
            useEvaluation: true,
            maximumAttempts: 3,
            maximumError: 30
        }   
    };
}
