import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService, LoginData } from '../services/auth.service';

interface RouteParams {
    direct?: string;
}

@Component({
    selector: 'app-pre-authorization-checking',
    templateUrl: './pre-authorization-checking.components.html',
    styleUrls: ['./pre-authorization-checking.components.css'],
})
export class PreAuthorizationCheckingComponent {
    constructor(
        private route: ActivatedRoute,
        public authService: AuthService
    ) {
        console.log('need to redirect to authorization-checking.components');
    }
}
