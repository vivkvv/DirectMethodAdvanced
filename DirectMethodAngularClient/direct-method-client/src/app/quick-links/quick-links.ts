import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { JwksValidationHandler, OAuthService } from 'angular-oauth2-oidc';
import { googleAuthConfig } from '../services/OAuth/auth-config';
import { AuthService, LoginData } from '../services/auth.service';
import { RouterModule } from '@angular/router';
import { ExitComponent } from '../exit/exit.component';
import { MatDialog } from '@angular/material/dialog';
import { OptionsPageComponent } from '../options/options-page.component';

@Component({
    selector: 'app-quick-links',
    templateUrl: './quick-links.html',
    styleUrls: ['./quick-links.css'],
})
export class QuickLinksComponent {
    constructor(private router: Router, private dialog: MatDialog) {}

    toOptions() {
        // this.router.navigate(['/options']);

            // this.router.navigate(['/options']);
            const optionsDialogRef = this.dialog.open(OptionsPageComponent, {
                // width: '100%',
                // width: '100vh',
                disableClose: false,
                panelClass: 'options-pane-class',
            });
    
            optionsDialogRef.afterClosed().subscribe((result) => {
                // Optional: Handle any actions after the dialog is closed
                console.log('The options dialog was closed');
            });
    
    }

    toLessons() {
        this.router.navigate(['/topic-list']);
    }

    toFiles() {
        this.router.navigate(['/files']);
    }

    toExit() {
        const dialogRef = this.dialog.open(ExitComponent, {
            panelClass: 'exit-overlay-pane-class',
            disableClose: true,
        });
    }
}
