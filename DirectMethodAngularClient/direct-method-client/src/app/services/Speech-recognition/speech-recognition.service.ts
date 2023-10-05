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
        // this.recognition.lang = 'en-US';
        this.recognition.interimResults = true;

        this.recognition.onstart = () => {
            this.startSubject.next();
        };

        this.recognition.onend = () => {
            this.endSubject.next();
        };
    }

    start() {
        const selectElement = document.querySelector('.language_id') as HTMLSelectElement;
        if (selectElement) {
            const selectedValue =
                selectElement.options[selectElement.selectedIndex].value;
            this.recognition.lang = selectedValue;
        }
        this.recognition.start();
    }

    stopListening() {
        this.recognition.stop();
    }

    onResult(callback: (event: any) => void) {
        this.recognition.onresult = callback;
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

    recognitionEnded(): Promise<void> {
        return new Promise(resolve => {
          this.onEnd(() => {
            resolve();
          });
        });
      }      
}
