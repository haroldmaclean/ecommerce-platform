import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  cartLoadStarted,
  cartLoadFailed,
  setCart,
} from './features/cart/cartSlice'
import { clearToken, setToken } from './features/auth/authSlice'

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

  const [cartHydrated, setCartHydrated] = useState(false)

  const [cartRetryCount, setCartRetryCount] = useState(0)

  const [guestCartPersistenceEnabled, setGuestCartPersistenceEnabled] =
    useState(false)

  const dispatch = useDispatch()

  const reduxCart = useSelector((state) => state.cart.items)

  function retryCartHydration() {
    setCartRetryCount((count) => count + 1)
  }

  useEffect(() => {
    const storedToken = getStoredToken()

    if (storedToken) {
      dispatch(setToken(storedToken))
    }
  }, [dispatch])

  useEffect(() => {
    let ignore = false

    async function hydrateCart() {
      const storedToken = getStoredToken()

      if (!storedToken) {
        const savedCart = loadCart()

        dispatch(setCart(savedCart))

        setCartHydrated(true)
        setGuestCartPersistenceEnabled(true)

        return
      }

      setGuestCartPersistenceEnabled(false)
      dispatch(cartLoadStarted())

      try {
        const serverCart = await getCart(storedToken)

        if (ignore) return

        dispatch(setCart(serverCart.items || []))

        setCartHydrated(true)
      } catch (error) {
        if (ignore) return

        console.error('Failed to load authenticated cart:', error)

        if (error.status === 401) {
          localStorage.removeItem('token')

          setGuestCartPersistenceEnabled(false)

          dispatch(clearToken())

          setCartHydrated(true)
        } else {
          dispatch(
            cartLoadFailed(
              error.message || 'Unable to load your cart. Please try again.',
            ),
          )
        }
      }
    }

    hydrateCart()
    return () => {
      ignore = true
    }
  }, [token, dispatch, cartRetryCount])

  useEffect(() => {
    if (!token && cartHydrated && guestCartPersistenceEnabled) {
      saveCart(reduxCart)
    }
  }, [reduxCart, token, cartHydrated, guestCartPersistenceEnabled])

  return (
    <>
      <Counter />

      <Routes>
        <Route path='/' element={<HomePage />} />

        <Route path='/products' element={<ProductsPage />} />

        <Route
          path='/cart'
          element={<CartPage onRetry={retryCartHydration} />}
        />

        <Route path='/register' element={<RegisterPage />} />

        <Route path='/login' element={<LoginPage setToken={setToken} />} />

        <Route path='/logout' element={<LogoutPage />} />
      </Routes>
    </>
  )
}

export default App
