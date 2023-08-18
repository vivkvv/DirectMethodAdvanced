import { Component, Input } from '@angular/core';

export class FontOptions {
    visibility!: boolean;
    fontFamily!: string;
    fontSize!: number;
    fontColor!: string;
}

@Component({
    selector: 'font-group',
    templateUrl: './font-group.html',
    styleUrls: ['./font-group.css']
})
export class FontGroupComponent {
    @Input() groupName: string = 'Default Font Group Name';
    @Input() fontOptions!: FontOptions;

    availableFonts: string[] = ['Arial', 'Verdana', 'Times New Roman'];    

    onFontChange(){

    }
}
