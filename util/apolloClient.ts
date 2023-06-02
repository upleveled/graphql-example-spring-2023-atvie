import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client';
import { registerApolloClient } from '@apollo/experimental-nextjs-app-support/rsc';

export const { getClient } = registerApolloClient(() => {
  // GitHub Link
  const githubLink = new HttpLink({
    uri: 'https://api.github.com/graphql',
    headers: {
      authorization: `Bearer ${process.env.NEXT_PUBLIC_GIT_HUB_API}`,
    },
  });

  // Local server Link
  const localLink = new HttpLink({
    uri: 'http://localhost:3000/api/graphql',
    credentials: 'same-origin',
  });

  // This is needed because two endpoints are being used
  const link = split(
    // Split based on the target URI
    ({ operationName }) => {
      return operationName.startsWith('Github');
    },
    githubLink,
    localLink,
  );

  return new ApolloClient({
    cache: new InMemoryCache(),
    link,
  });
});
