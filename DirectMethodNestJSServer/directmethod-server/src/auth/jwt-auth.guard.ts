import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.getTokenFromAuthorizationHeader(
      request.headers.authorization,
    );

    try {
      const decodedToken = this.jwtService.verify(token);
      request.decodedToken = decodedToken;
      return true;
    } catch (e) {
      return false;
    }
  }

  getTokenFromAuthorizationHeader(auth: string): string {
    if (!auth) {
      return '';
    }
    const parts = auth.split(' ');
    if (parts.length < 2) {
      return '';
    }
    return parts[1];
  }
}
