import { Component, OnInit } from '@angular/core';
import { OptionsService } from '../services/Options/options.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'app-options-page',
    templateUrl: './options-page.component.html',
})
export class OptionsPageComponent implements OnInit {
    userInput: string = '';

    availableLanguages: Set<string> = new Set();
    availableVoices: SpeechSynthesisVoice[] = [];
    selectedLanguage: string = 'en-US';
    selectedVoice: SpeechSynthesisVoice | null = null;

    constructor(
        public optionsService: OptionsService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.updateVoices();

        window.speechSynthesis.onvoiceschanged = () => {
            this.updateVoices();
        };
    }

    private updateVoices() {
        this.availableVoices = window.speechSynthesis.getVoices();
        this.availableLanguages.clear();
        this.availableVoices.forEach((voice) =>
            this.availableLanguages.add(voice.lang)
        );
        this.cdr.detectChanges();
    }

    onLanguageChange() {
        this.selectedVoice =
            this.availableVoices.find(
                (voice) => voice.lang === this.selectedLanguage
            ) || null;
    }

    speakUserText() {}
}
