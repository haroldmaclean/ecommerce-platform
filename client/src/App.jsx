import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { setCart } from './features/cart/cartSlice'
import { setToken } from './features/auth/authSlice'

import { Routes, Route } from 'react-router-dom'

import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'

import CartPage from './pages/CartPage'

import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import LogoutPage from './pages/LogoutPage'

import Counter from './features/counter/Counter'

import { getCart } from './api/cartApi'
import { getStoredToken } from './api/authApi'

import { loadCart, saveCart } from './storage/cartStorage'

import './App.css'

function App() {
  const token = useSelector((state) => state.auth.token)

  /*const [token, setToken] = useState(() => {
    return getStoredToken()
  })*/

  const [cartHydrated, setCartHydrated] = useState(false)

  const dispatch = useDispatch()

  const reduxCart = useSelector((state) => state.cart.items)

  useEffect(() => {
    const storedToken = getStoredToken()

    if (storedToken) {
      dispatch(setToken(storedToken))
    }
  }, [dispatch])

  useEffect(() => {
    async function hydrateCart() {
      const storedToken = getStoredToken()

      if (!storedToken) {
        const savedCart = loadCart()

        dispatch(setCart(savedCart))

        setCartHydrated(true)

        return
      }

      try {
        const serverCart = await getCart(storedToken)

        dispatch(setCart(serverCart.items || []))

        setCartHydrated(true)
      } catch (error) {
        console.error('Failed to load authenticated cart:', error)
      }
    }

    hydrateCart()
  }, [token, dispatch])

  useEffect(() => {
    if (!token && cartHydrated) {
      saveCart(reduxCart)
    }
  }, [reduxCart, token, cartHydrated])

  return (
    <>
      <Counter />

      <Routes>
        <Route path='/' element={<HomePage />} />

        <Route path='/products' element={<ProductsPage />} />

        <Route path='/cart' element={<CartPage />} />

        <Route path='/register' element={<RegisterPage />} />

        <Route path='/login' element={<LoginPage setToken={setToken} />} />

        <Route path='/logout' element={<LogoutPage />} />
      </Routes>
    </>
  )
}

export default App
