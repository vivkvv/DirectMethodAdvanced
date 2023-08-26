import { Controller, Get, Redirect } from '@nestjs/common';

const redirect_url =
  process.env.NODE_ENV === 'production'
    ? 'test.html'
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
