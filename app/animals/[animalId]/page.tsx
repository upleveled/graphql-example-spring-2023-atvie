import { gql } from '@apollo/client';
import Image from 'next/image';
import { getClient } from '../../../util/apolloClient';

export const dynamic = 'force-dynamic';

type Props = {
  params: { animalId: string };
};

type Animal = {
  animal: {
    id: number;
    firstName: string;
    type: string;
    accessory: string;
  };
};

export default async function page(props: Props) {
  const { data } = await getClient().query<Animal>({
    query: gql`
      query GetAnimalById($id: ID! = ${props.params.animalId}) {
        animal(id: $id) {
          id
          firstName
          type
          accessory
        }
      }
    `,
  });

  return (
    <>
      <h1>{data.animal.firstName}</h1>
      <br />

      <Image
        src={`/images/${data.animal.firstName}.png`}
        alt={`${data.animal.firstName} profile picture`}
        width={300}
        height={300}
      />

      <br />
      <p>Type: {data.animal.type}</p>
      <br />
      <p>Accessory: {data.animal.accessory}</p>
    </>
  );
}
