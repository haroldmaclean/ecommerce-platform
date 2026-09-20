import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function LogoutPage({ setToken }) {
  const navigate = useNavigate()

  useEffect(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('cart')

    setToken(null)

    navigate('/login')
  }, [navigate, setToken])

  return <p>Logging out...</p>
}

export default LogoutPage
