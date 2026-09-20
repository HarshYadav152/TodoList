import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './auth/LoginPage'
import ProtectedRoute from './auth/ProtectedRoute'
import RegisterPage from './auth/RegisterPage'
import AppShell from './pages/AppShell'
import CalendarView from './pages/CalendarView'
import TodoDashboard from './pages/TodoDashboard'

function App() {
  return (
    <Routes>
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path='/' element={<TodoDashboard />} />
          <Route path='/calendar' element={<CalendarView />} />
        </Route>
      </Route>
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  )
}

export default App
