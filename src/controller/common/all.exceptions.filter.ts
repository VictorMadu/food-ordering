import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { DomainException } from 'src/domain/exception/domain.exception';
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
    } else {
      httpAdapter.reply(ctx.getResponse(), null, 500);
    }

    Logger.error(exception);
  }
}
