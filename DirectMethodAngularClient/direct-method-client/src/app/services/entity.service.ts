import { Injectable } from '@angular/core';

export class IEntity {
    constructor(
        public sourceText: string | null = null,
        public translatedText: string | null | undefined = null,
        public imageUrl: string | null = null
    ) {}
}

@Injectable({
    providedIn: 'root',
})
export class EntityService {
    private questionEntity: IEntity = {
        sourceText: '',
        translatedText: '',
        imageUrl: '',
    };
    private answerEntity: IEntity = {
        sourceText: '',
        translatedText: '',
        imageUrl: '',
    };

    getQuestionEntity(): IEntity {
        return this.questionEntity;
    }

    getAnswerEntity(): IEntity {
        return this.answerEntity;
    }
}
