import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { parse } from 'url';

const redirect_url =
  process.env.NODE_ENV === 'production'
    ? 'index.html'
    : 'http://localhost:4200/index.html';

@Controller()
export class AuthRedirectControllerController {
  @Get('authorization-checking')
  // @Redirect(redirect_url)
  authorizationChecking(@Req() req: Request, @Res() res: Response) {
    console.log('After Google AuthRedirectControllerController');
    res.redirect(`${redirect_url}?oauth2_redirect=google`);
  }
}
