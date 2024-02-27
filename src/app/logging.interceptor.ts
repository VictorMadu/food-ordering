import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  // TODO: Push logs to its db and grafana
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    Logger.log(`Request: ${request.method} ${request.url} ${JSON.stringify(request.body)}`);

    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap((response) =>
          Logger.log(`Response: duration: ${Date.now() - now}ms, ${JSON.stringify(response)}`),
        ),
      )
      .pipe(
        catchError((error) => {
          Logger.error(`duration ${Date.now() - now}ms error: ${error}`);
          throw error;
        }),
      );
  }
}
