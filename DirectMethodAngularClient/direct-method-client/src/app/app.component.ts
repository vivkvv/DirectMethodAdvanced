import { Component, OnInit } from '@angular/core';
import { UserService } from './services/UserService/user.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent {
    constructor(private userService: UserService) {}
    username = 'noname';

    ngOnInit() {
        this.userService.username.subscribe(name => {
          this.username = name;
        });
      }
}
