import { Component, Input, OnInit } from '@angular/core';
// import { EntityService, IEntity } from '../services/entity.service';

@Component({
    selector: 'app-entity-block',
    templateUrl: './entity-block.component.html',
    styleUrls: ['./entity-block.component.css'],
})
export class EntityBlockComponent implements OnInit {
    @Input() entity: any;

    imageExists = true;
    imageLoading = true;
    enTextVisible = true;
    ruTextVisible = true;
    enText = '';
    ruText = '';
    imageUrl = '';

    //constructor(private entityService: EntityService) {}

    ngOnInit(): void {
        //this.getQuesion();
        this.updateEntityData();
    }

    ngOnChanges(): void {
        this.updateEntityData();
    }

    updateEntityData(): void {
      this.enText = this.entity?.sourceText;
      this.ruText = this.entity?.translatedText;
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
