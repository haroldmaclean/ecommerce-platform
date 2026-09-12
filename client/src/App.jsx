import { useState } from 'react'

import { Routes, Route } from 'react-router-dom'

import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'

import './App.css'

function App() {
  const [products, setProducts] = useState([])

  const [cart, setCart] = useState([])

  function handleAddToCart(product) {
    setCart((currentCart) => [...currentCart, product])
  }

  return (
    <>
      <p>Cart items: {cart.length}</p>
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
      </Routes>
    </>
  )
}

export default App
