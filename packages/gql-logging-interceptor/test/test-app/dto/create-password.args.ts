import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class CreatePasswordArgs {
  @Field()
  id: string;

  @Field()
  password: string;
}
