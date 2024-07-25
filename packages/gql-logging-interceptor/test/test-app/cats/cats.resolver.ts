/* eslint-disable */
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Log } from '../../../src';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Cat } from '../models/cat.model';
import { CreatePasswordArgs } from '../dto/create-password.args';
import { CreateCatInput } from '../dto/create-cat.input';

/**
 * Resolver: /cats
 */
@Resolver(() => Cat)
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
    throw new BadRequestException();
  }
  /**
   * Fetching internalerror
   */
  @Query(() => String)
  public internalError(): string {
    throw new InternalServerErrorException();
  }

  /**
   * Create a cat
   */
  @Mutation(() => Cat)
  @Log({
    mask: {
      request: ['birthdate', 'interests.description', 'address', 'enemies'],
      response: ['id', 'birthdate', 'interests.description', 'address', 'enemies'],
    },
  })
  public createCat(@Args('payload') payload: CreateCatInput) {
    if (payload.name === 'dog') {
      throw new BadRequestException('You cannot name a cat dog');
    }

    return { id: 1, ...payload };
  }

  @Query(() => [Cat])
  @Log({
    mask: {
      response: ['interests.description', 'unknownProperty'],
    },
  })
  public getCats() {
    return [
      {
        id: 1,
        name: 'Tom',
        interests: [
          { description: 'Eating Jerry', level: 'HIGH' },
          { description: 'Sleeping', level: 'MEDIUM' },
        ],
      },
      {
        id: 2,
        name: 'Sylvestre',
        interests: [{ description: 'Eating Titi', level: 'HIGH' }],
      },
    ];
  }

  /**
   * Create a password for a cat
   */
  @Mutation(() => String)
  @Log({ mask: { request: true, response: true } })
  public createPassword(@Args() payload: CreatePasswordArgs) {
    return `The password for cat ${payload.id} is ${payload.password}`;
  }
}
