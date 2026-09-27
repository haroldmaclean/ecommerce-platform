import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { setCart } from './features/cart/cartSlice'

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

import './App.css'

function App() {
  const [products, setProducts] = useState([])
  const [token, setToken] = useState(() => {
    return getStoredToken()
  })

  const dispatch = useDispatch()

  const reduxCart = useSelector((state) => state.cart.items)

  useEffect(() => {
    async function loadCart() {
      const storedToken = getStoredToken()

      if (!storedToken) {
        const savedCart = localStorage.getItem('cart')

        if (savedCart) {
          setCart(JSON.parse(savedCart))
        } else {
          setCart([])
        }

        return
      }

      try {
        const serverCart = await getCart(storedToken)

        dispatch(setCart(serverCart.items || []))
      } catch (error) {
        console.error('Failed to load authenticated cart:', error)
      }
    }

    loadCart()
  }, [token, dispatch])

  useEffect(() => {
    if (!token) {
      localStorage.setItem('cart', JSON.stringify(reduxCart))
    }
  }, [reduxCart, token])

  return (
    <>
      <Counter />

      <Routes>
        <Route path='/' element={<HomePage />} />

        <Route
          path='/products'
          element={
            <ProductsPage products={products} setProducts={setProducts} />
          }
        />

        <Route path='/cart' element={<CartPage />} />

        <Route path='/register' element={<RegisterPage />} />

        <Route path='/login' element={<LoginPage setToken={setToken} />} />

        <Route path='/logout' element={<LogoutPage setToken={setToken} />} />
      </Routes>
    </>
  )
}

export default App
