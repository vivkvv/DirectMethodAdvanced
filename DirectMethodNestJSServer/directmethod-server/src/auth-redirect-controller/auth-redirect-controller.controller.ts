import { Controller, Get, Res, Redirect } from '@nestjs/common';
import { Response } from 'express';

const redirect_url =
  process.env.NODE_ENV === 'production'
    ? 'index.html'
    : 'http://localhost:4200/test.html';

@Controller()
export class AuthRedirectControllerController {
  @Get('authorization-checking')
  @Redirect(redirect_url)
  authorizationChecking() {
    console.log('After Gooogle AuthRedirectControllerController');
    return null;
  }
}
