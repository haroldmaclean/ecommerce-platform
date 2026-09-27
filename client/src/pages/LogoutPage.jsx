import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { useNavigate } from 'react-router-dom'

import { clearCart } from '../features/cart/cartSlice'

function LogoutPage({ setToken }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    localStorage.removeItem('token')
    //localStorage.removeItem('cart')

    dispatch(clearCart())

    setToken(null)

    navigate('/login')
  }, [navigate, setToken, dispatch])

  return <p>Logging out...</p>
}

export default LogoutPage
