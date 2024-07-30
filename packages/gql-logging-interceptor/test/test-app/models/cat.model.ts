import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
class Address {
  @Field()
  country: string;

  @Field()
  city: string;
}

@ObjectType()
class Interests {
  @Field()
  description: string;

  @Field()
  level: 'HIGH' | 'MEDIUM' | 'LOW';
}

@ObjectType()
export class Cat {
  @Field()
  id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  birthdate?: string;

  @Field(() => Address, { nullable: true })
  address?: Address;

  @Field(() => [String], { nullable: true })
  enemies?: string[];

  @Field(() => [Interests], { nullable: true })
  interests?: Interests[];
}
