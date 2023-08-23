import { Controller, Get, Redirect } from '@nestjs/common';

@Controller()
export class AuthRedirectControllerController {
  @Get('authorization-checking')
  //   @Redirect('https://direct-pqyo.onrender.com/pre-authorization-checking')
  //   @Redirect('/pre-authorization-checking')
  @Redirect('/test.html')
  authorizationChecking() {
    // this method is intended to redirection and must not have any logic
    return null;
  }
}
