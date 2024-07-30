import { Module } from '@nestjs/common';
import { CatsResolver } from './cats.resolver';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

// @ts-ignore
/**
 * Cats module
 */
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
  ],
  providers: [CatsResolver],
})
export class CatsModule {}
