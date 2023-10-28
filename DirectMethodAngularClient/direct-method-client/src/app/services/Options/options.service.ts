import { Injectable } from '@angular/core';
import { FontOptions } from 'src/app/options/font-group/font-group.component';
import { HttpClient } from '@angular/common/http';

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
    pauseBeforeClose!: number;
    useEvaluation!: boolean;
    maximumAttempts!: number;
    maximumError!: number;
}

export class PauseAfterPhrase {
    // = constantTime + multiplePreviousPhraseTime * lengthOfPreviousTime()
    constantTime!: number;
    multiplePreviousPhraseTime!: number;
}

export class ContinuousLessonOptions {
    Language: string = '';
    ttsVoice: string = '';
    emptyTimeBehaviour: string = '';
    pauseBeforePhrase: number = 0.5;
    pauseAfterPhrase: PauseAfterPhrase = {
        constantTime: 0.5,
        multiplePreviousPhraseTime: 1.0,
    };
    digitalStudent: DigitalStudent = {
        use: false,
        amount: 0,
        realStudentOrder: 0,
    };
    onRealStudentAnswer: OnRealStudentAnswer = {
        use: false,
        playSignal: false,
        openSpeechRecognitionDialog: true,
        closeSpeechRecognitionDialog: true,
        pauseBeforeClose: 0.5,
        useEvaluation: true,
        maximumAttempts: 3,
        maximumError: 30,
    };
}

class SerializableOptions {
    mainPanelSide: string = 'left';

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

    activeModelName: string = 'default';

    continuousLessonOptionsMap: { [key: string]: ContinuousLessonOptions } = {
        default: {
            Language: '',
            ttsVoice: '',
            emptyTimeBehaviour: 'stop',

            pauseBeforePhrase: 0.5,
            pauseAfterPhrase: {
                constantTime: 0.5,
                multiplePreviousPhraseTime: 1.0,
            },

            digitalStudent: {
                use: false,
                amount: 0,
                realStudentOrder: 0,
            },

            onRealStudentAnswer: {
                use: false,
                playSignal: false,
                openSpeechRecognitionDialog: true,
                closeSpeechRecognitionDialog: true,
                pauseBeforeClose: 0.5,
                useEvaluation: true,
                maximumAttempts: 3,
                maximumError: 30,
            },
        },
    };
}

@Injectable({
    providedIn: 'root',
})
export class OptionsService {
    constructor(private http: HttpClient) {
        this.options = new SerializableOptions();
    }

    serialize() {
        const payload = JSON.parse(JSON.stringify(this.options));
        this.http.post('/api/db/save_options', payload).subscribe();
    }

    deserialize() {
        this.http.post('/api/db/load_options', null).subscribe(
            (payload) => Object.assign(this.options, payload),
            (error) => console.error('ailed to deserialize options:', error)
        );
    }

    options: SerializableOptions;
}
