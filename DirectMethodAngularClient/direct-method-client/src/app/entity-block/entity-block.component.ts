import { Component, Input, OnInit } from '@angular/core';
// import { OptionsService } from '../services/Options/options.service';
import { FontOptions } from '../options/font-group/font-group.component';
// import { EntityService, IEntity } from '../services/entity.service';

@Component({
    selector: 'app-entity-block',
    templateUrl: './entity-block.component.html',
    styleUrls: ['./entity-block.component.css'],
})
export class EntityBlockComponent implements OnInit {
    @Input() entity: any;

    @Input() fontOptions!: FontOptions;
    @Input() translatedFontOptions!: FontOptions;

    imageExists = true;
    imageLoading = true;
    // enTextVisible = true;
    // ruTextVisible = true;
    foreignText = '';
    translatedText = '';
    imageUrl = '';

    // constructor(public optionsService: OptionsService) {}

    transformText(originalText: string): string {
        if (originalText) {
            return originalText.replace(/\\n/g, '<br>');
        } else {
            return '';
        }
    }

    ngOnInit(): void {
        //this.getQuesion();
        this.updateEntityData();
    }

    ngOnChanges(): void {
        this.updateEntityData();
    }

    updateEntityData(): void {
        this.foreignText = this.entity?.sourceText;
        this.translatedText = this.entity?.translatedText;
        this.imageUrl = this.entity?.imageUrl;
        // const questionEntity = this.entityService.getQuestionEntity();
        // this.enText = questionEntity.sourceText;
        // this.ruText = questionEntity.translatedText;
        // this.imageUrl = questionEntity.imageUrl;
    }

    onImageLoaded() {
        this.imageExists = true;
        this.imageLoading = false;
    }

    onImageError() {
        this.imageExists = false;
        this.imageLoading = false;
    }
}
