import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Response } from 'express';
// eslint-disable-next-line import/no-extraneous-dependencies
import { GqlArgumentsHost, GqlContextType } from '@nestjs/graphql';
import { get } from 'lodash';
// eslint-disable-next-line import/no-extraneous-dependencies
import { GraphQLError } from 'graphql';
import { getCode, getErrorMessage } from './error.utils';

/**
 * Catch and format thrown exception in NestJS application based on Express
 */
@Catch()
export class GqlExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger = new Logger(GqlExceptionFilter.name);

  /**
   * Catch and format thrown exception
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public catch(exception: any, host: ArgumentsHost): void {
    const hostType = host.getType<GqlContextType>();

    switch (hostType) {
      case 'http':
        {
          const ctx: HttpArgumentsHost = host.switchToHttp();
          const request: Request = ctx.getRequest();
          const response: Response = ctx.getResponse();

          const { code, message, status } = this.getErrorMessageCodeStatus(exception, request);

          response.status(status).send({
            code,
            message,
            status,
          });
        }
        break;

      case 'graphql': {
        const ctx: GqlArgumentsHost = GqlArgumentsHost.create(host);
        const request: Request = ctx.getContext().req;

        const { code, message, status } = this.getErrorMessageCodeStatus(exception, request);

        throw new GraphQLError(message, { extensions: { code, status } });
      }

      default:
        this.logger.error({ message: 'Unknown host type' });
        throw exception;
    }
  }

  private getErrorMessageCodeStatus(
    exception: any,
    request: Request,
  ): { code: string; message: string; status: number } {
    let status: number;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
    } else {
      // Case of a PayloadTooLarge
      const type: string | undefined = get(exception, 'type');
      status = type === 'entity.too.large' ? HttpStatus.PAYLOAD_TOO_LARGE : HttpStatus.INTERNAL_SERVER_ERROR;
    }

    let code: string =
      exception instanceof HttpException
        ? getCode(exception.getResponse())
        : HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR];
    let message: string =
      exception instanceof HttpException
        ? getErrorMessage(exception.getResponse())
        : 'An internal server error occurred';

    if (status === HttpStatus.PAYLOAD_TOO_LARGE) {
      code = HttpStatus[HttpStatus.PAYLOAD_TOO_LARGE];
      message = `
        Your request entity size is too big for the server to process it:
          - request size: ${get(exception, 'length')};
          - request limit: ${get(exception, 'limit')}.`;
    }
    const exceptionStack: string = 'stack' in exception ? exception.stack : '';
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        {
          message: `${status} [${request.method} ${request.url}] has thrown a critical error`,
          headers: request.headers,
        },
        exceptionStack,
      );
    } else if (status >= HttpStatus.BAD_REQUEST) {
      this.logger.warn({
        message: `${status} [${request.method} ${request.url}] has thrown an HTTP client error`,
        exceptionStack,
        headers: request.headers,
      });
    }

    return { message, code, status };
  }
}
