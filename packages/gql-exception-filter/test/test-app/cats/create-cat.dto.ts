import { ArgsType, Field } from '@nestjs/graphql';

/**
 * Dto to create a new cat
 */
@ArgsType()
export class CreateCatDto {
  @Field()
  name: string;
}
