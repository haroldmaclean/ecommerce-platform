import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { useNavigate } from 'react-router-dom'

import { clearCart } from '../features/cart/cartSlice'
import { clearToken } from '../features/auth/authSlice'

function LogoutPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('cart')

    dispatch(clearCart())

    dispatch(clearToken())

    //setToken(null)

    navigate('/login')
  }, [navigate, dispatch])

  return <p>Logging out...</p>
}

export default LogoutPage
