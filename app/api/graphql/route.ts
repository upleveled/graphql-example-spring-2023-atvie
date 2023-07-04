import { gql } from '@apollo/client';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLError } from 'graphql';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import {
  createAnimal,
  deleteAnimalById,
  getAnimalByFirstName,
  getAnimalById,
  getAnimals,
  updateAnimalById,
} from '../../../database/animals';
import { isUserAdminBySessionToken } from '../../../database/users';
import { Animal } from '../../../migrations/1685696908-create-table-animals';

export type GraphQlResponseBody =
  | {
      animal: Animal;
    }
  | Error;

type AnimalInput = {
  firstName: string;
  type: string;
  accessory: string;
};

type Args = {
  id: string;
};

type FakeAdminAnimalContext = {
  isAdmin: boolean;
};

type LoginArgument = {
  username?: string;
  password?: string;
};

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
    loggedInAnimalByFirstName(firstName: String!): Animal
  }

  type Mutation {
    createAnimal(firstName: String!, type: String!, accessory: String): Animal

    deleteAnimalById(id: ID!): Animal

    updateAnimalById(
      id: ID!
      firstName: String!
      type: String!
      accessory: String
    ): Animal

    login(username: String!, password: String!): Animal
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

    loggedInAnimalByFirstName: async (
      parent: null,
      args: { firstName: string },
    ) => {
      return await getAnimalByFirstName(args.firstName);
    },
  },

  Mutation: {
    createAnimal: async (parent: null, args: AnimalInput) => {
      if (
        typeof args.firstName !== 'string' ||
        typeof args.type !== 'string' ||
        (args.accessory && typeof args.type !== 'string') ||
        !args.firstName ||
        !args.type
      ) {
        throw new GraphQLError('Required field is missing');
      }
      return await createAnimal(args.firstName, args.type, args.accessory);
    },

    deleteAnimalById: async (
      parent: null,
      args: Args,
      context: FakeAdminAnimalContext,
    ) => {
      if (!context.isAdmin) {
        throw new GraphQLError('Unauthorized operation');
      }
      return await deleteAnimalById(parseInt(args.id));
    },

    updateAnimalById: async (parent: null, args: AnimalInput & Args) => {
      if (
        typeof args.firstName !== 'string' ||
        typeof args.type !== 'string' ||
        (args.accessory && typeof args.type !== 'string') ||
        !args.firstName ||
        !args.type
      ) {
        throw new GraphQLError('Required field missing');
      }

      return await updateAnimalById(
        parseInt(args.id),
        args.firstName,
        args.type,
        args.accessory,
      );
    },

    login: async (parent: null, args: LoginArgument) => {
      //  FIXME: Implement secure authentication
      if (
        typeof args.username !== 'string' ||
        typeof args.password !== 'string' ||
        !args.username ||
        !args.password
      ) {
        throw new GraphQLError('Required field missing');
      }

      if (args.username !== 'bob' || args.password !== 'asdf') {
        throw new GraphQLError('Invalid username or password');
      }

      // Creating a fake login session cookies
      await cookies().set('fakeSession', args.username, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return await getAnimalByFirstName(args.username);
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

const handler = startServerAndCreateNextHandler<NextRequest>(apolloServer, {
  context: async (req) => {
    // FIXME: Implement secure authentication
    const fakeSessionToken = req.cookies.get('fakeSession');

    const isAdmin = await isUserAdminBySessionToken(fakeSessionToken?.value);

    return { req, isAdmin };
  },
});

export async function GET(
  req: NextRequest,
): Promise<NextResponse<GraphQlResponseBody>> {
  return (await handler(req)) as NextResponse<GraphQlResponseBody>;
}

export async function POST(
  req: NextRequest,
): Promise<NextResponse<GraphQlResponseBody>> {
  return (await handler(req)) as NextResponse<GraphQlResponseBody>;
}
