export async function isUserAdminBySessionToken(
  sessionToken: string | undefined,
) {
  // FIXME: Implement proper authorization
  console.log(sessionToken);
  if (sessionToken === 'freddy') return await true;
  return await false;
}
