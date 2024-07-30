import { IsNotEmpty } from 'class-validator';
import { ArgsType, Field } from '@nestjs/graphql';

/**
 * Dto to create a new cat
 */
@ArgsType()
export class CreateCatDto {
  @Field()
  @IsNotEmpty()
  name: string;
}
