import { Component } from '@angular/core';
import { OptionsService } from '../services/Options/options.service';

@Component({
    selector: 'app-options-page',
    templateUrl: './options-page.component.html',
})
export class OptionsPageComponent {
    constructor(public optionsService: OptionsService){}
}
