import { useSharedWithMe } from '../hooks/useShares';

export default function ListSwitcher({ ownerId, onChange }) {
  const { data: sharedWithMe = [] } = useSharedWithMe();

  return (
    <select
      value={ownerId ?? 'self'}
      onChange={(e) => {
        if (e.target.value === 'self') {
          onChange({ ownerId: null, ownerEmail: null, permission: 'edit' });
          return;
        }
        const share = sharedWithMe.find((s) => s.owner._id === e.target.value);
        onChange({ ownerId: e.target.value, ownerEmail: share?.owner.email, permission: share?.permission });
      }}
      className="border rounded px-2 py-1.5 text-sm bg-white"
    >
      <option value="self">My Todos</option>
      {sharedWithMe.map((share) => (
        <option key={share._id} value={share.owner._id}>
          {share.owner.email} ({share.permission})
        </option>
      ))}
    </select>
  );
}
