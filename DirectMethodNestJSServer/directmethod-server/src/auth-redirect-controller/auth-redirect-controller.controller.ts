import { Controller, Get, Res, Redirect } from '@nestjs/common';
import { Response } from 'express';

const redirect_url =
  process.env.NODE_ENV === 'production'
    ? 'test.html'
    : 'http://localhost:4200/test.html';

@Controller()
export class AuthRedirectControllerController {
  @Get('authorization-checking')
  // @Redirect(redirect_url)
  // authorizationChecking() {
  //   console.log('After Gooogle AuthRedirectControllerController');
  //   return null;
  // }
  redirectToAngular(@Res() res: Response) {
    res.send(`
    <html>
      <head><title>Redirecting...</title></head>
      <body>
        <script>
          window.location.href = "/options";
        </script>
      </body>
    </html>
  `);
  }
}
