import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SpeechRecognitionService } from '../services/Speech-recognition/speech-recognition.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { LessonComponent } from '../lesson/lesson.component';

export enum AudioState {
    AS_NONE = 0,
    AS_RECORD = 1,
    AS_PLAY = 2,
    AS_RECOGNIZE = 3,
}

@Component({
    selector: 'audio-overlay-content',
    templateUrl: './audio-overlay.component.html',
    styleUrls: ['./audio-overlay.component.css'],
})
export class AudioOverlayComponent implements OnInit {
    comparison_result: string = '';
    soundExists: boolean = false;

    isRecordEnabled: boolean = true;
    isRecognizeEnabled: boolean = true;

    _audioState: AudioState = AudioState.AS_NONE;

    mediaRecorder!: MediaRecorder;
    transcript = '';

    lesson!: any;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<AudioOverlayComponent>,
        private speechRecognitionService: SpeechRecognitionService,
        private cd: ChangeDetectorRef
    ) {
        this.lesson = data.parentComponent;
        this.speechRecognitionService.onResult((event) => {
            let final_flag: boolean = false;

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    final_flag = true;
                    this.transcript += result[0].transcript + '\n';
                } else {
                    //   this.transcript += result[0].transcript + '\n';
                }
            }

            if (final_flag) {
                const desired_text = this.lesson.getCurrentEpisode(true)?.text;
                if (desired_text) {
                    const difference = this.levenshtein(
                        this.transcript,
                        desired_text
                    );
                    this.comparison_result =
                        ((100 * difference) / desired_text.length).toFixed(1) +
                        '%';
                }
            }

            this.cd.detectChanges();
        });
    }

    ngOnInit() {
        this.speechRecognitionService.onStart(() => {
            if (this.audioState === AudioState.AS_NONE) {
                this.audioState = AudioState.AS_RECOGNIZE;
            }
            this.transcript = '';
            this.cd.detectChanges();
        });

        this.speechRecognitionService.onEnd(() => {
            if (this.audioState === AudioState.AS_RECOGNIZE) {
                this.audioState = AudioState.AS_NONE;
            }
            this.cd.detectChanges();
        });
    }

    getColor(value: string): string {
        const percentage = parseFloat(value);
        const hue = (1 - percentage / 100) * 120;
        return `hsl(${hue}, 100%, 50%)`;
    }

    close(): void {
        this.dialogRef.close();
    }

    get audioState() {
        return this._audioState;
    }

    set audioState(state: AudioState) {
        this._audioState = state;
        switch (state) {
            case AudioState.AS_NONE:
                this.isRecordEnabled = true;
                this.isRecognizeEnabled = true;
                break;
            case AudioState.AS_RECORD:
                this.isRecordEnabled = true;
                this.isRecognizeEnabled = false;
                break;
            case AudioState.AS_PLAY:
                this.isRecordEnabled = false;
                this.isRecognizeEnabled = false;
                break;
            case AudioState.AS_RECOGNIZE:
                this.isRecordEnabled = false;
                this.isRecognizeEnabled = true;
                break;
        }
    }

    onRecord() {
        if (this.audioState === AudioState.AS_RECORD) {
            this.soundExists = true;
            this.audioState = AudioState.AS_NONE;
            this.stopRecording();
        } else if (this.audioState === AudioState.AS_NONE) {
            this.audioState = AudioState.AS_RECORD;
            this.startRecording();
        }
    }

    onRecognizing() {
        if (this.audioState === AudioState.AS_NONE) {
            this.speechRecognitionService.start();
        } else if (this.audioState === AudioState.AS_RECOGNIZE) {
            this.speechRecognitionService.stopListening();
        }
    }

    onLiveRecognizingClick() {
        this.audioState = this.audioState;
    }

    private startRecording() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            console.log('getUserMedia supported.');
            navigator.mediaDevices
                .getUserMedia({
                    audio: true,
                })

                .then((stream) => {
                    const chunks: Blob[] = [];
                    this.mediaRecorder = new MediaRecorder(stream);

                    const audioElement = document.querySelector(
                        '.sound-clips audio'
                    ) as HTMLAudioElement;

                    this.mediaRecorder.onstop = (e) => {
                        const blob = new Blob(chunks, {
                            type: 'audio/ogg; codecs=opus',
                        });

                        audioElement.src = window.URL.createObjectURL(blob);
                    };

                    this.mediaRecorder.start();
                    this.mediaRecorder.ondataavailable = (e) => {
                        chunks.push(e.data);
                    };
                })

                // Error callback
                .catch((err) => {
                    console.error(
                        `The following getUserMedia error occurred: ${err}`
                    );
                });
        } else {
            console.log('getUserMedia not supported on your browser!');
        }
    }

    private stopRecording() {
        this.mediaRecorder.stop();
    }

    normalizeString(str: string) {
        return str
            .replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()\n\r]/g, '')
            .toLowerCase();
    }

    private levenshtein(a: string, b: string) {
        a = this.normalizeString(a);
        b = this.normalizeString(b);

        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        let matrix = [];

        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }
}
