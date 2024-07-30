import { Field, InputType } from '@nestjs/graphql';

@InputType()
class AddressInput {
  @Field()
  country: string;

  @Field()
  city: string;
}

@InputType()
class InterestsInput {
  @Field()
  description: string;

  @Field()
  level: 'HIGH' | 'MEDIUM' | 'LOW';
}

@InputType()
export class CreateCatInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  birthdate?: string;

  @Field(() => AddressInput, { nullable: true })
  address?: AddressInput;

  @Field(() => [String], { nullable: true })
  enemies?: string[];

  @Field(() => [InterestsInput], { nullable: true })
  interests?: InterestsInput[];
}
