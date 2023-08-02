import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

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
        private router: Router
    ) {}

    onSubmit() {
        const username = this.loginForm.get('username')?.value;
        const password = this.loginForm.get('password')?.value;

        this.http.post('/api/login', { username, password }).subscribe(
            (data: any) => {
                localStorage.setItem('access_token', data.access_token);

                this.http.get('api/topics').subscribe(
                  (topics: any) => {
                      this.router.navigate(['/topic-list']);
                  },
                  (error) => {
                      console.error('Failed to load topics:', error);
                  }
              );                
            },
            (error) => {
                console.error('Login failed:', error);
            }
        );
    }
}