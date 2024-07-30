import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class CreatePasswordArgs {
  @Field()
  id: number;

  @Field()
  password: string;
}
