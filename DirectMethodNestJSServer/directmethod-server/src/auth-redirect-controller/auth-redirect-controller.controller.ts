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
    console.log('After Gooogle AuthRedirectControllerController');

    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const parsedUrl = parse(fullUrl, true);
    console.log(fullUrl);
    console.log(parsedUrl);
    console.log(parsedUrl.query);

    console.log(req.headers);
    console.log(req.body);
    console.log(req.query);
    console.log(req.rawHeaders);
    console.log(req.cookies);

    res.redirect(`${redirect_url}?access_token=123`);
  }
}
