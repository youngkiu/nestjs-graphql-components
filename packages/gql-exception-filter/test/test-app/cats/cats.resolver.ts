import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCatDto } from './create-cat.dto';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

/**
 * Resolver: /cats
 */
@Resolver()
export class CatsResolver {
  /**
   * Fetching cats ok
   */
  @Query(() => String)
  public ok(): string {
    return 'This action returns all cats';
  }
  /**
   * Fetching bad request
   */
  @Query(() => String)
  public badRequest(): string {
    throw new BadRequestException(`The request is malformed.`);
  }
  /**
   * Fetching internalerror
   */
  @Query(() => String)
  public internalError(): string {
    throw new InternalServerErrorException(`A critical error happened.`);
  }

  /**
   * Fetching internalerror without message
   */
  @Query(() => String)
  public internalErrorNoMessage(): string {
    throw new Error();
  }

  /**
   * Fetching not found
   */
  @Query(() => String)
  public notFound(): string {
    throw new NotFoundException({
      code: 'UNKNOWN_ENTITY',
      message: 'Id notfound could not be found',
      status: 404,
    });
  }
  /**
   * Create a cat
   */
  @Mutation(() => String)
  public create(@Args() _createCatDto: CreateCatDto): string {
    return 'This action adds a new cat';
  }
}
