import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'font-group',
    templateUrl: './font-group.html',
    styleUrls: ['./font-group.css']
})
export class FontGroupComponent {
    @Input() groupName: string = 'Default Font Group Name';
    availableFonts: string[] = ['Arial', 'Verdana', 'Times New Roman'];
    selectedFont: string = 'Arial';
    fontSize: number = 12;
    fontColor: string = 'black';

    onFontChange(){

    }
}
