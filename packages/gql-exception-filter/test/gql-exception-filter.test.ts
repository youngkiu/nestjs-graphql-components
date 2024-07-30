import { HttpStatus, INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { GqlExceptionFilter } from '../src';
import { CatsModule } from './test-app/cats/cats.module';

describe('GraphQL Exception Filter', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [CatsModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useLogger(Logger);
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new GqlExceptionFilter());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns a formatted bad request response', async () => {
    const warnSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'warn');
    const url: string = '/';

    const { body: resBody } = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: '{ badRequest }' })
      .expect(HttpStatus.OK);

    expect(warnSpy).toHaveBeenCalledWith({
      message: `400 [POST ${url}] has thrown an HTTP client error`,
      exceptionStack: expect.any(String),
      headers: expect.anything(),
    });

    expect(resBody).toEqual({
      data: null,
      errors: [
        {
          extensions: {
            code: 'BAD_REQUEST',
            status: HttpStatus.BAD_REQUEST,
          },
          locations: [
            {
              column: 3,
              line: 1,
            },
          ],
          message: 'The request is malformed.',
          path: ['badRequest'],
        },
      ],
    });
  });

  it('returns a formatted bad request after failing DTO validation', async () => {
    const { body: resBody } = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: 'mutation { create }',
      })
      .expect(HttpStatus.BAD_REQUEST);

    expect(resBody).toEqual({
      errors: [
        {
          extensions: {
            code: 'GRAPHQL_VALIDATION_FAILED',
          },
          locations: [
            {
              column: 12,
              line: 1,
            },
          ],
          message: 'Field "create" argument "name" of type "String!" is required, but it was not provided.',
        },
      ],
    });
  });

  it('returns a formatted internal server error response', async () => {
    const errorSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'error');
    const url: string = '/';

    const { body: resBody } = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: '{ internalError }' })
      .expect(HttpStatus.OK);

    expect(errorSpy).toHaveBeenCalledWith(
      {
        message: `500 [POST ${url}] has thrown a critical error`,
        headers: expect.anything(),
      },
      expect.any(String),
    );

    expect(resBody).toEqual({
      data: null,
      errors: [
        {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            status: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          locations: [
            {
              column: 3,
              line: 1,
            },
          ],
          message: 'A critical error happened.',
          path: ['internalError'],
        },
      ],
    });
  });

  it('returns a formatted internal server error response with a default message', async () => {
    const errorSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'error');
    const url: string = '/';

    const { body: resBody } = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: '{ internalErrorNoMessage }' })
      .expect(HttpStatus.OK);

    expect(errorSpy).toHaveBeenCalledWith(
      {
        message: `500 [POST ${url}] has thrown a critical error`,
        headers: expect.anything(),
      },
      expect.any(String),
    );

    expect(resBody).toEqual({
      data: null,
      errors: [
        {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            status: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          locations: [
            {
              column: 3,
              line: 1,
            },
          ],
          message: 'An internal server error occurred',
          path: ['internalErrorNoMessage'],
        },
      ],
    });
  });

  it('returns a formatted not found error response with a specific code', async () => {
    const warnSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'warn');
    const url: string = '/';

    const { body: resBody } = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: '{ notFound }' })
      .expect(HttpStatus.OK);

    expect(warnSpy).toHaveBeenCalledWith({
      message: `404 [POST ${url}] has thrown an HTTP client error`,
      exceptionStack: expect.any(String),
      headers: expect.anything(),
    });

    expect(resBody).toEqual({
      data: null,
      errors: [
        {
          extensions: {
            code: 'UNKNOWN_ENTITY',
            status: HttpStatus.NOT_FOUND,
          },
          locations: [
            {
              column: 3,
              line: 1,
            },
          ],
          message: 'Id notfound could not be found',
          path: ['notFound'],
        },
      ],
    });
  });

  it('returns a formatted bad request after failing DTO validation', async () => {
    const warnSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'warn');
    const url: string = '/graphql';

    const { body: resBody } = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation { create ( name: "${'xyz'.repeat(1024 * 1024)}" ) }`,
      })
      .expect(HttpStatus.PAYLOAD_TOO_LARGE);

    expect(warnSpy).toHaveBeenCalledWith({
      message: `413 [POST ${url}] has thrown an HTTP client error`,
      exceptionStack: expect.any(String),
      headers: expect.anything(),
    });

    expect(resBody).toEqual({
      code: 'PAYLOAD_TOO_LARGE',
      message: `
        Your request entity size is too big for the server to process it:
          - request size: 3145774;
          - request limit: 102400.`,
      status: 413,
    });
  });
});
