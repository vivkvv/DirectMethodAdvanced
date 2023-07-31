import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  validateUser(username: string): boolean {
    if (username === 'vvovk') {
      return true;
    }

    return false;
  }

  login(username: string) {
    const payload = { username };
    return this.jwtService.sign(payload);
  }
}
