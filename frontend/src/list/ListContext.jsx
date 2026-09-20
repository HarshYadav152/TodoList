import { createContext, useContext } from 'react';

// ownerId: null means "my own list". When viewing a list shared with you,
// ownerId is that person's user id and permission reflects what they
// granted you — every mutation-capable component reads `canEdit` from here
// rather than each one re-deriving it.
const ListContext = createContext({ ownerId: null, ownerEmail: null, permission: 'edit' });

export function ListProvider({ ownerId, ownerEmail, permission, children }) {
  const canEdit = ownerId === null || permission === 'edit';
  return <ListContext.Provider value={{ ownerId, ownerEmail, permission, canEdit }}>{children}</ListContext.Provider>;
}

export function useListContext() {
  return useContext(ListContext);
}
