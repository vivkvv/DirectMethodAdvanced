import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService, DirectUser, GoogleUser } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { DBService } from 'src/mangoose-service/services/db.service';

@Controller('api')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private dbService: DBService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    const payload = { username: req.body.username, sub: req.body.userId };
    return {
      access_token: this.jwtService.sign(payload),
      user_name: payload.username,
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
        user_name: registerData.username,
        status: 'success',
      };
    } else {
      console.log('registering error', registerResult.description);
      return registerResult.description;
    }
  }

  @Post('login/google')
  async googleLogin(@Request() req) {
    const googleToken = req.body.token;
    const googleUser: GoogleUser = await this.authService.validateGoogleUser(
      googleToken,
    );

    if (!googleUser) {
      // Проверьте черный список и другие условия здесь
      return { status: 'failure' };
    }

    //const payload = { username: googleUser.email, sub: goo };

    // register in th db
    await this.dbService.handleGoogleLogin(googleUser);

    return {
      access_token: this.jwtService.sign(googleUser),
      user_name: googleUser.email,
      status: 'success',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    const token = req.headers.authorization.split(' ')[1];
    const payload = this.jwtService.decode(token) as any;
    const username = payload.username;

    const result = await this.authService.logout(username);

    const decodedToken = req.decodedToken;
    await this.dbService.handleLogout(decodedToken.userId);

    if (result) {
      return {
        status: 'success',
      };
    } else {
      return {
        description: 'user is not entered',
        status: 'error',
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('db/save_options')
  async serializeOptions(@Request() req) {
    const decodedToken = req.decodedToken;
    const userUniqId = decodedToken.userId;
    const options = req.body;
    const buffer = Buffer.from(JSON.stringify(options));
    await this.dbService.saveOptions(userUniqId, buffer);
  }

  @UseGuards(JwtAuthGuard)
  @Post('db/load_options')
  async deserializeOptions(@Request() req) {
    try {
      const decodedToken = req.decodedToken;
      const buffer = await this.dbService.loadOptions(decodedToken.userId);
      const options = JSON.parse(buffer.toString());
      return options;
    } catch (e) {
      return null;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
