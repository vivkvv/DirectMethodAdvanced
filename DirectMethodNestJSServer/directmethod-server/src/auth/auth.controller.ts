import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService, DirectUser } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';

@Controller('api')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    const payload = { username: req.body.username, sub: req.body.userId };
    return {
      access_token: this.jwtService.sign(payload),
      status: 'success',
    };
  }

  @Post('registering')
  async register(@Request() req) {
    const registerData: DirectUser = {
      username: req.body.username,
      email: req.body.email,
      passwordHash: req.body.passwordHash,
    };

    const registerResult = await this.authService.register(registerData);

    if (registerResult.result) {
      return {
        access_token: this.jwtService.sign(registerData),
        status: 'success',
      };
    } else {
      console.log('egistering error', registerResult.description);
      return registerResult.description;
    }
  }

  @Post('login/google')
  async googleLogin(@Request() req) {
    const googleToken = req.body.token;
    const googleUser = await this.authService.validateGoogleUser(googleToken);

    if (!googleUser) {
      // Проверьте черный список и другие условия здесь
      return { status: 'failure' };
    }

    const payload = { username: googleUser.email };
    return {
      access_token: this.jwtService.sign(payload),
      status: 'success',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
