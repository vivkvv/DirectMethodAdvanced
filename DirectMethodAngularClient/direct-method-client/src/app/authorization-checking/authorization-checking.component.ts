import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService, LoginData } from '../services/auth.service';

interface RouteParams {
    direct?: string;
}

@Component({
    selector: 'app-authorization-checking',
    templateUrl: './authorization-checking.component.html',
    styleUrls: ['./authorization-checking.component.css'],
})
export class AuthorizationCheckingComponent {
    constructor(
        private route: ActivatedRoute,
        public authService: AuthService
    ) {
        this.route.queryParams
            .pipe(filter((params) => !params['direct']))
            .subscribe((params) => {
                const fragment = this.route.snapshot.fragment;
                if (fragment) {

                    // const params = new URLSearchParams(fragment);
                    // const entries: { [key: string]: string } = {};
                    // params.forEach((value, key) => {
                    //     entries[key] = value;
                    // });

                    const idToken = new URLSearchParams(fragment).get(
                        'id_token'
                    );
                    const method = 'google';
                    if (idToken) {
                        const loginData: LoginData = {
                            method: method,
                            token: idToken,
                        };
                        this.authService.login(loginData, () => {});
                    }
                }
            });
    }
}
