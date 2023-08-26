import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AuthRedirectControllerController {
  @Get('authorization-checking-production')
  //   @Redirect('https://direct-pqyo.onrender.com/pre-authorization-checking')
  //   @Redirect('/pre-authorization-checking')
  //   @Redirect('/test.html')
  authorizationChecking(@Res() res: Response) {
    // this method is intended to redirection and must not have any logic
    console.log('After Gooogle AuthRedirectControllerController');
    // return null;
    if (process.env.NODE_ENV === 'production') {
      const script = `
        <script>
          window.location.href = '/authorization-checking';
        </script>
      `;
      res.send(script);
    } else {
      res.redirect('http://localhost:4200/authorization-checking');
    }
  }
}
