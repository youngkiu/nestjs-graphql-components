import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GqlLoggingInterceptor } from '../../../src';

/**
 * Core module: This module sets the logging interceptor as a global interceptor
 */
@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: GqlLoggingInterceptor,
    },
  ],
})
export class CoreModule {}
