import { gql } from '@apollo/client';
import Image from 'next/image';
import Link from 'next/link';
import { getClient } from '../../util/apolloClient';

export type AnimalResponse = {
  animals: {
    id: number;
    firstName: string;
    type: string;
    accessory: string;
  }[];
};

export default async function AnimalsPage() {
  const { data } = await getClient().query<AnimalResponse>({
    query: gql`
      query GetAnimals {
        animals {
          id
          firstName
        }
      }
    `,
  });

  return (
    <div>
      <h1>These are my animals</h1>
      {data.animals.map((animal) => {
        return (
          <div key={`animal-div-${animal.id}`}>
            <h2>{animal.firstName}</h2>

            <br />

            <Image
              src={`/images/${animal.firstName}.png`}
              alt={`${animal.firstName} profile picture`}
              width={300}
              height={300}
            />

            <br />

            <Link href={`/animals/${animal.id}`}>View Animal</Link>

            <br />
            <br />
          </div>
        );
      })}

      <br />
      <br />
    </div>
  );
}
