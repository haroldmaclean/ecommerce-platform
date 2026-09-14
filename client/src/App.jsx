import { useEffect, useState } from 'react'

import { Routes, Route } from 'react-router-dom'

import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'

import CartPage from './pages/CartPage'

import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'

import './App.css'

function App() {
  const [products, setProducts] = useState([])

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      return JSON.parse(savedCart)
    }
    return []
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  function handleAddToCart(product) {
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
  }

  function handleRemoveFromCart(productId) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.product._id !== productId),
    )
  }

  function handleUpdateCartQuantity(productId, newQuantity) {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.product._id === productId
          ? {
              ...item,
              quantity: Math.max(1, newQuantity),
            }
          : item,
      ),
    )
  }

  return (
    <>
      <Routes>
        <Route path='/' element={<HomePage />} />
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
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
      </Routes>
    </>
  )
}

export default App
