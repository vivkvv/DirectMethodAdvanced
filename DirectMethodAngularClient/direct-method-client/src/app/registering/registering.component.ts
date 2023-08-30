import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SHA256 } from 'crypto-js';
import { UserService } from '../services/UserService/user.service';

interface RegisterData {
    username: string | null | undefined;
    email: string | null | undefined;
    passwordHash: string | null | undefined;
}

@Component({
    selector: 'app-register',
    templateUrl: './registering.component.html',
    styleUrls: ['./registering.component.css'],
})
export class RegisterComponent {
    errorMessage: string = '';

    registerForm = this.fb.group({
        username: ['', Validators.required],
        email: [
            '',
            [
                Validators.required,
                Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$'),
            ],
        ],
        password: ['', [Validators.required, Validators.minLength(8)]],
    });

    constructor(
        private fb: FormBuilder,
        private http: HttpClient,
        private router: Router,
        private userService: UserService
    ) {}

    onSubmit() {
        const username = this.registerForm.get('username')?.value;
        const email = this.registerForm.get('email')?.value;
        const password = this.registerForm.get('password')?.value;

        if(password == null || password == undefined){
            return;
        }

        const registerData: RegisterData = {
            username,
            email,
            passwordHash: SHA256(password).toString(),
        };

        this.http.post('/api/registering', registerData).subscribe(
            (data: any) => {
                localStorage.setItem('access_token', data.access_token);
                this.userService.setUsername(data.user_name);                
                this.router.navigate(['/topic-list']);
            },
            (error) => {
                console.error('Error:', error.error.text);
                this.errorMessage = error.error.text;
            }
        );
    }
}
