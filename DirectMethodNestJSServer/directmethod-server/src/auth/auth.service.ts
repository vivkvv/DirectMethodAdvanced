import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';

class User {
  email: string;
  //userId: string;
}

export interface DirectUser {
  username: string;
  email: string;
  passwordHash: string;
}

export interface GoogleUser {
  email: string;
  userId: string;
}

type UserData = DirectUser | GoogleUser;

export type RegisterResult = { result: boolean; description: string };

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  registeredUsers: UserData[] = [];

  private static GOOGLE_CLIENT_ID =
    '1056330085698-p14refckgcbhs0533767eq2non7597nf.apps.googleusercontent.com';
  private googleClient = new OAuth2Client(AuthService.GOOGLE_CLIENT_ID);

  validateUser(username: string): boolean {
    if (username === 'vvovk') {
      return true;
    }

    return false;
  }

  async logout(username: string): Promise<boolean> {
    const index = this.registeredUsers.findIndex(
      (user) => user.email === username,
    );

    if (index !== -1) {
      this.registeredUsers.splice(index, 1);
      return Promise.resolve(true);
    }

    return Promise.resolve(false);
  }

  async register(registerUser: UserData): Promise<RegisterResult> {
    // 0. vaidation

    // 1. check if user already exists
    const exists = this.registeredUsers.some(
      (user) => user.email === registerUser.email,
    );

    if (exists) {
      return {
        result: false,
        description: 'User with this name is already registered',
      };
    }

    // 2. check if user can be registered

    // 3. added user
    // await someDatabaseOperaton(registerUser)
    this.registeredUsers.push(registerUser);

    // 4. return result
    return {
      result: true,
      description: '',
    };
  }

  // login(username: string) {
  //   const payload = { username };
  //   return this.jwtService.sign(payload);
  // }

  async validateGoogleUser(token: string): Promise<GoogleUser | null> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: AuthService.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const userId = payload?.sub;

      // checking black list

      // registering on the database
      if (payload && payload.email) {
        return { email: payload.email, userId: userId };
      }
    } catch (error) {
      console.log('Error on checking Google token:', error);
      return null;
    }
  }
}
