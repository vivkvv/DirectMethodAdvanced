import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Controller('not-found')
export class NotFoundController {
  @Get()
  handleNotFound(@Res() res: Response) {
    console.log('Not-Found Controller, redirecting to /');
    res.status(HttpStatus.MOVED_PERMANENTLY).redirect('/');
  }
}
