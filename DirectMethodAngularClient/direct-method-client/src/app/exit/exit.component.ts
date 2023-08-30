import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';
import { UserService } from '../services/UserService/user.service';

@Component({
    selector: 'exit',
    templateUrl: './exit.component.html',
    styleUrls: ['./exit.component.css'],
})
export class ExitComponent {
    constructor(
        private dialogRef: MatDialogRef<ExitComponent>,
        private http: HttpClient,
        private router: Router,
        private userService: UserService
    ) {}

    close(): void {
        this.dialogRef.close();
    }

    logout(): void {
        this.http
            .post('/api/logout', {})
            .pipe(
                finalize(() => {
                    this.dialogRef.close();
                    this.router.navigate(['/']);
                })
            )
            .subscribe(
                () => {
                    localStorage.removeItem('access_token');
                    // Сбросьте имя пользователя каким-либо образом, например:
                    this.userService.setUsername('');
                },
                (err) => console.error('Logout failed', err)
            );
    }
}