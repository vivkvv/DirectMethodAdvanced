import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';

class User {
  email: string;
  // другие свойства, которые могут быть вам нужны
}

export interface DirectUser {
  username: string;
  email: string;
  passwordHash: string;
}

export interface GoogleUser {
  username: string;
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

  async register(registerUser: UserData): Promise<RegisterResult> {
    // 0. vaidation

    // 1. check if user already exists
    const exists = this.registeredUsers.some(
      (user) => user.username === registerUser.username,
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

  async validateGoogleUser(token: string): Promise<User | null> {
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
        return { email: payload.email };
      }
    } catch (error) {
      console.log('Error on checking Google token:', error);
      return null;
    }
  }
}
