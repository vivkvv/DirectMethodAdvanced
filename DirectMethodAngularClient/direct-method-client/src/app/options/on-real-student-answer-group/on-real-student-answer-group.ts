import { Component, Input, Output, EventEmitter } from '@angular/core';
import { OnRealStudentAnswer } from 'src/app/services/Options/options.service';

@Component({
    selector: 'on-real-student-answer-group',
    templateUrl: './on-real-student-answer-group.html',
    styleUrls: ['./on-real-student-answer-group.css'],
})
export class OnRealStudentAnswerGroupComponent {
    @Input() onRealStudentAnswer!: OnRealStudentAnswer;
    @Output() realStudentChanged: EventEmitter<void> = new EventEmitter<void>();

    selectedChoice: string = 'automatic';

    onPropertyChange() {
        this.realStudentChanged.emit();
    }

    isAutomaticRecognizingDisabled() {
        return (
            !this.onRealStudentAnswer.use ||
            !this.onRealStudentAnswer.openSpeechRecognitionDialog
        );
    }

    isUseEvaluationDisabled() {
        return (
            !this.onRealStudentAnswer.use ||
            !this.onRealStudentAnswer.openSpeechRecognitionDialog ||
            this.selectedChoice != 'automatic'
        );
    }

    isMaximumAttemptsDisabled() {
        return (
            !this.onRealStudentAnswer.use ||
            !this.onRealStudentAnswer.openSpeechRecognitionDialog ||
            this.selectedChoice != 'automatic' ||
            !this.onRealStudentAnswer.useEvaluation
        );
    }
}
