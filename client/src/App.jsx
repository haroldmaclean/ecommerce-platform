import { useEffect, useState } from 'react'

import { Routes, Route } from 'react-router-dom'

import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'

import CartPage from './pages/CartPage'

import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import LogoutPage from './pages/LogoutPage'

import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
} from './api/cartApi'
import { getStoredToken } from './api/authApi'

import './App.css'

function App() {
  const [products, setProducts] = useState([])
  const [token, setToken] = useState(() => {
    return getStoredToken()
  })

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      return JSON.parse(savedCart)
    }
    return []
  })

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

        setCart(serverCart.items || [])
      } catch (error) {
        console.error('Failed to load authenticated cart:', error)
      }
    }

    loadCart()
  }, [token])

  /*useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])*/

  useEffect(() => {
    if (!token) {
      localStorage.setItem('cart', JSON.stringify(cart))
    }
  }, [cart, token])

  async function handleAddToCart(product) {
    const storedToken = getStoredToken()

    if (!storedToken) {
      setCart((currentCart) => {
        const existingItem = currentCart.find(
          (item) => item.product._id === product._id,
        )

        if (existingItem) {
          return currentCart.map((item) =>
            item.product._id === product._id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
              : item,
          )
        }

        return [
          ...currentCart,
          {
            product: product,
            quantity: 1,
          },
        ]
      })

      return
    }

    try {
      const serverCart = await addToCart(storedToken, product._id, 1)

      setCart(serverCart.items || [])
    } catch (error) {
      console.error('Failed to add item to cart:', error)
    }
  }

  async function handleRemoveFromCart(productId) {
    const storedToken = getStoredToken()

    /*
     * ANONYMOUS
     */
    if (!storedToken) {
      setCart((currentCart) =>
        currentCart.filter((item) => item.product._id !== productId),
      )

      return
    }

    /*
     * AUTHENTICATED
     */
    try {
      const serverCart = await removeCartItem(storedToken, productId)

      setCart(serverCart.items || [])
    } catch (error) {
      console.error('Failed to remove item from cart:', error)
    }
  }
  /*function handleRemoveFromCart(productId) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.product._id !== productId),
    )
  }*/

  async function handleUpdateCartQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
      return
    }

    const storedToken = getStoredToken()

    /*
     * ANONYMOUS
     */
    if (!storedToken) {
      setCart((currentCart) =>
        currentCart.map((item) =>
          item.product._id === productId
            ? {
                ...item,
                quantity: newQuantity,
              }
            : item,
        ),
      )

      return
    }

    /*
     * AUTHENTICATED
     */
    try {
      const serverCart = await updateCartItem(
        storedToken,
        productId,
        newQuantity,
      )

      setCart(serverCart.items || [])
    } catch (error) {
      console.error('Failed to update cart:', error)
    }
  }

  /*function handleUpdateCartQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
      return
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.product._id === productId
          ? {
              ...item,
              quantity: newQuantity,
            }
          : item,
      ),
    )
  }*/

  return (
    <>
      <Routes>
        <Route path='/' element={<HomePage />} />

        <Route
          path='/products'
          element={
            <ProductsPage
              products={products}
              setProducts={setProducts}
              onAddToCart={handleAddToCart}
            />
          }
        />

        <Route
          path='/cart'
          element={
            <CartPage
              cart={cart}
              onRemoveFromCart={handleRemoveFromCart}
              onUpdateCartQuantity={handleUpdateCartQuantity}
            />
          }
        />

        <Route path='/register' element={<RegisterPage />} />

        <Route
          path='/login'
          element={
            <LoginPage cart={cart} setCart={setCart} setToken={setToken} />
          }
        />

        <Route
          path='/logout'
          element={<LogoutPage setToken={setToken} setCart={setCart} />}
        />
      </Routes>
    </>
  )
}

export default App
