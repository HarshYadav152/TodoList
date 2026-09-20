import { useAuth } from '../auth/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()

  return (
    <nav className='flex justify-between items-center bg-slate-700 text-white py-2 px-9'>
      <span className='font-bold text-xl'>TODO</span>
      <div className='flex items-center gap-4 text-sm'>
        {user && <span className='text-slate-300'>{user.email}</span>}
        <button onClick={logout} className='hover:font-bold transition-all'>
          Log out
        </button>
      </div>
    </nav>
  )
}

export default Navbar
