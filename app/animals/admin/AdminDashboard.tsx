'use client';
import { gql, useMutation } from '@apollo/client';
import { useSuspenseQuery } from '@apollo/experimental-nextjs-app-support/ssr';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export type AnimalResponse = {
  animals: {
    id: number;
    firstName: string;
    type: string;
    accessory: string;
  }[];
};

const createAnimal = gql`
  mutation CreateAnimal(
    $firstName: String!
    $type: String!
    $accessory: String
  ) {
    createAnimal(firstName: $firstName, type: $type, accessory: $accessory) {
      id
      firstName
      type
      accessory
    }
  }
`;

const getAnimals = gql`
  query GetAnimals {
    animals {
      id
      firstName
      type
      accessory
    }
  }
`;

const deleteAnimalMutation = gql`
  mutation DeleteAnimal($id: ID!) {
    deleteAnimalById(id: $id) {
      id
    }
  }
`;

const updateAnimalMutation = gql`
  mutation UpdateAnimal(
    $id: ID!
    $firstNameOnEditInput: String!
    $typeOnEditInput: String!
    $accessoryOnEditInput: String
  ) {
    updateAnimalById(
      id: $id
      firstName: $firstNameOnEditInput
      type: $typeOnEditInput
      accessory: $accessoryOnEditInput
    ) {
      id
      firstName
      type
      accessory
    }
  }
`;

export default function AdminDashboard() {
  const [firstName, setFirstName] = useState('');
  const [type, setType] = useState('');
  const [accessory, setAccessory] = useState('');
  const [onEditId, setOnEditId] = useState<number | undefined>();
  const [firstNameOnEditInput, setFirstNameOnEditInput] = useState('');
  const [typeOnEditInput, setTypeOnEditInput] = useState('');
  const [accessoryOnEditInput, setAccessoryOnEditInput] = useState('');
  const [onError, setOnError] = useState('');

  const router = useRouter();

  const { data, refetch } = useSuspenseQuery<AnimalResponse>(getAnimals);

  const [handleCreateAnimal] = useMutation(createAnimal, {
    variables: {
      firstName,
      type,
      accessory,
    },

    onError: (error) => {
      setOnError(error.message);
    },

    onCompleted: async () => {
      await refetch();
      setOnError('');
      router.refresh();
    },
  });

  const [handleDeleteAnimal] = useMutation(deleteAnimalMutation, {
    onError: (error) => {
      setOnError(error.message);
    },

    onCompleted: async () => {
      await refetch();
      setOnError('');
      router.refresh();
    },
  });

  const [handleUpdateAnimal] = useMutation(updateAnimalMutation, {
    variables: {
      id: onEditId,
      firstNameOnEditInput,
      typeOnEditInput,
      accessoryOnEditInput,
    },

    onError: (error) => {
      setOnError(error.message);
      return;
    },

    onCompleted: async () => {
      await refetch();
      setOnError('');
      router.refresh();
    },
  });

  return (
    <div>
      <h1>Dashboard</h1>
      <br />
      <label>
        First Name
        <br />
        <input
          value={firstName}
          onChange={(event) => {
            setFirstName(event.currentTarget.value);
          }}
        />
      </label>
      <br />
      <label>
        Type
        <br />
        <input
          value={type}
          onChange={(event) => {
            setType(event.currentTarget.value);
          }}
        />
      </label>
      <br />
      <label>
        Accessory
        <br />
        <input
          value={accessory}
          onChange={(event) => {
            setAccessory(event.currentTarget.value);
          }}
        />
      </label>
      <br />
      <button onClick={async () => await handleCreateAnimal()}>
        Create Animal
      </button>
      <hr />
      <p className="error">{onError}</p>
      <br />
      {data?.animals.map((animal) => {
        const isEditing = onEditId === animal.id;
        return (
          <div key={`${animal.firstName}-${animal.id}`}>
            {!isEditing ? (
              <span>{animal.firstName}</span>
            ) : (
              <input
                value={firstNameOnEditInput}
                onChange={(event) => {
                  setFirstNameOnEditInput(event.currentTarget.value);
                }}
              />
            )}

            {!isEditing ? (
              <span>{animal.type}</span>
            ) : (
              <input
                value={typeOnEditInput}
                onChange={(event) => {
                  setTypeOnEditInput(event.currentTarget.value);
                }}
              />
            )}

            {!isEditing ? (
              <span>{animal.accessory || ''}</span>
            ) : (
              <input
                value={accessoryOnEditInput}
                onChange={(event) => {
                  setAccessoryOnEditInput(event.currentTarget.value);
                }}
              />
            )}

            <button
              onClick={async () => {
                await handleDeleteAnimal({
                  variables: {
                    id: animal.id,
                  },
                });
              }}
            >
              X
            </button>

            {!isEditing ? (
              <button
                onClick={() => {
                  setOnEditId(animal.id);
                  setFirstNameOnEditInput(animal.firstName);
                  setAccessoryOnEditInput(animal.accessory || '');
                  setTypeOnEditInput(animal.type);
                }}
              >
                Edit
              </button>
            ) : (
              <button
                onClick={async () => {
                  setOnEditId(undefined);
                  await handleUpdateAnimal();
                }}
              >
                Save
              </button>
            )}
          </div>
        );
      })}
      <br />
    </div>
  );
}
