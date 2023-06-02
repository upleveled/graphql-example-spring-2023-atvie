import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Logout from './Logout';

export default async function logout() {
  const fakeSessionToken = cookies().get('fakeSession');
  if (fakeSessionToken?.value) {
    return <Logout fakeSessionToken={fakeSessionToken?.name} />;
  }

  redirect('/animals');
}
