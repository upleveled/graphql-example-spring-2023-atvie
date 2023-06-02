'use client';

import { gql, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const logoutMutation = gql`
  mutation Logout($fakeSessionToken: String!) {
    logout(fakeSessionToken: $fakeSessionToken) {
      id
      firstName
      type
      accessory
    }
  }
`;

type Props = {
  fakeSessionToken: string;
};

export default function Logout(props: Props) {
  const [onError, setOnError] = useState('');
  const router = useRouter();

  const [logoutHandler] = useMutation(logoutMutation, {
    variables: {
      fakeSessionToken: props.fakeSessionToken,
    },

    onError: (error) => {
      setOnError(error.message);
    },

    onCompleted: () => {
      router.refresh();
    },
  });

  useEffect(() => {
    const logout = async () => {
      await logoutHandler();
    };
    logout();
  }, [props.fakeSessionToken]);

  return null;
}
