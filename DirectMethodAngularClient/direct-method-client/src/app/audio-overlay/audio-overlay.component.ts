import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

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
export class AudioOverlayComponent {
    liveRecognizing: boolean = false;
    soundExists: boolean = false;

    isRecordEnabled: boolean = true;
    isPlayEnabled: boolean = false;
    isLiveRecognizingEnabled: boolean = true;
    isRecognizeEnabled: boolean = false;

    _audioState: AudioState = AudioState.AS_NONE;

    constructor(public dialogRef: MatDialogRef<AudioOverlayComponent>) {}

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
                this.isPlayEnabled = this.soundExists;
                this.isLiveRecognizingEnabled = true;
                this.isRecognizeEnabled = this.soundExists || this.liveRecognizing;
                break;
            case AudioState.AS_RECORD:
                this.isRecordEnabled = true;
                this.isPlayEnabled = false;
                this.isLiveRecognizingEnabled = false;
                this.isRecognizeEnabled = false;
                break;
            case AudioState.AS_PLAY:
                this.isRecordEnabled = false;
                this.isPlayEnabled = true;
                this.isLiveRecognizingEnabled = false;
                this.isRecognizeEnabled = false;
                break;
            case AudioState.AS_RECOGNIZE:
                this.isRecordEnabled = false;
                this.isPlayEnabled = false;
                this.isLiveRecognizingEnabled = true;
                this.isRecognizeEnabled = true;
                break;
            case AudioState.AS_LIVE_RECOGNIZE:
                this.isRecordEnabled = false;
                this.isPlayEnabled = false;
                this.isLiveRecognizingEnabled = true;
                this.isRecognizeEnabled = true;
                break;
        }
    }

    onRecord() {
        if (this.audioState === AudioState.AS_RECORD) {
            this.soundExists = true;
            this.audioState = AudioState.AS_NONE;
        } else if (this.audioState === AudioState.AS_NONE) {
            this.audioState = AudioState.AS_RECORD;
        }
    }

    onPlay() {
        if (this.audioState === AudioState.AS_NONE) {
            this.audioState = AudioState.AS_PLAY;
        } else if (this.audioState === AudioState.AS_PLAY) {
            this.audioState = AudioState.AS_NONE;
        }
    }

    onRecognizing() {
        if (this.audioState === AudioState.AS_NONE) {
            if (this.liveRecognizing) {
                this.audioState = AudioState.AS_LIVE_RECOGNIZE;
            } else {
                this.audioState = AudioState.AS_RECOGNIZE;
            }
        } else if (this.audioState === AudioState.AS_RECOGNIZE) {
            this.audioState = AudioState.AS_NONE;
        } else if (this.audioState === AudioState.AS_LIVE_RECOGNIZE) {
            this.audioState = AudioState.AS_NONE;
        }
    }

    onLiveRecognizingClick() {
        this.liveRecognizing = !this.liveRecognizing;
        this.audioState = this.audioState;
    }
}
