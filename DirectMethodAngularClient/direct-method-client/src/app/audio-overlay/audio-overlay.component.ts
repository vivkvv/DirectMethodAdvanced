import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SpeechRecognitionService } from '../services/Speech-recognition/speech-recognition.service';

export enum AudioState {
    AS_NONE = 0,
    AS_RECORD = 1,
    AS_PLAY = 2,
    AS_RECOGNIZE = 3,
    AS_LIVE_RECOGNIZE = 4,
}

@Component({
    selector: 'audio-overlay-content',
    templateUrl: './audio-overlay.component.html',
    styleUrls: ['./audio-overlay.component.css'],
})
export class AudioOverlayComponent implements OnInit {
    liveRecognizing: boolean = true;
    soundExists: boolean = false;

    isRecordEnabled: boolean = true;
    isLiveRecognizingEnabled: boolean = true;
    isRecognizeEnabled: boolean = true;

    _audioState: AudioState = AudioState.AS_NONE;

    mediaRecorder!: MediaRecorder;
    transcript = '';

    constructor(
        public dialogRef: MatDialogRef<AudioOverlayComponent>,
        private speechRecognitionService: SpeechRecognitionService,
        private cd: ChangeDetectorRef
    ) {
        this.speechRecognitionService.onResult((event) => {
            this.transcript = '';
                    
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    this.transcript += result[0].transcript;
                } else {
                  this.transcript += result[0].transcript;
                }
            }

            this.cd.detectChanges();
        });
    }

    ngOnInit() {
        this.speechRecognitionService.onStart(() => {
            if (this.audioState === AudioState.AS_NONE) {
                if (this.liveRecognizing) {
                    this.audioState = AudioState.AS_LIVE_RECOGNIZE;
                } else {
                    this.audioState = AudioState.AS_RECOGNIZE;
                }
            }
            this.cd.detectChanges();
        });

        this.speechRecognitionService.onEnd(() => {
            if (this.audioState === AudioState.AS_RECOGNIZE) {
                this.audioState = AudioState.AS_NONE;
            } else if (this.audioState === AudioState.AS_LIVE_RECOGNIZE) {
                this.audioState = AudioState.AS_NONE;
            }
            this.cd.detectChanges();
        });
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
                this.isLiveRecognizingEnabled = true;
                this.isRecognizeEnabled =
                    this.soundExists || this.liveRecognizing;
                break;
            case AudioState.AS_RECORD:
                this.isRecordEnabled = true;
                this.isLiveRecognizingEnabled = false;
                this.isRecognizeEnabled = false;
                break;
            case AudioState.AS_PLAY:
                this.isRecordEnabled = false;
                this.isLiveRecognizingEnabled = false;
                this.isRecognizeEnabled = false;
                break;
            case AudioState.AS_RECOGNIZE:
                this.isRecordEnabled = false;
                this.isLiveRecognizingEnabled = true;
                this.isRecognizeEnabled = true;
                break;
            case AudioState.AS_LIVE_RECOGNIZE:
                this.isRecordEnabled = false;
                this.isLiveRecognizingEnabled = true;
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
        this.liveRecognizing = !this.liveRecognizing;
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
}
