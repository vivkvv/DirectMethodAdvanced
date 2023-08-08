import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Controller('not-found')
export class NotFoundController {
  @Get()
  handleNotFound(@Res() res: Response) {
    res.status(HttpStatus.MOVED_PERMANENTLY).redirect('/');
  }
}
