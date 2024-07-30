import { Module } from '@nestjs/common';
import { CatsResolver } from './cats.resolver';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';

/**
 * Cats module
 */
@Module({
  imports: [
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
  ],
  providers: [CatsResolver],
})
export class CatsModule {}
