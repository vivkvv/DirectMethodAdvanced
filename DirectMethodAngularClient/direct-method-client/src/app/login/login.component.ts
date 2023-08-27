import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { JwksValidationHandler, OAuthService } from 'angular-oauth2-oidc';
import { googleAuthConfig } from '../services/OAuth/auth-config';
import { AuthService, LoginData } from '../services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
})
export class LoginComponent {
    loginForm = this.fb.group({
        username: ['', Validators.required],
        password: ['', Validators.required],
    });

    constructor(
        private fb: FormBuilder,
        private http: HttpClient,
        private router: Router,
        private oAuthService: OAuthService,
        private authService: AuthService
    ) {
        this.oAuthService.events.subscribe((e) => {
            if (e.type === 'token_received') {
                const accessToken = this.oAuthService.getAccessToken();
            }
        });
    }

    onGoogleLogin(event: Event) {
        event.preventDefault();

        this.oAuthService.configure(googleAuthConfig);
        // this.oAuthService.tokenValidationHandler = new JwksValidationHandler();
        this.oAuthService.loadDiscoveryDocumentAndTryLogin();
        this.oAuthService.initLoginFlow();
    }

    onGitHubLogin() {}

    onFacebookLogin() {}

    onSubmit() {
        const username = this.loginForm.get('username')?.value;
        const password = this.loginForm.get('password')?.value;

        const loginData: LoginData = {
            method: 'direct',
            username,
            password,
        };

        this.authService.login(loginData, () => {
            this.router.navigate(['/authorization-checking'], {
                queryParams: { direct: true },
            });
        });
    }
}
