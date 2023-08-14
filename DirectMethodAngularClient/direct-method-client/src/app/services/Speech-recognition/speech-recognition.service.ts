import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SpeechRecognitionService {
    recognition: any;
    private startSubject = new Subject<void>();
    private endSubject = new Subject<void>();

    constructor() {
        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'en-US';
        this.recognition.interimResults = true; 

        this.recognition.onstart = () => {
            this.startSubject.next();
            console.log('speech recognition start');
        };

        this.recognition.onend = () => {
            this.endSubject.next();
            console.log('speech recognition end');            
        };
    }

    start() {
        this.recognition.start();
    }

    stopListening() {
        this.recognition.stop();
    }

    onResult(callback: (event: any) => void) {
        this.recognition.onresult = callback;
        console.log('on result');
    }

    onError(callback: (event: any) => void) {
        this.recognition.onerror = callback;
        console.log('on error');
    }

    onStart(callback: () => void) {
        this.startSubject.subscribe(callback);
    }

    onEnd(callback: () => void) {
        this.endSubject.subscribe(callback);
    }
}
