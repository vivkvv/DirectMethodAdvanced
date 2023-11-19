import { Component, OnInit } from '@angular/core';
import {
    ContinuousLessonOptions,
    OptionsService,
} from '../services/Options/options.service';
import { ChangeDetectorRef } from '@angular/core';
import { DeleteModeComponent } from '../delete-mode/delete-mode.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-options-page',
    templateUrl: './options-page.component.html',
})
export class OptionsPageComponent implements OnInit {
    availableSides: string[] = ['left', 'right'];
    emtyTimeOptions: string[] = ['stop', 'skip', 'use TTS'];

    tempModelKey!: string;
    selectedModelKey: string = 'default';

    userInput: string = '';

    availableLanguages: Set<string> = new Set();
    availableVoices: SpeechSynthesisVoice[] = [];
    selectedVoice: SpeechSynthesisVoice | null = null;

    constructor(
        public optionsService: OptionsService,
        private cdr: ChangeDetectorRef,
        private dialog: MatDialog,
        private optionsDialog: MatDialogRef<OptionsPageComponent>
    ) {}

    ngOnInit(): void {
        this.tempModelKey = this.optionsService.options.activeModelName;
        this.selectedModelKey = this.optionsService.options.activeModelName;
        this.updateVoices();
        this.updateSelectedModel();

        window.speechSynthesis.onvoiceschanged = () => {
            this.updateVoices();
        };

        this.cdr.detectChanges();
    }

    onVoiceNameChange(newVoiceName: string) {
        this.selectedVoice =
            this.availableVoices.find((voice) => voice.name === newVoiceName) ||
            null;
        this.optionsService.serialize();
        this.cdr.detectChanges();
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
                (voice) =>
                    voice.lang ===
                    this.optionsService.options.continuousLessonOptionsMap[
                        this.tempModelKey
                    ].Language
            ) || null;
        this.cdr.detectChanges();
    }

    changeModeName() {
        if (this.tempModelKey !== this.selectedModelKey) {
            const value =
                this.optionsService.options.continuousLessonOptionsMap[
                    this.selectedModelKey
                ];

            delete this.optionsService.options.continuousLessonOptionsMap[
                this.selectedModelKey
            ];

            this.optionsService.options.continuousLessonOptionsMap[
                this.tempModelKey
            ] = value;

            this.selectedModelKey = this.tempModelKey;
            this.optionsService.options.activeModelName = this.selectedModelKey;
        }
    }

    speakUserText() {
        const voice =
            this.availableVoices.find(
                (voice) =>
                    voice.name ===
                    this.optionsService.options.continuousLessonOptionsMap[
                        this.optionsService.options.activeModelName
                    ].ttsVoice
            ) || null;

        const msg = new SpeechSynthesisUtterance(this.userInput);
        msg.lang =
            this.optionsService.options.continuousLessonOptionsMap[
                this.tempModelKey
            ].Language;
        msg.voice = voice;
        window.speechSynthesis.speak(msg);
    }

    getModelKeys(): string[] {
        const keys = Object.keys(
            this.optionsService.options.continuousLessonOptionsMap
        );
        return keys;
    }

    updateSelectedModel() {
        this.tempModelKey = this.selectedModelKey;
        this.optionsService.options.activeModelName = this.selectedModelKey;
        this.optionsService.serialize();
    }

    private generateRandomString(length: number) {
        const charset =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            result += charset[randomIndex];
        }
        return result;
    }

    addNewContinuousLessonMode() {
        const randomName = this.generateRandomString(16);
        const newOption: ContinuousLessonOptions =
            new ContinuousLessonOptions();
        this.optionsService.options.continuousLessonOptionsMap[randomName] =
            newOption;
        this.selectedModelKey = randomName;
        this.optionsService.options.activeModelName = this.selectedModelKey;
        this.updateSelectedModel();

        this.optionsService.serialize();
    }

    closeDialog(){
        this.optionsDialog.close();
    }

    deleteCurrentContinuousLessonMode() {
        const dialogRef = this.dialog.open(DeleteModeComponent, {
            panelClass: 'exit-overlay-pane-class',
            disableClose: true,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                if (
                    Object.keys(
                        this.optionsService.options.continuousLessonOptionsMap
                    ).length <= 1
                ) {
                    return;
                }

                delete this.optionsService.options.continuousLessonOptionsMap[
                    this.selectedModelKey
                ];

                const firstKey = Object.keys(
                    this.optionsService.options.continuousLessonOptionsMap
                )[0];

                this.selectedModelKey = firstKey;
                this.optionsService.options.activeModelName =
                    this.selectedModelKey;
                this.updateSelectedModel();

                this.optionsService.serialize();
            }
        });
    }
}
