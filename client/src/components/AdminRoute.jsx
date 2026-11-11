import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

function AdminRoute() {
  const user = useSelector((state) => state.auth.user)

  if (user?.role !== 'admin') {
    return <Navigate to='/' replace />
  }

  return <Outlet />
}

export default AdminRoute
