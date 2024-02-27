import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { DomainException } from 'src/domain/exception/domain.exception';
import { NullException } from 'src/lib/null.exception';
import { serialize } from 'src/lib/serialize';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    if (exception instanceof DomainException) {
      httpAdapter.reply(ctx.getResponse(), serialize(exception), 400);
    } else if (exception instanceof HttpException) {
      httpAdapter.reply(ctx.getResponse(), null, exception.getStatus());
    } else if (exception instanceof NullException) {
      httpAdapter.reply(ctx.getResponse(), serialize({ reason: 'NOT_FOUND' }), 404);
    } else {
      httpAdapter.reply(ctx.getResponse(), serialize({ reason: 'INTERNAL' }), 500);
    }

    Logger.error(exception);
  }
}
