import { gql } from '@apollo/client';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getClient } from '../../../util/apolloClient';
import AdminDashboard from './AdminDashboard';

export default async function AnimalsAdminPage() {
  const fakeSessionToken = cookies().get('fakeSession');

  const { data } = await getClient().query({
    query: gql`
      query LoggedInAnimal($firstName: String!) {
        loggedInAnimalByFirstName(firstName: $firstName) {
          id
          firstName
          type
          accessory
        }
      }
    `,
    variables: {
      firstName: fakeSessionToken?.value || '',
    },
  });

  if (!data.loggedInAnimalByFirstName) {
    redirect('/login');
  }

  return (
    <div>
      <AdminDashboard />
    </div>
  );
}
