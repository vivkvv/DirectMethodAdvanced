import { Component, Input} from '@angular/core';
import { DigitalStudent } from 'src/app/services/Options/options.service';

@Component({
    selector: 'digital-students-group',
    templateUrl: './digital-students-group.html',
    styleUrls: ['./digital-students-group.css']
})
export class DigitalStudentsGroupComponent {
    @Input() digitalStudent!: DigitalStudent;
}