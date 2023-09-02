import { Controller, Get, Redirect, Req } from '@nestjs/common';
import { Request } from 'express';

const redirect_url =
  process.env.NODE_ENV === 'production'
    ? 'index.html'
    : 'http://localhost:4200/test.html';

@Controller()
export class AuthRedirectControllerController {
  @Get('authorization-checking')
  @Redirect(redirect_url)
  authorizationChecking(@Req() req: Request) {
    console.log('After Gooogle AuthRedirectControllerController');
    console.log('Query Parameters:', req.query);
    console.log('Full url:', req.url);
    console.log('Hash Fragment:', req.url.split('#')[1]);
    return null;
  }
}
