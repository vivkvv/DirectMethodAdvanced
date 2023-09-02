import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from './UserService/user.service';

export interface LoginData {
    method: 'google' | 'github' | 'facebook' | 'direct';
    token?: string;
    username?: string | null;
    password?: string | null;
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    authError: string | null = null;
    constructor(
        private http: HttpClient,
        private router: Router,
        private userService: UserService
    ) {}

    // login(username: string, password: string) {
    //   return this.http.post('/api/login', { username, password });
    // }

    login(loginData: LoginData, onFailure: (errorMessage: any) => void): void {
        let url = '/api/login';
        let body = {};

        if (loginData.method === 'direct') {
            body = {
                username: loginData.username,
                password: loginData.password,
            };
        } else {
            url += `/${loginData.method}`;
            body = { token: loginData.token };
        }

        this.http.post(url, body).subscribe(
            (data: any) => {
                if (data.status === 'failure') {
                    this.authError = 'Error authentification';
                    onFailure(this.authError);    
                } else {
                    this.authError = null;
                    localStorage.setItem('access_token', data.access_token);
                    this.userService.setUsername(data.user_name);
                    this.router.navigate(['/topic-list']);
                }
            },
            (error) => {
                this.authError = error.message;
                onFailure(this.authError);
            }
        );
    }
}
