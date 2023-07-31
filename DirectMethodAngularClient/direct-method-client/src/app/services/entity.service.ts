import { Injectable } from '@angular/core';

export class IEntity {
    constructor(
        public sourceText: string | null = null,
        public translatedText: string | null | undefined = null,
        public imageUrl: string | null = null
    ){};
}

@Injectable({
    providedIn: 'root',
})
export class EntityService {
    private questionEntity: IEntity = {
        sourceText:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec odio. Donec et ante.',
        translatedText:
            'Пример текста на русском. Пример текста на русском. Пример текста на русском. ',
        imageUrl: '..\\..\\favicon.ico',
    };
    private answerEntity: IEntity = {
        sourceText: 'answer',
        translatedText: 'translated answer',
        imageUrl: '..\\..\\favicon.ico',
    };

    getQuestionEntity(): IEntity {
        return this.questionEntity;
    }

    getAnswerEntity(): IEntity {
        return this.answerEntity;
    }
}
