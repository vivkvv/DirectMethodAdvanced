import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { JwksValidationHandler, OAuthService } from 'angular-oauth2-oidc';
import { googleAuthConfig } from '../services/OAuth/auth-config';
import { AuthService, LoginData } from '../services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-quick-links',
    templateUrl: './quick-links.html',
    styleUrls: ['./quick-links.css'],
})
export class QuickLinksComponent {
    constructor(private router: Router) {}

    toOptions() {
        this.router.navigate(['/options']);
    }

    toLessons() {
        this.router.navigate(['/topic-list']);
    }    
}
