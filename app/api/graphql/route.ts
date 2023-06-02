import { gql } from '@apollo/client';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { NextRequest } from 'next/server';
import { getAnimalById, getAnimals } from '../../../database/animals';

const typeDefs = gql`
  type Animal {
    id: ID!
    firstName: String
    type: String
    accessory: String
  }

  type Query {
    animals: [Animal]
    animal(id: ID!): Animal
  }
`;

const resolvers = {
  Query: {
    animals: async () => {
      return await getAnimals();
    },

    animal: async (parent: null, args: { id: string }) => {
      return await getAnimalById(parseInt(args.id));
    },
  },
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const apolloServer = new ApolloServer({
  schema,
});

const handler = startServerAndCreateNextHandler(apolloServer);

export async function GET(req: NextRequest) {
  return await handler(req);
}

export async function POST(req: NextRequest) {
  return await handler(req);
}
