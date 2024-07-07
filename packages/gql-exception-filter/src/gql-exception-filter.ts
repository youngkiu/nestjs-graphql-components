import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
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
    if (host.getType<GqlContextType>() !== 'graphql') {
      this.logger.error('GqlExceptionFilter should be used only for GraphQL context');
      throw exception;
    }

    const ctx = GqlArgumentsHost.create(host);
    const request: Request = ctx.getContext().req;
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
    throw new GraphQLError(message, { extensions: { code, status } });
  }
}
