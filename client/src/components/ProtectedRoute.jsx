import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

function ProtectedRoute() {
  const token = useSelector((state) => state.auth.token)
  const initialized = useSelector((state) => state.auth.initialized)

  const location = useLocation()

  // Wait until authentication restoration is complete.
  if (!initialized) {
    return <p>Checking authentication...</p>
  }

  // Redirect unauthenticated users to login.
  // Preserve the requested destination.
  if (!token) {
    return <Navigate to='/login' state={{ from: location.pathname }} replace />
  }

  // Authentication state is ready and a token exists.
  return <Outlet />
}

export default ProtectedRoute
